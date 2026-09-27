import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import { SocialMediaItem, SocialMediaProvider } from './types';

const execFileAsync = promisify(execFile);

export class YouTubeProvider implements SocialMediaProvider {
  name = 'YouTubeProvider';
  platform = 'youtube' as const;

  // Single-flight active downloads map to prevent race conditions & duplicate downloads
  private activeDownloads = new Map<string, Promise<string | null>>();

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('youtube.com') || lower.includes('youtu.be');
  }

  extractVideoId(url: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();

    // Direct 11-char ID
    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const match = trimmed.match(
      /(?:shorts\/|live\/|v=|youtu\.be\/|\/v\/|embed\/|[?&]v=)([A-Za-z0-9_-]{11})/i
    );
    if (match) return match[1];

    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      if (parsed.searchParams.has('v')) {
        const v = parsed.searchParams.get('v');
        if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      }
      const parts = parsed.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && /^[A-Za-z0-9_-]{11}$/.test(last)) return last;
    } catch {
      // Ignore URL parse errors
    }

    return null;
  }

  async fetchMedia(rawUrl: string): Promise<SocialMediaItem | null> {
    const videoId = this.extractVideoId(rawUrl);
    if (!videoId) return null;

    const ytdlpPath = path.join(process.cwd(), 'bin', 'yt-dlp.exe');
    if (!fs.existsSync(ytdlpPath)) {
      console.error('[YouTubeProvider] yt-dlp binary not found at:', ytdlpPath);
      return null;
    }

    try {
      const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const { stdout } = await execFileAsync(
        ytdlpPath,
        [
          '--dump-json',
          '--no-warnings',
          '--no-check-certificates',
          canonicalUrl,
        ],
        { timeout: 25000 }
      );

      const info = JSON.parse(stdout);
      const realVideoId = info.id || videoId;
      const title = info.title || `YouTube Video #${realVideoId}`;
      const creator = info.uploader || info.channel || undefined;
      const durationSeconds = info.duration;
      let durationStr: string | undefined;
      if (typeof durationSeconds === 'number') {
        const mins = Math.floor(durationSeconds / 60);
        const secs = durationSeconds % 60;
        durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;
      }

      // Find best thumbnail
      const thumbnail =
        info.thumbnail ||
        (info.thumbnails && info.thumbnails.length > 0
          ? info.thumbnails[info.thumbnails.length - 1].url
          : `https://i.ytimg.com/vi/${realVideoId}/hqdefault.jpg`);

      // Filename
      const safeTitle = title.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 50);
      const filename = `${safeTitle}_${realVideoId}.mp4`;

      // Internal download / streaming URL routed through our secure proxy
      const downloadUrl = `/api/social-media/download?platform=youtube&id=${realVideoId}&filename=${encodeURIComponent(
        filename
      )}`;

      // Pre-warm download in background so when user clicks download or loads preview, it is instant!
      this.getOrDownloadVideoFile(realVideoId).catch((err) => {
        console.warn('[YouTubeProvider] Pre-warm download warning:', err?.message || err);
      });

      return {
        id: realVideoId,
        platform: 'youtube',
        type: 'video',
        thumbnail,
        downloadUrl,
        sourceUrl: canonicalUrl,
        title,
        creator,
        duration: durationStr,
        filename,
        quality: '720p HD',
      };
    } catch (err: any) {
      console.error('[YouTubeProvider] Error getting video info:', err?.message || err);
      return null;
    }
  }

  /**
   * Downloads or caches a YouTube video as an MP4 file on demand, returning the file path.
   * Uses single-flight deduplication so concurrent requests share one download execution.
   */
  async getOrDownloadVideoFile(videoId: string): Promise<string | null> {
    if (!videoId || videoId === 'undefined') return null;

    if (this.activeDownloads.has(videoId)) {
      return this.activeDownloads.get(videoId)!;
    }

    const task = this.executeDownload(videoId).finally(() => {
      this.activeDownloads.delete(videoId);
    });

    this.activeDownloads.set(videoId, task);
    return task;
  }

  private async executeDownload(videoId: string): Promise<string | null> {
    const ytdlpPath = path.join(process.cwd(), 'bin', 'yt-dlp.exe');
    const ffmpegPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

    const cacheDir = path.join(process.cwd(), 'temp', 'youtube');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const expectedFile = path.join(cacheDir, `${videoId}.mp4`);
    if (fs.existsSync(expectedFile)) {
      const stats = fs.statSync(expectedFile);
      if (stats.size > 1000) {
        return expectedFile;
      }
    }

    try {
      const args = [
        '--no-warnings',
        '--no-check-certificates',
        '-f',
        'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best',
        '--merge-output-format',
        'mp4',
        '-o',
        expectedFile,
      ];

      if (fs.existsSync(ffmpegPath)) {
        args.push('--ffmpeg-location', ffmpegPath);
      }

      args.push(`https://www.youtube.com/watch?v=${videoId}`);

      await execFileAsync(ytdlpPath, args, { timeout: 60000 });

      if (fs.existsSync(expectedFile)) {
        return expectedFile;
      }
    } catch (err: any) {
      console.error('[YouTubeProvider] Download video error:', err?.message || err);
    }

    return null;
  }
}
