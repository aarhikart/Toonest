import JSZip from 'jszip';
import {
  ZipEntryItem,
  ArchiveMetadata,
  ExtractionProgress,
  FolderNode,
  FileCategory,
} from './zipExtractorTypes';

/**
 * Sanitize relative ZIP path to prevent path traversal (ZIP slip).
 * Strips leading/trailing slashes, null bytes, and collapses .. or . segments.
 */
export function sanitizeZipPath(rawPath: string): string {
  if (!rawPath) return '';

  const cleaned = rawPath.replace(/[\x00-\x1F\x7F]/g, '').replace(/\\/g, '/');

  const segments = cleaned
    .split('/')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== '.' && s !== '..');

  return segments.join('/');
}

/**
 * Sanitize base filename.
 */
export function sanitizeFilename(rawName: string): string {
  if (!rawName) return 'unnamed_file';

  let clean = rawName
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim();

  clean = clean.replace(/^[.\s]+/, '').replace(/[.\s]+$/, '');
  if (!clean) return 'unnamed_file';
  return clean;
}

/**
 * Classify file category for icons, previews, and filters.
 */
export function detectFileCategory(fileName: string, mime?: string): FileCategory {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mimeType = mime?.toLowerCase() || '';

  if (
    mimeType.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'bmp', 'ico', 'tiff', 'heic'].includes(ext)
  ) {
    return 'image';
  }

  if (
    mimeType.startsWith('video/') ||
    ['mp4', 'webm', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'm4v'].includes(ext)
  ) {
    return 'video';
  }

  if (
    mimeType.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(ext)
  ) {
    return 'audio';
  }

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf';
  }

  if (['xls', 'xlsx', 'csv', 'ods', 'tsv'].includes(ext)) {
    return 'spreadsheet';
  }

  if (
    ['doc', 'docx', 'txt', 'rtf', 'odt', 'md', 'tex', 'epub'].includes(ext) ||
    mimeType.startsWith('text/plain')
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
 * Format human-readable file size.
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
 * Parse and validate uploaded ZIP archive.
 * Performs metadata-only inspection without extracting files into memory.
 */
export async function loadAndValidateZip(
  file: File
): Promise<{ zip: JSZip; metadata: ArchiveMetadata; entries: ZipEntryItem[] }> {
  let zip: JSZip;

  try {
    zip = await JSZip.loadAsync(file);
  } catch (err: any) {
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('encrypted') || msg.includes('password')) {
      throw new Error('This ZIP file is password protected or encrypted, which is not supported in the browser.');
    }
    throw new Error('This file does not appear to be a valid or supported ZIP archive.');
  }

  const entries: ZipEntryItem[] = [];
  let fileCount = 0;
  let totalUncompressedSize = 0;
  let totalCompressedSize = 0;
  let isEncryptedArchive = false;
  const folderSet = new Set<string>();

  zip.forEach((rawPath, zipEntry) => {
    const isDir = zipEntry.dir || rawPath.endsWith('/');
    const cleanPath = sanitizeZipPath(rawPath);

    if (!cleanPath) return; // ignore empty root

    const pathSegments = cleanPath.split('/');
    const baseName = pathSegments.pop() || cleanPath;
    const parentFolder = pathSegments.join('/');

    if (parentFolder) {
      folderSet.add(parentFolder);
      // add ancestors
      const segs = parentFolder.split('/');
      let acc = '';
      for (const s of segs) {
        acc = acc ? `${acc}/${s}` : s;
        folderSet.add(acc);
      }
    }

    if (isDir) {
      folderSet.add(cleanPath);
      entries.push({
        id: `dir_${cleanPath}`,
        name: baseName,
        path: cleanPath,
        folderPath: parentFolder,
        isDirectory: true,
        uncompressedSize: 0,
        date: zipEntry.date || new Date(),
        category: 'other',
        isEncrypted: false,
        comment: zipEntry.comment || undefined,
      });
    } else {
      fileCount++;
      // @ts-ignore - internal uncompressed size in JSZip _data
      const uncompressed = zipEntry._data?.uncompressedSize || 0;
      // @ts-ignore
      const compressed = zipEntry._data?.compressedSize || 0;

      totalUncompressedSize += uncompressed;
      totalCompressedSize += compressed;

      // Check encryption flags
      // @ts-ignore
      const isEncrypted = Boolean(zipEntry._data?.isEncrypted);
      if (isEncrypted) isEncryptedArchive = true;

      entries.push({
        id: `file_${cleanPath}`,
        name: baseName,
        path: cleanPath,
        folderPath: parentFolder,
        isDirectory: false,
        uncompressedSize: uncompressed,
        compressedSize: compressed > 0 ? compressed : undefined,
        date: zipEntry.date || new Date(),
        category: detectFileCategory(baseName),
        isEncrypted,
        comment: zipEntry.comment || undefined,
      });
    }
  });

  if (entries.length === 0) {
    throw new Error('The uploaded ZIP archive is empty and contains no files or folders.');
  }

  // Detect suspicious ZIP bomb characteristics:
  // Compression ratio > 100:1 with total uncompressed size > 500 MB, or > 2 GB uncompressed
  const ratio = file.size > 0 ? totalUncompressedSize / file.size : 1;
  const isSuspiciousBomb = (ratio > 100 && totalUncompressedSize > 500 * 1024 * 1024) || totalUncompressedSize > 2 * 1024 * 1024 * 1024 || fileCount > 10000;

  const savedBytes = totalUncompressedSize > file.size ? totalUncompressedSize - file.size : 0;
  const compressionRatio =
    totalUncompressedSize > 0
      ? Math.max(0, Math.round((savedBytes / totalUncompressedSize) * 1000) / 10)
      : 0;

  const metadata: ArchiveMetadata = {
    filename: file.name,
    archiveSize: file.size,
    fileCount,
    folderCount: folderSet.size,
    totalUncompressedSize,
    compressionRatio,
    isEncrypted: isEncryptedArchive,
    isSuspiciousBomb,
    comment: (zip as any).comment || undefined,
  };

  return { zip, metadata, entries };
}

/**
 * Build hierarchical folder tree from archive entries.
 */
export function buildFolderHierarchy(entries: ZipEntryItem[]): FolderNode {
  const rootNode: FolderNode = {
    path: '',
    name: 'Root (/)',
    fileCount: 0,
    folderCount: 0,
    totalSize: 0,
    children: [],
  };

  const nodeMap = new Map<string, FolderNode>();
  nodeMap.set('', rootNode);

  const getOrCreateNode = (folderPath: string): FolderNode => {
    const clean = sanitizeZipPath(folderPath);
    if (!clean) return rootNode;

    if (nodeMap.has(clean)) return nodeMap.get(clean)!;

    const segments = clean.split('/');
    let curPath = '';
    let parent = rootNode;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      curPath = curPath ? `${curPath}/${seg}` : seg;

      if (!nodeMap.has(curPath)) {
        const newNode: FolderNode = {
          path: curPath,
          name: seg,
          fileCount: 0,
          folderCount: 0,
          totalSize: 0,
          children: [],
        };
        nodeMap.set(curPath, newNode);
        parent.children.push(newNode);
        parent = newNode;
      } else {
        parent = nodeMap.get(curPath)!;
      }
    }

    return parent;
  };

  // Register all directories and tally files
  for (const item of entries) {
    if (item.isDirectory) {
      getOrCreateNode(item.path);
    } else {
      const parent = getOrCreateNode(item.folderPath);
      parent.fileCount++;
      parent.totalSize += item.uncompressedSize;

      // Propagate counts up
      let cur = item.folderPath;
      while (cur) {
        const lastSlash = cur.lastIndexOf('/');
        cur = lastSlash >= 0 ? cur.slice(0, lastSlash) : '';
        const ancestor = nodeMap.get(cur);
        if (ancestor) {
          ancestor.fileCount++;
          ancestor.totalSize += item.uncompressedSize;
        }
      }
    }
  }

  // Count subfolders and sort children
  const finalizeNode = (node: FolderNode) => {
    node.folderCount = node.children.length;
    node.children.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    node.children.forEach(finalizeNode);
  };
  finalizeNode(rootNode);

  return rootNode;
}

/**
 * Lazy-extract single file as Blob for preview or direct download.
 */
export async function extractSingleFile(
  zip: JSZip,
  entryPath: string
): Promise<Blob> {
  const entry = zip.file(entryPath);
  if (!entry) {
    throw new Error(`File entry "${entryPath}" not found in archive.`);
  }

  return await entry.async('blob');
}

/**
 * Extract multiple files or a complete folder and package them into a new ZIP archive.
 */
export async function extractMultipleAsZip(
  zip: JSZip,
  entriesToExtract: ZipEntryItem[],
  outputZipName: string,
  baseFolderPath: string = '',
  onProgress?: (progress: ExtractionProgress) => void,
  abortSignal?: { aborted: boolean }
): Promise<Blob> {
  const newZip = new JSZip();
  const fileEntries = entriesToExtract.filter((e) => !e.isDirectory);
  const total = fileEntries.length;

  for (let i = 0; i < fileEntries.length; i++) {
    if (abortSignal?.aborted) {
      throw new Error('Extraction was cancelled');
    }

    const item = fileEntries[i];
    const sourceFile = zip.file(item.path);

    if (sourceFile) {
      const data = await sourceFile.async('arraybuffer');

      // Relative path inside extracted ZIP (strip base folder if downloading a subfolder)
      let relativeTarget = item.path;
      if (baseFolderPath && relativeTarget.startsWith(`${baseFolderPath}/`)) {
        relativeTarget = relativeTarget.slice(baseFolderPath.length + 1);
      }

      newZip.file(relativeTarget, data, { date: item.date });
    }

    if (onProgress) {
      const completed = i + 1;
      const percent = Math.round((completed / total) * 100);
      onProgress({
        percent,
        currentFile: item.name,
        completedCount: completed,
        totalCount: total,
      });
    }
  }

  if (abortSignal?.aborted) {
    throw new Error('Extraction was cancelled');
  }

  return await newZip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * Trigger client-side browser file download.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizeFilename(filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
