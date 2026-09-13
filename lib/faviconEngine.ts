import {
  FaviconConfig,
  FaviconSourceItem,
  GeneratedFaviconFile,
  IconShape,
} from './faviconTypes';
import { FAVICON_SIZE_PRESETS, getPresetById } from './faviconPresets';
import { encodeIco, IcoImageEntry } from './icoEncoder';

/**
 * Loads a File or Blob into an HTMLImageElement
 */
export function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let urlToRevoke: string | null = null;
    let url: string;

    if (typeof source === 'string') {
      url = source;
    } else {
      url = URL.createObjectURL(source);
      urlToRevoke = url;
    }

    img.onload = () => {
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      resolve(img);
    };

    img.onerror = (err) => {
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Sanitizes SVG source markup to eliminate XSS vectors
 */
export function sanitizeSvg(svgText: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');

    // Remove scripts, foreignObject, iframe, object, embed
    const dangerousTags = ['script', 'foreignobject', 'iframe', 'object', 'embed', 'applet'];
    dangerousTags.forEach((tag) => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });

    // Remove inline event handlers & dangerous attributes
    const allElements = doc.querySelectorAll('*');
    allElements.forEach((el) => {
      const attributes = Array.from(el.attributes);
      for (const attr of attributes) {
        const name = attr.name.toLowerCase();
        const value = attr.value.toLowerCase().trim();

        if (name.startsWith('on') || name === 'onload' || name === 'onerror') {
          el.removeAttribute(attr.name);
        }
        if ((name === 'href' || name === 'xlink:href') && (value.startsWith('javascript:') || value.startsWith('data:text/html'))) {
          el.removeAttribute(attr.name);
        }
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc.documentElement);
  } catch {
    return svgText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}

/**
 * Clips canvas to specified shape
 */
export function drawShapePath(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shape: IconShape,
  cornerRadiusPercent = 22
) {
  ctx.beginPath();

  if (shape === 'square') {
    ctx.rect(0, 0, w, h);
  } else if (shape === 'rounded') {
    const maxRadius = Math.min(w, h) / 2;
    const radius = (Math.max(0, Math.min(100, cornerRadiusPercent)) / 100) * maxRadius;
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, w, h, radius);
    } else {
      ctx.rect(0, 0, w, h);
    }
  } else if (shape === 'circle') {
    const radius = Math.min(w, h) / 2;
    ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
  } else if (shape === 'squircle') {
    // Apple-style superellipse / smooth squircle
    const r = Math.min(w, h) * 0.22; // smooth corner curvature
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.bezierCurveTo(w - r * 0.35, 0, w, r * 0.35, w, r);
    ctx.lineTo(w, h - r);
    ctx.bezierCurveTo(w, h - r * 0.35, w - r * 0.35, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.bezierCurveTo(r * 0.35, h, 0, h - r * 0.35, 0, h - r);
    ctx.lineTo(0, r);
    ctx.bezierCurveTo(0, r * 0.35, r * 0.35, 0, r, 0);
  }
  ctx.closePath();
}

/**
 * Draws background (solid, gradient, or transparent)
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: FaviconConfig
) {
  if (config.backgroundType === 'solid') {
    ctx.fillStyle = config.backgroundColor || '#5722AF';
    ctx.fillRect(0, 0, w, h);
  } else if (config.backgroundType === 'gradient') {
    if (config.gradientType === 'radial') {
      const grad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        Math.hypot(w / 2, h / 2)
      );
      grad.addColorStop(0, config.gradientStart || '#5722AF');
      grad.addColorStop(1, config.gradientEnd || '#9B6BE8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Linear gradient with angle
      const angleRad = ((config.gradientAngle || 135) * Math.PI) / 180;
      const x1 = w / 2 - (Math.cos(angleRad) * w) / 2;
      const y1 = h / 2 - (Math.sin(angleRad) * h) / 2;
      const x2 = w / 2 + (Math.cos(angleRad) * w) / 2;
      const y2 = h / 2 + (Math.sin(angleRad) * h) / 2;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, config.gradientStart || '#5722AF');
      grad.addColorStop(1, config.gradientEnd || '#9B6BE8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }
}

/**
 * Renders the favicon icon onto a 2D canvas context at specified dimensions
 */
export function renderFaviconToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  config: FaviconConfig,
  targetWidth: number,
  targetHeight: number
) {
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.clearRect(0, 0, targetWidth, targetHeight);

  // 1. Shape clipping & background
  ctx.save();
  if (config.shape !== 'original') {
    drawShapePath(ctx, targetWidth, targetHeight, config.shape, config.cornerRadius);
    ctx.clip();
  }

  // Draw background inside clipped shape
  drawBackground(ctx, targetWidth, targetHeight, config);

  // 2. Draw Image with transformations
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  // Calculate inner drawable box based on padding (0% to 50%)
  const paddingRatio = Math.max(0, Math.min(0.5, (config.padding || 0) / 100));
  const padX = targetWidth * paddingRatio;
  const padY = targetHeight * paddingRatio;
  const availW = targetWidth - padX * 2;
  const availH = targetHeight - padY * 2;

  // Compute base scale according to imageFit
  let baseScale = 1;
  if (config.imageFit === 'contain') {
    baseScale = Math.min(availW / imgW, availH / imgH);
  } else if (config.imageFit === 'cover') {
    baseScale = Math.max(availW / imgW, availH / imgH);
  } else {
    // Custom: default to contain as base
    baseScale = Math.min(availW / imgW, availH / imgH);
  }

  // Apply user zoom (50% to 300%)
  const userZoom = (config.zoom || 100) / 100;
  const finalW = imgW * baseScale * userZoom;
  const finalH = imgH * baseScale * userZoom;

  // Position offset (0 to 100, 50 is center)
  const posXRatio = (config.positionX || 50) / 100;
  const posYRatio = (config.positionY || 50) / 100;

  const centerX = padX + availW * posXRatio;
  const centerY = padY + availH * posYRatio;

  ctx.save();
  ctx.translate(centerX, centerY);

  // Rotation (-180 to 180)
  if (config.rotation) {
    ctx.rotate((config.rotation * Math.PI) / 180);
  }

  // Flips
  const scaleX = config.flipH ? -1 : 1;
  const scaleY = config.flipV ? -1 : 1;
  if (scaleX !== 1 || scaleY !== 1) {
    ctx.scale(scaleX, scaleY);
  }

  ctx.drawImage(img, -finalW / 2, -finalH / 2, finalW, finalH);

  ctx.restore(); // restore image transform
  ctx.restore(); // restore shape clip
}

/**
 * Generates a PNG Blob from a rendered canvas
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'image/png' | 'image/webp' | 'image/jpeg' = 'image/png',
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob conversion failed'));
      },
      format,
      quality
    );
  });
}

/**
 * Converts a Blob to Uint8Array
 */
export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Generates a real Microsoft .ico file containing 16x16, 32x32, and 48x48 PNG streams
 */
export async function generateIcoFile(
  img: HTMLImageElement,
  config: FaviconConfig,
  sizes: number[] = [16, 32, 48]
): Promise<Blob> {
  const entries: IcoImageEntry[] = [];
  const offscreen = document.createElement('canvas');

  for (const s of sizes) {
    renderFaviconToCanvas(offscreen, img, config, s, s);
    const pngBlob = await canvasToBlob(offscreen, 'image/png');
    const pngData = await blobToUint8Array(pngBlob);
    entries.push({
      width: s,
      height: s,
      pngData,
    });
  }

  return encodeIco(entries);
}

/**
 * Generates a valid Progressive Web App Manifest (site.webmanifest)
 */
export function generateManifestJson(config: FaviconConfig): string {
  const name = config.websiteName.trim() || 'My Website';
  const shortName = config.shortName.trim() || name.slice(0, 12);
  const themeColor = config.themeColor || '#5722AF';
  const bgColor = config.manifestBgColor || '#FFFFFF';

  const manifest = {
    name: name,
    short_name: shortName,
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: themeColor,
    background_color: bgColor,
    display: 'standalone',
  };

  return JSON.stringify(manifest, null, 2);
}

/**
 * Generates a ready-to-copy HTML `<head>` snippet for website favicons
 */
export function generateHtmlSnippet(config: FaviconConfig): string {
  const p = config.filenamePrefix ? `${config.filenamePrefix}-` : '';

  const lines: string[] = [
    `<!-- Favicon Package generated with ToolNest Favicon Generator -->`,
    `<link rel="icon" type="image/x-icon" href="/favicon.ico">`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/${p}16x16.png">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/${p}32x32.png">`,
    `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`,
  ];

  if (config.packageOptions.includeManifest) {
    lines.push(`<link rel="manifest" href="/site.webmanifest">`);
  }

  if (config.themeColor) {
    lines.push(`<meta name="theme-color" content="${config.themeColor}">`);
  }

  return lines.join('\n');
}

/**
 * Generates an SVG favicon wrapper or sanitized SVG file
 */
export function generateSvgFavicon(
  sourceItem: FaviconSourceItem,
  config: FaviconConfig
): Blob {
  if (sourceItem.svgContent) {
    const cleanSvg = sanitizeSvg(sourceItem.svgContent);
    return new Blob([cleanSvg], { type: 'image/svg+xml' });
  }

  // Generate SVG container with embedded data URL
  const canvas = document.createElement('canvas');
  const size = 512;
  renderFaviconToCanvas(canvas, document.createElement('img'), config, size, size);
  const dataUrl = canvas.toDataURL('image/png');

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <image href="${dataUrl}" x="0" y="0" width="${size}" height="${size}" />
</svg>`;

  return new Blob([svgContent], { type: 'image/svg+xml' });
}

/**
 * Generates all selected favicon files in bulk
 */
export async function generateAllFaviconFiles(
  sourceItem: FaviconSourceItem,
  img: HTMLImageElement,
  config: FaviconConfig,
  onProgress?: (percent: number, currentItem: string) => void
): Promise<GeneratedFaviconFile[]> {
  const generated: GeneratedFaviconFile[] = [];
  const offscreen = document.createElement('canvas');

  // Filter selected size presets
  const selectedPresets = FAVICON_SIZE_PRESETS.filter((p) =>
    config.selectedSizeIds.includes(p.id)
  );

  const totalSteps =
    selectedPresets.length +
    (config.packageOptions.includeIco ? 1 : 0) +
    (config.packageOptions.includeManifest ? 1 : 0) +
    (config.packageOptions.includeHtmlSnippet ? 1 : 0) +
    (config.packageOptions.includeSvg ? 1 : 0);

  let currentStep = 0;

  // 1. Generate ICO file if requested
  if (config.packageOptions.includeIco && config.selectedSizeIds.includes('ico-multi')) {
    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100), 'Generating favicon.ico...');

    try {
      const icoBlob = await generateIcoFile(img, config, [16, 32, 48]);
      const icoUrl = URL.createObjectURL(icoBlob);
      generated.push({
        id: 'file-ico',
        name: 'favicon.ico',
        filename: 'favicon.ico',
        width: 48,
        height: 48,
        blob: icoBlob,
        url: icoUrl,
        size: icoBlob.size,
        format: 'ICO',
        category: 'Browser Universal',
        isIco: true,
      });
    } catch (err) {
      console.error('Failed to generate ICO file:', err);
    }
  }

  // 2. Generate PNG sizes
  for (const preset of selectedPresets) {
    if (preset.id === 'ico-multi') continue; // handled above

    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100), `Rendering ${preset.name}...`);

    renderFaviconToCanvas(offscreen, img, config, preset.width, preset.height);
    const pngBlob = await canvasToBlob(offscreen, 'image/png');
    const pngUrl = URL.createObjectURL(pngBlob);

    // Apply custom prefix if applicable to standard favicons
    let finalFilename = preset.filename;
    if (config.filenamePrefix && config.filenamePrefix !== 'favicon' && preset.filename.startsWith('favicon-')) {
      finalFilename = preset.filename.replace('favicon-', `${config.filenamePrefix}-`);
    }

    generated.push({
      id: `file-${preset.id}`,
      name: finalFilename,
      filename: finalFilename,
      width: preset.width,
      height: preset.height,
      blob: pngBlob,
      url: pngUrl,
      size: pngBlob.size,
      format: 'PNG',
      category: preset.category,
    });
  }

  // 3. Custom user sizes
  for (let i = 0; i < config.customSizes.length; i++) {
    const cs = config.customSizes[i];
    renderFaviconToCanvas(offscreen, img, config, cs.width, cs.height);
    const blob = await canvasToBlob(offscreen, 'image/png');
    const url = URL.createObjectURL(blob);
    const filename = `favicon-${cs.width}x${cs.height}.png`;

    generated.push({
      id: `file-custom-${i}`,
      name: filename,
      filename: filename,
      width: cs.width,
      height: cs.height,
      blob: blob,
      url: url,
      size: blob.size,
      format: 'PNG',
      category: 'custom',
    });
  }

  // 4. SVG Favicon
  if (config.packageOptions.includeSvg) {
    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100), 'Generating SVG favicon...');

    try {
      const svgBlob = generateSvgFavicon(sourceItem, config);
      const svgUrl = URL.createObjectURL(svgBlob);
      generated.push({
        id: 'file-svg',
        name: 'favicon.svg',
        filename: 'favicon.svg',
        blob: svgBlob,
        url: svgUrl,
        size: svgBlob.size,
        format: 'SVG',
        category: 'Vector Favicon',
        isSvg: true,
      });
    } catch (err) {
      console.error('Failed to generate SVG favicon:', err);
    }
  }

  // 5. Web Manifest
  if (config.packageOptions.includeManifest) {
    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100), 'Creating site.webmanifest...');

    const manifestText = generateManifestJson(config);
    const manifestBlob = new Blob([manifestText], { type: 'application/manifest+json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    generated.push({
      id: 'file-manifest',
      name: 'site.webmanifest',
      filename: 'site.webmanifest',
      blob: manifestBlob,
      url: manifestUrl,
      size: manifestBlob.size,
      format: 'JSON',
      category: 'PWA Manifest',
      isManifest: true,
    });
  }

  // 6. HTML Snippet text file
  if (config.packageOptions.includeHtmlSnippet) {
    currentStep++;
    if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100), 'Generating HTML snippet...');

    const htmlText = generateHtmlSnippet(config);
    const htmlBlob = new Blob([htmlText], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(htmlBlob);

    generated.push({
      id: 'file-html',
      name: 'favicon-html-code.html',
      filename: 'favicon-html-code.html',
      blob: htmlBlob,
      url: htmlUrl,
      size: htmlBlob.size,
      format: 'HTML',
      category: 'Code Snippet',
      isHtml: true,
    });
  }

  return generated;
}
