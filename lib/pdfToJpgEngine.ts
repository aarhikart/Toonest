import JSZip from 'jszip';
import {
  PdfPageItem,
  PdfConversionConfig,
  ConvertedJpgItem,
  PageOrientation,
} from './pdfToJpgTypes';

/**
 * Format readable file size.
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
 * Sanitize filename.
 */
export function sanitizeFilename(rawName: string): string {
  if (!rawName) return 'unnamed';
  let clean = rawName
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim();
  clean = clean.replace(/^[.\s]+/, '').replace(/[.\s]+$/, '');
  return clean || 'unnamed';
}

/**
 * Parse and validate custom page range strings like "1-3, 5, 8-10".
 */
export function parsePageRange(
  rangeText: string,
  totalPages: number
): { valid: boolean; pages: number[]; error?: string } {
  if (!rangeText.trim()) {
    return { valid: false, pages: [], error: 'Please enter a page range (e.g. 1-3, 5).' };
  }

  const tokens = rangeText.split(',').map((t) => t.trim()).filter(Boolean);
  const selectedPages = new Set<number>();

  for (const token of tokens) {
    if (token.includes('-')) {
      const parts = token.split('-').map((p) => p.trim());
      if (parts.length !== 2) {
        return { valid: false, pages: [], error: `Invalid range format: "${token}"` };
      }
      const start = parseInt(parts[0], 10);
      const end = parseInt(parts[1], 10);

      if (isNaN(start) || isNaN(end)) {
        return { valid: false, pages: [], error: `Invalid page numbers in range: "${token}"` };
      }
      if (start < 1) {
        return { valid: false, pages: [], error: `Page numbers must start at 1.` };
      }
      if (end > totalPages) {
        return {
          valid: false,
          pages: [],
          error: `Page ${end} exceeds total pages in document (${totalPages}).`,
        };
      }
      if (start > end) {
        return { valid: false, pages: [], error: `Start page (${start}) cannot be greater than end page (${end}).` };
      }

      for (let p = start; p <= end; p++) {
        selectedPages.add(p);
      }
    } else {
      const page = parseInt(token, 10);
      if (isNaN(page)) {
        return { valid: false, pages: [], error: `Invalid page number: "${token}"` };
      }
      if (page < 1 || page > totalPages) {
        return {
          valid: false,
          pages: [],
          error: `Page ${page} is out of bounds (1–${totalPages}).`,
        };
      }
      selectedPages.add(page);
    }
  }

  const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
  if (sortedPages.length === 0) {
    return { valid: false, pages: [], error: 'No valid pages found in range.' };
  }

  return { valid: true, pages: sortedPages };
}

/**
 * Generate output JPG filename based on naming config and page number.
 */
export function generateOutputFilename(
  pdfName: string,
  pageNumber: number,
  config: PdfConversionConfig
): string {
  const baseName = sanitizeFilename(pdfName.replace(/\.pdf$/i, ''));
  const padded = String(pageNumber).padStart(config.numberPadding, '0');
  const ext = config.outputFormat === 'png' ? 'png' : 'jpg';

  switch (config.namingPattern) {
    case 'custom-prefix': {
      const prefix = sanitizeFilename(config.customPrefix || 'converted');
      return `${prefix}-page-${padded}.${ext}`;
    }
    case 'custom-suffix': {
      return `${baseName}-${padded}-converted.${ext}`;
    }
    case 'pdf-name':
    default: {
      return `${baseName}-page-${padded}.${ext}`;
    }
  }
}

/**
 * Render low-resolution thumbnail preview of a PDF page for the grid view.
 */
export async function renderPageThumbnail(
  pdfDoc: any,
  pageNumber: number
): Promise<{ url: string; width: number; height: number; orientation: PageOrientation }> {
  const page = await pdfDoc.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1.0 });

  let orientation: PageOrientation = 'portrait';
  if (unscaledViewport.width > unscaledViewport.height * 1.05) {
    orientation = 'landscape';
  } else if (Math.abs(unscaledViewport.width - unscaledViewport.height) < 5) {
    orientation = 'square';
  }

  // Scale down to a max width/height of ~200px for lightweight memory footprint
  const maxDim = 220;
  const scale = Math.min(maxDim / unscaledViewport.width, maxDim / unscaledViewport.height, 0.4);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');

  // White background for preview
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  const url = canvas.toDataURL('image/jpeg', 0.8);

  // Clean up canvas
  canvas.width = 0;
  canvas.height = 0;
  if (typeof page.cleanup === 'function') page.cleanup();

  return {
    url,
    width: Math.round(unscaledViewport.width),
    height: Math.round(unscaledViewport.height),
    orientation,
  };
}

/**
 * Render full-resolution JPG blob based on target DPI and user customization.
 */
export async function renderPageToJpgBlob(
  pdfDoc: any,
  pageNumber: number,
  config: PdfConversionConfig
): Promise<{ blob: Blob; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);

  // 1. Base scale from DPI (72 pt = 1 inch)
  const baseScale = config.dpi / 72;
  let viewport = page.getViewport({ scale: baseScale });

  // 2. Custom resizing adjustment if enabled
  let finalWidth = Math.floor(viewport.width);
  let finalHeight = Math.floor(viewport.height);

  if (config.resizeMode === 'percent' && config.resizePercent !== 100) {
    const scaleFactor = Math.max(0.1, config.resizePercent / 100);
    viewport = page.getViewport({ scale: baseScale * scaleFactor });
    finalWidth = Math.floor(viewport.width);
    finalHeight = Math.floor(viewport.height);
  } else if (config.resizeMode === 'width' && config.resizeWidth) {
    const targetW = config.resizeWidth;
    const scaleFactor = targetW / (viewport.width / baseScale);
    viewport = page.getViewport({ scale: scaleFactor });
    finalWidth = Math.floor(viewport.width);
    finalHeight = Math.floor(viewport.height);
  } else if (config.resizeMode === 'height' && config.resizeHeight) {
    const targetH = config.resizeHeight;
    const scaleFactor = targetH / (viewport.height / baseScale);
    viewport = page.getViewport({ scale: scaleFactor });
    finalWidth = Math.floor(viewport.width);
    finalHeight = Math.floor(viewport.height);
  }

  const canvas = document.createElement('canvas');
  canvas.width = finalWidth;
  canvas.height = finalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');

  // 3. Fill background color (for JPG or opaque PNG; transparent PNG retains alpha channel)
  const isPng = config.outputFormat === 'png';
  if (!isPng || !config.transparentBackground) {
    ctx.fillStyle = config.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, finalWidth, finalHeight);
  } else {
    ctx.clearRect(0, 0, finalWidth, finalHeight);
  }

  // 4. Render PDF page onto canvas
  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  // 5. Convert to Blob (PNG or JPEG)
  const mimeType = isPng ? 'image/png' : 'image/jpeg';
  const qualityParam = isPng ? undefined : Math.max(0.01, Math.min(1.0, config.quality / 100));

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error(`Failed to encode canvas to ${isPng ? 'PNG' : 'JPEG'} blob.`));
      },
      mimeType,
      qualityParam
    );
  });

  // 6. Immediate memory cleanup
  canvas.width = 0;
  canvas.height = 0;
  if (typeof page.cleanup === 'function') page.cleanup();

  return {
    blob,
    width: finalWidth,
    height: finalHeight,
  };
}

/**
 * Package multiple converted JPGs into an organized ZIP archive.
 */
export async function packageConvertedJpgsToZip(
  items: ConvertedJpgItem[],
  zipFilename: string
): Promise<Blob> {
  const zip = new JSZip();

  // Determine if multiple distinct PDFs are included
  const distinctPdfs = new Set(items.map((i) => i.pdfId));
  const isMultiplePdfs = distinctPdfs.size > 1;

  for (const item of items) {
    let zipPath = item.filename;
    if (isMultiplePdfs) {
      const folderName = sanitizeFilename(item.pdfName.replace(/\.pdf$/i, ''));
      zipPath = `${folderName}/${item.filename}`;
    }

    zip.file(zipPath, item.blob);
  }

  // Use STORE compression since JPGs are already compressed
  return await zip.generateAsync({
    type: 'blob',
    compression: 'STORE',
  });
}

/**
 * Trigger client-side download of a file blob.
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
