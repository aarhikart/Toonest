import { ImageFileItem, RenameConfig, CaseTransform } from './types';

/**
 * Transforms string casing according to selected mode
 */
export function transformCase(str: string, transform: CaseTransform): string {
  if (transform === 'lowercase') {
    return str.toLowerCase();
  }
  if (transform === 'uppercase') {
    return str.toUpperCase();
  }
  if (transform === 'titlecase') {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return str;
}

/**
 * Removes or replaces unsafe filesystem characters
 */
export function cleanSpecialChars(str: string): string {
  // Replace characters not allowed in file systems: < > : " / \ | ? * and common web escape hazards
  return str
    .replace(/[<>:"/\\|?*#%&{}\\$!'`;@+=~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Formats a date into YYYY-MM-DD
 */
export function formatDate(timestamp?: number): string {
  const date = timestamp ? new Date(timestamp) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats bytes into human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Extracts base filename and extension from a filename string
 */
export function parseFileName(filename: string): { baseName: string; extension: string } {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return { baseName: filename, extension: '' };
  }
  return {
    baseName: filename.substring(0, lastDotIndex),
    extension: filename.substring(lastDotIndex + 1),
  };
}

/**
 * Generates a single new filename given an item, its order index, and the rename config
 */
export function generateNewName(
  item: ImageFileItem,
  index: number,
  config: RenameConfig
): string {
  // Determine target extension
  let ext = item.extension;
  if (!config.preserveExtension) {
    ext = config.customExtension.replace(/^\./, '').trim();
  }

  // Calculate formatted sequence number
  const currentNum = config.startNumber + index;
  const numStr = String(currentNum).padStart(Math.max(1, config.numberPadding), '0');
  const formattedDate = formatDate(item.lastModified);

  let resultName = '';

  if (config.mode === 'pattern') {
    // Custom pattern replacement
    let templ = config.pattern || '{name}-{number}';
    templ = templ.replace(/\{name\}/gi, item.originalBaseName);
    templ = templ.replace(/\{number\}/gi, numStr);
    templ = templ.replace(/\{date\}/gi, formattedDate);
    templ = templ.replace(/\{extension\}|\{ext\}/gi, ext);
    resultName = templ;
  } else {
    // Standard mode
    const base = config.baseName.trim();
    const sep = config.separator;

    if (base) {
      resultName = `${base}${sep}${numStr}`;
    } else {
      // If base name is empty, retain original base name + separator + number
      resultName = `${item.originalBaseName}${sep}${numStr}`;
    }
  }

  // Replace text if configured
  if (config.findText) {
    // Global replacement of findText with replaceText
    resultName = resultName.split(config.findText).join(config.replaceText || '');
  }

  // Prefix & Suffix
  if (config.prefix) {
    resultName = `${config.prefix}${resultName}`;
  }
  if (config.suffix) {
    resultName = `${resultName}${config.suffix}`;
  }

  // Remove spaces
  if (config.removeSpaces) {
    const spaceSub = config.separator && config.separator.trim() !== '' ? config.separator : '-';
    resultName = resultName.replace(/\s+/g, spaceSub);
  }

  // Clean special characters
  if (config.removeSpecialChars) {
    resultName = cleanSpecialChars(resultName);
  }

  // Case transformation
  if (config.caseTransform !== 'none') {
    resultName = transformCase(resultName, config.caseTransform);
  }

  // Ensure result name is not empty
  if (!resultName.trim()) {
    resultName = `image-${numStr}`;
  }

  // Combine with extension
  if (ext) {
    return `${resultName}.${ext}`;
  }
  return resultName;
}

/**
 * Calculates new names for all items in the list and flags duplicates
 */
export function recalculateAllNames(
  items: ImageFileItem[],
  config: RenameConfig
): ImageFileItem[] {
  // First pass: generate prospective names
  const rawNames = items.map((item, index) => generateNewName(item, index, config));

  // Count occurrences to detect duplicates
  const nameCounts = new Map<string, number>();
  for (const name of rawNames) {
    const lower = name.toLowerCase();
    nameCounts.set(lower, (nameCounts.get(lower) || 0) + 1);
  }

  // If auto-resolve duplicates is enabled, disambiguate
  const resolvedNames: string[] = [];
  const seenCounters = new Map<string, number>();

  if (config.autoResolveDuplicates) {
    for (let i = 0; i < rawNames.length; i++) {
      const orig = rawNames[i];
      const lower = orig.toLowerCase();
      if ((nameCounts.get(lower) || 0) > 1) {
        const count = (seenCounters.get(lower) || 0) + 1;
        seenCounters.set(lower, count);

        if (count > 1) {
          const { baseName, extension } = parseFileName(orig);
          const disambiguated = extension
            ? `${baseName}-${count}.${extension}`
            : `${baseName}-${count}`;
          resolvedNames.push(disambiguated);
          continue;
        }
      }
      resolvedNames.push(orig);
    }
  } else {
    for (const name of rawNames) {
      resolvedNames.push(name);
    }
  }

  // Final pass: assign names and status
  const finalCounts = new Map<string, number>();
  for (const name of resolvedNames) {
    const lower = name.toLowerCase();
    finalCounts.set(lower, (finalCounts.get(lower) || 0) + 1);
  }

  return items.map((item, index) => {
    const newName = resolvedNames[index];
    const isDuplicate = (finalCounts.get(newName.toLowerCase()) || 0) > 1;

    return {
      ...item,
      newName,
      status: isDuplicate ? 'duplicate' : 'ready',
      errorMessage: isDuplicate ? 'Duplicate filename detected' : undefined,
    };
  });
}

/**
 * Measures image dimensions client-side using an HTML Image object
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

/**
 * Validates if an image file type is supported
 */
export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/avif',
];

export const SUPPORTED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'svg',
  'bmp',
  'tiff',
  'tif',
  'avif',
];

export function isSupportedImageFile(file: File): boolean {
  if (SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return true;
  }
  const { extension } = parseFileName(file.name);
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}
