import JSZip from 'jszip';
import { InstagramBulkItem } from './bulkHtmlParser';

export interface BatchProgressUpdate {
  status: 'idle' | 'resolving' | 'downloading' | 'zipping' | 'completed' | 'cancelled' | 'error';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  percent: number;
  currentFilename?: string;
  totalBytes: number;
  message?: string;
}

/**
 * Trigger browser file save from a Blob or Object URL
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Downloads a single reel directly to disk
 */
export async function downloadSingleReel(
  item: InstagramBulkItem,
  onStart?: () => void,
  onDone?: () => void,
  onError?: (err: string) => void
) {
  try {
    onStart?.();
    let directUrl = item.downloadUrl;

    // Resolve if not already resolved
    if (!directUrl) {
      const res = await fetch('/api/instagram/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url }),
      });
      const data = await res.json();
      if (!data.success || !data.media?.downloadUrl) {
        throw new Error(data.error || 'Failed to resolve media stream URL.');
      }
      directUrl = data.media.downloadUrl;
    }

    // Stream download through proxy
    const proxyUrl = `/api/instagram/download?url=${encodeURIComponent(directUrl!)}&filename=${encodeURIComponent(
      item.filename
    )}`;
    const streamRes = await fetch(proxyUrl);
    if (!streamRes.ok) {
      throw new Error(`Download failed with HTTP ${streamRes.status}`);
    }

    const blob = await streamRes.blob();
    triggerFileDownload(blob, item.filename);
    onDone?.();
  } catch (err: any) {
    onError?.(err?.message || 'Download failed');
  }
}

/**
 * Resolves a single reel URL to its direct CDN video stream URL
 */
export async function resolveReelMedia(
  url: string,
  signal?: AbortSignal
): Promise<{ downloadUrl: string; thumbnail?: string; creator?: string; caption?: string }> {
  const res = await fetch('/api/instagram/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal,
  });

  const data = await res.json();
  if (!data.success || !data.media?.downloadUrl) {
    throw new Error(data.error || 'Could not retrieve media URL from Instagram.');
  }

  return {
    downloadUrl: data.media.downloadUrl,
    thumbnail: data.media.thumbnail,
    creator: data.media.creator,
    caption: data.media.caption,
  };
}

/**
 * Fetches the video stream blob through the server streaming proxy
 */
export async function fetchReelBlob(
  downloadUrl: string,
  filename: string,
  signal?: AbortSignal,
  onChunk?: (bytesLoaded: number) => void
): Promise<Blob> {
  const proxyUrl = `/api/instagram/download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(
    filename
  )}`;

  const res = await fetch(proxyUrl, { signal });
  if (!res.ok) {
    throw new Error(`Media stream error HTTP ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    return await res.blob();
  }

  const chunks: Uint8Array[] = [];
  let totalLoaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      totalLoaded += value.length;
      onChunk?.(totalLoaded);
    }
  }

  const contentType = res.headers.get('content-type') || 'video/mp4';
  return new Blob(chunks as any[], { type: contentType });
}

/**
 * Bulk downloads an array of reels and packages them into a single ZIP file.
 */
export async function executeBulkDownloadAndZip(
  items: InstagramBulkItem[],
  options: {
    zipFilename?: string;
    concurrency?: number;
    delayMs?: number;
    signal?: AbortSignal;
    onProgress?: (progress: BatchProgressUpdate) => void;
    onItemUpdate?: (itemId: string, updates: Partial<InstagramBulkItem>) => void;
  }
): Promise<{ success: boolean; zipBlob?: Blob; error?: string }> {
  const {
    zipFilename = 'ToolNest_Instagram_Reels.zip',
    concurrency = 2,
    delayMs = 600,
    signal,
    onProgress,
    onItemUpdate,
  } = options;

  const total = items.length;
  if (total === 0) {
    return { success: false, error: 'No items to download.' };
  }

  const zip = new JSZip();
  let completedCount = 0;
  let failedCount = 0;
  let accumulatedBytes = 0;

  const updateProgress = (
    status: BatchProgressUpdate['status'],
    currentFilename?: string,
    message?: string
  ) => {
    const processed = completedCount + failedCount;
    const percent = Math.min(100, Math.round((processed / total) * 90)); // 0-90% for downloading, 90-100% for zipping
    onProgress?.({
      status,
      totalItems: total,
      completedItems: completedCount,
      failedItems: failedCount,
      percent,
      currentFilename,
      totalBytes: accumulatedBytes,
      message,
    });
  };

  updateProgress('downloading', undefined, `Starting batch download of ${total} reels...`);

  // Process items with controlled concurrency queue
  let currentIndex = 0;

  const worker = async () => {
    while (currentIndex < items.length) {
      if (signal?.aborted) {
        throw new Error('Batch download cancelled.');
      }

      const itemIdx = currentIndex++;
      const item = items[itemIdx];

      try {
        onItemUpdate?.(item.id, { status: 'resolving', error: undefined });
        updateProgress('resolving', item.filename, `Resolving ${item.filename}...`);

        // 1. Resolve media if needed
        let directUrl = item.downloadUrl;
        let thumbnail = item.thumbnail;

        if (!directUrl) {
          const resolved = await resolveReelMedia(item.url, signal);
          directUrl = resolved.downloadUrl;
          thumbnail = resolved.thumbnail || thumbnail;
          onItemUpdate?.(item.id, {
            downloadUrl: directUrl,
            thumbnail,
            creator: item.creator || resolved.creator,
          });
        }

        // Delay between resolving requests to be gentle to Instagram
        if (delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
        }

        if (signal?.aborted) throw new Error('Batch download cancelled.');

        // 2. Download video stream blob
        onItemUpdate?.(item.id, { status: 'downloading' });
        updateProgress('downloading', item.filename, `Downloading ${item.filename}...`);

        const blob = await fetchReelBlob(directUrl, item.filename, signal, () => {
          // Chunk progress
        });

        accumulatedBytes += blob.size;

        // 3. Add to ZIP archive with explicit filename
        zip.file(item.filename, blob);

        completedCount++;
        onItemUpdate?.(item.id, {
          status: 'completed',
          sizeBytes: blob.size,
          thumbnail,
        });

        updateProgress(
          'downloading',
          item.filename,
          `Saved ${item.filename} (${(blob.size / (1024 * 1024)).toFixed(1)} MB)`
        );
      } catch (err: any) {
        if (signal?.aborted) {
          throw err;
        }
        failedCount++;
        const errMsg = err?.message || 'Download failed';
        onItemUpdate?.(item.id, { status: 'failed', error: errMsg });
        updateProgress('downloading', item.filename, `Failed ${item.filename}: ${errMsg}`);
      }
    }
  };

  try {
    // Launch concurrent workers
    const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
    await Promise.all(workers);

    if (signal?.aborted) {
      return { success: false, error: 'Download cancelled by user.' };
    }

    if (completedCount === 0) {
      return {
        success: false,
        error: 'Failed to download any reels in this batch. Please verify the links.',
      };
    }

    // 4. Generate ZIP archive
    onProgress?.({
      status: 'zipping',
      totalItems: total,
      completedItems: completedCount,
      failedItems: failedCount,
      percent: 92,
      totalBytes: accumulatedBytes,
      message: `Compiling ${completedCount} videos into ZIP archive...`,
    });

    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'STORE', // Videos are already MP4 compressed; STORE is ultra-fast with zero CPU lag
      },
      (metadata) => {
        const zipPct = 90 + Math.round((metadata.percent / 100) * 10);
        onProgress?.({
          status: 'zipping',
          totalItems: total,
          completedItems: completedCount,
          failedItems: failedCount,
          percent: Math.min(100, zipPct),
          totalBytes: accumulatedBytes,
          message: `Building ZIP: ${Math.round(metadata.percent)}%`,
        });
      }
    );

    // Trigger save to disk
    triggerFileDownload(zipBlob, zipFilename);

    onProgress?.({
      status: 'completed',
      totalItems: total,
      completedItems: completedCount,
      failedItems: failedCount,
      percent: 100,
      totalBytes: accumulatedBytes,
      message: `Successfully generated ${zipFilename}!`,
    });

    return { success: true, zipBlob };
  } catch (err: any) {
    const errorMsg = err?.message || 'Error occurred during batch download.';
    onProgress?.({
      status: 'error',
      totalItems: total,
      completedItems: completedCount,
      failedItems: failedCount,
      percent: 0,
      totalBytes: accumulatedBytes,
      message: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
}
