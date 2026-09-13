import { CaseMode, TitleCaseOptions } from './types';
import { toTitleCase } from './title-case';

/**
 * Converts all alphabetic characters to UPPERCASE.
 * Preserves numbers, punctuation, spaces, and formatting.
 */
export function toUpperCase(text: string): string {
  if (!text) return '';
  return text.toUpperCase();
}

/**
 * Converts all alphabetic characters to lowercase.
 * Preserves numbers, punctuation, spaces, and formatting.
 */
export function toLowerCase(text: string): string {
  if (!text) return '';
  return text.toLowerCase();
}

/**
 * Main Case Converter Dispatcher
 */
export function convertCase(
  text: string,
  mode: CaseMode,
  options?: TitleCaseOptions
): string {
  if (!text) return '';

  switch (mode) {
    case 'uppercase':
      return toUpperCase(text);
    case 'lowercase':
      return toLowerCase(text);
    case 'titlecase':
      return toTitleCase(text, options);
    default:
      return text;
  }
}

/**
 * Utility: Collapses multiple consecutive spaces/tabs into a single space,
 * while preserving line breaks.
 */
export function removeExtraSpaces(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => line.replace(/[^\S\r\n]+/g, ' ').trim())
    .join('\n');
}

/**
 * Utility: Replaces line breaks with single spaces, collapsing paragraphs.
 */
export function removeLineBreaks(text: string): string {
  if (!text) return '';
  return text.replace(/[\r\n]+/g, ' ').replace(/[^\S\r\n]+/g, ' ').trim();
}

/**
 * Utility: Trims leading and trailing whitespace from each line.
 */
export function trimLines(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => line.trim())
    .join('\n');
}
