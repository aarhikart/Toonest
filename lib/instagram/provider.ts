import { isAllowedCdnUrl } from './validator';

export interface NormalizedMediaResponse {
  type: 'video' | 'image';
  thumbnail: string;
  downloadUrl: string;
  sourceUrl: string;
  creator?: string;
  caption?: string;
  filename?: string;
}

export interface InstagramMediaProvider {
  name: string;
  canHandle(url: string): boolean;
  fetchMedia(url: string, shortcode: string): Promise<NormalizedMediaResponse | null>;
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Provider 1: Authorized API Provider
 * Invoked if environment credentials (INSTAGRAM_DOWNLOADER_API_URL, INSTAGRAM_API_KEY, or RAPIDAPI_KEY)
 * are configured in .env or .env.local.
 */
export class AuthorizedApiProvider implements InstagramMediaProvider {
  name = 'AuthorizedApiProvider';

  canHandle(): boolean {
    return Boolean(
      process.env.INSTAGRAM_DOWNLOADER_API_URL ||
      process.env.INSTAGRAM_API_URL ||
      process.env.RAPIDAPI_KEY ||
      process.env.INSTAGRAM_DOWNLOADER_API_KEY
    );
  }

  async fetchMedia(cleanUrl: string, shortcode: string): Promise<NormalizedMediaResponse | null> {
    const apiUrl = process.env.INSTAGRAM_DOWNLOADER_API_URL || process.env.INSTAGRAM_API_URL;
    const apiKey = process.env.INSTAGRAM_DOWNLOADER_API_KEY || process.env.RAPIDAPI_KEY;

    // Option A: Custom Authorized Provider Endpoint
    if (apiUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': USER_AGENT,
        };
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
          headers['x-api-key'] = apiKey;
        }

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: cleanUrl, shortcode }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const mediaUrl = data.download_url || data.video_url || data.url || data.media || data.formats?.[0]?.url;
          const thumbnail = data.thumbnail || data.cover || data.poster || '';
          const isVideo = data.type === 'video' || /\.(mp4|webm)(\?.*)?$/i.test(mediaUrl || '');

          if (mediaUrl) {
            return {
              type: isVideo ? 'video' : 'image',
              thumbnail,
              downloadUrl: mediaUrl,
              sourceUrl: cleanUrl,
              creator: data.creator || data.author || data.username || undefined,
              caption: data.caption || data.title || undefined,
              filename: `instagram_${shortcode}.${isVideo ? 'mp4' : 'jpg'}`,
            };
          }
        }
      } catch (err: any) {
        console.warn('[AuthorizedApiProvider] Custom API provider error:', err?.message || err);
      }
    }

    // Option B: RapidAPI Provider (if RAPIDAPI_KEY is supplied)
    if (apiKey && !apiUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const rapidRes = await fetch(
          `https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/get-info?url=${encodeURIComponent(
            cleanUrl
          )}`,
          {
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': 'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com',
            },
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (rapidRes.ok) {
          const data = await rapidRes.json();
          const mediaUrl =
            data?.download_url ||
            data?.video_url ||
            data?.media ||
            data?.formats?.[0]?.url ||
            data?.image_url;

          if (mediaUrl) {
            const isVideo = data?.type === 'video' || /\.(mp4|webm)(\?.*)?$/i.test(mediaUrl);
            return {
              type: isVideo ? 'video' : 'image',
              thumbnail: data?.thumbnail || data?.cover || '',
              downloadUrl: mediaUrl,
              sourceUrl: cleanUrl,
              creator: data?.username || data?.author || undefined,
              caption: data?.caption || data?.title || undefined,
              filename: `instagram_${shortcode}.${isVideo ? 'mp4' : 'jpg'}`,
            };
          }
        }
      } catch (err: any) {
        console.warn('[AuthorizedApiProvider] RapidAPI provider error:', err?.message || err);
      }
    }

    return null;
  }
}

function cleanEscapedUrl(raw: string): string {
  let s = raw;
  const quoteIdx = s.search(/\\*"/);
  if (quoteIdx !== -1) {
    s = s.slice(0, quoteIdx);
  }
  return s
    .replace(/\\u0026/g, '&')
    .replace(/\\u0025/g, '%')
    .replace(/\\u002F/g, '/')
    .replace(/\\u003A/g, ':')
    .replace(/\\u003F/g, '?')
    .replace(/\\u003D/g, '=')
    .replace(/\\/g, '');
}

function extractVideoFromHtml(html: string): string | null {
  // Pattern 1: Escaped or unescaped video_url field in embed JSON/scripts
  const videoMatch =
    html.match(/video_url[\\]*":[\\]*"([^"\\]*(?:\\.[^"\\]*)*)/i) ||
    html.match(/"video_url"\s*:\s*"([^"]+)"/i) ||
    html.match(/video_url\\?":\\?"(https:[^"\\]+)/i);

  if (videoMatch && videoMatch[1]) {
    const cleaned = cleanEscapedUrl(videoMatch[1]);
    if (cleaned.startsWith('https://') && isAllowedCdnUrl(cleaned)) {
      return cleaned;
    }
  }

  // Pattern 2: Any direct .mp4 URL inside the HTML
  const mp4Match = html.match(/(https:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*)/i);
  if (mp4Match && mp4Match[1]) {
    const cleaned = cleanEscapedUrl(mp4Match[1]);
    if (cleaned.startsWith('https://') && isAllowedCdnUrl(cleaned)) {
      return cleaned;
    }
  }

  return null;
}

function extractThumbnailFromHtml(html: string): string | null {
  // Pattern 1: display_url in embed JSON
  const displayMatch =
    html.match(/display_url[\\]*":[\\]*"([^"\\]*(?:\\.[^"\\]*)*)/i) ||
    html.match(/"display_url"\s*:\s*"([^"]+)"/i) ||
    html.match(/display_url\\?":\\?"(https:[^"\\]+)/i);

  if (displayMatch && displayMatch[1]) {
    const cleaned = cleanEscapedUrl(displayMatch[1]);
    if (cleaned.startsWith('https://') && isAllowedCdnUrl(cleaned)) {
      return cleaned;
    }
  }

  // Pattern 2: EmbeddedMediaImage tag
  const imgMatch =
    html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i) ||
    html.match(/src="([^"]+)"[^>]*class="EmbeddedMediaImage"/i);
  if (imgMatch && imgMatch[1]) {
    const cleaned = imgMatch[1].replace(/&amp;/g, '&');
    if (isAllowedCdnUrl(cleaned)) {
      return cleaned;
    }
  }

  return null;
}

/**
 * Provider 2: Public Media Provider
 * Reads public captioned embed endpoints and public metadata without bypassing authentication,
 * CAPTCHA, or private account restrictions.
 */
export class PublicMetaProvider implements InstagramMediaProvider {
  name = 'PublicMetaProvider';

  canHandle(): boolean {
    return true;
  }

  async fetchMedia(cleanUrl: string, shortcode: string): Promise<NormalizedMediaResponse | null> {
    const isReelUrl = /\/(?:reel|reels)\//i.test(cleanUrl);

    // 1. Try public captioned embed endpoints (both /p/ and /reel/)
    const embedUrlsToTry = [
      `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
      `https://www.instagram.com/reel/${shortcode}/embed/captioned/`,
    ];

    const userAgentsToTry = [
      'Mozilla/5.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      USER_AGENT,
    ];

    for (const embedUrl of embedUrlsToTry) {
      for (const ua of userAgentsToTry) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(embedUrl, {
            headers: {
              'User-Agent': ua,
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (res.ok) {
            const html = await res.text();

            // Extract video stream URL
            const videoUrl = extractVideoFromHtml(html);

            // Extract thumbnail
            const thumbnail = extractThumbnailFromHtml(html) || '';

            // Extract username
            let creator: string | undefined;
            const userMatch =
              html.match(/class="UsernameText"[^>]*>([^<]+)<\/span>/i) ||
              html.match(/href="\/([^/?#"]+)\/"/i);
            if (userMatch && userMatch[1]) {
              creator = userMatch[1].trim();
            }

            // Extract caption
            let caption: string | undefined;
            const captionMatch = html.match(/class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
            if (captionMatch && captionMatch[1]) {
              caption = captionMatch[1].replace(/<[^>]+>/g, '').trim();
            }

            // If a valid video stream is obtained, return type: 'video'
            if (videoUrl) {
              return {
                type: 'video',
                thumbnail,
                downloadUrl: videoUrl,
                sourceUrl: cleanUrl,
                creator,
                caption,
                filename: `instagram_reel_${shortcode}.mp4`,
              };
            }

            // If it's explicitly a photo post (NOT a Reel URL) and an image is present
            if (!isReelUrl && thumbnail && isAllowedCdnUrl(thumbnail)) {
              return {
                type: 'image',
                thumbnail,
                downloadUrl: thumbnail,
                sourceUrl: cleanUrl,
                creator,
                caption,
                filename: `instagram_post_${shortcode}.jpg`,
              };
            }
          }
        } catch (err: any) {
          // Continue to next attempt
        }
      }
    }

    // 2. Try OpenGraph meta tags on public reel page
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const ogRes = await fetch(`https://www.instagram.com/reel/${shortcode}/`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (ogRes.ok) {
        const html = await ogRes.text();

        let videoUrl: string | undefined;
        const ogVideoMatch =
          html.match(/<meta\s+property="og:video(?::secure_url)?"\s+content="([^"]+)"/i) ||
          html.match(/<meta\s+content="([^"]+)"\s+property="og:video(?::secure_url)?"/i);
        if (ogVideoMatch && ogVideoMatch[1]) {
          const cleaned = ogVideoMatch[1].replace(/&amp;/g, '&');
          if (isAllowedCdnUrl(cleaned)) {
            videoUrl = cleaned;
          }
        }

        let thumbnail = '';
        const ogImageMatch =
          html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
          html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
        if (ogImageMatch && ogImageMatch[1]) {
          const cleaned = ogImageMatch[1].replace(/&amp;/g, '&');
          if (isAllowedCdnUrl(cleaned)) {
            thumbnail = cleaned;
          }
        }

        if (videoUrl) {
          return {
            type: 'video',
            thumbnail: thumbnail || '',
            downloadUrl: videoUrl,
            sourceUrl: cleanUrl,
            filename: `instagram_reel_${shortcode}.mp4`,
          };
        }

        // Only return image if NOT a reel
        if (!isReelUrl && thumbnail && isAllowedCdnUrl(thumbnail)) {
          return {
            type: 'image',
            thumbnail,
            downloadUrl: thumbnail,
            sourceUrl: cleanUrl,
            filename: `instagram_post_${shortcode}.jpg`,
          };
        }
      }
    } catch {
      // Ignore
    }

    // 3. Try public oEmbed ONLY if not a Reel URL (oEmbed only provides still thumbnail)
    if (!isReelUrl) {
      try {
        const oEmbedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(cleanUrl)}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const oRes = await fetch(oEmbedUrl, {
          headers: { 'User-Agent': USER_AGENT },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (oRes.ok) {
          const oData = await oRes.json();
          if (oData && oData.thumbnail_url && isAllowedCdnUrl(oData.thumbnail_url)) {
            return {
              type: 'image',
              thumbnail: oData.thumbnail_url,
              downloadUrl: oData.thumbnail_url,
              sourceUrl: cleanUrl,
              creator: oData.author_name,
              caption: oData.title,
              filename: `instagram_${shortcode}.jpg`,
            };
          }
        }
      } catch {
        // Ignore oEmbed error
      }
    }

    return null;
  }
}

/**
 * Composite Provider: Evaluates authorized provider first, then falls back to public retrieval.
 */
export class CompositeInstagramProvider {
  private providers: InstagramMediaProvider[];

  constructor() {
    this.providers = [new AuthorizedApiProvider(), new PublicMetaProvider()];
  }

  async fetchMedia(url: string, shortcode: string): Promise<NormalizedMediaResponse | null> {
    for (const provider of this.providers) {
      if (provider.canHandle(url)) {
        try {
          const result = await provider.fetchMedia(url, shortcode);
          if (result && result.downloadUrl) {
            return result;
          }
        } catch (err: any) {
          console.warn(`[CompositeInstagramProvider] Error in ${provider.name}:`, err?.message || err);
        }
      }
    }
    return null;
  }
}

export const instagramProvider = new CompositeInstagramProvider();
