import { NextRequest, NextResponse } from 'next/server';
import { ZipArchive } from 'archiver';
import { PassThrough, Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5-minute maximum execution timeout

interface VideoItem {
  url: string;
  filename: string;
}

interface BatchRequest {
  batchIndex?: number;
  batchName?: string;
  videos: VideoItem[];
}

function cleanUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  url = url
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return url;
}

function sanitizeFilename(name: string, fallbackIndex: number): string {
  let cleaned = (name || '').normalize('NFKD').trim();
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, '')
    .replace(/&quot;/g, '')
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '');
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

export async function POST(req: NextRequest) {
  try {
    const body: BatchRequest = await req.json();
    const { batchIndex = 1, batchName, videos } = body;

    if (!Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No videos provided in request.' },
        { status: 400 }
      );
    }

    // Limit batch size to 250 for serverless safety
    const MAX_BATCH_LIMIT = 250;
    const batchVideos = videos.slice(0, MAX_BATCH_LIMIT);

    // Setup Archiver with STORE mode (level: 0)
    // MP4 videos are already compressed; level 0 eliminates 95% CPU time and avoids serverless timeouts
    const archive = new ZipArchive({
      zlib: { level: 0 },
    });

    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    const safeBatchName = batchName
      ? batchName.replace(/[^a-zA-Z0-9._-]/g, '_')
      : `videos_batch_${batchIndex}`;

    // Handle stream errors
    archive.on('error', (err) => {
      console.error('[BatchDownload] Archiver error:', err);
      passThrough.destroy(err);
    });

    // Background worker to download and append videos with serialized archiver appending
    (async () => {
      const failedList: Array<{ filename: string; url: string; reason: string }> = [];
      const usedFilenames = new Set<string>();

      // Serialized queue for archive appending to prevent archiver stream corruption
      let appendPromise = Promise.resolve();
      const safeAppend = (buf: Buffer, name: string) => {
        appendPromise = appendPromise.then(() => {
          return new Promise<void>((resolve) => {
            archive.append(buf, { name });
            resolve();
          });
        });
        return appendPromise;
      };

      const CONCURRENCY = 16;
      let currentIndex = 0;

      const downloadVideo = async (item: VideoItem, index: number) => {
        let baseName = sanitizeFilename(item.filename, index + 1);
        if (usedFilenames.has(baseName)) {
          const extIndex = baseName.lastIndexOf('.');
          const stem = extIndex !== -1 ? baseName.substring(0, extIndex) : baseName;
          const ext = extIndex !== -1 ? baseName.substring(extIndex) : '.mp4';
          baseName = `${stem}_${index + 1}${ext}`;
        }
        usedFilenames.add(baseName);

        const videoUrl = cleanUrl(item.url);

        try {
          const parsedUrl = new URL(videoUrl);
          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error(`Invalid protocol: ${parsedUrl.protocol}`);
          }

          let referer = 'https://www.pinterest.com/';
          if (parsedUrl.hostname.includes('instagram.com')) {
            referer = 'https://www.instagram.com/';
          }

          const response = await fetch(videoUrl, {
            keepalive: true,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Referer': referer,
              'Accept': 'video/mp4,video/*,*/*;q=0.9',
            },
            signal: AbortSignal.timeout(20000), // 20s timeout per video
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          if (buffer.length === 0) {
            throw new Error('Received 0 byte payload');
          }

          await safeAppend(buffer, baseName);
        } catch (err: any) {
          console.warn(`[BatchDownload] Video #${index + 1} (${baseName}) failed:`, err.message);
          failedList.push({
            filename: baseName,
            url: item.url,
            reason: err?.message || 'Download failed',
          });
        }
      };

      // Run concurrency pool
      const workers = Array.from({ length: Math.min(CONCURRENCY, batchVideos.length) }).map(async () => {
        while (currentIndex < batchVideos.length) {
          const idx = currentIndex++;
          await downloadVideo(batchVideos[idx], idx);
        }
      });

      await Promise.all(workers);
      // Wait for any queued appends to finish
      await appendPromise;

      // Append summary report if any items failed
      if (failedList.length > 0) {
        const errorReport = [
          `Batch #${batchIndex} Download Summary`,
          `==================================`,
          `Total Requested: ${batchVideos.length}`,
          `Successfully Downloaded: ${batchVideos.length - failedList.length}`,
          `Failed Items: ${failedList.length}`,
          ``,
          `Failed Video URLs:`,
          ...failedList.map((f, i) => `${i + 1}. [${f.filename}] ${f.url}\n   Reason: ${f.reason}`),
        ].join('\n');

        await safeAppend(Buffer.from(errorReport, 'utf-8'), '_failed_downloads.txt');
        await appendPromise;
      }

      await archive.finalize();
    })().catch(async (err) => {
      console.error('[BatchDownload] Pipeline error, attempting graceful finalization:', err);
      try {
        await archive.finalize();
      } catch {
        passThrough.destroy(err);
      }
    });

    const webStream = Readable.toWeb(passThrough);

    return new Response(webStream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeBatchName}.zip"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Batch-Index': String(batchIndex),
        'X-Total-Videos': String(batchVideos.length),
      },
    });
  } catch (error: any) {
    console.error('[BatchDownload] Route error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error processing batch download.' },
      { status: 500 }
    );
  }
}
