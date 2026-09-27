export interface ExtractedVideo {
  id: number;
  url: string;
  filename: string;
  source: string;
  originalIndex: number;
  title?: string;
  originalFilename?: string;
}

export interface ParseResult {
  total: number;
  videos: ExtractedVideo[];
  duplicateCount: number;
}

/**
 * Strict validator to ensure a URL is a genuine video stream/file,
 * and explicitly REJECT non-video web pages (Pinterest pin pages, html pages, etc.)
 */
export function isActualVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();

  // Must be an absolute http/https URL
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return false;
  }

  // Explicitly REJECT web pages and Pinterest pin links
  // e.g. https://www.pinterest.com/pin/973340538212166926/
  if (
    clean.includes('/pin/') ||
    clean.includes('pinterest.com/pin') ||
    clean.includes('/user/') ||
    clean.includes('/board/')
  ) {
    return false;
  }

  // Reject web page file extensions
  if (/\.(html?|php|asp|aspx|jsp|cgi)(\?.*)?$/i.test(clean)) {
    return false;
  }

  // ACCEPT direct video file extensions
  if (/\.(mp4|webm|mov|mkv|m4v|avi|flv|ts)(\?.*)?$/i.test(clean)) {
    return true;
  }

  // ACCEPT Pinterest CDN video paths (v1.pinimg.com/videos, /expMp4/, /720p/, /720w/, /1080/, /mc/, /hls/)
  if (
    (clean.includes('pinimg.com') || clean.includes('pinterest.')) &&
    (clean.includes('/videos/') ||
      clean.includes('/video/') ||
      clean.includes('/expMp4/') ||
      clean.includes('/720p/') ||
      clean.includes('/720w') ||
      clean.includes('/1080') ||
      clean.includes('/mc/') ||
      clean.includes('/hls/'))
  ) {
    return true;
  }

  // ACCEPT generic CDN video paths containing /videos/ or /video/
  if ((clean.includes('/videos/') || clean.includes('/video/')) && !clean.includes('.html')) {
    return true;
  }

  return false;
}

/**
 * Format a video filename prioritizing the video's title text
 * Handles Unicode stylized characters (e.g. bold math fonts), HTML entities,
 * filesystem forbidden characters, and path length restrictions.
 */
export function formatTitleToFilename(
  title: string | null | undefined,
  rawDownloadName: string | null | undefined,
  fallbackIndex: number,
  url: string
): string {
  let candidate = '';

  // 1. Prioritize and format title text if present
  if (title && typeof title === 'string') {
    let clean = title.normalize('NFKD').trim();
    // Clean basic entities
    clean = clean
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, '')
      .replace(/&quot;/g, '')
      .replace(/&lt;/g, '')
      .replace(/&gt;/g, '');

    // Remove diacritics / accents
    clean = clean.replace(/[\u0300-\u036f]/g, '');
    // Replace non-alphanumeric (except standard separators: dash, underscore)
    clean = clean.replace(/[^a-zA-Z0-9_\-\s]/g, '');
    // Replace spaces/tabs/newlines with a single underscore
    clean = clean.trim().replace(/\s+/g, '_').replace(/_+/g, '_');

    // Cap length to 100 characters to prevent filesystem MAX_PATH issues
    if (clean.length > 100) {
      clean = clean.substring(0, 100).replace(/_+$/, '');
    }

    if (clean.length >= 2) {
      candidate = clean;
    }
  }

  // 2. Fallback to download attribute filename if title was empty or only emojis
  if (!candidate && rawDownloadName) {
    let raw = rawDownloadName.trim().replace(/\.(mp4|webm|mov|mkv)$/i, '');
    raw = raw.replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim();
    if (raw) {
      candidate = raw;
    }
  }

  // 3. Fallback to URL path
  if (!candidate && url) {
    try {
      const urlObj = new URL(url);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1];
      if (last) {
        candidate = last.split('?')[0].replace(/\.(mp4|webm|mov|mkv)$/i, '');
      }
    } catch {
      // ignore
    }
  }

  // 4. Ultimate fallback
  if (!candidate) {
    candidate = `pinterest_video_${String(fallbackIndex).padStart(4, '0')}`;
  }

  return `${candidate}.mp4`;
}

/**
 * Parses an HTML string to extract Pinterest and generic video download items.
 * Prioritizes card-level elements (.card, <video id="vid-X">, data-src, src, a.btn-red),
 * sets the filename directly to the video's title text, and strictly eliminates non-video links.
 */
export function parseVideosFromHtml(htmlContent: string): ParseResult {
  const usedFilenames = new Map<string, number>();
  const videos: ExtractedVideo[] = [];
  let counter = 1;

  if (!htmlContent || typeof htmlContent !== 'string') {
    return { total: 0, videos: [], duplicateCount: 0 };
  }

  const getUniqueFilename = (baseFilename: string): string => {
    if (usedFilenames.has(baseFilename)) {
      const count = (usedFilenames.get(baseFilename) || 1) + 1;
      usedFilenames.set(baseFilename, count);
      return baseFilename.replace(/\.mp4$/i, `_${count}.mp4`);
    } else {
      usedFilenames.set(baseFilename, 1);
      return baseFilename;
    }
  };

  // Method 1: Browser DOMParser (runs in client-side Next.js environment)
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Strategy 1: Target structured video cards (Pinterest export format)
      // Every card represents a video item; extract ALL cards without dropping any duplicates
      const cardNodes = doc.querySelectorAll('.card, [class*="card"]');
      if (cardNodes.length > 0) {
        cardNodes.forEach((card) => {
          let videoUrl = '';
          let downloadAttr = '';

          // Check 1: <video id="vid-X" data-src="..." src="...">
          const videoEl = card.querySelector('video');
          if (videoEl) {
            const dataSrc = videoEl.getAttribute('data-src')?.trim();
            const src = videoEl.getAttribute('src')?.trim();
            if (dataSrc && isActualVideoUrl(dataSrc)) {
              videoUrl = dataSrc;
            } else if (src && isActualVideoUrl(src)) {
              videoUrl = src;
            }
          }

          // Check 2: <source src="..."> inside the video box
          if (!videoUrl) {
            const sourceEl = card.querySelector('source[src]');
            if (sourceEl) {
              const src = sourceEl.getAttribute('src')?.trim();
              if (src && isActualVideoUrl(src)) {
                videoUrl = src;
              }
            }
          }

          // Check 3: <a class="btn btn-red" href="..." download="...">
          const redBtn = card.querySelector('a.btn-red, a[class*="btn-red"]');
          if (redBtn) {
            const href = redBtn.getAttribute('href')?.trim();
            if (href && isActualVideoUrl(href)) {
              if (!videoUrl) videoUrl = href;
              downloadAttr = redBtn.getAttribute('download')?.trim() || '';
            }
          }

          // Check 4: Any anchor tag with a valid video URL
          if (!videoUrl) {
            const anchors = card.querySelectorAll('a[href]');
            for (let i = 0; i < anchors.length; i++) {
              const a = anchors[i];
              const href = a.getAttribute('href')?.trim();
              if (href && isActualVideoUrl(href)) {
                videoUrl = href;
                if (!downloadAttr) downloadAttr = a.getAttribute('download')?.trim() || '';
                break;
              }
            }
          }

          // Extract title from .title or heading
          const titleEl = card.querySelector('.title, [class*="title"], h1, h2, h3, h4');
          const title = titleEl?.textContent?.trim() || '';

          // Extract download attribute if not found yet
          if (!downloadAttr) {
            const dlAnchor = card.querySelector('a[download]');
            if (dlAnchor) {
              downloadAttr = dlAnchor.getAttribute('download')?.trim() || '';
            }
          }

          if (videoUrl && isActualVideoUrl(videoUrl)) {
            // Title is prioritized as the primary filename
            const rawFilename = downloadAttr || `video_${counter}.mp4`;
            const baseFilename = formatTitleToFilename(title, downloadAttr, counter, videoUrl);
            const uniqueFilename = getUniqueFilename(baseFilename);

            videos.push({
              id: counter,
              originalIndex: counter,
              url: videoUrl,
              filename: uniqueFilename,
              title,
              originalFilename: rawFilename,
              source: 'Video Card',
            });
            counter++;
          }
        });
      }

      // Strategy 2: If no .card nodes or no videos extracted via cards, inspect standalone <video> / <source>
      if (videos.length === 0) {
        const videoElements = doc.querySelectorAll('video');
        videoElements.forEach((videoEl) => {
          let candidate =
            videoEl.getAttribute('data-src')?.trim() ||
            videoEl.getAttribute('src')?.trim();

          if (!candidate) {
            const sourceEl = videoEl.querySelector('source[src]');
            candidate = sourceEl?.getAttribute('src')?.trim() || '';
          }

          if (!candidate || !isActualVideoUrl(candidate)) return;

          const rawFilename = `video_${counter}.mp4`;
          const baseFilename = formatTitleToFilename(null, null, counter, candidate);
          const uniqueFilename = getUniqueFilename(baseFilename);

          videos.push({
            id: counter,
            originalIndex: counter,
            url: candidate,
            filename: uniqueFilename,
            originalFilename: rawFilename,
            source: 'Video Tag',
          });
          counter++;
        });
      }

      // Strategy 3: Inspect <a> tags with STRICT video URL check (NEVER add Pin Pages)
      if (videos.length === 0) {
        const anchorElements = doc.querySelectorAll('a[href]');
        anchorElements.forEach((anchor) => {
          const href = anchor.getAttribute('href')?.trim();
          const downloadAttr = anchor.getAttribute('download')?.trim();
          const anchorTitle = anchor.getAttribute('title')?.trim() || anchor.textContent?.trim();

          if (!href || !isActualVideoUrl(href)) return;

          const rawFilename = downloadAttr || `video_${counter}.mp4`;
          const baseFilename = formatTitleToFilename(anchorTitle, downloadAttr, counter, href);
          const uniqueFilename = getUniqueFilename(baseFilename);

          videos.push({
            id: counter,
            originalIndex: counter,
            url: href,
            filename: uniqueFilename,
            title: anchorTitle,
            originalFilename: rawFilename,
            source: 'Anchor Tag',
          });
          counter++;
        });
      }
    } catch (e) {
      console.warn('[htmlParser] DOMParser encountered error, falling back to regex:', e);
    }
  }

  // Method 2: Regex Extraction (Runs if DOMParser found nothing, on server, or in fallback mode)
  if (videos.length === 0) {
    // Strategy 1: Match .card blocks
    const cardRegex = /<div\b[^>]*class=["'][^"']*\bcard\b[^"']*["'][^>]*>([\s\S]*?)(?=(?:<div\b[^>]*class=["'][^"']*\bcard\b[^"']*["']|$))/gi;
    let cardMatch: RegExpExecArray | null;

    while ((cardMatch = cardRegex.exec(htmlContent)) !== null) {
      const cardContent = cardMatch[1];
      let videoUrl = '';

      // 1. Check video tag (data-src, src)
      const videoTagMatch = /<video\b([^>]*)>/i.exec(cardContent);
      if (videoTagMatch) {
        const vAttrs = videoTagMatch[1];
        const dataSrcMatch = /data-src=["'](https?:\/\/[^"'\s>]+)["']/i.exec(vAttrs);
        const srcMatch = /src=["'](https?:\/\/[^"'\s>]+)["']/i.exec(vAttrs);
        const cand = (dataSrcMatch && dataSrcMatch[1]) || (srcMatch && srcMatch[1]);
        if (cand && isActualVideoUrl(cand)) {
          videoUrl = cand;
        }
      }

      // 2. Check source tag
      if (!videoUrl) {
        const sourceMatch = /<source\b[^>]*src=["'](https?:\/\/[^"'\s>]+)["']/i.exec(cardContent);
        if (sourceMatch && isActualVideoUrl(sourceMatch[1])) {
          videoUrl = sourceMatch[1];
        }
      }

      // 3. Check anchor tags with valid video URL (e.g. btn-red or download anchor)
      let downloadAttr = '';
      const aRegex = /<a\b([^>]*)>/gi;
      let aMatch: RegExpExecArray | null;
      while ((aMatch = aRegex.exec(cardContent)) !== null) {
        const aAttrs = aMatch[1];
        const hrefMatch = /href=["'](https?:\/\/[^"'\s>]+)["']/i.exec(aAttrs);
        if (hrefMatch && isActualVideoUrl(hrefMatch[1])) {
          if (!videoUrl) videoUrl = hrefMatch[1];
          const dlMatch = /download=["']([^"'>\s]*)["']/i.exec(aAttrs);
          if (dlMatch) downloadAttr = dlMatch[1];
          break;
        }
      }

      // 4. Extract title
      const titleMatch = /class=["'][^"']*\btitle\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i.exec(cardContent);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      if (!downloadAttr) {
        const dlMatch = /download=["']([^"'>\s]*)["']/i.exec(cardContent);
        if (dlMatch) downloadAttr = dlMatch[1];
      }

      if (videoUrl && isActualVideoUrl(videoUrl)) {
        const rawFilename = downloadAttr || `video_${counter}.mp4`;
        const baseFilename = formatTitleToFilename(title, downloadAttr, counter, videoUrl);
        const uniqueFilename = getUniqueFilename(baseFilename);

        videos.push({
          id: counter,
          originalIndex: counter,
          url: videoUrl,
          filename: uniqueFilename,
          title,
          originalFilename: rawFilename,
          source: 'Video Card',
        });
        counter++;
      }
    }

    // Strategy 2: If no card blocks matched, match standalone video tags
    if (videos.length === 0) {
      const videoRegex = /<(?:video|source)\b[^>]*\b(?:src|data-src)=["'](https?:\/\/[^"'\s>]+)["']/gi;
      let vMatch: RegExpExecArray | null;
      while ((vMatch = videoRegex.exec(htmlContent)) !== null) {
        const url = vMatch[1].trim();
        if (isActualVideoUrl(url)) {
          const rawFilename = `video_${counter}.mp4`;
          const baseFilename = formatTitleToFilename(null, null, counter, url);
          const uniqueFilename = getUniqueFilename(baseFilename);

          videos.push({
            id: counter,
            originalIndex: counter,
            url,
            filename: uniqueFilename,
            originalFilename: rawFilename,
            source: 'Regex Video Tag',
          });
          counter++;
        }
      }

      // Strategy 3: Match direct video anchor tags
      const anchorRegex = /<a\b[^>]*\bhref=["'](https?:\/\/[^"'\s>]+)["'][^>]*>/gi;
      let anchorMatch: RegExpExecArray | null;
      while ((anchorMatch = anchorRegex.exec(htmlContent)) !== null) {
        const tag = anchorMatch[0];
        const href = anchorMatch[1].trim();
        if (isActualVideoUrl(href)) {
          const dlMatch = /download=["']([^"'>\s]*)["']/i.exec(tag);
          const downloadAttr = dlMatch ? dlMatch[1] : '';

          const rawFilename = downloadAttr || `video_${counter}.mp4`;
          const baseFilename = formatTitleToFilename(null, downloadAttr, counter, href);
          const uniqueFilename = getUniqueFilename(baseFilename);

          videos.push({
            id: counter,
            originalIndex: counter,
            url: href,
            filename: uniqueFilename,
            originalFilename: rawFilename,
            source: 'Regex Anchor Match',
          });
          counter++;
        }
      }

      // Strategy 4: Raw Video URL pattern fallback
      if (videos.length === 0) {
        const urlRegex = /(https?:\/\/[^\s"'<>]+\.(?:mp4|webm|mov|mkv)(?:\?[^\s"'<>]*)?)/gi;
        let urlMatch: RegExpExecArray | null;
        while ((urlMatch = urlRegex.exec(htmlContent)) !== null) {
          const url = urlMatch[1].trim();
          if (isActualVideoUrl(url)) {
            const rawFilename = `video_${counter}.mp4`;
            const baseFilename = formatTitleToFilename(null, null, counter, url);
            const uniqueFilename = getUniqueFilename(baseFilename);

            videos.push({
              id: counter,
              originalIndex: counter,
              url,
              filename: uniqueFilename,
              originalFilename: rawFilename,
              source: 'Regex URL Pattern',
            });
            counter++;
          }
        }
      }
    }
  }

  return {
    total: videos.length,
    videos,
    duplicateCount: 0,
  };
}


