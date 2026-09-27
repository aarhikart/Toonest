import { SocialMediaItem, SocialMediaProvider } from './types';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export class PinterestProvider implements SocialMediaProvider {
  name = 'PinterestProvider';
  platform = 'pinterest' as const;

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('pinterest.com') || lower.includes('pin.it');
  }

  async fetchMedia(url: string): Promise<SocialMediaItem | null> {
    try {
      // 1. Fast Direct HTML Fetch Strategy
      const directResult = await this.extractFromHtml(url);
      if (directResult) {
        return directResult;
      }

      // 2. yt-dlp Fallback Strategy
      const ytdlpResult = await this.extractFromYtDlp(url);
      if (ytdlpResult) {
        return ytdlpResult;
      }
    } catch (err: any) {
      console.warn('[PinterestProvider] Extraction error:', err?.message || err);
    }

    return null;
  }

  private async extractFromHtml(rawUrl: string): Promise<SocialMediaItem | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(rawUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    // 1. Extract MP4 URLs
    const mp4Matches = Array.from(
      new Set(html.match(/https:\/\/v1\.pinimg\.com\/videos\/[^\s"'<>\\]+\.mp4/gi) || [])
    );

    // Prefer 720p or 1080p, otherwise first match
    let videoUrl =
      mp4Matches.find((u) => u.includes('/720p/') || u.includes('/720w/')) ||
      mp4Matches.find((u) => u.includes('/1080/')) ||
      mp4Matches[0];

    // Fallback to any .mp4 on pinimg
    if (!videoUrl) {
      const anyMp4 = html.match(/https:\/\/[^"'<>\s\\]*pinimg\.com\/[^\s"'<>\\]+\.mp4/i);
      if (anyMp4) videoUrl = anyMp4[0];
    }

    if (!videoUrl) return null;

    // 2. Extract Title
    const titleMatch =
      html.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i) ||
      html.match(/<title>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/\| Pinterest/gi, '').trim() : undefined;
    if (title && (title.includes('Pinterest') && title.length < 15)) {
      title = undefined;
    }

    // 3. Extract Thumbnail
    const thumbMatch =
      html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i) ||
      html.match(/https:\/\/i\.pinimg\.com\/[^\s"'<>\\]+\.jpg/gi);
    const thumbnail = thumbMatch ? (typeof thumbMatch === 'string' ? thumbMatch : thumbMatch[1] || thumbMatch[0]) : '';

    // 4. Generate Pin Identifier
    const pinIdMatch = rawUrl.match(/\/pin\/(\d+)/i) || res.url.match(/\/pin\/(\d+)/i);
    const pinId = pinIdMatch ? pinIdMatch[1] : Date.now().toString();

    return {
      id: pinId,
      platform: 'pinterest',
      type: 'video',
      thumbnail: thumbnail || '',
      downloadUrl: videoUrl,
      sourceUrl: res.url || rawUrl,
      title: title || `Pinterest Video #${pinId}`,
      filename: `pinterest_video_${pinId}.mp4`,
      quality: videoUrl.includes('/720p/') ? '720p' : 'HD',
    };
  }

  private async extractFromYtDlp(rawUrl: string): Promise<SocialMediaItem | null> {
    const ytdlpPath = path.join(process.cwd(), 'bin', 'yt-dlp.exe');
    if (!fs.existsSync(ytdlpPath)) return null;

    try {
      const { stdout } = await execFileAsync(
        ytdlpPath,
        ['--dump-json', '--no-warnings', '--no-check-certificates', rawUrl],
        { timeout: 15000 }
      );

      const info = JSON.parse(stdout);
      const videoUrl = info.url || info.requested_formats?.[0]?.url;
      const thumbnail = info.thumbnail || info.thumbnails?.[info.thumbnails?.length - 1]?.url || '';
      const pinId = info.id || Date.now().toString();

      if (videoUrl) {
        return {
          id: pinId,
          platform: 'pinterest',
          type: 'video',
          thumbnail,
          downloadUrl: videoUrl,
          sourceUrl: rawUrl,
          title: info.title || `Pinterest Video #${pinId}`,
          creator: info.uploader || undefined,
          duration: info.duration ? `${Math.round(info.duration)}s` : undefined,
          filename: `pinterest_video_${pinId}.mp4`,
          quality: info.format_note || 'HD',
        };
      }
    } catch {
      // Fallback failed
    }

    return null;
  }
}
