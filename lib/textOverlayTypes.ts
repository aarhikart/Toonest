export type TextEffect = 'none' | 'outline' | 'shadow' | 'background-box';

export type TextAlignment = 'left' | 'center' | 'right';

export type PositionAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'custom';

export type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp' | 'avif';

export type FilenameOption = 'suffix' | 'prefix' | 'original';

export type SocialPresetId =
  | 'original'
  | 'ig-square'
  | 'ig-portrait'
  | 'ig-story'
  | 'fb-post'
  | 'yt-thumbnail'
  | 'li-post';

export interface SocialPreset {
  id: SocialPresetId;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  { id: 'original', label: 'Original Dimensions', width: 0, height: 0, aspectRatio: 'Native' },
  { id: 'ig-square', label: 'Instagram Square', width: 1080, height: 1080, aspectRatio: '1:1' },
  { id: 'ig-portrait', label: 'Instagram Portrait', width: 1080, height: 1350, aspectRatio: '4:5' },
  { id: 'ig-story', label: 'Instagram Story / Reel', width: 1080, height: 1920, aspectRatio: '9:16' },
  { id: 'fb-post', label: 'Facebook Post', width: 1200, height: 630, aspectRatio: '1.91:1' },
  { id: 'yt-thumbnail', label: 'YouTube Thumbnail', width: 1280, height: 720, aspectRatio: '16:9' },
  { id: 'li-post', label: 'LinkedIn Post', width: 1200, height: 627, aspectRatio: '1.91:1' },
];

export interface TextLayer {
  id: string;
  name: string;
  text: string;
  fontFamily: string;
  fontSize: number; // in pixels
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800';
  fontStyle: 'normal' | 'italic';
  color: string;
  opacity: number; // 0 - 100
  letterSpacing: number; // -5 to 30 px
  lineHeight: number; // 0.8 to 2.5
  alignment: TextAlignment;

  // Effects
  effect: TextEffect;
  outlineColor: string;
  outlineWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  boxColor: string;
  boxOpacity: number;
  boxPadding: number;
  boxBorderRadius: number;

  // Position & Layout
  position: PositionAnchor;
  customXPercent: number; // 0 - 100%
  customYPercent: number; // 0 - 100%
  marginOffsetX: number; // px from edge
  marginOffsetY: number; // px from edge
  rotation: number; // -180 to 180 deg
  isVisible: boolean;
}

export interface TextOverlayConfig {
  layers: TextLayer[];
  activeLayerId: string | null;
  socialPreset: SocialPresetId;
  scaleProportionally: boolean;
  outputFormat: OutputFormat;
  quality: number; // 1 - 100
  jpegBgColor: string;
  filenameOption: FilenameOption;
  customSuffix: string;
  customPrefix: string;
  removeMetadata: boolean;
}

export interface TextOverlayItem {
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
  customLayers?: TextLayer[];
  hasCustomOverride?: boolean;
}

export interface TextOverlayPreset {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  layerStyle: Partial<TextLayer>;
}

export const DEFAULT_TEXT_LAYER: TextLayer = {
  id: 'layer-1',
  name: 'Headline Text',
  text: 'Enter Your Text Here',
  fontFamily: 'Arial',
  fontSize: 54,
  fontWeight: '700',
  fontStyle: 'normal',
  color: '#FFFFFF',
  opacity: 100,
  letterSpacing: 0,
  lineHeight: 1.2,
  alignment: 'center',

  effect: 'shadow',
  outlineColor: '#000000',
  outlineWidth: 2,
  shadowColor: 'rgba(0, 0, 0, 0.75)',
  shadowBlur: 8,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  boxColor: '#000000',
  boxOpacity: 60,
  boxPadding: 16,
  boxBorderRadius: 8,

  position: 'center',
  customXPercent: 50,
  customYPercent: 50,
  marginOffsetX: 40,
  marginOffsetY: 40,
  rotation: 0,
  isVisible: true,
};

export const DEFAULT_TEXT_OVERLAY_CONFIG: TextOverlayConfig = {
  layers: [DEFAULT_TEXT_LAYER],
  activeLayerId: 'layer-1',
  socialPreset: 'original',
  scaleProportionally: true,
  outputFormat: 'original',
  quality: 90,
  jpegBgColor: '#FFFFFF',
  filenameOption: 'suffix',
  customSuffix: '-text-overlay',
  customPrefix: 'text-',
  removeMetadata: true,
};

export const BUILT_IN_TEXT_TEMPLATES: TextOverlayPreset[] = [
  {
    id: 'simple-clean',
    name: 'Simple Clean',
    description: 'Clean white typography with soft drop shadow for maximum legibility',
    layerStyle: {
      color: '#FFFFFF',
      fontWeight: '600',
      effect: 'shadow',
      shadowColor: 'rgba(0, 0, 0, 0.65)',
      shadowBlur: 6,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      rotation: 0,
    },
  },
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    description: 'Extra-bold uppercase statement font with prominent outline',
    layerStyle: {
      fontFamily: 'Impact',
      fontWeight: '800',
      color: '#FFFFFF',
      effect: 'outline',
      outlineColor: '#000000',
      outlineWidth: 4,
      letterSpacing: 2,
      rotation: 0,
    },
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Sleek tracked typography for modern editorial and brand photos',
    layerStyle: {
      fontFamily: 'Helvetica',
      fontWeight: '500',
      color: '#FFFFFF',
      effect: 'shadow',
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowBlur: 4,
      letterSpacing: 4,
      rotation: 0,
    },
  },
  {
    id: 'sale-badge',
    name: 'Sale Badge',
    description: 'High-contrast promotional text inside a vibrant badge box',
    layerStyle: {
      color: '#FFFFFF',
      fontWeight: '700',
      effect: 'background-box',
      boxColor: '#5722AF',
      boxOpacity: 90,
      boxPadding: 16,
      boxBorderRadius: 10,
      rotation: -5,
    },
  },
  {
    id: 'photo-caption',
    name: 'Photo Caption',
    description: 'Elegant lower-third caption with a subtle semi-transparent dark pill',
    layerStyle: {
      fontFamily: 'Georgia',
      fontStyle: 'italic',
      fontSize: 28,
      position: 'bottom-center',
      effect: 'background-box',
      boxColor: '#000000',
      boxOpacity: 55,
      boxPadding: 10,
      boxBorderRadius: 6,
      rotation: 0,
    },
  },
  {
    id: 'social-promo',
    name: 'Social Promo',
    description: 'Eye-catching bold center typography with neon-tinted shadow',
    layerStyle: {
      fontWeight: '800',
      fontSize: 68,
      color: '#FFFFFF',
      effect: 'shadow',
      shadowColor: '#5722AF',
      shadowBlur: 14,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      rotation: 0,
    },
  },
  {
    id: 'minimal-watermark',
    name: 'Corner Attribution',
    description: 'Subtle corner creator attribution and copyright credit',
    layerStyle: {
      fontSize: 22,
      fontWeight: '500',
      color: '#FFFFFF',
      opacity: 75,
      position: 'bottom-right',
      marginOffsetX: 32,
      marginOffsetY: 32,
      effect: 'shadow',
      shadowBlur: 3,
      rotation: 0,
    },
  },
];
