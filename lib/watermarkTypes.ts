export type WatermarkType = 'text' | 'image';

export type WatermarkPosition =
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

export type TextEffect = 'none' | 'outline' | 'shadow' | 'background-box';

export type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp' | 'avif';

export type FilenameOption = 'suffix' | 'prefix' | 'original';

export interface WatermarkConfig {
  type: WatermarkType;
  // Text Options
  text: string;
  fontFamily: string;
  fontSize: number; // in pixels (or relative base)
  fontWeight: 'normal' | 'bold' | '600' | '800';
  fontStyle: 'normal' | 'italic';
  textColor: string;
  textOpacity: number; // 0 - 100
  letterSpacing: number; // px
  lineHeight: number; // multiplier e.g. 1.2
  textEffect: TextEffect;
  outlineColor: string;
  outlineWidth: number;
  shadowColor: string;
  shadowBlur: number;
  boxColor: string;
  boxOpacity: number;
  boxPadding: number;
  boxBorderRadius: number;

  // Image/Logo Options
  logoFile: File | null;
  logoUrl: string | null;
  logoWidth: number;
  logoHeight: number;
  logoScalePercent: number; // 5 to 100% of base image width
  logoOpacity: number; // 0 - 100

  // Position & Offset
  position: WatermarkPosition;
  marginOffset: number; // px margin from border
  customXPercent: number; // 0 - 100%
  customYPercent: number; // 0 - 100%

  // Rotation
  rotation: number; // -180 to 180 deg

  // Tiling / Repeating
  isTiled: boolean;
  tileSpacingX: number; // px
  tileSpacingY: number; // px

  // Output Settings
  outputFormat: OutputFormat;
  quality: number; // 1 - 100
  jpegBgColor: string;
  filenameOption: FilenameOption;
  customSuffix: string;
  customPrefix: string;
}

export interface WatermarkItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  watermarkedUrl?: string;
  watermarkedBlob?: Blob;
  watermarkedSize?: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  error?: string;
  customConfig?: Partial<WatermarkConfig>;
  hasCustomOverride?: boolean;
}

export interface WatermarkPreset {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  config: Partial<WatermarkConfig>;
}

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  type: 'text',
  text: '© ToolNest Watermark',
  fontFamily: 'Arial',
  fontSize: 36,
  fontWeight: 'bold',
  fontStyle: 'normal',
  textColor: '#ffffff',
  textOpacity: 75,
  letterSpacing: 1,
  lineHeight: 1.2,
  textEffect: 'shadow',
  outlineColor: '#000000',
  outlineWidth: 2,
  shadowColor: 'rgba(0, 0, 0, 0.75)',
  shadowBlur: 6,
  boxColor: '#000000',
  boxOpacity: 45,
  boxPadding: 12,
  boxBorderRadius: 8,

  logoFile: null,
  logoUrl: null,
  logoWidth: 0,
  logoHeight: 0,
  logoScalePercent: 20,
  logoOpacity: 80,

  position: 'bottom-right',
  marginOffset: 32,
  customXPercent: 50,
  customYPercent: 50,

  rotation: 0,

  isTiled: false,
  tileSpacingX: 120,
  tileSpacingY: 100,

  outputFormat: 'original',
  quality: 92,
  jpegBgColor: '#ffffff',
  filenameOption: 'suffix',
  customSuffix: '-watermarked',
  customPrefix: 'watermarked-',
};

export const BUILT_IN_PRESETS: WatermarkPreset[] = [
  {
    id: 'subtle-branding',
    name: 'Subtle Branding',
    description: 'Corner placement with soft opacity for a clean, non-intrusive watermark',
    config: {
      type: 'text',
      position: 'bottom-right',
      textOpacity: 45,
      fontSize: 28,
      textEffect: 'shadow',
      shadowBlur: 4,
      rotation: 0,
      isTiled: false,
    },
  },
  {
    id: 'professional-proof',
    name: 'Professional Proof',
    description: 'Center diagonal watermark ideal for proofs, samples, and client previews',
    config: {
      type: 'text',
      text: 'SAMPLE PROOF — DO NOT COPY',
      position: 'center',
      textOpacity: 55,
      fontSize: 52,
      fontWeight: 'bold',
      textEffect: 'outline',
      outlineColor: '#000000',
      outlineWidth: 2,
      rotation: -30,
      isTiled: false,
    },
  },
  {
    id: 'copyright-notice',
    name: 'Copyright Notice',
    description: 'Crisp legal attribution with high legibility and background pill',
    config: {
      type: 'text',
      text: `© ${new Date().getFullYear()} All Rights Reserved`,
      position: 'bottom-center',
      textOpacity: 85,
      fontSize: 24,
      textEffect: 'background-box',
      boxColor: '#000000',
      boxOpacity: 60,
      boxPadding: 8,
      boxBorderRadius: 6,
      rotation: 0,
      isTiled: false,
    },
  },
  {
    id: 'full-tile-protection',
    name: 'Full Tile Protection',
    description: 'Repeated diagonal grid across entire image prevents unauthorized cropping',
    config: {
      type: 'text',
      text: 'PROTECTED PREVIEW',
      textOpacity: 25,
      fontSize: 32,
      fontWeight: 'bold',
      rotation: -30,
      isTiled: true,
      tileSpacingX: 160,
      tileSpacingY: 120,
      textEffect: 'shadow',
      shadowBlur: 3,
    },
  },
  {
    id: 'high-contrast-stamp',
    name: 'High Contrast Stamp',
    description: 'Bold text with black outline and 100% white fill for maximum readability',
    config: {
      type: 'text',
      textOpacity: 90,
      fontSize: 36,
      fontWeight: '800',
      textColor: '#ffffff',
      textEffect: 'outline',
      outlineColor: '#000000',
      outlineWidth: 3,
      position: 'bottom-right',
      rotation: 0,
      isTiled: false,
    },
  },
];
