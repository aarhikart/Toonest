import { ReelMetadata, ReelApiResponse } from './types';
import { extractReelShortcode, cleanInstagramUrl } from './validator';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Strategy 1: Configured External Downloader Provider
 * Supports custom provider URL (INSTAGRAM_DOWNLOADER_API_URL) or RapidAPI (RAPIDAPI_KEY).
 */
async function fetchFromConfiguredProvider(
  cleanUrl: string,
  shortcode: string
): Promise<ReelMetadata | null> {
  const apiUrl = process.env.INSTAGRAM_DOWNLOADER_API_URL;
  const apiKey =
    process.env.INSTAGRAM_DOWNLOADER_API_KEY || process.env.RAPIDAPI_KEY;

  // Option A: Custom Provider URL
  if (apiUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
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
        if (data && (data.video_url || data.url || (data.formats && data.formats.length > 0))) {
          const videoUrl = data.video_url || data.url || data.formats?.[0]?.url;
          return {
            id: shortcode,
            url: cleanUrl,
            thumbnail: data.thumbnail || data.poster || '',
            creator: data.creator || data.author || data.username,
            caption: data.caption || data.title,
            duration: data.duration,
            formats: data.formats || [
              {
                quality: 'Best Quality (HD)',
                url: videoUrl,
                type: 'video',
                hasAudio: true,
              },
            ],
          };
        }
      }
    } catch (err) {
      console.error('Configured Instagram provider error:', err);
    }
  }

  // Option B: RapidAPI Instagram Downloader Provider
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
            'x-rapidapi-host':
              'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com',
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (rapidRes.ok) {
        const data = await rapidRes.json();
        const videoUrl =
          data?.download_url ||
          data?.video_url ||
          data?.media ||
          data?.formats?.[0]?.url;

        if (videoUrl) {
          return {
            id: shortcode,
            url: cleanUrl,
            thumbnail: data.thumbnail || data.cover || '',
            creator: data.username || data.author || '',
            caption: data.caption || data.title || '',
            formats: [
              {
                quality: 'Best Quality (HD)',
                url: videoUrl,
                type: 'video',
                hasAudio: true,
              },
            ],
          };
        }
      }
    } catch (err) {
      console.error('RapidAPI Instagram lookup error:', err);
    }
  }

  return null;
}

/**
 * Strategy 2: Instagram Public Embed Parser
 * Instagram public embed endpoint (/embed/captioned/) provides public post metadata,
 * author details, captions, and media references.
 */
async function fetchFromEmbed(shortcode: string): Promise<Partial<ReelMetadata> | null> {
  try {
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    // 1. Extract username from class="UsernameText" or href="/username/"
    let creator: string | undefined;
    const usernameMatch =
      html.match(/class="UsernameText"[^>]*>([^<]+)<\/span>/i) ||
      html.match(/href="\/([^/?#"]+)\/"/i);
    if (usernameMatch && usernameMatch[1]) {
      creator = usernameMatch[1].trim();
    }

    // 2. Extract caption from class="Caption"
    let caption: string | undefined;
    const captionMatch = html.match(/class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
    if (captionMatch && captionMatch[1]) {
      // Strip HTML tags
      caption = captionMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    // 3. Extract thumbnail/poster image
    let thumbnail = '';
    const imgMatch =
      html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i) ||
      html.match(/src="([^"]+)"[^>]*class="EmbeddedMediaImage"/i);
    if (imgMatch && imgMatch[1]) {
      thumbnail = imgMatch[1].replace(/&amp;/g, '&');
    }

    // 4. Check for direct video URL in embed script state
    let videoUrl: string | undefined;
    const videoMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/i);
    if (videoMatch && videoMatch[1]) {
      videoUrl = JSON.parse(`"${videoMatch[1]}"`);
    }

    if (videoUrl) {
      return {
        creator,
        caption,
        thumbnail,
        formats: [
          {
            quality: 'Best Quality (HD)',
            url: videoUrl,
            type: 'video',
            hasAudio: true,
          },
        ],
      };
    }

    return { creator, caption, thumbnail };
  } catch {
    return null;
  }
}

/**
 * Strategy 3: Instagram Public Page Meta Tags
 * Extracts open-graph metadata (og:video, og:image, og:title) from public HTML page.
 */
async function fetchFromMetaTags(
  cleanUrl: string,
  shortcode: string
): Promise<Partial<ReelMetadata> | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`https://www.instagram.com/reel/${shortcode}/`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    // Video URL in OpenGraph or JSON-LD
    let videoUrl: string | undefined;
    const ogVideoMatch =
      html.match(/<meta\s+property="og:video(?::secure_url)?"\s+content="([^"]+)"/i) ||
      html.match(/<meta\s+content="([^"]+)"\s+property="og:video(?::secure_url)?"/i);
    if (ogVideoMatch && ogVideoMatch[1]) {
      videoUrl = ogVideoMatch[1].replace(/&amp;/g, '&');
    }

    // If not found in meta, look in JSON payload
    if (!videoUrl) {
      const jsonMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/i);
      if (jsonMatch && jsonMatch[1]) {
        videoUrl = JSON.parse(`"${jsonMatch[1]}"`);
      }
    }

    // Thumbnail
    let thumbnail = '';
    const ogImageMatch =
      html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
      html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      thumbnail = ogImageMatch[1].replace(/&amp;/g, '&');
    }

    // Title / Caption
    let caption: string | undefined;
    const ogTitleMatch =
      html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
      html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      caption = ogTitleMatch[1].replace(/&amp;/g, '&');
    }

    if (videoUrl) {
      return {
        caption,
        thumbnail,
        formats: [
          {
            quality: 'Best Quality (HD)',
            url: videoUrl,
            type: 'video',
            hasAudio: true,
          },
        ],
      };
    }

    return { caption, thumbnail };
  } catch {
    return null;
  }
}

/**
 * Strategy 4: Instagram oEmbed API
 * Official lightweight endpoint for public post metadata.
 */
async function fetchFromOEmbed(cleanUrl: string): Promise<Partial<ReelMetadata> | null> {
  try {
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(cleanUrl)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();

    return {
      creator: data.author_name,
      caption: data.title,
      thumbnail: data.thumbnail_url,
    };
  } catch {
    return null;
  }
}

/**
 * Primary Media Resolver
 * Combines provider and native public strategies to retrieve Reel media.
 */
export async function fetchReelMetadata(rawUrl: string): Promise<ReelApiResponse> {
  const shortcode = extractReelShortcode(rawUrl);
  if (!shortcode) {
    return {
      success: false,
      error: 'Please enter a valid Instagram Reel URL (e.g. instagram.com/reel/...).',
      code: 'INVALID_URL',
    };
  }

  const cleanUrl = cleanInstagramUrl(rawUrl);

  // 1. Try configured backend provider if available
  const providerResult = await fetchFromConfiguredProvider(cleanUrl, shortcode);
  if (providerResult && providerResult.formats.length > 0) {
    return { success: true, reel: providerResult };
  }

  // 2. Concurrently query public sources
  const [embedData, metaData, oembedData] = await Promise.all([
    fetchFromEmbed(shortcode),
    fetchFromMetaTags(cleanUrl, shortcode),
    fetchFromOEmbed(cleanUrl),
  ]);

  const creator =
    embedData?.creator || oembedData?.creator || undefined;
  const caption =
    embedData?.caption || metaData?.caption || oembedData?.caption || undefined;
  const thumbnail =
    metaData?.thumbnail || embedData?.thumbnail || oembedData?.thumbnail || '';

  const formats = metaData?.formats || embedData?.formats || [];

  if (formats.length > 0) {
    return {
      success: true,
      reel: {
        id: shortcode,
        url: cleanUrl,
        thumbnail,
        creator,
        caption,
        formats,
      },
    };
  }

  // If metadata was retrieved but direct video stream is protected or restricted by Instagram
  if (creator || caption || thumbnail) {
    return {
      success: true,
      reel: {
        id: shortcode,
        url: cleanUrl,
        thumbnail,
        creator,
        caption,
        formats: [],
        isRestricted: true,
        restrictionReason:
          'Direct public video stream is restricted by Instagram permissions or account settings. You can still download the HD cover art, open the Reel, or use our mobile saving steps below.',
      },
    };
  }

  return {
    success: false,
    error:
      'This Reel is not publicly accessible or is no longer available. Please ensure the link is from an open public account.',
    code: 'PRIVATE_OR_UNAVAILABLE',
  };
}
