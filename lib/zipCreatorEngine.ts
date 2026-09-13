import JSZip from 'jszip';
import {
  ZipFileItem,
  ZipFolderItem,
  ZipCreatorConfig,
  BulkRenameConfig,
  ZipProgressInfo,
  ZipResult,
  FolderTreeNode,
  FileCategory,
  DuplicateStrategy,
} from './zipCreatorTypes';

/**
 * Sanitize folder and relative paths.
 * Normalizes backslashes, strips traversal sequences (../, ..\), leading/trailing slashes, null bytes.
 */
export function sanitizePath(rawPath: string): string {
  if (!rawPath) return '';

  // Remove null bytes and non-printable control characters
  const cleaned = rawPath.replace(/[\x00-\x1F\x7F]/g, '').replace(/\\/g, '/');

  // Split into segments and filter dangerous tokens
  const segments = cleaned
    .split('/')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== '.' && s !== '..');

  return segments.join('/');
}

/**
 * Sanitize filename.
 * Strips null bytes, path separators, and illegal filesystem characters (<>:"/\|?*).
 */
export function sanitizeFilename(rawName: string): string {
  if (!rawName) return 'unnamed_file';

  // Remove control characters and path traversal / filesystem reserved characters
  let clean = rawName
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim();

  // Strip leading/trailing dots or spaces which can cause OS issues
  clean = clean.replace(/^[.\s]+/, '').replace(/[.\s]+$/, '');

  if (!clean) return 'unnamed_file';
  return clean;
}

/**
 * Format zip archive name. Ensures .zip extension and valid characters.
 */
export function sanitizeZipName(rawName: string): string {
  let base = sanitizeFilename(rawName || 'my-files');
  if (base.toLowerCase().endsWith('.zip')) {
    base = base.slice(0, -4);
  }
  if (!base.trim()) base = 'my-files';
  return `${base.trim()}.zip`;
}

/**
 * Categorize files for filtering and tailored icon display.
 */
export function detectFileCategory(fileName: string, mimeType?: string): FileCategory {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mime = mimeType?.toLowerCase() || '';

  if (
    mime.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'bmp', 'ico', 'tiff', 'heic'].includes(ext)
  ) {
    return 'image';
  }

  if (
    mime.startsWith('video/') ||
    ['mp4', 'webm', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'm4v'].includes(ext)
  ) {
    return 'video';
  }

  if (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(ext)
  ) {
    return 'audio';
  }

  if (ext === 'pdf' || mime === 'application/pdf') {
    return 'pdf';
  }

  if (['xls', 'xlsx', 'csv', 'ods', 'tsv'].includes(ext)) {
    return 'spreadsheet';
  }

  if (
    ['doc', 'docx', 'txt', 'rtf', 'odt', 'md', 'tex', 'epub'].includes(ext) ||
    mime.startsWith('text/plain')
  ) {
    return 'document';
  }

  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'].includes(ext)) {
    return 'archive';
  }

  if (
    [
      'js',
      'ts',
      'jsx',
      'tsx',
      'html',
      'htm',
      'css',
      'scss',
      'json',
      'py',
      'rs',
      'go',
      'java',
      'c',
      'cpp',
      'h',
      'cs',
      'php',
      'rb',
      'sql',
      'sh',
      'yaml',
      'yml',
      'xml',
    ].includes(ext)
  ) {
    return 'code';
  }

  return 'other';
}

/**
 * Human-readable file size formatter.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${sizes[i]}`;
}

/**
 * Build a hierarchical folder tree structure for sidebar navigation and ZIP contents preview.
 */
export function buildFolderTree(
  folders: ZipFolderItem[],
  files: ZipFileItem[]
): FolderTreeNode {
  const rootNode: FolderTreeNode = {
    path: '',
    name: 'Root (/)' ,
    fileCount: 0,
    totalSize: 0,
    isExplicit: true,
    children: [],
  };

  const nodeMap = new Map<string, FolderTreeNode>();
  nodeMap.set('', rootNode);

  // Helper to get or create node in tree
  const getOrCreateNode = (folderPath: string, isExplicit: boolean = false): FolderTreeNode => {
    const cleanPath = sanitizePath(folderPath);
    if (!cleanPath) return rootNode;

    if (nodeMap.has(cleanPath)) {
      const existing = nodeMap.get(cleanPath)!;
      if (isExplicit) existing.isExplicit = true;
      return existing;
    }

    const segments = cleanPath.split('/');
    let curPath = '';
    let parent = rootNode;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      curPath = curPath ? `${curPath}/${seg}` : seg;

      if (!nodeMap.has(curPath)) {
        const newNode: FolderTreeNode = {
          path: curPath,
          name: seg,
          fileCount: 0,
          totalSize: 0,
          isExplicit: i === segments.length - 1 ? isExplicit : false,
          children: [],
        };
        nodeMap.set(curPath, newNode);
        parent.children.push(newNode);
        parent = newNode;
      } else {
        parent = nodeMap.get(curPath)!;
        if (i === segments.length - 1 && isExplicit) {
          parent.isExplicit = true;
        }
      }
    }

    return parent;
  };

  // Register all explicit folders
  for (const f of folders) {
    if (f.path) {
      getOrCreateNode(f.path, f.isExplicit);
    }
  }

  // Register folder paths from files and tally counts
  for (const file of files) {
    const node = getOrCreateNode(file.folderPath, false);
    node.fileCount++;
    node.totalSize += file.size;

    // Propagate up to root
    let cur = file.folderPath;
    while (cur) {
      const lastSlash = cur.lastIndexOf('/');
      cur = lastSlash >= 0 ? cur.slice(0, lastSlash) : '';
      const ancestor = nodeMap.get(cur);
      if (ancestor) {
        ancestor.fileCount++;
        ancestor.totalSize += file.size;
      }
    }
  }

  // Sort child nodes alphabetically
  const sortChildren = (node: FolderTreeNode) => {
    node.children.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    node.children.forEach(sortChildren);
  };
  sortChildren(rootNode);

  return rootNode;
}

/**
 * Evaluate bulk rename pattern for a given file item.
 * Supported tags: {number}, {name}, {extension}, {date}
 */
export function evaluateRenamePattern(
  pattern: string,
  file: ZipFileItem,
  index: number,
  config: BulkRenameConfig
): string {
  const originalExt = file.name.includes('.') ? file.name.split('.').pop() || '' : '';
  const originalBase = file.name.includes('.')
    ? file.name.slice(0, file.name.lastIndexOf('.'))
    : file.name;

  const currentNumber = config.startNumber + index;
  const paddedNumber = String(currentNumber).padStart(config.padding, '0');

  // Format date as YYYY-MM-DD
  const dateObj = file.lastModified ? new Date(file.lastModified) : new Date();
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  let result = pattern
    .replace(/\{number\}/gi, paddedNumber)
    .replace(/\{name\}/gi, originalBase)
    .replace(/\{extension\}/gi, originalExt)
    .replace(/\{date\}/gi, dateStr);

  result = sanitizeFilename(result);

  // If pattern does not include an explicit extension and original file had one, preserve it
  if (!result.includes('.') && originalExt) {
    result = `${result}.${originalExt}`;
  }

  return result;
}

/**
 * Resolve duplicate filenames in the same folder path.
 * If duplicateStrategy is 'auto-rename', appends (1), (2), etc.
 */
export function resolveDuplicateNames(
  files: ZipFileItem[],
  strategy: DuplicateStrategy = 'auto-rename'
): ZipFileItem[] {
  if (strategy !== 'auto-rename') {
    return files;
  }

  const seenMap = new Map<string, number>();

  return files.map((file) => {
    const fullKey = `${file.folderPath ? file.folderPath + '/' : ''}${file.name.toLowerCase()}`;
    const count = seenMap.get(fullKey) || 0;
    seenMap.set(fullKey, count + 1);

    if (count === 0) {
      return file;
    }

    // Split name and extension
    const dotIndex = file.name.lastIndexOf('.');
    let newName: string;
    if (dotIndex > 0) {
      const base = file.name.substring(0, dotIndex);
      const ext = file.name.substring(dotIndex);
      newName = `${base} (${count})${ext}`;
    } else {
      newName = `${file.name} (${count})`;
    }

    return {
      ...file,
      name: newName,
    };
  });
}

/**
 * JSZip Generation Pipeline.
 * Performs client-side browser compression with chunking and progress events.
 */
export async function createZipArchive(
  files: ZipFileItem[],
  folders: ZipFolderItem[],
  config: ZipCreatorConfig,
  onProgress: (info: ZipProgressInfo) => void,
  abortSignal?: { aborted: boolean }
): Promise<ZipResult> {
  const zip = new JSZip();

  // 1. Resolve duplicates before bundling
  const resolvedFiles = resolveDuplicateNames(files, config.duplicateStrategy);

  // 2. Add explicit empty folders if enabled
  if (config.includeEmptyFolders) {
    for (const folder of folders) {
      if (folder.path) {
        zip.folder(folder.path);
      }
    }
  }

  // 3. Add each file to its designated folder in the ZIP
  for (const item of resolvedFiles) {
    if (abortSignal?.aborted) {
      throw new Error('ZIP creation was cancelled');
    }

    const zipFilePath = item.folderPath ? `${item.folderPath}/${item.name}` : item.name;
    // JSZip directly supports passing browser File objects, streaming data efficiently
    zip.file(zipFilePath, item.file, {
      date: item.lastModified ? new Date(item.lastModified) : new Date(),
    });
  }

  // 4. Map compression options
  let compression: 'STORE' | 'DEFLATE' = 'DEFLATE';
  let compressionLevel = 6;

  switch (config.compressionLevel) {
    case 'STORE':
      compression = 'STORE';
      break;
    case 'FAST':
      compression = 'DEFLATE';
      compressionLevel = 1;
      break;
    case 'BALANCED':
      compression = 'DEFLATE';
      compressionLevel = 6;
      break;
    case 'MAXIMUM':
      compression = 'DEFLATE';
      compressionLevel = 9;
      break;
  }

  // 5. Generate ZIP blob with progress callback
  const totalOriginalSize = resolvedFiles.reduce((acc, f) => acc + f.size, 0);

  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression,
      compressionOptions: compression === 'DEFLATE' ? { level: compressionLevel } : undefined,
      comment: config.comment?.trim() || undefined,
    },
    (metadata) => {
      if (abortSignal?.aborted) {
        throw new Error('ZIP creation was cancelled');
      }

      const percent = Math.round(metadata.percent);
      const currentFile = metadata.currentFile || 'Finalizing archive...';
      const approxFiles = Math.min(
        resolvedFiles.length,
        Math.round((percent / 100) * resolvedFiles.length)
      );

      onProgress({
        percent,
        currentFile,
        processedCount: approxFiles,
        totalCount: resolvedFiles.length,
      });
    }
  );

  const zipSize = blob.size;
  const savedBytes = totalOriginalSize - zipSize;
  const savedPercentage =
    totalOriginalSize > 0 ? Math.round((savedBytes / totalOriginalSize) * 1000) / 10 : 0;

  const downloadUrl = URL.createObjectURL(blob);
  const finalFilename = sanitizeZipName(config.zipName);

  // Compute folder count
  const distinctFolders = new Set<string>();
  for (const f of resolvedFiles) {
    if (f.folderPath) distinctFolders.add(f.folderPath);
  }
  for (const fo of folders) {
    if (fo.path) distinctFolders.add(fo.path);
  }

  return {
    blob,
    filename: finalFilename,
    originalTotalSize: totalOriginalSize,
    zipSize,
    savedPercentage,
    fileCount: resolvedFiles.length,
    folderCount: distinctFolders.size,
    downloadUrl,
  };
}
