export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'linkedin'
  | 'x'
  | 'pinterest'
  | 'tiktok'
  | 'snapchat'
  | 'custom';

export type PresetCategory =
  | 'all'
  | 'posts'
  | 'stories'
  | 'profile'
  | 'covers'
  | 'thumbnails'
  | 'custom';

export type ResizeMode = 'crop' | 'fit' | 'stretch';

export type BackgroundMode = 'white' | 'black' | 'transparent' | 'custom' | 'blur';

export type CropPosition = 'top' | 'center' | 'bottom' | 'left' | 'right' | 'manual';

export type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp' | 'avif';

export type FilenameOption = 'suffix' | 'prefix' | 'original' | 'platform';

export interface SocialMediaPreset {
  id: string;
  platform: SocialPlatform;
  category: PresetCategory;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
  hasSafeArea?: boolean;
  recommendedFormat?: 'jpeg' | 'png';
  isPopular?: boolean;
  isCustom?: boolean;
}

export interface CropSettings {
  mode: ResizeMode;
  position: CropPosition;
  panX: number; // percentage -100 to 100
  panY: number; // percentage -100 to 100
  zoom: number; // 1 to 3
  rotation: number; // 0, 90, 180, 270
  fineRotation: number; // -180 to 180
  flipH: boolean;
  flipV: boolean;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  blurAmount: number; // 0 to 40 px
  blurBrightness: number; // 50 to 150 %
  smartCrop: boolean;
  faceSafeCrop: boolean;
  showSafeArea: boolean;
}

export interface SocialMediaConfig {
  presetId: string;
  customWidth: number;
  customHeight: number;
  customUnit: 'px' | 'percent';
  cropSettings: CropSettings;
  outputFormat: OutputFormat;
  quality: number; // 1 - 100
  doNotUpscale: boolean;
  filenameOption: FilenameOption;
  customSuffix: string;
  customPrefix: string;
}

export interface SocialMediaItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  processedUrl?: string;
  processedBlob?: Blob;
  processedSize?: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  error?: string;
  customCropSettings?: Partial<CropSettings>;
  hasCustomCrop?: boolean;
}

export const DEFAULT_CROP_SETTINGS: CropSettings = {
  mode: 'crop',
  position: 'center',
  panX: 0,
  panY: 0,
  zoom: 1,
  rotation: 0,
  fineRotation: 0,
  flipH: false,
  flipV: false,
  backgroundMode: 'blur',
  backgroundColor: '#FFFFFF',
  blurAmount: 24,
  blurBrightness: 90,
  smartCrop: true,
  faceSafeCrop: true,
  showSafeArea: false,
};

export const DEFAULT_SOCIAL_MEDIA_CONFIG: SocialMediaConfig = {
  presetId: 'ig-portrait',
  customWidth: 1080,
  customHeight: 1350,
  customUnit: 'px',
  cropSettings: DEFAULT_CROP_SETTINGS,
  outputFormat: 'original',
  quality: 90,
  doNotUpscale: true,
  filenameOption: 'platform',
  customSuffix: '-social',
  customPrefix: 'social-',
};
