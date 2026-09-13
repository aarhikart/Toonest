import {
  SocialMediaConfig,
  SocialMediaItem,
  CropSettings,
  OutputFormat,
} from './socialMediaTypes';
import { getPresetById } from './socialMediaPresets';

/**
 * Loads an image from URL, Blob, or File
 */
export function loadImage(src: string | File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let objectUrl: string | null = null;

    img.onload = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      resolve(img);
    };

    img.onerror = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      reject(new Error('Failed to load image'));
    };

    if (typeof src === 'string') {
      img.src = src;
    } else {
      objectUrl = URL.createObjectURL(src);
      img.src = objectUrl;
    }
  });
}

/**
 * Calculates greatest common divisor to compute aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  const ratioW = Math.round(width) / divisor;
  const ratioH = Math.round(height) / divisor;

  // If ratio numbers are too large, provide decimal approximation
  if (ratioW > 30 || ratioH > 30) {
    const dec = (width / height).toFixed(2);
    return `${dec}:1`;
  }
  return `${ratioW}:${ratioH}`;
}

/**
 * Resolves target dimensions from config
 */
export function getTargetDimensions(config: SocialMediaConfig): { width: number; height: number } {
  if (config.presetId === 'custom') {
    return {
      width: Math.max(16, Math.round(config.customWidth || 1080)),
      height: Math.max(16, Math.round(config.customHeight || 1080)),
    };
  }
  const preset = getPresetById(config.presetId);
  return {
    width: preset.width,
    height: preset.height,
  };
}

/**
 * Lightweight browser-local face / subject detection heuristic
 * Prioritizes face / portrait focal estimation in the browser without external APIs
 */
export function detectFaceCenter(
  img: HTMLImageElement
): { xPercent: number; yPercent: number } | null {
  try {
    const sampleW = 40;
    const sampleH = 40;
    const canvas = document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, sampleW, sampleH);
    const data = ctx.getImageData(0, 0, sampleW, sampleH).data;

    let skinCount = 0;
    let skinSumX = 0;
    let skinSumY = 0;

    // Scan top 65% of image for face clusters
    for (let y = 1; y < sampleH * 0.65; y++) {
      for (let x = 1; x < sampleW - 1; x++) {
        const idx = (y * sampleW + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (a > 128 && r > 90 && g > 40 && b > 20 && r > g && r > b && (r - g) > 15) {
          skinCount++;
          skinSumX += x;
          skinSumY += y;
        }
      }
    }

    if (skinCount >= (sampleW * sampleH) * 0.02) {
      const avgX = (skinSumX / skinCount / sampleW) * 100;
      const avgY = (skinSumY / skinCount / sampleH) * 100;
      return {
        xPercent: Math.max(15, Math.min(85, Math.round(avgX))),
        yPercent: Math.max(15, Math.min(75, Math.round(avgY))),
      };
    }
  } catch {
    // Ignore and fallback
  }
  return null;
}

/**
 * Lightweight local visual saliency analysis (contrast / edge detection) for smart crop
 */
export function estimateVisualCenter(
  img: HTMLImageElement,
  checkFace = false
): { xPercent: number; yPercent: number } {
  if (checkFace) {
    const face = detectFaceCenter(img);
    if (face) return face;
  }

  try {
    const sampleW = 32;
    const sampleH = 32;
    const canvas = document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { xPercent: 50, yPercent: 50 };

    ctx.drawImage(img, 0, 0, sampleW, sampleH);
    const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imageData.data;

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    for (let y = 1; y < sampleH - 1; y++) {
      for (let x = 1; x < sampleW - 1; x++) {
        const idx = (y * sampleW + x) * 4;
        const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

        // Simple Laplacian edge gradient
        const idxRight = (y * sampleW + (x + 1)) * 4;
        const lumRight = data[idxRight] * 0.299 + data[idxRight + 1] * 0.587 + data[idxRight + 2] * 0.114;
        const idxBottom = ((y + 1) * sampleW + x) * 4;
        const lumBottom = data[idxBottom] * 0.299 + data[idxBottom + 1] * 0.587 + data[idxBottom + 2] * 0.114;

        const edge = Math.abs(lum - lumRight) + Math.abs(lum - lumBottom);
        const weight = Math.pow(edge / 255, 2);

        weightedX += x * weight;
        weightedY += y * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight > 0.1) {
      const bestX = (weightedX / totalWeight / sampleW) * 100;
      const bestY = (weightedY / totalWeight / sampleH) * 100;
      return {
        xPercent: Math.max(20, Math.min(80, Math.round(bestX))),
        yPercent: Math.max(20, Math.min(80, Math.round(bestY))),
      };
    }
  } catch {
    // Fallback if security or canvas error
  }
  return { xPercent: 50, yPercent: 50 };
}

/**
 * Calculates image positioning inside target canvas
 */
export function calculateTransform(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number,
  cropSettings: CropSettings,
  smartCenter = { xPercent: 50, yPercent: 50 }
): {
  drawX: number;
  drawY: number;
  drawW: number;
  drawH: number;
} {
  const zoom = Math.max(1, cropSettings.zoom || 1);

  if (cropSettings.mode === 'stretch') {
    return {
      drawX: 0,
      drawY: 0,
      drawW: targetWidth,
      drawH: targetHeight,
    };
  }

  let baseScale = 1;
  if (cropSettings.mode === 'fit') {
    baseScale = Math.min(targetWidth / imgWidth, targetHeight / imgHeight) * zoom;
  } else {
    // Crop to fill
    baseScale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight) * zoom;
  }

  const drawW = imgWidth * baseScale;
  const drawH = imgHeight * baseScale;

  let drawX = (targetWidth - drawW) / 2;
  let drawY = (targetHeight - drawH) / 2;

  // Apply discrete position presets
  if (cropSettings.position === 'top') {
    drawY = 0;
  } else if (cropSettings.position === 'bottom') {
    drawY = targetHeight - drawH;
  } else if (cropSettings.position === 'left') {
    drawX = 0;
  } else if (cropSettings.position === 'right') {
    drawX = targetWidth - drawW;
  } else if (cropSettings.position === 'center' && cropSettings.smartCrop) {
    // Adjust slightly according to smart visual focus
    const diffX = (50 - smartCenter.xPercent) * 0.01 * (drawW - targetWidth);
    const diffY = (50 - smartCenter.yPercent) * 0.01 * (drawH - targetHeight);
    drawX += diffX;
    drawY += diffY;
  }

  // Add manual pan offsets
  const maxPanX = Math.max(0, (drawW - targetWidth) / 2);
  const maxPanY = Math.max(0, (drawH - targetHeight) / 2);
  drawX += (cropSettings.panX / 100) * maxPanX;
  drawY += (cropSettings.panY / 100) * maxPanY;

  return {
    drawX,
    drawY,
    drawW,
    drawH,
  };
}

/**
 * Draws non-destructive safe area guides on preview canvas
 */
export function drawSafeAreaOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  platform: string
) {
  ctx.save();

  // Draw semi-transparent header/footer bounds for Stories/Reels/Shorts/TikTok
  const topSafeHeight = Math.round(height * 0.14); // ~250px on 1920
  const bottomSafeHeight = Math.round(height * 0.2); // ~380px on 1920

  ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
  // Top unsafe bar
  ctx.fillRect(0, 0, width, topSafeHeight);
  // Bottom unsafe bar
  ctx.fillRect(0, height - bottomSafeHeight, width, bottomSafeHeight);

  // Guide lines
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);

  ctx.beginPath();
  ctx.moveTo(0, topSafeHeight);
  ctx.lineTo(width, topSafeHeight);
  ctx.moveTo(0, height - bottomSafeHeight);
  ctx.lineTo(width, height - bottomSafeHeight);
  ctx.stroke();

  // If Instagram Reel, also show 1:1 center feed crop box guide
  if (platform === 'instagram') {
    const squareH = width; // 1:1
    const squareY = (height - squareH) / 2;
    ctx.strokeStyle = 'rgba(123, 69, 209, 0.85)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, squareY, width, squareH);

    ctx.fillStyle = 'rgba(123, 69, 209, 0.9)';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('1:1 Profile Feed Crop Area', 20, squareY + 28);
  }

  // Label text
  ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Unsafe Area (Header UI & Profile)', 20, topSafeHeight - 16);
  ctx.fillText('Unsafe Area (Captions & Actions)', 20, height - 20);

  ctx.restore();
}

/**
 * Renders social media resized image onto a 2D canvas context
 */
export function renderSocialMediaCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: SocialMediaConfig,
  customCrop?: Partial<CropSettings>,
  isInteractivePreview = false
) {
  const cropSettings: CropSettings = {
    ...config.cropSettings,
    ...(customCrop || {}),
  };

  const { width: targetW, height: targetH } = getTargetDimensions(config);
  ctx.canvas.width = targetW;
  ctx.canvas.height = targetH;

  // Clear
  ctx.clearRect(0, 0, targetW, targetH);

  // Handle Background for 'fit' mode
  if (cropSettings.mode === 'fit') {
    if (cropSettings.backgroundMode === 'blur') {
      // Draw blurred backdrop
      ctx.save();
      const blurPx = Math.max(4, cropSettings.blurAmount || 24);
      const brightness = Math.max(40, cropSettings.blurBrightness || 90);
      ctx.filter = `blur(${blurPx}px) brightness(${brightness}%)`;

      // Scale background image to cover full target
      const bgScale = Math.max(targetW / img.naturalWidth, targetH / img.naturalHeight) * 1.15;
      const bgW = img.naturalWidth * bgScale;
      const bgH = img.naturalHeight * bgScale;
      const bgX = (targetW - bgW) / 2;
      const bgY = (targetH - bgH) / 2;
      ctx.drawImage(img, bgX, bgY, bgW, bgH);
      ctx.restore();
    } else if (cropSettings.backgroundMode === 'black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (cropSettings.backgroundMode === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (cropSettings.backgroundMode === 'custom') {
      ctx.fillStyle = cropSettings.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);
    }
  } else if (config.outputFormat === 'jpeg') {
    // JPG requires solid base
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  // Calculate transform
  const smartCenter = cropSettings.smartCrop
    ? estimateVisualCenter(img, cropSettings.faceSafeCrop)
    : { xPercent: 50, yPercent: 50 };

  const { drawX, drawY, drawW, drawH } = calculateTransform(
    img.naturalWidth,
    img.naturalHeight,
    targetW,
    targetH,
    cropSettings,
    smartCenter
  );

  ctx.save();

  // Center coordinate transformations for rotation and flipping
  const centerX = drawX + drawW / 2;
  const centerY = drawY + drawH / 2;
  ctx.translate(centerX, centerY);

  const totalAngle =
    ((cropSettings.rotation || 0) + (cropSettings.fineRotation || 0)) * (Math.PI / 180);
  if (totalAngle !== 0) {
    ctx.rotate(totalAngle);
  }

  const scaleX = cropSettings.flipH ? -1 : 1;
  const scaleY = cropSettings.flipV ? -1 : 1;
  if (scaleX !== 1 || scaleY !== 1) {
    ctx.scale(scaleX, scaleY);
  }

  // Draw main transformed image
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();

  // If in interactive preview and safe areas enabled, draw non-destructive overlay
  if (isInteractivePreview && cropSettings.showSafeArea) {
    const preset = getPresetById(config.presetId);
    if (preset.hasSafeArea) {
      drawSafeAreaOverlay(ctx, targetW, targetH, preset.platform);
    }
  }
}

/**
 * Maps format choice to MIME type
 */
export function getOutputMimeType(originalMime: string, format: OutputFormat): string {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'original':
    default:
      if (originalMime === 'image/jpeg' || originalMime === 'image/jpg') return 'image/jpeg';
      if (originalMime === 'image/png') return 'image/png';
      if (originalMime === 'image/webp') return 'image/webp';
      if (originalMime === 'image/avif') return 'image/avif';
      return 'image/jpeg';
  }
}

/**
 * Calculates new output filename
 */
export function generateSocialFilename(
  originalName: string,
  config: SocialMediaConfig
): string {
  const lastDot = originalName.lastIndexOf('.');
  let baseName = originalName;
  let ext = '';

  if (lastDot !== -1) {
    baseName = originalName.slice(0, lastDot);
    ext = originalName.slice(lastDot + 1).toLowerCase();
  }

  if (config.outputFormat === 'jpeg') ext = 'jpg';
  else if (config.outputFormat === 'png') ext = 'png';
  else if (config.outputFormat === 'webp') ext = 'webp';
  else if (config.outputFormat === 'avif') ext = 'avif';

  const { width, height } = getTargetDimensions(config);
  const preset = getPresetById(config.presetId);

  let finalBase = baseName;
  if (config.filenameOption === 'platform') {
    finalBase = `${baseName}-${preset.platform}-${width}x${height}`;
  } else if (config.filenameOption === 'suffix') {
    finalBase = `${baseName}${config.customSuffix || '-social'}`;
  } else if (config.filenameOption === 'prefix') {
    finalBase = `${config.customPrefix || 'social-'}${baseName}`;
  }

  return ext ? `${finalBase}.${ext}` : finalBase;
}

/**
 * Processes a single social media image item
 */
export async function processSocialMediaItem(
  item: SocialMediaItem,
  config: SocialMediaConfig
): Promise<SocialMediaItem> {
  try {
    const baseImg = await loadImage(item.file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    renderSocialMediaCanvas(ctx, baseImg, config, item.customCropSettings, false);

    const mimeType = getOutputMimeType(item.file.type, config.outputFormat);
    const quality = (config.quality || 90) / 100;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create image Blob from canvas'));
        },
        mimeType,
        quality
      );
    });

    const newUrl = URL.createObjectURL(blob);
    const finalName = generateSocialFilename(item.name, config);

    return {
      ...item,
      name: finalName,
      processedBlob: blob,
      processedUrl: newUrl,
      processedSize: blob.size,
      status: 'done',
      error: undefined,
    };
  } catch (err: unknown) {
    return {
      ...item,
      status: 'error',
      error: err instanceof Error ? err.message : 'Processing failed',
    };
  }
}
