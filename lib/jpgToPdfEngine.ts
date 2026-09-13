import { PDFDocument, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import {
  JpgImageItem,
  JpgToPdfConfig,
  PdfPageSize,
  ConversionProgress,
  GeneratedPdfResult,
} from './jpgToPdfTypes';

// Conversion constant: 1 mm = 72 / 25.4 points ≈ 2.83464567 pt
export const MM_TO_PT = 72 / 25.4;
export const PT_TO_MM = 25.4 / 72;

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

export function ptToMm(pt: number): number {
  return pt * PT_TO_MM;
}

// Standard page dimensions in points [width, height] (portrait)
export const PAGE_SIZES_PT: Record<Exclude<PdfPageSize, 'original' | 'custom'>, [number, number]> = {
  a4: [595.28, 841.89],
  a3: [841.89, 1190.55],
  a5: [419.53, 595.28],
  letter: [612.0, 792.0],
  legal: [612.0, 1008.0],
};

export const MARGIN_PRESETS_MM = {
  none: 0,
  small: 5,
  medium: 10,
  large: 20,
};

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
  if (!rawName) return 'converted-images.pdf';
  let clean = rawName
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim();
  clean = clean.replace(/^[.\s]+/, '').replace(/[.\s]+$/, '');
  return clean || 'converted-images.pdf';
}

/**
 * Helper to convert HEX color string to pdf-lib rgb values.
 */
export function hexToRgbPdf(hex: string) {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return rgb(r / 255, g / 255, b / 255);
}

/**
 * Extract natural dimensions from an image File.
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight, previewUrl });
    };
    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error('Failed to load image metadata.'));
    };
    img.src = previewUrl;
  });
}

/**
 * Process image to JPEG ArrayBuffer according to rotation and quality settings.
 */
export async function prepareImageBytes(
  item: JpgImageItem,
  config: JpgToPdfConfig
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  // If no rotation and max quality, we can embed the raw file bytes directly
  if (item.rotation === 0 && config.quality >= 95 && config.compression === 'best') {
    const buffer = await item.file.arrayBuffer();
    return {
      bytes: new Uint8Array(buffer),
      width: item.width,
      height: item.height,
    };
  }

  // Otherwise, use Canvas to apply rotation and quality recompression
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      const isRotated90or270 = item.rotation === 90 || item.rotation === 270;
      const targetWidth = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const targetHeight = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable.'));
        return;
      }

      // Fill with background color before drawing
      ctx.fillStyle = config.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Apply rotation transformation
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      // Determine compression factor
      let qualityFactor = config.quality / 100;
      if (config.compression === 'small') {
        qualityFactor = Math.min(qualityFactor, 0.65);
      } else if (config.compression === 'balanced') {
        qualityFactor = Math.min(qualityFactor, 0.85);
      }

      canvas.toBlob(
        async (blob) => {
          // Clean canvas memory
          canvas.width = 0;
          canvas.height = 0;

          if (!blob) {
            reject(new Error('Failed to encode image to JPEG.'));
            return;
          }

          const buf = await blob.arrayBuffer();
          resolve({
            bytes: new Uint8Array(buf),
            width: targetWidth,
            height: targetHeight,
          });
        },
        'image/jpeg',
        qualityFactor
      );
    };

    img.onerror = () => reject(new Error(`Failed to load image "${item.name}".`));
    img.src = item.previewUrl;
  });
}

/**
 * Calculate margins in points for a given configuration.
 */
export function getMarginsPt(config: JpgToPdfConfig): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (config.marginPreset === 'none') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  if (config.marginPreset === 'custom') {
    return {
      top: mmToPt(config.customMarginsMm.top),
      right: mmToPt(config.customMarginsMm.right),
      bottom: mmToPt(config.customMarginsMm.bottom),
      left: mmToPt(config.customMarginsMm.left),
    };
  }
  const valPt = mmToPt(MARGIN_PRESETS_MM[config.marginPreset] || 10);
  return { top: valPt, right: valPt, bottom: valPt, left: valPt };
}

/**
 * Calculate page dimensions in points for a specific image item.
 */
export function getPageDimensionsPt(
  imgWidth: number,
  imgHeight: number,
  config: JpgToPdfConfig
): [number, number] {
  if (config.pageSize === 'original') {
    return [imgWidth, imgHeight];
  }

  let baseWidth: number;
  let baseHeight: number;

  if (config.pageSize === 'custom') {
    baseWidth = mmToPt(config.customWidthMm || 210);
    baseHeight = mmToPt(config.customHeightMm || 297);
  } else {
    const standard = PAGE_SIZES_PT[config.pageSize] || PAGE_SIZES_PT.a4;
    baseWidth = standard[0];
    baseHeight = standard[1];
  }

  // Handle Orientation
  const isImageLandscape = imgWidth > imgHeight;
  let shouldBeLandscape = false;

  if (config.orientation === 'auto') {
    shouldBeLandscape = isImageLandscape;
  } else if (config.orientation === 'landscape') {
    shouldBeLandscape = true;
  } else {
    shouldBeLandscape = false;
  }

  const minDim = Math.min(baseWidth, baseHeight);
  const maxDim = Math.max(baseWidth, baseHeight);

  return shouldBeLandscape ? [maxDim, minDim] : [minDim, maxDim];
}

/**
 * Calculate image placement rectangle (x, y, width, height) within the page.
 */
export function calculateImagePlacement(
  imgWidth: number,
  imgHeight: number,
  pageWidth: number,
  pageHeight: number,
  margins: { top: number; right: number; bottom: number; left: number },
  config: JpgToPdfConfig
): { x: number; y: number; width: number; height: number } {
  const availWidth = Math.max(1, pageWidth - (margins.left + margins.right));
  const availHeight = Math.max(1, pageHeight - (margins.top + margins.bottom));

  const imgAspect = imgWidth / imgHeight;
  const availAspect = availWidth / availHeight;

  let drawWidth = availWidth;
  let drawHeight = availHeight;

  if (config.imageFit === 'fit') {
    // Keep entire image visible without cropping
    if (imgAspect > availAspect) {
      drawWidth = availWidth;
      drawHeight = availWidth / imgAspect;
    } else {
      drawHeight = availHeight;
      drawWidth = availHeight * imgAspect;
    }
  } else if (config.imageFit === 'fill') {
    // Fill entire available area, cropping excess
    if (imgAspect > availAspect) {
      drawHeight = availHeight;
      drawWidth = availHeight * imgAspect;
    } else {
      drawWidth = availWidth;
      drawHeight = availWidth / imgAspect;
    }
  } else if (config.imageFit === 'original') {
    // Use natural image dimensions
    drawWidth = imgWidth;
    drawHeight = imgHeight;
  } else if (config.imageFit === 'custom') {
    // Scale proportionally according to custom percentage
    const baseScale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
    const scaleFactor = (config.customScalePercent || 100) / 100;
    drawWidth = imgWidth * baseScale * scaleFactor;
    drawHeight = imgHeight * baseScale * scaleFactor;
  }

  // Calculate X (horizontal alignment)
  let x = margins.left;
  if (config.alignment === 'center' || config.alignment === 'top' || config.alignment === 'bottom') {
    x = margins.left + (availWidth - drawWidth) / 2;
  } else if (config.alignment === 'right') {
    x = pageWidth - margins.right - drawWidth;
  } else if (config.alignment === 'left') {
    x = margins.left;
  }

  // Calculate Y (vertical alignment in PDF coordinates where 0,0 is bottom-left)
  let y = margins.bottom;
  if (config.alignment === 'center' || config.alignment === 'left' || config.alignment === 'right') {
    y = margins.bottom + (availHeight - drawHeight) / 2;
  } else if (config.alignment === 'top') {
    y = pageHeight - margins.top - drawHeight;
  } else if (config.alignment === 'bottom') {
    y = margins.bottom;
  }

  return { x, y, width: drawWidth, height: drawHeight };
}

/**
 * Generate a single PDF document from a collection of images.
 */
export async function createPdfFromImages(
  images: JpgImageItem[],
  config: JpgToPdfConfig,
  onProgress?: (progress: ConversionProgress) => void,
  abortRef?: { current: boolean }
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  // Set Document Metadata
  if (!config.removeMetadata) {
    if (config.metadata?.title?.trim()) pdfDoc.setTitle(config.metadata.title.trim());
    if (config.metadata?.author?.trim()) pdfDoc.setAuthor(config.metadata.author.trim());
    if (config.metadata?.subject?.trim()) pdfDoc.setSubject(config.metadata.subject.trim());
    if (config.metadata?.keywords?.trim()) {
      pdfDoc.setKeywords(
        config.metadata.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      );
    }
    pdfDoc.setProducer('ToolNest PDF Engine');
    pdfDoc.setCreator('ToolNest Online Suite');
  }

  const margins = getMarginsPt(config);
  const bgColor = config.backgroundColor?.toLowerCase() !== '#ffffff'
    ? hexToRgbPdf(config.backgroundColor || '#ffffff')
    : null;

  for (let i = 0; i < images.length; i++) {
    if (abortRef?.current) {
      throw new Error('PDF conversion was cancelled by user.');
    }

    const item = images[i];

    if (onProgress) {
      onProgress({
        percent: Math.round(((i + 1) / images.length) * 100),
        currentImageName: item.name,
        completedCount: i + 1,
        totalCount: images.length,
      });
    }

    // 1. Prepare image bytes & effective dimensions
    const { bytes, width: imgW, height: imgH } = await prepareImageBytes(item, config);

    // 2. Determine Page Dimensions
    const [pageWidth, pageHeight] = getPageDimensionsPt(imgW, imgH, config);

    // 3. Add Page
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // 4. Fill custom background if specified
    if (bgColor) {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: bgColor,
      });
    }

    // 5. Embed JPG image
    const embeddedImage = await pdfDoc.embedJpg(bytes);

    // 6. Calculate placement
    const placement = calculateImagePlacement(imgW, imgH, pageWidth, pageHeight, margins, config);

    // 7. Draw image on page
    page.drawImage(embeddedImage, {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
    });

    // Let event loop breathe
    await new Promise((r) => setTimeout(r, 15));
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Generate separate individual PDF documents for each image, optionally packaged into a ZIP.
 */
export async function createSeparatePdfs(
  images: JpgImageItem[],
  config: JpgToPdfConfig,
  onProgress?: (progress: ConversionProgress) => void,
  abortRef?: { current: boolean }
): Promise<GeneratedPdfResult> {
  const separateFiles: { filename: string; blob: Blob; size: number; url: string }[] = [];

  for (let i = 0; i < images.length; i++) {
    if (abortRef?.current) {
      throw new Error('PDF conversion was cancelled by user.');
    }

    const item = images[i];
    const singleBlob = await createPdfFromImages([item], config, undefined, abortRef);

    let baseName = sanitizeFilename(item.name.replace(/\.(jpg|jpeg)$/i, ''));
    if (config.filenamePrefix?.trim()) {
      baseName = `${sanitizeFilename(config.filenamePrefix.trim())}-${baseName}`;
    }
    if (config.filenameSuffix?.trim()) {
      baseName = `${baseName}-${sanitizeFilename(config.filenameSuffix.trim())}`;
    }
    const pdfFilename = `${baseName}.pdf`;
    const url = URL.createObjectURL(singleBlob);

    separateFiles.push({
      filename: pdfFilename,
      blob: singleBlob,
      size: singleBlob.size,
      url,
    });

    if (onProgress) {
      onProgress({
        percent: Math.round(((i + 1) / images.length) * 100),
        currentImageName: item.name,
        completedCount: i + 1,
        totalCount: images.length,
      });
    }
  }

  // Package into ZIP if more than 1 file
  const zip = new JSZip();
  for (const f of separateFiles) {
    zip.file(f.filename, f.blob);
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipUrl = URL.createObjectURL(zipBlob);

  const primaryFilename = sanitizeFilename(
    config.filename.toLowerCase().endsWith('.zip')
      ? config.filename
      : config.filename.replace(/\.pdf$/i, '') + '.zip'
  );

  return {
    id: Math.random().toString(36).substring(2, 9),
    filename: primaryFilename,
    blob: zipBlob,
    url: zipUrl,
    size: zipBlob.size,
    pageCount: images.length,
    separateFiles,
  };
}

/**
 * Trigger client-side download of a file blob.
 */
export function downloadFileBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizeFilename(filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
