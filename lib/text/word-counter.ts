/**
 * Word Counting Utilities.
 * Handles whitespace, punctuation, numbers, hyphens, and URLs accurately.
 */

export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;

  // Step 1: Normalize URLs and emails to single tokens to prevent internal punctuation splitting
  const urlRegex = /https?:\/\/[^\s"'>]+/gi;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

  const sanitized = text
    .replace(urlRegex, ' __URL__ ')
    .replace(emailRegex, ' __EMAIL__ ');

  // Step 2: Match word tokens: Unicode letters or numbers with optional internal hyphens, apostrophes, or decimal dots
  const tokens = sanitized.match(/[\p{L}\p{N}]+(?:['’.\-][\p{L}\p{N}]+)*/gu);

  return tokens ? tokens.length : 0;
}
