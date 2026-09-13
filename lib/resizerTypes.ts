export type ResizeMode =
  | 'exact'
  | 'fit'
  | 'fill'
  | 'percentage'
  | 'longest'
  | 'shortest';

export type ResizeUnit = 'px' | '%';

export type CropPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export type OrientationMode = 'original' | 'landscape' | 'portrait' | 'square';

export interface PresetItem {
  id: string;
  name: string;
  category: 'social' | 'web' | 'profile' | 'custom';
  width: number;
  height: number;
  mode?: ResizeMode;
}

export interface ResizeNamingConfig {
  mode: 'original' | 'suffix' | 'custom' | 'numbered';
  prefix: string;
  suffix: string;
  customName: string;
  startNumber: number;
  numberPadding: number;
}

export interface ResizeConfig {
  mode: ResizeMode;
  unit: ResizeUnit;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  percentage: number; // e.g. 50%
  longestSide: number;
  shortestSide: number;
  doNotUpscale: boolean; // default true
  orientation: OrientationMode;
  cropPosition: CropPosition;
  rotate: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  outputFormat: 'original' | 'jpg' | 'png' | 'webp' | 'avif';
  quality: number; // 1 - 100, default 90
  backgroundColor: string; // default #FFFFFF for transparent -> JPG
  removeMetadata: boolean;
  naming: ResizeNamingConfig;
}

export interface ResizeFileItem {
  id: string;
  file: File;
  previewUrl: string;
  originalName: string;
  originalBaseName: string;
  originalExtension: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalRatio: string;
  originalFormat: string;
  hasTransparency: boolean;

  // Calculated Output
  targetWidth: number;
  targetHeight: number;
  targetName: string;
  estimatedSize?: number;

  // Execution state
  status: 'idle' | 'processing' | 'completed' | 'skipped' | 'error';
  resizedBlob?: Blob;
  resizedUrl?: string;
  resizedSize?: number;
  actualWidth?: number;
  actualHeight?: number;
  wasUpscaleSkipped?: boolean;
  selected: boolean;
  errorMessage?: string;
}

export interface ResizeBatchStats {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  avgOriginalWidth: number;
  avgOriginalHeight: number;
  avgOutputWidth: number;
  avgOutputHeight: number;
  originalTotalBytes: number;
  outputTotalBytes: number;
  spaceSavedBytes: number;
  totalReductionPercent?: number;
}
