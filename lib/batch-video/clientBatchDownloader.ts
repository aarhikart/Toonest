import JSZip from 'jszip';

export interface VideoDownloadItem {
  url: string;
  filename: string;
}

export interface BatchDownloadProgress {
  totalVideos: number;
  completedVideos: number;
  failedVideos: number;
  percent: number;
  currentVideoName: string;
  totalBytesDownloaded: number;
  status: 'starting' | 'downloading' | 'zipping' | 'complete' | 'cancelled' | 'error';
  errorMessage?: string;
}

export interface BatchDownloadResult {
  success: boolean;
  zipBlob?: Blob;
  totalVideos: number;
  downloadedCount: number;
  failedCount: number;
  failedList: Array<{ filename: string; url: string; reason: string }>;
  error?: string;
}

/**
 * Validates the End of Central Directory (EOCD) signature to ensure
 * the ZIP file is 100% complete and not truncated mid-stream.
 * Signature: 0x06054b50 -> little-endian bytes: [0x50, 0x4b, 0x05, 0x06]
 */
export async function verifyZipIntegrity(blob: Blob): Promise<boolean> {
  if (!blob || blob.size < 22) return false;

  try {
    // Read the last 65536 bytes (or the whole blob if smaller)
    const searchSize = Math.min(blob.size, 65536);
    const slice = blob.slice(blob.size - searchSize, blob.size);
    const arrayBuffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Search for 0x50, 0x4B, 0x05, 0x06
    for (let i = bytes.length - 4; i >= 0; i--) {
      if (
        bytes[i] === 0x50 &&
        bytes[i + 1] === 0x4b &&
        bytes[i + 2] === 0x05 &&
        bytes[i + 3] === 0x06
      ) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.warn('[ZipVerifier] Failed to verify ZIP signature:', e);
    return false;
  }
}

/**
 * Clean and format filename ensuring a valid extension
 */
export function sanitizeClientFilename(name: string, fallbackIndex: number): string {
  let cleaned = (name || '').normalize('NFKD').trim();
  cleaned = cleaned.replace(/[\u0300-\u036f]/g, '');
  cleaned = cleaned.replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim();
  cleaned = cleaned.replace(/\s+/g, '_').replace(/_+/g, '_');

  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 100).replace(/_+$/, '');
  }

  if (
    !cleaned.toLowerCase().endsWith('.mp4') &&
    !cleaned.toLowerCase().endsWith('.webm') &&
    !cleaned.toLowerCase().endsWith('.mov')
  ) {
    cleaned = cleaned ? `${cleaned}.mp4` : `video_${fallbackIndex}.mp4`;
  }
  return cleaned;
}

/**
 * Triggers browser download of a Blob with a specific filename
 */
export function saveBlobAsFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Resilient Client-Side Batch Downloader
 * Downloads each video via the high-speed proxy, streams into JSZip,
 * verifies ZIP integrity, and saves directly to disk.
 */
export async function downloadBatchWithJSZip({
  videos,
  zipFilename,
  concurrency = 14,
  signal,
  onProgress,
}: {
  videos: VideoDownloadItem[];
  zipFilename: string;
  concurrency?: number;
  signal?: AbortSignal;
  onProgress?: (progress: BatchDownloadProgress) => void;
}): Promise<BatchDownloadResult> {
  const totalVideos = videos.length;
  if (totalVideos === 0) {
    return {
      success: false,
      totalVideos: 0,
      downloadedCount: 0,
      failedCount: 0,
      failedList: [],
      error: 'No videos to download.',
    };
  }

  const zip = new JSZip();
  const failedList: Array<{ filename: string; url: string; reason: string }> = [];
  const usedFilenames = new Set<string>();

  let completedVideos = 0;
  let totalBytesDownloaded = 0;
  let currentIndex = 0;
  let lastProgressEmit = 0;

  const emitProgress = (
    currentVideoName: string,
    status: BatchDownloadProgress['status'] = 'downloading',
    errorMessage?: string,
    force = false
  ) => {
    if (!onProgress) return;
    const now = Date.now();
    // Throttle progress emissions during downloading to keep the main thread fluid
    if (!force && status === 'downloading' && now - lastProgressEmit < 100) {
      return;
    }
    lastProgressEmit = now;

    const downloadPercent = Math.min(
      88,
      Math.round((completedVideos / totalVideos) * 88)
    );
    onProgress({
      totalVideos,
      completedVideos,
      failedVideos: failedList.length,
      percent: status === 'zipping' ? 92 : status === 'complete' ? 100 : downloadPercent,
      currentVideoName,
      totalBytesDownloaded,
      status,
      errorMessage,
    });
  };

  emitProgress('Initializing turbo download...', 'starting', undefined, true);

  // Single video download worker
  const processVideo = async (item: VideoDownloadItem, index: number) => {
    if (signal?.aborted) return;

    let baseName = sanitizeClientFilename(item.filename, index + 1);
    // Deduplicate filename within the batch
    if (usedFilenames.has(baseName)) {
      const extIdx = baseName.lastIndexOf('.');
      const stem = extIdx !== -1 ? baseName.substring(0, extIdx) : baseName;
      const ext = extIdx !== -1 ? baseName.substring(extIdx) : '.mp4';
      baseName = `${stem}_${index + 1}${ext}`;
    }
    usedFilenames.add(baseName);

    emitProgress(baseName, 'downloading');

    try {
      const proxyUrl = `/api/download-batch/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(baseName)}`;
      const response = await fetch(proxyUrl, {
        signal,
      });

      if (!response.ok) {
        throw new Error(`Proxy error HTTP ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Received 0 bytes from video source');
      }

      // Add directly to JSZip
      zip.file(baseName, blob);
      completedVideos++;
      totalBytesDownloaded += blob.size;

      emitProgress(baseName, 'downloading');
    } catch (err: any) {
      if (signal?.aborted) return;
      console.warn(`[ClientDownloader] Video #${index + 1} (${baseName}) failed:`, err?.message);
      failedList.push({
        filename: baseName,
        url: item.url,
        reason: err?.message || 'Download failed',
      });
      completedVideos++;
      emitProgress(baseName, 'downloading');
    }
  };

  // Run concurrency pool
  const workerCount = Math.min(concurrency, totalVideos);
  const workers = Array.from({ length: workerCount }).map(async () => {
    while (currentIndex < totalVideos) {
      if (signal?.aborted) break;
      const idx = currentIndex++;
      await processVideo(videos[idx], idx);
    }
  });

  await Promise.all(workers);

  if (signal?.aborted) {
    emitProgress('Download cancelled by user', 'cancelled', undefined, true);
    return {
      success: false,
      totalVideos,
      downloadedCount: completedVideos - failedList.length,
      failedCount: failedList.length,
      failedList,
      error: 'Download cancelled by user.',
    };
  }

  // If some items failed, include a clean report inside the ZIP
  if (failedList.length > 0) {
    const errorReport = [
      `Batch Download Report`,
      `=====================`,
      `Total Videos: ${totalVideos}`,
      `Successfully Packaged: ${totalVideos - failedList.length}`,
      `Failed to Download: ${failedList.length}`,
      ``,
      `Failed URLs:`,
      ...failedList.map((f, i) => `${i + 1}. [${f.filename}] ${f.url}\n   Reason: ${f.reason}`),
    ].join('\n');

    zip.file('_download_summary.txt', errorReport);
  }

  // Generate ZIP file using STORE mode (MP4s are already compressed; STORE is instant and 0 CPU)
  emitProgress('Packaging ZIP archive...', 'zipping', undefined, true);

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'STORE',
      streamFiles: true,
    },
    (metadata) => {
      if (onProgress) {
        onProgress({
          totalVideos,
          completedVideos,
          failedVideos: failedList.length,
          percent: Math.min(99, 90 + Math.round(metadata.percent * 0.09)),
          currentVideoName: 'Finalizing ZIP central directory...',
          totalBytesDownloaded,
          status: 'zipping',
        });
      }
    }
  );

  // Validate ZIP integrity before offering to user
  const isValid = await verifyZipIntegrity(zipBlob);
  if (!isValid) {
    const err = 'Generated ZIP failed integrity verification (missing End of Central Directory signature).';
    emitProgress(err, 'error', err, true);
    return {
      success: false,
      totalVideos,
      downloadedCount: completedVideos - failedList.length,
      failedCount: failedList.length,
      failedList,
      error: err,
    };
  }

  // Save the file
  const finalFilename = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  saveBlobAsFile(zipBlob, finalFilename);

  emitProgress('Download complete!', 'complete', undefined, true);

  return {
    success: true,
    zipBlob,
    totalVideos,
    downloadedCount: completedVideos - failedList.length,
    failedCount: failedList.length,
    failedList,
  };
}
