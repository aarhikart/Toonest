export interface ShadowLayer {
  id: string;
  inset: boolean;
  offsetX: number; // -100 to 100 px
  offsetY: number; // -100 to 100 px
  blur: number; // 0 to 200 px
  spread: number; // -100 to 100 px
  color: string; // HEX, e.g. #000000
  opacity: number; // 0 to 100 %
  enabled: boolean;
}

export type PreviewObject =
  | 'card'
  | 'button'
  | 'circle'
  | 'image'
  | 'input'
  | 'custom';

export interface PreviewSettings {
  object: PreviewObject;
  width: number;
  height: number;
  borderRadius: number;
  elementBg: string;
  previewBg: string;
  borderWidth: number;
  borderColor: string;
}

export interface ShadowConfig {
  name: string;
  layers: ShadowLayer[];
  preview: PreviewSettings;
}

export interface SavedShadow {
  id: string;
  name: string;
  config: ShadowConfig;
  createdAt: number;
}

export type ShadowCategory =
  | 'Subtle'
  | 'Cards'
  | 'Buttons'
  | 'Modern'
  | 'Dramatic'
  | 'Inset';

export interface ShadowPreset {
  id: string;
  name: string;
  category: ShadowCategory;
  layers: ShadowLayer[];
}

export type ExportTab = 'css' | 'class' | 'var' | 'tailwind' | 'scss';
