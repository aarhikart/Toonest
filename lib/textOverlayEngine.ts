import {
  TextLayer,
  TextOverlayConfig,
  TextOverlayItem,
  PositionAnchor,
  OutputFormat,
  SOCIAL_PRESETS,
} from './textOverlayTypes';

/**
 * Loads an image from a URL, Blob, or File
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
 * Ensures browser fonts are loaded before rendering
 */
export async function ensureFontsLoaded(fonts: string[]): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    const promises = fonts.map((font) => document.fonts.load(`16px "${font}"`));
    await Promise.allSettled(promises);
    await document.fonts.ready;
  } catch {
    // Graceful fallback if font API encounters an issue
  }
}

/**
 * Interpolates dynamic tokens: {name}, {number}, {date}
 */
export function interpolateTokens(
  template: string,
  fileName: string,
  sequenceIndex = 1
): string {
  const lastDot = fileName.lastIndexOf('.');
  const baseName = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
  const numStr = String(sequenceIndex).padStart(2, '0');
  const dateStr = new Date().toISOString().slice(0, 10);

  return template
    .replace(/\{name\}/gi, baseName)
    .replace(/\{number\}/gi, numStr)
    .replace(/\{date\}/gi, dateStr);
}

/**
 * Draws a rounded rectangle path
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/**
 * Calculates anchor position coordinates (centerX, centerY) for a text layer
 */
export function calculateLayerAnchor(
  pos: PositionAnchor,
  canvasWidth: number,
  canvasHeight: number,
  contentWidth: number,
  contentHeight: number,
  marginOffsetX = 40,
  marginOffsetY = 40,
  customXPercent = 50,
  customYPercent = 50
): { x: number; y: number } {
  const halfW = contentWidth / 2;
  const halfH = contentHeight / 2;

  switch (pos) {
    case 'top-left':
      return { x: marginOffsetX + halfW, y: marginOffsetY + halfH };
    case 'top-center':
      return { x: canvasWidth / 2, y: marginOffsetY + halfH };
    case 'top-right':
      return { x: canvasWidth - marginOffsetX - halfW, y: marginOffsetY + halfH };
    case 'middle-left':
      return { x: marginOffsetX + halfW, y: canvasHeight / 2 };
    case 'center':
      return { x: canvasWidth / 2, y: canvasHeight / 2 };
    case 'middle-right':
      return { x: canvasWidth - marginOffsetX - halfW, y: canvasHeight / 2 };
    case 'bottom-left':
      return { x: marginOffsetX + halfW, y: canvasHeight - marginOffsetY - halfH };
    case 'bottom-center':
      return { x: canvasWidth / 2, y: canvasHeight - marginOffsetY - halfH };
    case 'bottom-right':
      return { x: canvasWidth - marginOffsetX - halfW, y: canvasHeight - marginOffsetY - halfH };
    case 'custom':
      return {
        x: (customXPercent / 100) * canvasWidth,
        y: (customYPercent / 100) * canvasHeight,
      };
    default:
      return { x: canvasWidth / 2, y: canvasHeight / 2 };
  }
}

/**
 * Measures text layer bounds
 */
export function measureTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  rawText: string,
  scaleFactor = 1
): { width: number; height: number; lines: string[]; lineSpacing: number; effectiveFontSize: number } {
  const effectiveFontSize = Math.max(8, Math.round(layer.fontSize * scaleFactor));
  const fontStyle = layer.fontStyle || 'normal';
  const fontWeight = layer.fontWeight || '700';
  const fontFamily = layer.fontFamily || 'Arial';

  ctx.save();
  ctx.font = `${fontStyle} ${fontWeight} ${effectiveFontSize}px "${fontFamily}", sans-serif`;
  if ('letterSpacing' in ctx && typeof layer.letterSpacing === 'number') {
    ctx.letterSpacing = `${layer.letterSpacing * scaleFactor}px`;
  }

  const lines = rawText.split('\n');
  let maxWidth = 0;

  for (const line of lines) {
    const metrics = ctx.measureText(line);
    if (metrics.width > maxWidth) {
      maxWidth = metrics.width;
    }
  }

  ctx.restore();

  const lineSpacing = effectiveFontSize * (layer.lineHeight || 1.2);
  const totalHeight = lines.length > 0 ? (lines.length - 1) * lineSpacing + effectiveFontSize : effectiveFontSize;

  return {
    width: Math.ceil(maxWidth),
    height: Math.ceil(totalHeight),
    lines,
    lineSpacing,
    effectiveFontSize,
  };
}

/**
 * Renders a single text layer onto canvas
 */
export function renderSingleLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number,
  fileName: string,
  sequenceIndex = 1,
  scaleFactor = 1
) {
  if (!layer.isVisible || !layer.text) return;

  const interpolated = interpolateTokens(layer.text, fileName, sequenceIndex);
  if (!interpolated.trim()) return;

  const { width: blockWidth, height: blockHeight, lines, lineSpacing, effectiveFontSize } = measureTextLayer(
    ctx,
    layer,
    interpolated,
    scaleFactor
  );

  ctx.save();

  // Determine anchor
  const anchor = calculateLayerAnchor(
    layer.position,
    canvasWidth,
    canvasHeight,
    blockWidth,
    blockHeight,
    layer.marginOffsetX * scaleFactor,
    layer.marginOffsetY * scaleFactor,
    layer.customXPercent,
    layer.customYPercent
  );

  ctx.translate(anchor.x, anchor.y);

  if (layer.rotation !== 0) {
    ctx.rotate((layer.rotation * Math.PI) / 180);
  }

  const layerAlpha = Math.max(0, Math.min(100, layer.opacity ?? 100)) / 100;
  const padding = (layer.boxPadding || 16) * scaleFactor;
  const boxW = blockWidth + padding * 2;
  const boxH = blockHeight + padding * 2;

  // Optional background box
  if (layer.effect === 'background-box') {
    ctx.save();
    ctx.globalAlpha = ((layer.boxOpacity || 60) / 100) * layerAlpha;
    ctx.fillStyle = layer.boxColor || '#000000';
    drawRoundedRect(
      ctx,
      -boxW / 2,
      -boxH / 2,
      boxW,
      boxH,
      (layer.boxBorderRadius || 8) * scaleFactor
    );
    ctx.fill();
    ctx.restore();
  }

  // Set font styling for lines
  const fontStyle = layer.fontStyle || 'normal';
  const fontWeight = layer.fontWeight || '700';
  const fontFamily = layer.fontFamily || 'Arial';
  ctx.font = `${fontStyle} ${fontWeight} ${effectiveFontSize}px "${fontFamily}", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = layer.alignment;

  if ('letterSpacing' in ctx && typeof layer.letterSpacing === 'number') {
    ctx.letterSpacing = `${layer.letterSpacing * scaleFactor}px`;
  }

  const startY = -blockHeight / 2 + effectiveFontSize / 2;

  lines.forEach((line, idx) => {
    const lineY = startY + idx * lineSpacing;
    let lineX = 0;
    if (layer.alignment === 'left') {
      lineX = -blockWidth / 2;
    } else if (layer.alignment === 'right') {
      lineX = blockWidth / 2;
    }

    ctx.save();
    ctx.globalAlpha = layerAlpha;

    // Drop shadow
    if (layer.effect === 'shadow') {
      ctx.shadowColor = layer.shadowColor || 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = (layer.shadowBlur || 8) * scaleFactor;
      ctx.shadowOffsetX = (layer.shadowOffsetX || 2) * scaleFactor;
      ctx.shadowOffsetY = (layer.shadowOffsetY || 2) * scaleFactor;
    }

    // Outline stroke
    if (layer.effect === 'outline' && layer.outlineWidth > 0) {
      ctx.strokeStyle = layer.outlineColor || '#000000';
      ctx.lineWidth = Math.max(1, layer.outlineWidth * scaleFactor);
      ctx.lineJoin = 'round';
      ctx.strokeText(line, lineX, lineY);
    }

    // Fill text
    ctx.fillStyle = layer.color || '#FFFFFF';
    ctx.fillText(line, lineX, lineY);

    ctx.restore();
  });

  ctx.restore();
}

/**
 * Calculates target canvas dimensions and image crop coordinates based on social presets
 */
export function computeTargetCanvasDimensions(
  imgWidth: number,
  imgHeight: number,
  presetId: string
): {
  canvasWidth: number;
  canvasHeight: number;
  srcX: number;
  srcY: number;
  srcW: number;
  srcH: number;
  scaleFactor: number;
} {
  const preset = SOCIAL_PRESETS.find((p) => p.id === presetId);
  if (!preset || preset.id === 'original' || preset.width === 0) {
    return {
      canvasWidth: imgWidth,
      canvasHeight: imgHeight,
      srcX: 0,
      srcY: 0,
      srcW: imgWidth,
      srcH: imgHeight,
      scaleFactor: 1,
    };
  }

  const targetW = preset.width;
  const targetH = preset.height;
  const targetAspect = targetW / targetH;
  const imgAspect = imgWidth / imgHeight;

  let srcX = 0;
  let srcY = 0;
  let srcW = imgWidth;
  let srcH = imgHeight;

  if (imgAspect > targetAspect) {
    // Image is wider than target: crop horizontal edges
    srcW = imgHeight * targetAspect;
    srcX = (imgWidth - srcW) / 2;
  } else {
    // Image is taller than target: crop vertical edges
    srcH = imgWidth / targetAspect;
    srcY = (imgHeight - srcH) / 2;
  }

  // Scale factor relative to standard 1200px width
  const scaleFactor = targetW / Math.max(1, imgWidth);

  return {
    canvasWidth: targetW,
    canvasHeight: targetH,
    srcX,
    srcY,
    srcW,
    srcH,
    scaleFactor,
  };
}

/**
 * Renders base image and all active text layers onto a canvas context
 */
export function renderTextOverlaysOnCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  layers: TextLayer[],
  config: TextOverlayConfig,
  fileName: string,
  sequenceIndex = 1
) {
  const { canvasWidth, canvasHeight, srcX, srcY, srcW, srcH, scaleFactor } = computeTargetCanvasDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    config.socialPreset
  );

  ctx.canvas.width = canvasWidth;
  ctx.canvas.height = canvasHeight;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Background color if JPEG
  if (config.outputFormat === 'jpeg') {
    ctx.fillStyle = config.jpegBgColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Draw base image (with crop if social preset active)
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvasWidth, canvasHeight);

  // Determine scaling factor
  const effectiveScale = config.scaleProportionally ? scaleFactor : 1;

  // Render each visible layer in order (bottom to top)
  layers.forEach((layer) => {
    if (layer.isVisible) {
      renderSingleLayer(
        ctx,
        layer,
        canvasWidth,
        canvasHeight,
        fileName,
        sequenceIndex,
        effectiveScale
      );
    }
  });
}

/**
 * Maps format choice to browser MIME type
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
      return 'image/png';
  }
}

/**
 * Calculates output filename
 */
export function generateTextOverlayFileName(
  originalName: string,
  config: TextOverlayConfig
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

  let finalBase = baseName;
  if (config.filenameOption === 'suffix') {
    finalBase = `${baseName}${config.customSuffix || '-text-overlay'}`;
  } else if (config.filenameOption === 'prefix') {
    finalBase = `${config.customPrefix || 'text-'}${baseName}`;
  }

  return ext ? `${finalBase}.${ext}` : finalBase;
}

/**
 * Processes a single image item with configured text overlays
 */
export async function processSingleTextOverlayItem(
  item: TextOverlayItem,
  config: TextOverlayConfig,
  sequenceIndex = 1
): Promise<TextOverlayItem> {
  const effectiveLayers = item.hasCustomOverride && item.customLayers ? item.customLayers : config.layers;

  try {
    const baseImg = await loadImage(item.file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    // Ensure all unique fonts used in layers are loaded
    const uniqueFonts = Array.from(new Set(effectiveLayers.map((l) => l.fontFamily)));
    await ensureFontsLoaded(uniqueFonts);

    renderTextOverlaysOnCanvas(ctx, baseImg, effectiveLayers, config, item.name, sequenceIndex);

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
    const finalName = generateTextOverlayFileName(item.name, config);

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
