import JSZip from 'jszip';
import { ImageFileItem } from './types';

/**
 * Downloads a single file directly without archiving
 */
export function downloadSingleFile(item: ImageFileItem): void {
  const link = document.createElement('a');
  link.href = item.previewUrl;
  link.download = item.newName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface ZipProgressCallback {
  (percentage: number, currentItem: string): void;
}

/**
 * Packages multiple renamed images into a ZIP archive and triggers a browser download
 */
export async function downloadFilesAsZip(
  items: ImageFileItem[],
  zipFilename = 'renamed-images.zip',
  onProgress?: ZipProgressCallback
): Promise<void> {
  const zip = new JSZip();

  // Add each file to the zip with its newName
  // If duplicate filenames somehow exist, ensure unique entries inside the zip
  const addedNames = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let finalEntryName = item.newName;

    if (addedNames.has(finalEntryName.toLowerCase())) {
      const dot = finalEntryName.lastIndexOf('.');
      if (dot !== -1) {
        finalEntryName = `${finalEntryName.slice(0, dot)}-${i + 1}${finalEntryName.slice(dot)}`;
      } else {
        finalEntryName = `${finalEntryName}-${i + 1}`;
      }
    }
    addedNames.add(finalEntryName.toLowerCase());

    zip.file(finalEntryName, item.file);

    if (onProgress) {
      const prepPercent = Math.round(((i + 1) / items.length) * 40);
      onProgress(prepPercent, `Adding ${item.newName}...`);
    }
  }

  // Generate zip with real-time compression progress tracking
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        // metadata.percent is 0 to 100
        const mappedPercent = 40 + Math.round((metadata.percent / 100) * 60);
        onProgress(Math.min(100, mappedPercent), `Compressing archive (${Math.round(metadata.percent)}%)...`);
      }
    }
  );

  // Trigger browser download
  const blobUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Free memory after slight delay
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

/**
 * Packages multiple watermarked images into a ZIP archive
 */
export async function downloadWatermarkedAsZip(
  items: { name: string; watermarkedBlob?: Blob }[],
  zipFilename = 'watermarked-images.zip',
  onProgress?: (percentage: number) => void
): Promise<void> {
  const zip = new JSZip();
  const addedNames = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.watermarkedBlob) continue;

    let finalEntryName = item.name;
    if (addedNames.has(finalEntryName.toLowerCase())) {
      const dot = finalEntryName.lastIndexOf('.');
      if (dot !== -1) {
        finalEntryName = `${finalEntryName.slice(0, dot)}-${i + 1}${finalEntryName.slice(dot)}`;
      } else {
        finalEntryName = `${finalEntryName}-${i + 1}`;
      }
    }
    addedNames.add(finalEntryName.toLowerCase());

    zip.file(finalEntryName, item.watermarkedBlob);

    if (onProgress) {
      const prepPercent = Math.round(((i + 1) / items.length) * 40);
      onProgress(prepPercent);
    }
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        const mappedPercent = 40 + Math.round((metadata.percent / 100) * 60);
        onProgress(Math.min(100, mappedPercent));
      }
    }
  );

  const blobUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

/**
 * Packages multiple text overlay images into a ZIP archive
 */
export async function downloadOverlayImagesAsZip(
  items: { name: string; processedBlob?: Blob }[],
  zipFilename = 'text-overlay-images.zip',
  onProgress?: (percentage: number) => void
): Promise<void> {
  const zip = new JSZip();
  const addedNames = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.processedBlob) continue;

    let finalEntryName = item.name;
    if (addedNames.has(finalEntryName.toLowerCase())) {
      const dot = finalEntryName.lastIndexOf('.');
      if (dot !== -1) {
        finalEntryName = `${finalEntryName.slice(0, dot)}-${i + 1}${finalEntryName.slice(dot)}`;
      } else {
        finalEntryName = `${finalEntryName}-${i + 1}`;
      }
    }
    addedNames.add(finalEntryName.toLowerCase());

    zip.file(finalEntryName, item.processedBlob);

    if (onProgress) {
      const prepPercent = Math.round(((i + 1) / items.length) * 40);
      onProgress(prepPercent);
    }
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        const mappedPercent = 40 + Math.round((metadata.percent / 100) * 60);
        onProgress(Math.min(100, mappedPercent));
      }
    }
  );

  const blobUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

/**
 * Packages multiple social media resized images into a ZIP archive
 */
export async function downloadSocialImagesAsZip(
  items: { name: string; processedBlob?: Blob }[],
  zipFilename = 'social-media-images.zip',
  onProgress?: (percentage: number) => void
): Promise<void> {
  const zip = new JSZip();
  const addedNames = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.processedBlob) continue;

    let finalEntryName = item.name;
    if (addedNames.has(finalEntryName.toLowerCase())) {
      const dot = finalEntryName.lastIndexOf('.');
      if (dot !== -1) {
        finalEntryName = `${finalEntryName.slice(0, dot)}-${i + 1}${finalEntryName.slice(dot)}`;
      } else {
        finalEntryName = `${finalEntryName}-${i + 1}`;
      }
    }
    addedNames.add(finalEntryName.toLowerCase());

    zip.file(finalEntryName, item.processedBlob);

    if (onProgress) {
      const prepPercent = Math.round(((i + 1) / items.length) * 40);
      onProgress(prepPercent);
    }
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        const mappedPercent = 40 + Math.round((metadata.percent / 100) * 60);
        onProgress(Math.min(100, mappedPercent));
      }
    }
  );

  const blobUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

/**
 * Packages generated favicon files, manifest, and HTML into a complete ZIP package
 */
export async function downloadFaviconPackageAsZip(
  files: { filename: string; blob: Blob }[],
  zipFilename = 'favicon-package.zip',
  onProgress?: (percentage: number) => void
): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    zip.file(f.filename, f.blob);

    if (onProgress) {
      const prepPercent = Math.round(((i + 1) / files.length) * 35);
      onProgress(prepPercent);
    }
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        const mappedPercent = 35 + Math.round((metadata.percent / 100) * 65);
        onProgress(Math.min(100, mappedPercent));
      }
    }
  );

  const blobUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}
