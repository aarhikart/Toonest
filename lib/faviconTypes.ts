export type IconShape = 'original' | 'square' | 'rounded' | 'circle' | 'squircle';

export type BackgroundType = 'transparent' | 'solid' | 'gradient';

export type GradientType = 'linear' | 'radial';

export type ImageFit = 'contain' | 'cover' | 'custom';

export type FaviconCategory = 'browser' | 'apple' | 'android' | 'additional' | 'custom';

export interface FaviconSizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: FaviconCategory;
  filename: string;
  recommendedFormat: 'ico' | 'png' | 'svg';
  description: string;
  isDefaultSelected: boolean;
}

export interface PackageOptions {
  includeIco: boolean;
  includePng: boolean;
  includeAppleTouch: boolean;
  includeAndroidPwa: boolean;
  includeSvg: boolean;
  includeManifest: boolean;
  includeHtmlSnippet: boolean;
}

export interface FaviconConfig {
  // Shape & Background
  shape: IconShape;
  cornerRadius: number; // 0 to 100 % (for rounded square)
  backgroundType: BackgroundType;
  backgroundColor: string; // hex
  gradientType: GradientType;
  gradientStart: string; // hex
  gradientEnd: string; // hex
  gradientAngle: number; // 0 to 360 deg

  // Image Transformation
  imageFit: ImageFit;
  padding: number; // 0 to 50 % (default 10)
  positionX: number; // 0 to 100 % (default 50)
  positionY: number; // 0 to 100 % (default 50)
  zoom: number; // 50 to 300 % (default 100)
  rotation: number; // -180 to 180 deg (default 0)
  flipH: boolean;
  flipV: boolean;

  // Quality
  quality: number; // 1 to 100 (default 95)

  // Size selections
  selectedSizeIds: string[];
  customSizes: { width: number; height: number }[];

  // Package & Manifest
  websiteName: string;
  shortName: string;
  themeColor: string;
  manifestBgColor: string;
  filenamePrefix: string; // default "favicon"
  packageOptions: PackageOptions;
}

export interface FaviconSourceItem {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  format: string;
  previewUrl: string;
  svgContent?: string;
  isDarkModeVariant?: boolean;
}

export interface GeneratedFaviconFile {
  id: string;
  name: string;
  filename: string;
  width?: number;
  height?: number;
  blob: Blob;
  url: string;
  size: number;
  format: string;
  category: string;
  isIco?: boolean;
  isSvg?: boolean;
  isManifest?: boolean;
  isHtml?: boolean;
}

export const DEFAULT_PACKAGE_OPTIONS: PackageOptions = {
  includeIco: true,
  includePng: true,
  includeAppleTouch: true,
  includeAndroidPwa: true,
  includeSvg: true,
  includeManifest: true,
  includeHtmlSnippet: true,
};

export const DEFAULT_FAVICON_CONFIG: FaviconConfig = {
  shape: 'original',
  cornerRadius: 22,
  backgroundType: 'transparent',
  backgroundColor: '#5722AF',
  gradientType: 'linear',
  gradientStart: '#5722AF',
  gradientEnd: '#9B6BE8',
  gradientAngle: 135,

  imageFit: 'contain',
  padding: 10,
  positionX: 50,
  positionY: 50,
  zoom: 100,
  rotation: 0,
  flipH: false,
  flipV: false,

  quality: 95,

  selectedSizeIds: [
    'ico-multi',
    'png-16',
    'png-32',
    'png-48',
    'apple-180',
    'android-192',
    'android-512',
  ],
  customSizes: [],

  websiteName: 'My Website',
  shortName: 'Website',
  themeColor: '#5722AF',
  manifestBgColor: '#FFFFFF',
  filenamePrefix: 'favicon',
  packageOptions: DEFAULT_PACKAGE_OPTIONS,
};
