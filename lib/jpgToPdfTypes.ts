export type PdfPageSize =
  | 'a4'
  | 'a3'
  | 'a5'
  | 'letter'
  | 'legal'
  | 'original'
  | 'custom';

export type PdfOrientation = 'auto' | 'portrait' | 'landscape';

export type ImageFitMode = 'fit' | 'fill' | 'original' | 'custom';

export type MarginPreset = 'none' | 'small' | 'medium' | 'large' | 'custom';

export type ImageAlignment = 'center' | 'top' | 'bottom' | 'left' | 'right';

export type PdfCompressionMode = 'best' | 'balanced' | 'small';

export interface JpgImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270 degrees clockwise
  previewUrl: string;
  orderIndex: number;
  selected: boolean;
  status: 'ready' | 'processing' | 'error';
  error?: string;
}

export interface JpgToPdfConfig {
  pageSize: PdfPageSize;
  customWidthMm: number;
  customHeightMm: number;
  orientation: PdfOrientation;
  imageFit: ImageFitMode;
  customScalePercent: number; // 10 to 200, default 100
  marginPreset: MarginPreset;
  customMarginsMm: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  alignment: ImageAlignment;
  backgroundColor: string; // default '#ffffff'
  quality: number; // 1–100, default 90
  compression: PdfCompressionMode;
  filename: string; // default 'converted-images.pdf'
  filenamePrefix?: string;
  filenameSuffix?: string;
  separatePdfs: boolean; // default false
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
  };
  removeMetadata: boolean;
}

export interface ConversionProgress {
  percent: number;
  currentImageName: string;
  completedCount: number;
  totalCount: number;
}

export interface GeneratedPdfResult {
  id: string;
  filename: string;
  blob: Blob;
  url: string;
  size: number;
  pageCount: number;
  separateFiles?: {
    filename: string;
    blob: Blob;
    size: number;
    url: string;
  }[];
}
