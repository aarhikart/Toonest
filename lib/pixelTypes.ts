export type PixelResizeMode =
  | 'exact'
  | 'fit'
  | 'fill'
  | 'percentage'
  | 'longest'
  | 'shortest';

export type CropPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export type OrientationOption = 'original' | 'landscape' | 'portrait' | 'square';

export type PixelNamingMode = 'original' | 'suffix' | 'prefix' | 'dimensions' | 'custom';

export type QualityPreset = 'max' | 'high' | 'balanced' | 'small' | 'custom';

export interface PixelPreset {
  id: string;
  name: string;
  category: 'social' | 'website' | 'common' | 'custom';
  width: number;
  height: number;
  mode?: PixelResizeMode;
}

export interface PixelConfig {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  mode: PixelResizeMode;
  percentage: number; // 25, 50, 75, 100, 125, 150, 200, custom
  longestSide: number;
  shortestSide: number;
  doNotUpscale: boolean; // default true
  orientation: OrientationOption;
  cropPosition: CropPosition;
  rotate: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  quality: number; // 1 - 100, default 90
  qualityPreset: QualityPreset;
  outputFormat: 'original' | 'jpg' | 'png' | 'webp' | 'avif';
  backgroundColor: string; // default #FFFFFF for transparent -> JPG
  removeMetadata: boolean;
  namingMode: PixelNamingMode;
  namingSuffix: string;
  namingPrefix: string;
  customName: string;
}

export interface PixelCustomOverride {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  mode?: PixelResizeMode;
  quality?: number;
  outputFormat?: 'original' | 'jpg' | 'png' | 'webp' | 'avif';
}

export interface PixelFileItem {
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
  isExcessiveSize?: boolean;
  safetyWarning?: string;

  // Custom Override per-item
  customOverride?: PixelCustomOverride;

  // Target values
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

export interface PixelBatchStats {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  originalTotalBytes: number;
  outputTotalBytes: number;
  spaceSavedBytes: number;
  totalReductionPercent?: number;
}
