import {
  ImageFormat,
  ConversionSettings,
  ConvertFileItem,
  ResizeConfig,
  CropConfig,
  TransformConfig,
} from './converterTypes';

/**
 * Returns the MIME type corresponding to an image format
 */
export function getMimeType(format: ImageFormat): string {
  switch (format) {
    case 'jpg':
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
 * Checks if browser canvas supports exporting to a specific format
 */
export function checkFormatSupport(format: ImageFormat): boolean {
  if (typeof document === 'undefined') return true;
  const mime = getMimeType(format);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL(mime);
    return dataUrl.startsWith(`data:${mime}`);
  } catch (e) {
    return false;
  }
}

/**
 * Detects if an image contains transparent pixels
 */
export function detectTransparency(
  img: HTMLImageElement,
  sampleLimit = 50000
): boolean {
  try {
    const canvas = document.createElement('canvas');
    const w = Math.min(img.naturalWidth, 300);
    const h = Math.min(img.naturalHeight, 300);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h).data;

    const step = Math.max(1, Math.floor((imgData.length / 4) / sampleLimit));
    for (let i = 3; i < imgData.length; i += 4 * step) {
      if (imgData[i] < 250) {
        return true;
      }
    }
  } catch (e) {
    // If cross-origin or canvas read fails
  }
  return false;
}

/**
 * Calculates output dimensions considering resize rules, percentage, and max constraints
 */
export function calculateOutputDimensions(
  origW: number,
  origH: number,
  config: ResizeConfig
): { width: number; height: number } {
  if (!config.enabled) {
    return { width: origW, height: origH };
  }

  let targetW = origW;
  let targetH = origH;

  // Percentage resize
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
        // Fit within bounding box while maintaining ratio
        const ratio = Math.min(config.width / origW, config.height / origH);
        targetW = Math.round(origW * ratio);
        targetH = Math.round(origH * ratio);
      }
    } else {
      targetW = config.width || origW;
      targetH = config.height || origH;
    }
  }

  // Max bounds
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

  return {
    width: Math.max(1, targetW),
    height: Math.max(1, targetH),
  };
}

/**
 * Loads an image URL into an HTMLImageElement
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image for conversion'));
    img.src = url;
  });
}

/**
 * Renders an image to a canvas with all crop, resize, rotate, flip, and background fills applied
 */
export function renderTransformedCanvas(
  img: HTMLImageElement,
  settings: ConversionSettings,
  hasTransp = false
): HTMLCanvasElement {
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  // 1. Calculate Crop bounds
  let sourceX = 0;
  let sourceY = 0;
  let sourceW = origW;
  let sourceH = origH;

  if (settings.crop.enabled && settings.crop.preset !== 'free') {
    let targetRatio = 1;
    switch (settings.crop.preset) {
      case '1:1':
        targetRatio = 1;
        break;
      case '4:3':
        targetRatio = 4 / 3;
        break;
      case '16:9':
        targetRatio = 16 / 9;
        break;
      case '3:2':
        targetRatio = 3 / 2;
        break;
      case '9:16':
        targetRatio = 9 / 16;
        break;
    }

    const currentRatio = origW / origH;
    if (currentRatio > targetRatio) {
      // Image is wider than crop box
      sourceW = Math.round(origH * targetRatio);
      sourceH = origH;
      sourceX = Math.round((origW - sourceW) / 2);
    } else {
      // Image is taller than crop box
      sourceW = origW;
      sourceH = Math.round(origW / targetRatio);
      sourceY = Math.round((origH - sourceH) / 2);
    }
  }

  // 2. Calculate Final Output Dimensions after Resize
  const { width: targetW, height: targetH } = calculateOutputDimensions(
    sourceW,
    sourceH,
    settings.resize
  );

  // 3. Handle 90/270 deg rotation swapping width & height
  const isRotated90or270 =
    settings.transform.rotate === 90 || settings.transform.rotate === 270;
  const finalCanvasW = isRotated90or270 ? targetH : targetW;
  const finalCanvasH = isRotated90or270 ? targetW : targetH;

  const canvas = document.createElement('canvas');
  canvas.width = finalCanvasW;
  canvas.height = finalCanvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // 4. Background filling
  // If target format is JPG (which does not support alpha), fill background
  if (settings.targetFormat === 'jpg' || (settings.backgroundColor && settings.backgroundColor !== 'transparent')) {
    ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, finalCanvasW, finalCanvasH);
  } else {
    ctx.clearRect(0, 0, finalCanvasW, finalCanvasH);
  }

  // 5. Apply transforms: Rotation & Flip
  ctx.save();
  ctx.translate(finalCanvasW / 2, finalCanvasH / 2);

  if (settings.transform.rotate) {
    ctx.rotate((settings.transform.rotate * Math.PI) / 180);
  }

  const scaleX = settings.transform.flipH ? -1 : 1;
  const scaleY = settings.transform.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Smooth scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the cropped & scaled portion centered
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
 * Converts a canvas to a blob with format-specific quality encoding
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  settings: ConversionSettings
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mime = getMimeType(format);

    // Normalize quality (0.01 to 1.0)
    let qualityVal = settings.quality / 100;
    if (format === 'webp' && settings.webpLossless) {
      qualityVal = 1.0;
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback if browser failed format (e.g. unsupported AVIF)
          reject(new Error(`Failed to encode image as ${format.toUpperCase()}`));
        }
      },
      mime,
      format === 'png' ? undefined : qualityVal
    );
  });
}

/**
 * Generates an output filename according to naming settings
 */
export function generateConvertedFilename(
  item: ConvertFileItem,
  index: number,
  settings: ConversionSettings
): string {
  const ext = settings.targetFormat;
  const { naming } = settings;

  let base = item.originalBaseName;

  switch (naming.mode) {
    case 'original':
      base = item.originalBaseName;
      break;
    case 'suffix':
      base = `${item.originalBaseName}-${ext}`;
      break;
    case 'custom':
      base = naming.customName ? naming.customName : `${item.originalBaseName}-converted`;
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
 * Converts a single item through the full pipeline
 */
export async function convertSingleImage(
  item: ConvertFileItem,
  settings: ConversionSettings
): Promise<{
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
}> {
  const img = await loadImage(item.previewUrl);
  const canvas = renderTransformedCanvas(img, settings, item.hasTransparency);
  const blob = await canvasToBlob(canvas, settings.targetFormat, settings);
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    size: blob.size,
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Disambiguates a list of filenames so no two files have identical names
 */
export function deduplicateFilenames(names: string[]): string[] {
  const counts = new Map<string, number>();
  return names.map((name) => {
    const lower = name.toLowerCase();
    const count = counts.get(lower) || 0;
    counts.set(lower, count + 1);

    if (count > 0) {
      const dot = name.lastIndexOf('.');
      if (dot !== -1) {
        return `${name.slice(0, dot)}-${count}${name.slice(dot)}`;
      }
      return `${name}-${count}`;
    }
    return name;
  });
}
