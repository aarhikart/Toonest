import {
  CompressFileItem,
  CompressionSettings,
  SmartResizeConfig,
  TargetSizeOption,
  OutputFormatOption,
} from './compressorTypes';
import { loadImage } from './conversionEngine';

/**
 * Maps target size string to byte count
 */
export function getTargetBytes(
  option: TargetSizeOption,
  customBytes?: number
): number | null {
  switch (option) {
    case '5mb':
      return 5 * 1024 * 1024;
    case '2mb':
      return 2 * 1024 * 1024;
    case '1mb':
      return 1 * 1024 * 1024;
    case '500kb':
      return 500 * 1024;
    case '250kb':
      return 250 * 1024;
    case 'custom':
      return customBytes || null;
    default:
      return null;
  }
}

/**
 * Resolves output format from settings and original extension
 */
export function resolveOutputFormat(
  originalExt: string,
  option: OutputFormatOption
): string {
  if (option === 'original') {
    const clean = originalExt.toLowerCase();
    return clean === 'jpeg' ? 'jpg' : clean;
  }
  return option;
}

/**
 * Maps format string to canvas MIME type
 */
export function getCompressMimeType(format: string): string {
  switch (format) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    default:
      return 'image/jpeg';
  }
}

/**
 * Calculates output dimensions considering resize options and upscale prevention
 */
export function calculateSmartDimensions(
  origW: number,
  origH: number,
  config: SmartResizeConfig
): { width: number; height: number } {
  if (!config.enabled) {
    return { width: origW, height: origH };
  }

  let targetW = origW;
  let targetH = origH;

  if (config.percentage && config.percentage > 0) {
    const factor = config.percentage / 100;
    targetW = Math.round(origW * factor);
    targetH = Math.round(origH * factor);
  } else if (config.width || config.height) {
    if (config.maintainAspectRatio) {
      if (config.width && !config.height) {
        targetW = config.width;
        targetH = Math.round((origH / origW) * targetW);
      } else if (config.height && !config.width) {
        targetH = config.height;
        targetW = Math.round((origW / origH) * targetH);
      } else if (config.width && config.height) {
        const ratio = Math.min(config.width / origW, config.height / origH);
        targetW = Math.round(origW * ratio);
        targetH = Math.round(origH * ratio);
      }
    } else {
      targetW = config.width || origW;
      targetH = config.height || origH;
    }
  }

  // Max constraints
  if (config.maxWidth && targetW > config.maxWidth) {
    const ratio = config.maxWidth / targetW;
    targetW = config.maxWidth;
    if (config.maintainAspectRatio) {
      targetH = Math.round(targetH * ratio);
    }
  }

  if (config.maxHeight && targetH > config.maxHeight) {
    const ratio = config.maxHeight / targetH;
    targetH = config.maxHeight;
    if (config.maintainAspectRatio) {
      targetW = Math.round(targetW * ratio);
    }
  }

  // Prevent upscale if enabled
  if (config.preventUpscale) {
    if (targetW > origW || targetH > origH) {
      targetW = Math.min(targetW, origW);
      targetH = Math.min(targetH, origH);
    }
  }

  return {
    width: Math.max(1, targetW),
    height: Math.max(1, targetH),
  };
}

/**
 * Draws image to canvas with dimension scaling and background fill
 */
export function renderCanvas(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  targetFormat: string,
  backgroundColor = '#FFFFFF'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas 2D context');

  // Fill background if JPG (does not support transparency)
  if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
    ctx.fillStyle = backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
  } else {
    ctx.clearRect(0, 0, targetW, targetH);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  return canvas;
}

/**
 * Encodes canvas to blob for a given format and quality (1 - 100)
 */
export function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mime = getCompressMimeType(format);
    const qVal = Math.max(0.01, Math.min(1.0, quality / 100));

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Failed to encode image as ${format}`));
      },
      mime,
      format === 'png' ? undefined : qVal
    );
  });
}

/**
 * Fast binary search to find quality level that best fits a target file size
 */
export async function solveQualityForTargetSize(
  canvas: HTMLCanvasElement,
  format: string,
  targetBytes: number,
  initialQuality = 80
): Promise<{ blob: Blob; quality: number; closest: boolean }> {
  // If PNG, quality parameter is not supported by standard canvas, return encoded
  if (format === 'png') {
    const blob = await encodeCanvas(canvas, format, 100);
    return { blob, quality: 100, closest: true };
  }

  let low = 5;
  let high = 95;
  let bestBlob: Blob | null = null;
  let bestQuality = initialQuality;
  let minDiff = Infinity;

  // Run 4 iterations of binary search
  for (let i = 0; i < 4; i++) {
    const mid = Math.round((low + high) / 2);
    const blob = await encodeCanvas(canvas, format, mid);
    const diff = Math.abs(blob.size - targetBytes);

    if (diff < minDiff) {
      minDiff = diff;
      bestBlob = blob;
      bestQuality = mid;
    }

    if (blob.size > targetBytes) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }

    if (Math.abs(blob.size - targetBytes) < targetBytes * 0.05) {
      break; // Within 5% of target
    }
  }

  if (!bestBlob) {
    bestBlob = await encodeCanvas(canvas, format, initialQuality);
  }

  return {
    blob: bestBlob,
    quality: bestQuality,
    closest: true,
  };
}

/**
 * Generates output filename according to naming settings
 */
export function generateCompressedFilename(
  item: CompressFileItem,
  index: number,
  settings: CompressionSettings
): string {
  const ext = resolveOutputFormat(item.originalExtension, settings.outputFormat);
  const { naming } = settings;

  let base = item.originalBaseName;

  switch (naming.mode) {
    case 'original':
      base = item.originalBaseName;
      break;
    case 'suffix':
      base = `${item.originalBaseName}-compressed`;
      break;
    case 'custom':
      base = naming.customName ? naming.customName : `${item.originalBaseName}-compressed`;
      break;
    case 'numbered': {
      const num = String(naming.startNumber + index).padStart(
        Math.max(1, naming.numberPadding),
        '0'
      );
      base = `${naming.prefix || ''}${num}${naming.suffix || ''}`;
      break;
    }
  }

  return `${base}.${ext}`;
}

/**
 * Compresses a single image item through the full pipeline
 */
export async function compressSingleImageItem(
  item: CompressFileItem,
  settings: CompressionSettings,
  index = 0
): Promise<{
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  actualQuality: number;
  isLarger: boolean;
  wasSkipped: boolean;
  reductionPercent: number;
  spaceSaved: number;
  closestAchievable: boolean;
  targetName: string;
}> {
  const img = await loadImage(item.previewUrl);
  const targetFormat = resolveOutputFormat(item.originalExtension, settings.outputFormat);

  // 1. Calculate dimensions
  const { width: finalW, height: finalH } = calculateSmartDimensions(
    img.naturalWidth,
    img.naturalHeight,
    settings.resize
  );

  // 2. Render to canvas
  const canvas = renderCanvas(
    img,
    finalW,
    finalH,
    targetFormat,
    settings.backgroundColor
  );

  // 3. Encode / Solve quality
  const targetBytes = getTargetBytes(
    settings.targetSize,
    settings.customTargetSizeBytes
  );

  let finalBlob: Blob;
  let finalQuality = settings.quality;
  let closestAchievable = false;

  if (targetBytes && targetBytes > 0 && targetFormat !== 'png') {
    const solved = await solveQualityForTargetSize(
      canvas,
      targetFormat,
      targetBytes,
      settings.quality
    );
    finalBlob = solved.blob;
    finalQuality = solved.quality;
    closestAchievable = true;
  } else {
    finalBlob = await encodeCanvas(canvas, targetFormat, settings.quality);
  }

  // 4. Evaluate savings & skip if larger
  const isLarger = finalBlob.size >= item.originalSize;
  let wasSkipped = false;
  let spaceSaved = item.originalSize - finalBlob.size;
  let reductionPercent = Math.round(
    Math.max(0, (spaceSaved / item.originalSize) * 100)
  );

  if (isLarger && settings.skipIfLarger) {
    wasSkipped = true;
    finalBlob = item.file; // Keep original file
    spaceSaved = 0;
    reductionPercent = 0;
  } else if (
    settings.minSavingsPercent > 0 &&
    reductionPercent < settings.minSavingsPercent &&
    settings.skipIfLarger
  ) {
    wasSkipped = true;
    finalBlob = item.file;
    spaceSaved = 0;
    reductionPercent = 0;
  }

  const url = URL.createObjectURL(finalBlob);
  const targetName = generateCompressedFilename(item, index, settings);

  return {
    blob: finalBlob,
    url,
    size: finalBlob.size,
    width: finalW,
    height: finalH,
    actualQuality: finalQuality,
    isLarger,
    wasSkipped,
    reductionPercent,
    spaceSaved: Math.max(0, spaceSaved),
    closestAchievable,
    targetName,
  };
}
