import {
  PixelConfig,
  PixelCustomOverride,
  PixelFileItem,
  CropPosition,
} from './pixelTypes';
import { loadImage } from './conversionEngine';
import { getCompressMimeType, resolveOutputFormat } from './compressorEngine';

/**
 * Calculates Greatest Common Divisor
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

  const decimal = width / height;
  if (Math.abs(decimal - 16 / 9) < 0.02) return '16:9';
  if (Math.abs(decimal - 9 / 16) < 0.02) return '9:16';
  if (Math.abs(decimal - 4 / 3) < 0.02) return '4:3';
  if (Math.abs(decimal - 3 / 4) < 0.02) return '3:4';
  if (Math.abs(decimal - 3 / 2) < 0.02) return '3:2';
  if (Math.abs(decimal - 2 / 3) < 0.02) return '2:3';
  if (Math.abs(decimal - 1) < 0.02) return '1:1';

  return `${wRatio}:${hRatio}`;
}

/**
 * Checks safety parameters to prevent browser tab crashes on massive images
 */
export function checkImageSafety(
  width: number,
  height: number,
  size: number
): { isExcessive: boolean; warning?: string } {
  const pixelCount = width * height;
  const megaPixels = Math.round(pixelCount / 1_000_000);

  if (megaPixels > 50 || size > 50 * 1024 * 1024) {
    return {
      isExcessive: true,
      warning: `Very large image (${megaPixels} MP). Browser memory will be monitored during resize.`,
    };
  }

  if (megaPixels > 30) {
    return {
      isExcessive: true,
      warning: `High resolution (${megaPixels} MP). May take a few extra moments.`,
    };
  }

  return { isExcessive: false };
}

/**
 * Computes exact target dimensions based on config and optional per-item override
 */
export function computePixelDimensions(
  origW: number,
  origH: number,
  config: PixelConfig,
  override?: PixelCustomOverride
): { width: number; height: number; wasUpscaleSkipped: boolean } {
  const mode = override?.mode || config.mode;
  let targetW = override?.width || config.width || origW;
  let targetH = override?.height || config.height || origH;
  let wasUpscaleSkipped = false;

  switch (mode) {
    case 'percentage': {
      const factor = (config.percentage || 100) / 100;
      targetW = Math.max(1, Math.round(origW * factor));
      targetH = Math.max(1, Math.round(origH * factor));
      break;
    }

    case 'longest': {
      const longest = config.longestSide || 1920;
      if (origW >= origH) {
        targetW = longest;
        targetH = Math.max(1, Math.round(origH * (longest / origW)));
      } else {
        targetH = longest;
        targetW = Math.max(1, Math.round(origW * (longest / origH)));
      }
      break;
    }

    case 'shortest': {
      const shortest = config.shortestSide || 1080;
      if (origW <= origH) {
        targetW = shortest;
        targetH = Math.max(1, Math.round(origH * (shortest / origW)));
      } else {
        targetH = shortest;
        targetW = Math.max(1, Math.round(origW * (shortest / origH)));
      }
      break;
    }

    case 'fit': {
      const maxW = targetW;
      const maxH = targetH;
      const ratio = Math.min(maxW / origW, maxH / origH);
      targetW = Math.max(1, Math.round(origW * ratio));
      targetH = Math.max(1, Math.round(origH * ratio));
      break;
    }

    case 'fill': {
      // Dimensions stay as specified (aspect crop applied in canvas)
      break;
    }

    case 'exact':
    default: {
      const maintainRatio =
        override?.maintainAspectRatio !== undefined
          ? override.maintainAspectRatio
          : config.maintainAspectRatio;

      if (maintainRatio) {
        const aspect = origW / origH;
        // If width was changed, compute height from width
        targetH = Math.max(1, Math.round(targetW / aspect));
      }
      break;
    }
  }

  // Orientation handling
  if (config.orientation === 'square') {
    const minDim = Math.min(targetW, targetH);
    targetW = minDim;
    targetH = minDim;
  } else if (config.orientation === 'landscape' && targetW < targetH) {
    const temp = targetW;
    targetW = targetH;
    targetH = temp;
  } else if (config.orientation === 'portrait' && targetW > targetH) {
    const temp = targetW;
    targetW = targetH;
    targetH = temp;
  }

  // Do not upscale safeguard
  if (config.doNotUpscale && (targetW > origW || targetH > origH)) {
    if (mode === 'exact' && !config.maintainAspectRatio) {
      if (targetW > origW) targetW = origW;
      if (targetH > origH) targetH = origH;
    } else {
      const scaleDown = Math.min(origW / targetW, origH / targetH);
      targetW = Math.round(targetW * scaleDown);
      targetH = Math.round(targetH * scaleDown);
    }
    wasUpscaleSkipped = true;
  }

  return {
    width: Math.max(1, Math.min(30000, targetW)),
    height: Math.max(1, Math.min(30000, targetH)),
    wasUpscaleSkipped,
  };
}

/**
 * Calculates source crop coordinates for Fill Dimensions mode
 */
export function calculateCropBounds(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
  cropPosition: CropPosition
): { sx: number; sy: number; sw: number; sh: number } {
  const origRatio = origW / origH;
  const targetRatio = targetW / targetH;

  let sw = origW;
  let sh = origH;
  let sx = 0;
  let sy = 0;

  if (origRatio > targetRatio) {
    // Original is wider than target -> crop left/right edges
    sw = Math.round(origH * targetRatio);
    sh = origH;
  } else {
    // Original is taller than target -> crop top/bottom edges
    sw = origW;
    sh = Math.round(origW / targetRatio);
  }

  switch (cropPosition) {
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
 * Renders resized image onto a Canvas with transforms
 */
export function renderPixelCanvas(
  img: HTMLImageElement,
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
  config: PixelConfig,
  override?: PixelCustomOverride
): HTMLCanvasElement {
  const mode = override?.mode || config.mode;
  let sourceX = 0;
  let sourceY = 0;
  let sourceW = origW;
  let sourceH = origH;

  if (mode === 'fill') {
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

  const isRotated = config.rotate === 90 || config.rotate === 270;
  const canvasW = isRotated ? targetH : targetW;
  const canvasH = isRotated ? targetW : targetH;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not acquire 2D canvas context');

  const outFormat = resolveOutputFormat('jpg', override?.outputFormat || config.outputFormat);
  if (outFormat === 'jpg' || (config.backgroundColor && config.backgroundColor !== 'transparent')) {
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
 * Formats the output filename including optional dimension tags
 */
export function generatePixelFilename(
  item: PixelFileItem,
  index: number,
  config: PixelConfig,
  targetW: number,
  targetH: number
): string {
  const outFormat = resolveOutputFormat(
    item.originalExtension,
    item.customOverride?.outputFormat || config.outputFormat
  );

  let base = item.originalBaseName;

  switch (config.namingMode) {
    case 'original':
      base = item.originalBaseName;
      break;

    case 'dimensions':
      // e.g. photo-1920x1080.jpg
      base = `${item.originalBaseName}-${targetW}x${targetH}`;
      break;

    case 'prefix':
      base = `${config.namingPrefix || 'resized-'}${item.originalBaseName}`;
      break;

    case 'custom':
      base = config.customName ? `${config.customName}-${index + 1}` : `${item.originalBaseName}-resized`;
      break;

    case 'suffix':
    default:
      base = `${item.originalBaseName}${config.namingSuffix || '-resized'}`;
      break;
  }

  return `${base}.${outFormat}`;
}

/**
 * Estimates output file size in bytes
 */
export function estimateOutputSize(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
  originalSize: number,
  config: PixelConfig,
  override?: PixelCustomOverride
): number {
  if (!origW || !origH || !targetW || !targetH || !originalSize) return originalSize;
  const origPixels = origW * origH;
  const targetPixels = targetW * targetH;
  const areaRatio = targetPixels / origPixels;

  let estimated = originalSize * areaRatio;

  const outFormat = resolveOutputFormat('jpg', override?.outputFormat || config.outputFormat);
  const quality = override?.quality || config.quality || 90;

  if (outFormat === 'webp') {
    estimated *= 0.75;
  } else if (outFormat === 'avif') {
    estimated *= 0.6;
  } else if (outFormat === 'png') {
    estimated *= 1.2;
  } else {
    // jpg
    estimated *= Math.max(0.2, quality / 100);
  }

  return Math.max(500, Math.round(estimated));
}

/**
 * Executes full resize pipeline for a single item
 */
export async function resizePixelItem(
  item: PixelFileItem,
  config: PixelConfig,
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
    computePixelDimensions(
      img.naturalWidth,
      img.naturalHeight,
      config,
      item.customOverride
    );

  const canvas = renderPixelCanvas(
    img,
    img.naturalWidth,
    img.naturalHeight,
    targetW,
    targetH,
    config,
    item.customOverride
  );

  const outFormat = resolveOutputFormat(
    item.originalExtension,
    item.customOverride?.outputFormat || config.outputFormat
  );
  const mime = getCompressMimeType(outFormat);
  const qualityVal = Math.max(
    0.01,
    Math.min(1.0, (item.customOverride?.quality || config.quality) / 100)
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to generate image blob'));
      },
      mime,
      outFormat === 'png' ? undefined : qualityVal
    );
  });

  const url = URL.createObjectURL(blob);
  const targetName = generatePixelFilename(item, index, config, targetW, targetH);

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
