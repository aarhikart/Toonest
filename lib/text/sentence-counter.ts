/**
 * Robust Sentence Counting Utilities.
 * Correctly handles terminal punctuation (. ! ?), ellipses, decimals, URLs,
 * emails, quotes, and common abbreviations to prevent false positive sentence splits.
 */

export function countSentences(text: string): number {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return 0;
  }

  let cleaned = text;

  // 1. Protect URLs, web domains, and email addresses
  cleaned = cleaned.replace(/https?:\/\/[^\s"'>]+/gi, ' URL ');
  cleaned = cleaned.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    ' EMAIL '
  );
  cleaned = cleaned.replace(
    /\b[a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|ai|app|dev)\b/gi,
    ' DOMAIN '
  );

  // 2. Protect decimal numbers (e.g. 25.50, 3.14159)
  cleaned = cleaned.replace(/(\d+)\.(\d+)/g, '$1_DOT_$2');

  // 3. Protect common English abbreviations (e.g. Mr., Dr., etc.)
  cleaned = cleaned.replace(
    /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|Inc|Ltd|Dept|Approx|Jan|Feb|Mar|Apr|Aug|Sept|Oct|Nov|Dec)\./gi,
    '$1_DOT_'
  );

  // 4. Collapse ellipses (...) and repeated punctuation (??, !?, ..., etc.) to a single terminal marker
  cleaned = cleaned.replace(/\.{2,}/g, '.');
  cleaned = cleaned.replace(/[?!]+/g, '.');

  // 5. Split by sentence terminators followed by whitespace, closing quotes/brackets, or end of string
  const segments = cleaned
    .split(/[.!?]+(?=['"]?\s|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return segments.length;
}
