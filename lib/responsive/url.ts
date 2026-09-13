/**
 * Normalizes input URL: prepends https:// if missing, trims whitespace
 */
export function normalizeURL(input: string): string {
  if (!input) return '';
  let trimmed = input.trim();
  // Handle localhost, 127.0.0.1, or standard domain
  if (/^localhost(:\d+)?$/i.test(trimmed) || /^127\.0\.0\.1(:\d+)?$/i.test(trimmed)) {
    return 'http://' + trimmed;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

/**
 * Validates whether string is a valid web URL
 */
export function validateURL(input: string): { isValid: boolean; error?: string } {
  if (!input || !input.trim()) {
    return { isValid: false, error: 'Please enter a website URL.' };
  }
  const normalized = normalizeURL(input);
  try {
    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported.' };
    }
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { isValid: false, error: 'Please enter a valid hostname or domain.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format.' };
  }
}
