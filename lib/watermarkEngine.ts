import { WatermarkConfig, WatermarkItem, WatermarkPosition, OutputFormat } from './watermarkTypes';

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

    img.onerror = (err) => {
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
 * Helper to draw a rounded rectangle
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/**
 * Calculates anchor coordinates (centerX, centerY) for a given position and dimensions
 */
export function calculateAnchor(
  pos: WatermarkPosition,
  canvasWidth: number,
  canvasHeight: number,
  contentWidth: number,
  contentHeight: number,
  margin: number,
  customXPercent = 50,
  customYPercent = 50
): { x: number; y: number } {
  const halfW = contentWidth / 2;
  const halfH = contentHeight / 2;

  switch (pos) {
    case 'top-left':
      return { x: margin + halfW, y: margin + halfH };
    case 'top-center':
      return { x: canvasWidth / 2, y: margin + halfH };
    case 'top-right':
      return { x: canvasWidth - margin - halfW, y: margin + halfH };
    case 'middle-left':
      return { x: margin + halfW, y: canvasHeight / 2 };
    case 'center':
      return { x: canvasWidth / 2, y: canvasHeight / 2 };
    case 'middle-right':
      return { x: canvasWidth - margin - halfW, y: canvasHeight / 2 };
    case 'bottom-left':
      return { x: margin + halfW, y: canvasHeight - margin - halfH };
    case 'bottom-center':
      return { x: canvasWidth / 2, y: canvasHeight - margin - halfH };
    case 'bottom-right':
      return { x: canvasWidth - margin - halfW, y: canvasHeight - margin - halfH };
    case 'custom':
      return {
        x: (customXPercent / 100) * canvasWidth,
        y: (customYPercent / 100) * canvasHeight,
      };
    default:
      return { x: canvasWidth - margin - halfW, y: canvasHeight - margin - halfH };
  }
}

/**
 * Measures the multiline text block bounding box
 */
export function measureTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number,
  lineHeight: number
): { width: number; height: number; lines: string[]; lineSpacing: number } {
  const lines = text.split('\n');
  let maxWidth = 0;

  for (const line of lines) {
    const metrics = ctx.measureText(line);
    if (metrics.width > maxWidth) {
      maxWidth = metrics.width;
    }
  }

  const lineSpacing = fontSize * lineHeight;
  const totalHeight = lines.length > 0 ? (lines.length - 1) * lineSpacing + fontSize : fontSize;

  return {
    width: Math.ceil(maxWidth),
    height: Math.ceil(totalHeight),
    lines,
    lineSpacing,
  };
}

/**
 * Draws the watermark onto a provided 2D canvas context
 */
export function renderWatermarkOnCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  logoImg: HTMLImageElement | null,
  config: WatermarkConfig
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // If output requires a solid background (e.g. JPEG) and transparency would show
  if (config.outputFormat === 'jpeg') {
    ctx.fillStyle = config.jpegBgColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw base image
  ctx.drawImage(img, 0, 0, width, height);

  if (config.type === 'text') {
    renderTextWatermark(ctx, width, height, config);
  } else if (config.type === 'image' && logoImg) {
    renderImageWatermark(ctx, width, height, logoImg, config);
  }
}

/**
 * Renders Text Watermark
 */
function renderTextWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  config: WatermarkConfig
) {
  if (!config.text || !config.text.trim()) return;

  ctx.save();

  // Set font
  const fontStyle = config.fontStyle || 'normal';
  const fontWeight = config.fontWeight || 'normal';
  const fontSize = Math.max(8, config.fontSize || 32);
  const fontFamily = config.fontFamily || 'Arial';
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  const { width: blockWidth, height: blockHeight, lines, lineSpacing } = measureTextBlock(
    ctx,
    config.text,
    fontSize,
    config.lineHeight || 1.2
  );

  const drawLinesAtCurrentOrigin = () => {
    const startY = -blockHeight / 2 + fontSize / 2;

    // Optional background box
    if (config.textEffect === 'background-box') {
      ctx.save();
      const padding = config.boxPadding || 10;
      const boxW = blockWidth + padding * 2;
      const boxH = blockHeight + padding * 2;
      const boxX = -boxW / 2;
      const boxY = -boxH / 2;

      ctx.globalAlpha = (config.boxOpacity || 50) / 100;
      ctx.fillStyle = config.boxColor || '#000000';
      drawRoundedRect(ctx, boxX, boxY, boxW, boxH, config.boxBorderRadius || 6);
      ctx.fill();
      ctx.restore();
    }

    // Draw each text line
    lines.forEach((line, index) => {
      const lineY = startY + index * lineSpacing;

      ctx.save();
      ctx.globalAlpha = (config.textOpacity || 75) / 100;

      // Shadow effect
      if (config.textEffect === 'shadow') {
        ctx.shadowColor = config.shadowColor || 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = config.shadowBlur || 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      // Outline effect
      if (config.textEffect === 'outline' && config.outlineWidth > 0) {
        ctx.strokeStyle = config.outlineColor || '#000000';
        ctx.lineWidth = config.outlineWidth || 2;
        ctx.lineJoin = 'round';
        ctx.strokeText(line, 0, lineY);
      }

      // Fill text
      ctx.fillStyle = config.textColor || '#ffffff';
      ctx.fillText(line, 0, lineY);

      ctx.restore();
    });
  };

  if (config.isTiled) {
    // Tiled repeating watermark
    const stepX = blockWidth + (config.tileSpacingX || 100);
    const stepY = blockHeight + (config.tileSpacingY || 80);
    const rad = (config.rotation * Math.PI) / 180;

    // Diagonal span to cover entire rotated canvas
    const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
    const startX = -diagonal;
    const endX = diagonal + canvasWidth;
    const startY = -diagonal;
    const endY = diagonal + canvasHeight;

    for (let y = startY; y < endY; y += stepY) {
      for (let x = startX; x < endX; x += stepX) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rad);
        drawLinesAtCurrentOrigin();
        ctx.restore();
      }
    }
  } else {
    // Single placement
    const { x, y } = calculateAnchor(
      config.position,
      canvasWidth,
      canvasHeight,
      blockWidth,
      blockHeight,
      config.marginOffset || 24,
      config.customXPercent,
      config.customYPercent
    );

    ctx.translate(x, y);
    if (config.rotation !== 0) {
      ctx.rotate((config.rotation * Math.PI) / 180);
    }
    drawLinesAtCurrentOrigin();
  }

  ctx.restore();
}

/**
 * Renders Image/Logo Watermark
 */
function renderImageWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  logoImg: HTMLImageElement,
  config: WatermarkConfig
) {
  if (!logoImg.naturalWidth || !logoImg.naturalHeight) return;

  ctx.save();

  // Scale relative to canvas width
  const scaleFraction = (config.logoScalePercent || 20) / 100;
  const targetW = Math.max(16, Math.min(canvasWidth * 2, canvasWidth * scaleFraction));
  const aspect = logoImg.naturalHeight / logoImg.naturalWidth;
  const targetH = targetW * aspect;

  const drawLogoAtCenter = () => {
    ctx.save();
    ctx.globalAlpha = (config.logoOpacity || 80) / 100;
    ctx.drawImage(logoImg, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();
  };

  if (config.isTiled) {
    const stepX = targetW + (config.tileSpacingX || 100);
    const stepY = targetH + (config.tileSpacingY || 80);
    const rad = (config.rotation * Math.PI) / 180;

    const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
    const startX = -diagonal;
    const endX = diagonal + canvasWidth;
    const startY = -diagonal;
    const endY = diagonal + canvasHeight;

    for (let y = startY; y < endY; y += stepY) {
      for (let x = startX; x < endX; x += stepX) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rad);
        drawLogoAtCenter();
        ctx.restore();
      }
    }
  } else {
    const { x, y } = calculateAnchor(
      config.position,
      canvasWidth,
      canvasHeight,
      targetW,
      targetH,
      config.marginOffset || 24,
      config.customXPercent,
      config.customYPercent
    );

    ctx.translate(x, y);
    if (config.rotation !== 0) {
      ctx.rotate((config.rotation * Math.PI) / 180);
    }
    drawLogoAtCenter();
  }

  ctx.restore();
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
 * Calculates new output filename according to user settings
 */
export function generateWatermarkedFileName(
  originalName: string,
  config: WatermarkConfig
): string {
  const lastDot = originalName.lastIndexOf('.');
  let baseName = originalName;
  let ext = '';

  if (lastDot !== -1) {
    baseName = originalName.slice(0, lastDot);
    ext = originalName.slice(lastDot + 1).toLowerCase();
  }

  // Update extension if user forced a specific output format
  if (config.outputFormat === 'jpeg') ext = 'jpg';
  else if (config.outputFormat === 'png') ext = 'png';
  else if (config.outputFormat === 'webp') ext = 'webp';
  else if (config.outputFormat === 'avif') ext = 'avif';

  let finalBase = baseName;
  if (config.filenameOption === 'suffix') {
    finalBase = `${baseName}${config.customSuffix || '-watermarked'}`;
  } else if (config.filenameOption === 'prefix') {
    finalBase = `${config.customPrefix || 'watermarked-'}${baseName}`;
  }

  return ext ? `${finalBase}.${ext}` : finalBase;
}

/**
 * Processes a single item with watermark rendering and returns updated WatermarkItem
 */
export async function watermarkSingleItem(
  item: WatermarkItem,
  baseConfig: WatermarkConfig,
  logoImg: HTMLImageElement | null
): Promise<WatermarkItem> {
  const effectiveConfig: WatermarkConfig = {
    ...baseConfig,
    ...(item.customConfig || {}),
  };

  try {
    const baseImg = await loadImage(item.file);
    const canvas = document.createElement('canvas');
    canvas.width = baseImg.naturalWidth || item.originalWidth || 800;
    canvas.height = baseImg.naturalHeight || item.originalHeight || 600;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    renderWatermarkOnCanvas(ctx, baseImg, logoImg, effectiveConfig);

    const mimeType = getOutputMimeType(item.file.type, effectiveConfig.outputFormat);
    const quality = (effectiveConfig.quality || 90) / 100;

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
    const finalName = generateWatermarkedFileName(item.name, effectiveConfig);

    return {
      ...item,
      name: finalName,
      watermarkedBlob: blob,
      watermarkedUrl: newUrl,
      watermarkedSize: blob.size,
      status: 'done',
      error: undefined,
    };
  } catch (err: unknown) {
    return {
      ...item,
      status: 'error',
      error: err instanceof Error ? err.message : 'Watermark processing failed',
    };
  }
}
