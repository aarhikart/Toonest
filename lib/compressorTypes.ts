export type CompressorMode = 'single' | 'bulk';

export type OutputFormatOption = 'original' | 'jpg' | 'png' | 'webp' | 'avif';

export type QualityPreset = 'max' | 'balanced' | 'small' | 'custom';

export type TargetSizeOption =
  | 'none'
  | '5mb'
  | '2mb'
  | '1mb'
  | '500kb'
  | '250kb'
  | 'custom';

export interface SmartResizeConfig {
  enabled: boolean;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  percentage?: number; // 25, 50, 75, 100
  maxWidth?: number;
  maxHeight?: number;
  preventUpscale: boolean; // default true
}

export interface CompressorNamingConfig {
  mode: 'original' | 'suffix' | 'custom' | 'numbered';
  prefix: string;
  suffix: string;
  customName: string;
  startNumber: number;
  numberPadding: number;
}

export interface CompressionSettings {
  preset: QualityPreset;
  quality: number; // 1 - 100
  targetSize: TargetSizeOption;
  customTargetSizeBytes?: number;
  outputFormat: OutputFormatOption;
  skipIfLarger: boolean; // default true
  minSavingsPercent: number; // 0, 1, 5, 10, 20
  preventExcessiveLoss: boolean;
  backgroundColor: string; // for transparent PNG -> JPG
  removeMetadata: boolean;
  resize: SmartResizeConfig;
  naming: CompressorNamingConfig;
}

export interface CompressFileItem {
  id: string;
  file: File;
  previewUrl: string;
  originalName: string;
  originalBaseName: string;
  originalExtension: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalFormat: string;
  hasTransparency: boolean;

  // Compression Output
  targetName: string;
  outputFormat: string;
  status: 'idle' | 'compressing' | 'completed' | 'skipped' | 'error';
  compressedBlob?: Blob;
  compressedUrl?: string;
  compressedSize?: number;
  compressedWidth?: number;
  compressedHeight?: number;
  spaceSavedBytes?: number;
  reductionPercent?: number;
  isLargerThanOriginal?: boolean;
  wasSkipped?: boolean;
  closestAchievable?: boolean;
  actualQualityUsed?: number;
  errorMessage?: string;
  selected: boolean;
}

export interface CompressionBatchStats {
  totalFiles: number;
  completedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  originalTotalBytes: number;
  compressedTotalBytes: number;
  spaceSavedBytes: number;
  totalReductionPercent: number;
}
