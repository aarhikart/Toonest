export type DpiPreset = 72 | 96 | 150 | 200 | 300 | 'custom';
export type QualityPreset = 'max' | 'high' | 'balanced' | 'small' | 'custom';
export type PageRangeMode = 'all' | 'selected' | 'custom';
export type PageOrientation = 'portrait' | 'landscape' | 'square';

export interface PdfPageItem {
  pageNumber: number;          // 1-indexed original page number
  orderIndex: number;          // order in current selection
  thumbnailUrl?: string;       // low-res preview URL
  width: number;               // original pt width
  height: number;              // original pt height
  orientation: PageOrientation;
  selected: boolean;
}

export interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  pages: PdfPageItem[];
  status: 'loading' | 'ready' | 'converting' | 'completed' | 'error';
  error?: string;
  customSettings?: Partial<PdfConversionConfig>;
}

export interface PdfConversionConfig {
  outputFormat: 'jpg' | 'png'; // 'jpg' | 'png' (default: 'jpg')
  transparentBackground?: boolean; // for PNG: transparent canvas if true
  quality: number;             // 1–100 (default: 90)
  dpi: number;                 // 50–600 (default: 150)
  resizeMode: 'original' | 'width' | 'height' | 'percent';
  resizeWidth?: number;
  resizeHeight?: number;
  resizePercent: number;       // default: 100
  maintainAspectRatio: boolean;// default: true
  backgroundColor: string;     // default: '#ffffff'
  namingPattern: 'pdf-name' | 'custom-prefix' | 'custom-suffix';
  customPrefix: string;
  numberPadding: number;       // 1, 2, 3, 4 (default: 3 -> '001')
  rangeMode: PageRangeMode;
  customRangeText: string;
}

export interface ConvertedJpgItem {
  id: string;
  pdfId: string;
  pdfName: string;
  pageNumber: number;
  filename: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  quality: number;
  format?: 'jpg' | 'png';
}

export type ConvertedImageItem = ConvertedJpgItem;

export interface ConversionProgress {
  currentPdfIndex: number;
  totalPdfs: number;
  currentPdfName: string;
  currentPageNumber: number;
  totalPagesForPdf: number;
  totalConvertedPages: number;
  totalTargetPages: number;
  percent: number;
}
