export type CaseMode = 'uppercase' | 'lowercase' | 'titlecase';

export type TitleCaseStyle = 'standard' | 'every-word' | 'sentence';

export interface TitleCaseOptions {
  style: TitleCaseStyle;
  preserveSmallWords?: boolean;
}

export interface TextStatistics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
}

export interface ConversionHistoryItem {
  id: string;
  timestamp: number;
  mode: CaseMode;
  inputPreview: string;
  outputPreview: string;
  charCount: number;
  wordCount: number;
}

export interface WordCounterStatistics {
  words: number;
  characters: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  averageWordsPerSentence: number;
}

export interface ReadingSpeedSettings {
  readingWpm: number;
  speakingWpm: number;
}

