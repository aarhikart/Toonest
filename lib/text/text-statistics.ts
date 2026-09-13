import { TextStatistics, WordCounterStatistics, ReadingSpeedSettings } from './types';
import { countWords } from './word-counter';
import { countCharacters, countCharactersWithoutSpaces } from './character-counter';
import { countSentences } from './sentence-counter';
import { countParagraphs } from './paragraph-counter';

/**
 * Counts actual lines of text. Returns 0 for empty or null text.
 */
export function countLines(text: string): number {
  if (!text) return 0;
  return text.split(/\r\n|\r|\n/).length;
}

/**
 * Calculates complete text statistics for the Word Counter tool.
 */
export function getFullTextStatistics(
  text: string,
  settings?: ReadingSpeedSettings
): WordCounterStatistics {
  if (!text) {
    return {
      words: 0,
      characters: 0,
      charactersWithoutSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      averageWordsPerSentence: 0,
    };
  }

  const readingWpm = settings?.readingWpm || 200;
  const speakingWpm = settings?.speakingWpm || 130;

  const words = countWords(text);
  const characters = countCharacters(text);
  const charactersWithoutSpaces = countCharactersWithoutSpaces(text);
  const sentences = countSentences(text);
  const paragraphs = countParagraphs(text);
  const lines = countLines(text);

  // Reading time: in whole minutes or rounded
  const readingTimeMinutes =
    words > 0 ? Math.max(1, Math.round(words / readingWpm)) : 0;
  const speakingTimeMinutes =
    words > 0 ? Math.max(1, Math.round(words / speakingWpm)) : 0;

  const averageWordsPerSentence =
    sentences > 0 ? Number((words / sentences).toFixed(1)) : 0;

  return {
    words,
    characters,
    charactersWithoutSpaces,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes,
    speakingTimeMinutes,
    averageWordsPerSentence,
  };
}

/**
 * Backward-compatible helper for basic statistics.
 */
export function getTextStatistics(text: string): TextStatistics {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      sentences: 0,
    };
  }

  return {
    characters: countCharacters(text),
    charactersNoSpaces: countCharactersWithoutSpaces(text),
    words: countWords(text),
    lines: countLines(text),
    sentences: countSentences(text),
  };
}
