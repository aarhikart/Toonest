import {
  ResizeConfig,
  ResizeFileItem,
  CropPosition,
} from './resizerTypes';
import { loadImage } from './conversionEngine';
import { getCompressMimeType, resolveOutputFormat } from './compressorEngine';

/**
 * Calculates Greatest Common Divisor for aspect ratio formatting
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Formats width and height into a readable aspect ratio string (e.g. "16:9", "4:3", "1:1")
 */
export function formatAspectRatio(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const divisor = gcd(width, height);
  const wRatio = width / divisor;
  const hRatio = height / divisor;

  // Approximate standard ratios
  const decimal = width / height;
  if (Math.abs(decimal - 16 / 9) < 0.02) return '16:9';
  if (Math.abs(decimal - 9 / 16) < 0.02) return '9:16';
  if (Math.abs(decimal - 4 / 3) < 0.02) return '4:3';
  if (Math.abs(decimal - 3 / 2) < 0.02) return '3:2';
  if (Math.abs(decimal - 1) < 0.02) return '1:1';

  return `${wRatio}:${hRatio}`;
}

/**
 * Computes exact target dimensions based on resize mode and rules
 */
export function computeTargetDimensions(
  origW: number,
  origH: number,
  config: ResizeConfig
): { width: number; height: number; wasUpscaleSkipped: boolean } {
  let targetW = origW;
  let targetH = origH;
  let wasUpscaleSkipped = false;

  switch (config.mode) {
    case 'percentage': {
      const factor = (config.percentage || 100) / 100;
      targetW = Math.round(origW * factor);
      targetH = Math.round(origH * factor);
      break;
    }

    case 'longest': {
      const longest = config.longestSide || 1920;
      if (origW >= origH) {
        targetW = longest;
        targetH = Math.round(origH * (longest / origW));
      } else {
        targetH = longest;
        targetW = Math.round(origW * (longest / origH));
      }
      break;
    }

    case 'shortest': {
      const shortest = config.shortestSide || 1080;
      if (origW <= origH) {
        targetW = shortest;
        targetH = Math.round(origH * (shortest / origW));
      } else {
        targetH = shortest;
        targetW = Math.round(origW * (shortest / origH));
      }
      break;
    }

    case 'fit': {
      const maxW = config.width || origW;
      const maxH = config.height || origH;
      const ratio = Math.min(maxW / origW, maxH / origH);
      targetW = Math.round(origW * ratio);
      targetH = Math.round(origH * ratio);
      break;
    }

    case 'fill': {
      targetW = config.width || origW;
      targetH = config.height || origH;
      break;
    }

    case 'exact':
    default: {
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
      break;
    }
  }

  // Handle Orientation presets
  if (config.orientation === 'landscape' && targetW < targetH) {
    const temp = targetW;
    targetW = targetH;
    targetH = temp;
  } else if (config.orientation === 'portrait' && targetW > targetH) {
    const temp = targetW;
    targetW = targetH;
    targetH = temp;
  } else if (config.orientation === 'square') {
    const minSide = Math.min(targetW, targetH);
    targetW = minSide;
    targetH = minSide;
  }

  // Prevent upscaling safeguard
  if (config.doNotUpscale && (targetW > origW || targetH > origH)) {
    targetW = Math.min(targetW, origW);
    targetH = Math.min(targetH, origH);
    wasUpscaleSkipped = true;
  }

  return {
    width: Math.max(1, targetW),
    height: Math.max(1, targetH),
    wasUpscaleSkipped,
  };
}

/**
 * Estimates output file size based on dimension reduction and quality
 */
export function estimateOutputSize(
  origSize: number,
  origW: number,
  origH: number,
  outW: number,
  outH: number,
  quality = 90
): number {
  const origPixels = origW * origH;
  const outPixels = outW * outH;
  if (!origPixels) return origSize;

  const ratio = outPixels / origPixels;
  const qFactor = quality / 90;
  const estimated = Math.round(origSize * ratio * qFactor);
  return Math.max(1024, estimated);
}

/**
 * Calculates anchor crop coordinates for "fill" mode
 */
function calculateCropBounds(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
  position: CropPosition
): { sx: number; sy: number; sw: number; sh: number } {
  const targetRatio = targetW / targetH;
  const origRatio = origW / origH;

  let sw = origW;
  let sh = origH;

  if (origRatio > targetRatio) {
    sw = Math.round(origH * targetRatio);
  } else {
    sh = Math.round(origW / targetRatio);
  }

  let sx = 0;
  let sy = 0;

  switch (position) {
    case 'top':
      sx = Math.round((origW - sw) / 2);
      sy = 0;
      break;
    case 'bottom':
      sx = Math.round((origW - sw) / 2);
      sy = origH - sh;
      break;
    case 'left':
      sx = 0;
      sy = Math.round((origH - sh) / 2);
      break;
    case 'right':
      sx = origW - sw;
      sy = Math.round((origH - sh) / 2);
      break;
    case 'center':
    default:
      sx = Math.round((origW - sw) / 2);
      sy = Math.round((origH - sh) / 2);
      break;
  }

  return { sx, sy, sw, sh };
}

/**
 * Renders the resized image to a canvas with rotation, flipping, cropping, and background fills
 */
export function renderResizedCanvas(
  img: HTMLImageElement,
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
  config: ResizeConfig
): HTMLCanvasElement {
  let sourceX = 0;
  let sourceY = 0;
  let sourceW = origW;
  let sourceH = origH;

  if (config.mode === 'fill') {
    const crop = calculateCropBounds(
      origW,
      origH,
      targetW,
      targetH,
      config.cropPosition
    );
    sourceX = crop.sx;
    sourceY = crop.sy;
    sourceW = crop.sw;
    sourceH = crop.sh;
  }

  // Handle rotation 90/270 swap
  const isRotated = config.rotate === 90 || config.rotate === 270;
  const canvasW = isRotated ? targetH : targetW;
  const canvasH = isRotated ? targetW : targetH;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Background fill for JPG
  const outFmt = resolveOutputFormat('jpg', config.outputFormat);
  if (outFmt === 'jpg' || (config.backgroundColor && config.backgroundColor !== 'transparent')) {
    ctx.fillStyle = config.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvasW, canvasH);
  } else {
    ctx.clearRect(0, 0, canvasW, canvasH);
  }

  ctx.save();
  ctx.translate(canvasW / 2, canvasH / 2);

  if (config.rotate) {
    ctx.rotate((config.rotate * Math.PI) / 180);
  }

  const scaleX = config.flipH ? -1 : 1;
  const scaleY = config.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceW,
    sourceH,
    -targetW / 2,
    -targetH / 2,
    targetW,
    targetH
  );

  ctx.restore();

  return canvas;
}

/**
 * Generates an output filename for the resized file
 */
export function generateResizedFilename(
  item: ResizeFileItem,
  index: number,
  config: ResizeConfig
): string {
  const ext = resolveOutputFormat(item.originalExtension, config.outputFormat);
  const { naming } = config;

  let base = item.originalBaseName;

  switch (naming.mode) {
    case 'original':
      base = item.originalBaseName;
      break;
    case 'suffix':
      base = `${item.originalBaseName}-resized`;
      break;
    case 'custom':
      base = naming.customName ? naming.customName : `${item.originalBaseName}-resized`;
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
 * Resizes a single image item through the full pipeline
 */
export async function resizeSingleImageItem(
  item: ResizeFileItem,
  config: ResizeConfig,
  index = 0
): Promise<{
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  wasUpscaleSkipped: boolean;
  targetName: string;
}> {
  const img = await loadImage(item.previewUrl);

  const { width: targetW, height: targetH, wasUpscaleSkipped } =
    computeTargetDimensions(img.naturalWidth, img.naturalHeight, config);

  const canvas = renderResizedCanvas(
    img,
    img.naturalWidth,
    img.naturalHeight,
    targetW,
    targetH,
    config
  );

  const outFormat = resolveOutputFormat(item.originalExtension, config.outputFormat);
  const mime = getCompressMimeType(outFormat);
  const qVal = Math.max(0.01, Math.min(1.0, config.quality / 100));

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to encode resized image'));
      },
      mime,
      outFormat === 'png' ? undefined : qVal
    );
  });

  const url = URL.createObjectURL(blob);
  const targetName = generateResizedFilename(item, index, config);

  return {
    blob,
    url,
    size: blob.size,
    width: targetW,
    height: targetH,
    wasUpscaleSkipped,
    targetName,
  };
}

/**
 * Estimates the resized file size based on pixel area scaling and format compression
 */
export function estimateResizedFileSize(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
  originalSize: number,
  config: ResizeConfig
): number {
  if (!origW || !origH || !targetW || !targetH || !originalSize) return originalSize;
  const originalPixels = origW * origH;
  const targetPixels = targetW * targetH;
  const areaRatio = targetPixels / originalPixels;

  // Base estimation from pixel area
  let estimated = originalSize * areaRatio;

  // Format factor
  const outFmt = resolveOutputFormat('jpg', config.outputFormat);
  if (outFmt === 'webp') {
    estimated *= 0.75;
  } else if (outFmt === 'avif') {
    estimated *= 0.6;
  } else if (outFmt === 'png') {
    estimated *= 1.2;
  } else {
    // jpg
    const qFactor = Math.max(0.2, config.quality / 100);
    estimated *= qFactor;
  }

  return Math.max(500, Math.round(estimated));
}
