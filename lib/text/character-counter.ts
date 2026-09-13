/**
 * Character Counting Utilities with Unicode Grapheme Cluster Support.
 * Correctly counts multi-byte code units and emojis as single user-perceived characters.
 */

function countGraphemes(text: string): number {
  if (!text) return 0;

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      let count = 0;
      for (const _ of segmenter.segment(text)) {
        count++;
      }
      return count;
    } catch {
      // Fallback
    }
  }

  // Fallback: Unicode code-point array spread
  return [...text].length;
}

/**
 * Counts all characters in the text, including spaces and punctuation.
 */
export function countCharacters(text: string): number {
  if (!text) return 0;
  return countGraphemes(text);
}

/**
 * Counts all characters excluding spaces, tabs, and line breaks.
 */
export function countCharactersWithoutSpaces(text: string): number {
  if (!text) return 0;
  const noWhitespace = text.replace(/\s/gu, '');
  return countGraphemes(noWhitespace);
}
