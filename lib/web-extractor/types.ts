export interface ExtractedMetadata {
  title: string;
  description: string;
  keywords: string[];
  author?: string;
  favicon?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  themeColor?: string;
  language?: string;
  charset?: string;
}

export interface ExtractedHeading {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ExtractedImage {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  isDataUri?: boolean;
}

export interface ExtractedLink {
  href: string;
  text: string;
  isExternal: boolean;
  rel?: string;
  target?: string;
}

export interface ExtractedTable {
  id: number;
  caption?: string;
  headers: string[];
  rows: string[][];
  rowCount: number;
  colCount: number;
}

export interface ExtractedTextContent {
  cleanText: string;
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
  paragraphs: string[];
}

export interface ExtractedWebData {
  url: string;
  targetUrl: string;
  domain: string;
  statusCode: number;
  statusText: string;
  loadTimeMs: number;
  pageSizeBytes: number;
  contentType: string;
  metadata: ExtractedMetadata;
  headings: ExtractedHeading[];
  textContent: ExtractedTextContent;
  images: ExtractedImage[];
  links: ExtractedLink[];
  tables: ExtractedTable[];
  rawHtml: string;
  extractedAt: string;
}

export interface ExtractionResponse {
  success: boolean;
  data?: ExtractedWebData;
  error?: string;
}

export type ViewportMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export type BrowserDisplayMode = 'proxy' | 'direct' | 'reader';

export interface ConsoleLogItem {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'eval-in' | 'eval-out' | 'eval-error';
  messages: string[];
  timestamp: string;
}
