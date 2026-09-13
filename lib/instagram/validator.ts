/**
 * URL validation and sanitization for Instagram Reels with SSRF protection.
 */

const ALLOWED_DOMAINS = [
  'instagram.com',
  'www.instagram.com',
  'instagr.am',
  'www.instagr.am',
  'm.instagram.com',
];

const ALLOWED_CDN_SUFFIXES = [
  '.cdninstagram.com',
  '.fbcdn.net',
  '.instagram.com',
];

export function extractReelShortcode(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  try {
    let normalized = rawUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();

    // Verify allowed domain
    const isDomainAllowed = ALLOWED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
    if (!isDomainAllowed) return null;

    // Match /reel/{code}, /reels/{code}, or /p/{code}
    const path = parsed.pathname;
    const match = path.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch {
    return null;
  }
}

export function isValidInstagramReelUrl(url: string): boolean {
  return extractReelShortcode(url) !== null;
}

export function cleanInstagramUrl(url: string): string {
  const shortcode = extractReelShortcode(url);
  if (!shortcode) return url.trim();
  return `https://www.instagram.com/reel/${shortcode}/`;
}

/**
 * SSRF Safeguard: Verifies that a target URL belongs exclusively to authorized
 * Instagram or Meta CDN endpoints and is not an internal network or loopback address.
 */
export function isAllowedCdnUrl(targetUrl: string): boolean {
  if (!targetUrl || typeof targetUrl !== 'string') return false;

  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Reject localhost and loopbacks
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname === '169.254.169.254'
    ) {
      return false;
    }

    // Reject private IP patterns (IPv4)
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
      return false;
    }

    // Must match approved Instagram / Meta CDN suffixes or domain
    return (
      ALLOWED_CDN_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) ||
      ALLOWED_DOMAINS.includes(hostname)
    );
  } catch {
    return false;
  }
}
