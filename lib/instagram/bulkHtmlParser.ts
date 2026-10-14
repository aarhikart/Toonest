export interface InstagramBulkItem {
  id: string;
  index: number;
  indexLabel: string;
  url: string;
  shortcode: string;
  creator?: string;
  rawTitle: string;
  headline: string;
  cleanHeadline: string;
  filename: string;
  status: 'pending' | 'resolving' | 'ready' | 'downloading' | 'completed' | 'failed';
  downloadUrl?: string;
  thumbnail?: string;
  error?: string;
  sizeBytes?: number;
  selected: boolean;
}

export interface BulkParseResult {
  items: InstagramBulkItem[];
  total: number;
  validCount: number;
  duplicateCount: number;
  sourceType: 'html' | 'text';
}

/**
 * Remove illegal Windows, macOS, and Linux filename characters:
 * \ / : * ? " < > | and control characters, emoji characters.
 */
export function sanitizeFilenamePart(text: string): string {
  if (!text) return '';
  return text
    // Strip emojis and non-standard symbols
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ''
    )
    // Strip forbidden characters
    .replace(/[\\/:*?"<>|]/g, '')
    // Normalize spaces and dashes
    .replace(/[\s\t\r\n]+/g, ' ')
    .trim();
}

/**
 * Formats a clean, safe filename matching "#{index} - {headline}.mp4"
 */
export function formatReelFilename(index: number, headline: string, shortcode?: string): string {
  const cleanHeadline = sanitizeFilenamePart(headline);
  const indexPrefix = `#${index}`;

  if (!cleanHeadline) {
    return `${indexPrefix} - Reel_${shortcode || index}.mp4`;
  }

  // Cap length to 75 characters to avoid path length limits
  const trimmed = cleanHeadline.length > 75 ? cleanHeadline.slice(0, 75).trim() : cleanHeadline;
  return `${indexPrefix} - ${trimmed}.mp4`;
}

/**
 * Extracts the primary headline from raw caption text by skipping pure index tags,
 * empty punctuation lines (e.g. '.'), and pure hashtag lines.
 */
export function extractHeadline(rawCaption: string): { headline: string; cleanHeadline: string } {
  if (!rawCaption) {
    return { headline: '', cleanHeadline: '' };
  }

  const lines = rawCaption
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let candidate = '';
  for (const line of lines) {
    // Skip index numbers like "#1", "<b>#1</b>", "1."
    if (/^#?\d+[.:)]*$/i.test(line)) continue;
    // Skip dot/divider lines like ".", "...", "---", "***"
    if (/^[.\-_*~•]+$/.test(line)) continue;
    // Skip lines that are only hashtags (e.g. "#motivation #explorepage #viral")
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length > 0 && words.every((w) => w.startsWith('#'))) continue;

    candidate = line;
    break;
  }

  if (!candidate && lines.length > 0) {
    // If all lines were hashtags or dots, take the first line that isn't just an index
    candidate = lines.find((l) => !/^#?\d+[.:)]*$/i.test(l)) || lines[0];
  }

  const clean = sanitizeFilenamePart(candidate);
  return { headline: candidate, cleanHeadline: clean };
}

/**
 * Parse an Instagram shortcode from any valid URL.
 */
export function extractShortcodeFromUrl(url: string): string {
  const match = url.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : '';
}

/**
 * Extract creator username from Instagram URL if present (e.g. instagram.com/green.faction/reel/...)
 */
export function extractCreatorFromUrl(url: string): string | undefined {
  const match = url.match(/instagram\.com\/([A-Za-z0-9_.-]+)\/(?:reel|reels|p)/i);
  if (match && match[1] && !['reel', 'reels', 'p', 'explore', 'stories'].includes(match[1].toLowerCase())) {
    return match[1];
  }
  return undefined;
}

/**
 * Parses an HTML file containing reels (like the provided structure)
 * or any generic HTML / text list with Instagram Reel URLs.
 */
export function parseInstagramBulkHtml(htmlContent: string): BulkParseResult {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return { items: [], total: 0, validCount: 0, duplicateCount: 0, sourceType: 'html' };
  }

  const cleanContent = htmlContent.trim();
  const isHtml = /<[a-z][\s\S]*>/i.test(cleanContent);
  const items: InstagramBulkItem[] = [];
  const seenUrls = new Set<string>();
  let duplicateCount = 0;

  if (isHtml) {
    // Mode A: Parse reel-item blocks or generic HTML containers
    // First, look for `.reel-item` blocks
    const hasReelItemClass = /class=["'][^"']*reel-item[^"']*["']/i.test(cleanContent);

    if (hasReelItemClass) {
      // Split on `<div class="reel-item">` or similar
      const rawBlocks = cleanContent
        .split(/<div[^>]*class=["'][^"']*reel-item[^"']*["'][^>]*>/i)
        .slice(1);

      rawBlocks.forEach((block, idx) => {
        // Find URL in href
        const linkMatch = block.match(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"']+)["']/i);
        if (!linkMatch) return;

        const rawUrl = linkMatch[1].trim();
        const shortcode = extractShortcodeFromUrl(rawUrl);
        if (!shortcode) return;

        // Canonical URL
        const canonicalUrl = `https://www.instagram.com/reel/${shortcode}/`;
        if (seenUrls.has(canonicalUrl)) {
          duplicateCount++;
          return;
        }
        seenUrls.add(canonicalUrl);

        // Find title container
        const titleMatch = block.match(/<div[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        const rawHtmlTitle = titleMatch ? titleMatch[1] : '';

        // Extract explicit index from <b>#1</b> or #1
        const indexMatch =
          rawHtmlTitle.match(/<b>#?(\d+)<\/b>/i) ||
          rawHtmlTitle.match(/#(\d+)/i) ||
          block.match(/<b>#?(\d+)<\/b>/i);
        const index = indexMatch ? parseInt(indexMatch[1], 10) : idx + 1;

        // Clean HTML entities and tags
        const rawTitleText = rawHtmlTitle
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();

        const { headline, cleanHeadline } = extractHeadline(rawTitleText);
        const filename = formatReelFilename(index, cleanHeadline || headline, shortcode);
        const creator = extractCreatorFromUrl(rawUrl);

        items.push({
          id: `reel-${items.length + 1}`,
          index,
          indexLabel: `#${index}`,
          url: canonicalUrl,
          shortcode,
          creator,
          rawTitle: rawTitleText,
          headline,
          cleanHeadline,
          filename,
          status: 'pending',
          selected: true,
        });
      });
    }

    // If no .reel-item matched or standard HTML with regular <a> links
    if (items.length === 0) {
      // Find all <a> tags with instagram links
      const linkRegex = /<a[^>]+href=["'](https?:\/\/(?:www\.)?instagram\.com\/(?:reel|reels|p)\/[A-Za-z0-9_-]+\/?)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let m: RegExpExecArray | null;
      let count = 0;

      while ((m = linkRegex.exec(cleanContent)) !== null) {
        count++;
        const rawUrl = m[1].trim();
        const linkInner = m[2] ? m[2].replace(/<[^>]+>/g, '').trim() : '';
        const shortcode = extractShortcodeFromUrl(rawUrl);
        if (!shortcode) continue;

        const canonicalUrl = `https://www.instagram.com/reel/${shortcode}/`;
        if (seenUrls.has(canonicalUrl)) {
          duplicateCount++;
          continue;
        }
        seenUrls.add(canonicalUrl);

        const index = count;
        const { headline, cleanHeadline } = extractHeadline(linkInner);
        const filename = formatReelFilename(index, cleanHeadline, shortcode);
        const creator = extractCreatorFromUrl(rawUrl);

        items.push({
          id: `reel-${items.length + 1}`,
          index,
          indexLabel: `#${index}`,
          url: canonicalUrl,
          shortcode,
          creator,
          rawTitle: linkInner,
          headline,
          cleanHeadline,
          filename,
          status: 'pending',
          selected: true,
        });
      }
    }
  }

  // Fallback: If still 0 items, search for plain text URLs line by line
  if (items.length === 0) {
    const lines = cleanContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const urlMatch = line.match(/(https?:\/\/(?:www\.)?instagram\.com\/(?:reel|reels|p)\/[A-Za-z0-9_-]+\/?)/i);
      if (urlMatch) {
        count++;
        const rawUrl = urlMatch[1];
        const shortcode = extractShortcodeFromUrl(rawUrl);
        if (!shortcode) continue;

        const canonicalUrl = `https://www.instagram.com/reel/${shortcode}/`;
        if (seenUrls.has(canonicalUrl)) {
          duplicateCount++;
          continue;
        }
        seenUrls.add(canonicalUrl);

        // Check if previous line was a title/headline
        let potentialTitle = '';
        if (i > 0 && !lines[i - 1].includes('instagram.com')) {
          potentialTitle = lines[i - 1];
        }

        const index = count;
        const { headline, cleanHeadline } = extractHeadline(potentialTitle);
        const filename = formatReelFilename(index, cleanHeadline, shortcode);
        const creator = extractCreatorFromUrl(rawUrl);

        items.push({
          id: `reel-${items.length + 1}`,
          index,
          indexLabel: `#${index}`,
          url: canonicalUrl,
          shortcode,
          creator,
          rawTitle: potentialTitle,
          headline,
          cleanHeadline,
          filename,
          status: 'pending',
          selected: true,
        });
      }
    }
  }

  return {
    items,
    total: items.length + duplicateCount,
    validCount: items.length,
    duplicateCount,
    sourceType: isHtml ? 'html' : 'text',
  };
}
