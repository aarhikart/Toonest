import { SupportedPlatform } from './types';

const ALLOWED_CDN_SUFFIXES = [
  // Instagram / Meta
  '.cdninstagram.com',
  '.fbcdn.net',
  '.instagram.com',
  // Pinterest
  '.pinimg.com',
  '.pinterest.com',
  // YouTube / Google
  '.googlevideo.com',
  '.youtube.com',
  '.ytimg.com',
  '.ggpht.com',
];

export function detectPlatform(rawUrl: string): SupportedPlatform | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  try {
    let normalized = rawUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();

    // Instagram
    if (host.includes('instagram.com') || host.includes('instagr.am')) {
      const path = parsed.pathname;
      if (/\/(?:reel|reels|p)\//i.test(path)) {
        return 'instagram';
      }
    }

    // Pinterest
    if (host.includes('pinterest.com') || host.includes('pin.it')) {
      return 'pinterest';
    }

    // YouTube
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      return 'youtube';
    }

    return null;
  } catch {
    return null;
  }
}

export function isAllowedMediaCdn(targetUrl: string): boolean {
  if (!targetUrl || typeof targetUrl !== 'string') return false;

  try {
    // Relative API routes on same origin are safe
    if (targetUrl.startsWith('/api/social-media/download') || targetUrl.startsWith('/api/instagram/download')) {
      return true;
    }

    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block local loopbacks and internal networks
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname === '169.254.169.254'
    ) {
      return false;
    }

    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
      return false;
    }

    return (
      ALLOWED_CDN_SUFFIXES.some((suffix) => hostname.endsWith(suffix) || hostname === suffix.slice(1))
    );
  } catch {
    return false;
  }
}
