import {
  ExtractedHeading,
  ExtractedImage,
  ExtractedLink,
  ExtractedMetadata,
  ExtractedTable,
  ExtractedTextContent,
  ExtractedWebData,
} from './types';

/**
 * Normalizes input URL ensuring protocol is present
 */
export function normalizeUrl(input: string): string {
  let trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

/**
 * Resolves a relative or protocol-relative URL against a base URL safely
 */
export function toAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
  if (!relativeUrl) return '';
  const trimmed = relativeUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  try {
    return new URL(trimmed, baseUrl).href;
  } catch {
    return relativeUrl;
  }
}

/**
 * Removes HTML tags and unescapes common HTML entities
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts comprehensive data from an HTML string for a given base URL
 */
export function extractWebDataFromHtml(
  html: string,
  targetUrl: string,
  options: {
    statusCode?: number;
    statusText?: string;
    loadTimeMs?: number;
    pageSizeBytes?: number;
    contentType?: string;
  } = {}
): ExtractedWebData {
  let baseObj: URL;
  try {
    baseObj = new URL(targetUrl);
  } catch {
    baseObj = new URL('https://example.com');
  }
  const domain = baseObj.hostname;

  // 1. Metadata extraction
  const metadata: ExtractedMetadata = {
    title: '',
    description: '',
    keywords: [],
  };

  // Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    metadata.title = stripHtmlTags(titleMatch[1]);
  }

  // Meta tags helper
  const getMeta = (regex: RegExp): string => {
    const match = html.match(regex);
    return match ? stripHtmlTags(match[1]) : '';
  };

  metadata.description =
    getMeta(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);

  const keywordsStr =
    getMeta(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']keywords["']/i);
  if (keywordsStr) {
    metadata.keywords = keywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }

  metadata.author =
    getMeta(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']author["']/i);

  // Favicon
  const faviconMatch =
    html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
  if (faviconMatch) {
    metadata.favicon = toAbsoluteUrl(faviconMatch[1], targetUrl);
  } else {
    metadata.favicon = `https://${domain}/favicon.ico`;
  }

  // Canonical
  const canonicalMatch =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
  if (canonicalMatch) {
    metadata.canonical = toAbsoluteUrl(canonicalMatch[1], targetUrl);
  }

  // Open Graph
  metadata.ogTitle =
    getMeta(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i);

  metadata.ogDescription =
    getMeta(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i);

  const ogImg =
    getMeta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i);
  if (ogImg) {
    metadata.ogImage = toAbsoluteUrl(ogImg, targetUrl);
  }

  metadata.ogSiteName =
    getMeta(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:site_name["']/i);

  metadata.ogType =
    getMeta(/<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:type["']/i);

  // Twitter
  metadata.twitterCard =
    getMeta(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']twitter:card["']/i);

  metadata.twitterTitle =
    getMeta(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']twitter:title["']/i);

  metadata.twitterDescription =
    getMeta(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']twitter:description["']/i);

  const twImg =
    getMeta(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']twitter:image["']/i);
  if (twImg) {
    metadata.twitterImage = toAbsoluteUrl(twImg, targetUrl);
  }

  metadata.themeColor =
    getMeta(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']*)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']theme-color["']/i);

  // Language & Charset
  const langMatch = html.match(/<html[^>]+lang=["']([^"']*)["']/i);
  if (langMatch) metadata.language = langMatch[1];

  const charsetMatch =
    html.match(/<meta[^>]+charset=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["'][^"']*charset=([^"';\s]+)/i);
  if (charsetMatch) metadata.charset = charsetMatch[1];

  // 2. Headings extraction
  const headings: ExtractedHeading[] = [];
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headingRegex.exec(html)) !== null) {
    const level = parseInt(hMatch[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
    const text = stripHtmlTags(hMatch[2]);
    if (text) {
      headings.push({ level, text });
    }
  }

  // 3. Images extraction
  const images: ExtractedImage[] = [];
  const imgSeen = new Set<string>();
  const imgRegex = /<img\b([^>]*?)\/?>/gi;
  let imgMatch: RegExpExecArray | null;

  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const attrs = imgMatch[1];
    const srcMatch =
      attrs.match(/\bsrc=["']([^"']+)["']/i) ||
      attrs.match(/\bdata-src=["']([^"']+)["']/i) ||
      attrs.match(/\bdata-original=["']([^"']+)["']/i);
    if (!srcMatch) continue;

    const rawSrc = srcMatch[1].trim();
    if (!rawSrc || rawSrc.startsWith('javascript:')) continue;

    const absSrc = toAbsoluteUrl(rawSrc, targetUrl);
    if (imgSeen.has(absSrc)) continue;
    imgSeen.add(absSrc);

    const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
    const titleAttr = attrs.match(/\btitle=["']([^"']*)["']/i);
    const widthMatch = attrs.match(/\bwidth=["']?(\d+)["']?/i);
    const heightMatch = attrs.match(/\bheight=["']?(\d+)["']?/i);

    images.push({
      src: absSrc,
      alt: altMatch ? stripHtmlTags(altMatch[1]) : '',
      title: titleAttr ? stripHtmlTags(titleAttr[1]) : undefined,
      width: widthMatch ? parseInt(widthMatch[1], 10) : undefined,
      height: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
      isDataUri: rawSrc.startsWith('data:'),
    });
  }

  // 4. Links extraction
  const links: ExtractedLink[] = [];
  const linkSeen = new Set<string>();
  const aRegex = /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi;
  let aMatch: RegExpExecArray | null;

  while ((aMatch = aRegex.exec(html)) !== null) {
    const attrs = aMatch[1];
    const innerText = stripHtmlTags(aMatch[2]);

    const hrefMatch = attrs.match(/\bhref=["']([^"']+)["']/i);
    if (!hrefMatch) continue;

    const rawHref = hrefMatch[1].trim();
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      continue;
    }

    const absHref = toAbsoluteUrl(rawHref, targetUrl);
    if (linkSeen.has(absHref)) continue;
    linkSeen.add(absHref);

    let isExternal = false;
    try {
      const linkHost = new URL(absHref).hostname;
      isExternal = linkHost !== domain && !linkHost.endsWith('.' + domain);
    } catch {
      isExternal = false;
    }

    const relMatch = attrs.match(/\brel=["']([^"']*)["']/i);
    const targetAttr = attrs.match(/\btarget=["']([^"']*)["']/i);

    links.push({
      href: absHref,
      text: innerText || absHref,
      isExternal,
      rel: relMatch ? relMatch[1] : undefined,
      target: targetAttr ? targetAttr[1] : undefined,
    });
  }

  // 5. Tables extraction
  const tables: ExtractedTable[] = [];
  const tableRegex = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch: RegExpExecArray | null;
  let tableId = 1;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];

    // Caption
    let caption: string | undefined;
    const captionMatch = tableHtml.match(/<caption[^>]*>([\s\S]*?)<\/caption>/i);
    if (captionMatch) {
      caption = stripHtmlTags(captionMatch[1]);
    }

    // Headers
    const headers: string[] = [];
    const thRegex = /<th\b[^>]*>([\s\S]*?)<\/th>/gi;
    let thMatch: RegExpExecArray | null;
    while ((thMatch = thRegex.exec(tableHtml)) !== null) {
      headers.push(stripHtmlTags(thMatch[1]));
    }

    // Rows
    const rows: string[][] = [];
    const trRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch: RegExpExecArray | null;

    while ((trMatch = trRegex.exec(tableHtml)) !== null) {
      const rowHtml = trMatch[1];
      const tdRegex = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;
      const rowCells: string[] = [];
      let tdMatch: RegExpExecArray | null;

      while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
        rowCells.push(stripHtmlTags(tdMatch[1]));
      }

      if (rowCells.length > 0) {
        rows.push(rowCells);
      }
    }

    if (headers.length > 0 || rows.length > 0) {
      const colCount = Math.max(headers.length, ...rows.map((r) => r.length), 0);
      tables.push({
        id: tableId++,
        caption,
        headers: headers.length > 0 ? headers : Array.from({ length: colCount }, (_, i) => `Col ${i + 1}`),
        rows,
        rowCount: rows.length,
        colCount,
      });
    }
  }

  // 6. Text content & Readability
  // Clean HTML from scripts, styles, noscripts, iframes, svgs
  const cleanBodyHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // Extract paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<(?:p|div|section|article|li|blockquote)[^>]*>([\s\S]*?)<\/(?:p|div|section|article|li|blockquote)>/gi;
  let pMatch: RegExpExecArray | null;

  while ((pMatch = pRegex.exec(cleanBodyHtml)) !== null) {
    const pText = stripHtmlTags(pMatch[1]);
    if (pText && pText.length > 25 && !paragraphs.includes(pText)) {
      paragraphs.push(pText);
    }
  }

  const cleanText = stripHtmlTags(cleanBodyHtml);
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = cleanText.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    url: targetUrl,
    targetUrl,
    domain,
    statusCode: options.statusCode || 200,
    statusText: options.statusText || 'OK',
    loadTimeMs: options.loadTimeMs || 0,
    pageSizeBytes: options.pageSizeBytes || Buffer.byteLength(html, 'utf8'),
    contentType: options.contentType || 'text/html; charset=utf-8',
    metadata,
    headings,
    textContent: {
      cleanText,
      wordCount,
      charCount,
      readingTimeMinutes,
      paragraphs: paragraphs.slice(0, 100),
    },
    images,
    links,
    tables,
    rawHtml: html,
    extractedAt: new Date().toISOString(),
  };
}
