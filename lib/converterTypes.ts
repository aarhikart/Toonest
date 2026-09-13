export type ImageFormat = 'jpg' | 'png' | 'webp' | 'avif';

export type QualityPreset = 'best' | 'balanced' | 'small' | 'custom';

export type ResizeMethod = 'fit' | 'fill' | 'stretch';

export type CropPreset = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '9:16';

export interface ResizeConfig {
  enabled: boolean;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  method: ResizeMethod;
  percentage?: number; // e.g. 50%, 75%
  maxWidth?: number;
  maxHeight?: number;
}

export interface CropConfig {
  enabled: boolean;
  preset: CropPreset;
}

export interface TransformConfig {
  rotate: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export interface NamingConfig {
  mode: 'original' | 'suffix' | 'custom' | 'numbered';
  prefix: string;
  suffix: string;
  customName: string;
  startNumber: number;
  numberPadding: number;
}

export interface ConversionSettings {
  targetFormat: ImageFormat;
  quality: number; // 1 - 100
  preset: QualityPreset;
  
  // Format specific
  jpegProgressive: boolean;
  pngCompression: 'fast' | 'optimal';
  webpLossless: boolean;
  removeMetadata: boolean;
  backgroundColor: string; // e.g. '#FFFFFF' for transparent PNG -> JPG
  
  // Transforms
  resize: ResizeConfig;
  crop: CropConfig;
  transform: TransformConfig;
  
  // Naming
  naming: NamingConfig;
}

export interface ConvertFileItem {
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
  
  // Target overrides (optional per-image settings)
  targetFormat: ImageFormat;
  targetName: string;
  
  // Conversion state
  status: 'idle' | 'converting' | 'completed' | 'error';
  progress?: number;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  convertedWidth?: number;
  convertedHeight?: number;
  errorMessage?: string;
  selected: boolean;
}

export interface ConversionStats {
  totalFiles: number;
  completedFiles: number;
  originalTotalBytes: number;
  convertedTotalBytes: number;
  spaceSavedBytes: number;
  percentageSaved: number;
}
