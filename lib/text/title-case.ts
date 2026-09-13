import { TitleCaseOptions } from './types';

// Standard English minor words / articles / short prepositions / conjunctions
const SMALL_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'but',
  'or',
  'for',
  'nor',
  'on',
  'at',
  'to',
  'from',
  'by',
  'in',
  'of',
  'with',
  'as',
  'off',
  'via',
  'into',
  'per',
]);

/**
 * Capitalizes a single sub-token (e.g. "hello" -> "Hello", "WORLD" -> "World").
 * Preserves numbers, symbols, and correctly formats contraction suffixes ('s, 't, etc.)
 */
function capitalizeWord(word: string): string {
  if (!word) return '';

  // Check if word contains internal apostrophe (e.g. john's, don't, we'll, user’s)
  const apostropheIndex = word.search(/['’]/);
  if (apostropheIndex > 0) {
    const beforeApostrophe = word.slice(0, apostropheIndex);
    const apostropheAndAfter = word.slice(apostropheIndex);
    const capitalizedPrefix =
      beforeApostrophe.charAt(0).toUpperCase() +
      beforeApostrophe.slice(1).toLowerCase();
    // Keep contraction lowercase: 's, 't, 'll, 've, 're, 'd
    return capitalizedPrefix + apostropheAndAfter.toLowerCase();
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Capitalizes a hyphenated word or compound word (e.g. "welcome-to-my-website" -> "Welcome-To-My-Website")
 */
function capitalizeCompound(
  compound: string,
  isFirstWord: boolean,
  isLastWord: boolean,
  style: 'standard' | 'every-word'
): string {
  if (compound.includes('-')) {
    const subParts = compound.split('-');
    return subParts
      .map((part) => capitalizeWord(part))
      .join('-');
  }

  const lower = compound.toLowerCase();
  if (
    style === 'standard' &&
    !isFirstWord &&
    !isLastWord &&
    SMALL_WORDS.has(lower)
  ) {
    return lower;
  }

  return capitalizeWord(compound);
}

/**
 * Sentence-like conversion: capitalizes the first word of each sentence, preserving the rest in lowercase.
 */
function toSentenceCase(text: string): string {
  if (!text) return '';

  // Match sentences delimited by ., !, ? followed by whitespace or line breaks
  return text.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, prefix, char) => {
    return prefix + char.toUpperCase();
  });
}

/**
 * Main Smart Title Case Converter
 * Preserves exact whitespace, indentation, tabs, line breaks, and punctuation.
 */
export function toTitleCase(text: string, options?: TitleCaseOptions): string {
  if (!text) return '';

  const style = options?.style || 'standard';

  if (style === 'sentence') {
    return toSentenceCase(text);
  }

  // Tokenize text into words and delimiters (whitespace, punctuation)
  // We use regex to identify words while preserving all intermediate tokens.
  // Match lines first to ensure line-level boundary accuracy
  const lines = text.split(/(\r\n|\r|\n)/);

  return lines
    .map((line) => {
      // If it's a newline delimiter, return as-is
      if (line === '\r\n' || line === '\r' || line === '\n') {
        return line;
      }

      // Tokenize the line into word and non-word sequences
      // \p{L} matches any unicode letter, \p{N} matches numbers
      // We also include internal apostrophes and hyphens inside words
      const tokens = line.split(/([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)/gu);

      // Find indices of word tokens
      const wordIndices: number[] = [];
      tokens.forEach((token, idx) => {
        if (/[\p{L}]/u.test(token)) {
          wordIndices.push(idx);
        }
      });

      if (wordIndices.length === 0) {
        return line;
      }

      const firstWordIdx = wordIndices[0];
      const lastWordIdx = wordIndices[wordIndices.length - 1];

      return tokens
        .map((token, idx) => {
          if (!/[\p{L}]/u.test(token)) {
            return token;
          }

          const isFirst = idx === firstWordIdx;
          const isLast = idx === lastWordIdx;

          // Check if previous non-whitespace token was a colon, dash, or sentence end
          let afterPunctuation = false;
          if (!isFirst) {
            const prevToken = tokens[idx - 1];
            if (prevToken && /[:.!?—–]\s*$/.test(prevToken)) {
              afterPunctuation = true;
            }
          }

          return capitalizeCompound(
            token,
            isFirst || afterPunctuation,
            isLast,
            style
          );
        })
        .join('');
    })
    .join('');
}
