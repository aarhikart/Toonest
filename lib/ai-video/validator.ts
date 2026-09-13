/**
 * Security and format validation for the AI Video Detector tool.
 * Provides comprehensive SSRF protection, platform URL filtering, and size checks.
 */

export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];

const ALLOWED_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
]);

// Social media/walled garden platforms that require login/scraping
const BLOCKED_PLATFORM_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'm.youtube.com',
  'instagram.com',
  'www.instagram.com',
  'tiktok.com',
  'www.tiktok.com',
  'facebook.com',
  'www.facebook.com',
  'twitter.com',
  'x.com',
  'vimeo.com',
];

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  isPlatformUrl?: boolean;
  sanitizedUrl?: string;
}

/**
 * Validates a video URL against SSRF vulnerabilities, internal IPs, and platform pages.
 */
export function validateVideoUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { isValid: false, error: 'Please enter a video URL to begin.' };
  }

  let parsed: URL;
  try {
    let normalized = rawUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    parsed = new URL(normalized);
  } catch {
    return { isValid: false, error: 'Please enter a valid video URL.' };
  }

  // 1. Protocol check: Allow only HTTP and HTTPS (prefer HTTPS)
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      isValid: false,
      error: 'Invalid protocol. Only HTTPS or HTTP URLs are supported.',
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. SSRF Protection: Block localhost and loopback addresses
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0'
  ) {
    return { isValid: false, error: 'Access to localhost and loopback addresses is forbidden.' };
  }

  // 3. SSRF Protection: Block Cloud Provider Metadata IPs
  if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
    return { isValid: false, error: 'Access to cloud metadata endpoints is forbidden.' };
  }

  // 4. SSRF Protection: Block Private RFC 1918 IPv4 and link-local ranges
  const isPrivateIpv4 =
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^127\./.test(hostname);

  if (isPrivateIpv4) {
    return { isValid: false, error: 'Access to internal and private networks is forbidden.' };
  }

  // 5. SSRF Protection: Block internal and special-use domain suffixes
  const forbiddenSuffixes = [
    '.local',
    '.internal',
    '.lan',
    '.corp',
    '.test',
    '.example',
    '.invalid',
    '.onion',
  ];
  if (forbiddenSuffixes.some((suffix) => hostname.endsWith(suffix))) {
    return { isValid: false, error: 'Access to private internal domain namespaces is forbidden.' };
  }

  // 6. Platform URL Check (YouTube, Instagram, TikTok, etc.)
  const isPlatform = BLOCKED_PLATFORM_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
  if (isPlatform) {
    return {
      isValid: false,
      isPlatformUrl: true,
      error:
        'This video URL cannot currently be analyzed. Please upload the video file instead.',
    };
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
  };
}

/**
 * Validates uploaded video file size and MIME type.
 */
export function validateUploadedFile(
  size: number,
  mimeType: string,
  filename: string
): { isValid: boolean; error?: string } {
  if (size <= 0) {
    return { isValid: false, error: 'The selected video file appears to be empty.' };
  }

  if (size > MAX_VIDEO_SIZE_BYTES) {
    return {
      isValid: false,
      error: `This video exceeds the maximum supported size (${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)} MB).`,
    };
  }

  const lowerFilename = filename.toLowerCase();
  const hasValidExt = ALLOWED_VIDEO_EXTENSIONS.some((ext) =>
    lowerFilename.endsWith(ext)
  );
  const hasValidMime = ALLOWED_MIME_TYPES.has(mimeType.toLowerCase());

  if (!hasValidExt && !hasValidMime && !mimeType.startsWith('video/')) {
    return {
      isValid: false,
      error: 'Unsupported video format. Please upload an MP4, WebM, or MOV video.',
    };
  }

  return { isValid: true };
}
