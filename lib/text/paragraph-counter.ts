/**
 * Paragraph Counting Utilities.
 * Counts meaningful text blocks separated by one or more blank lines.
 */

export function countParagraphs(text: string): number {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return 0;
  }

  // Split by two or more newlines (allowing whitespace between them)
  const blocks = text
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  return blocks.length;
}
