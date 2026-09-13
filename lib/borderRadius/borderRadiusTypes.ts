export type RadiusUnit = 'px' | '%' | 'rem' | 'em';

export interface CornerRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export type PreviewObject =
  | 'rectangle'
  | 'card'
  | 'button'
  | 'image'
  | 'circle'
  | 'input'
  | 'custom';

export type PreviewSizePreset = 'small' | 'medium' | 'large' | 'square' | 'custom';

export interface BorderSettings {
  enabled: boolean;
  width: number; // in px
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
}

export interface PreviewSettings {
  object: PreviewObject;
  sizePreset: PreviewSizePreset;
  width: number;
  height: number;
  previewBg: string; // canvas background color
  elementBg: string; // element background color
  border: BorderSettings;
  showGuides: boolean;
}

export interface BorderRadiusConfig {
  name?: string;
  isLinked: boolean;
  isElliptical: boolean;
  unit: RadiusUnit;
  horizontal: CornerRadius;
  vertical: CornerRadius;
  preview: PreviewSettings;
}

export interface SavedRadiusPreset {
  id: string;
  name: string;
  createdAt: number;
  config: BorderRadiusConfig;
}

export type ShapeCategory =
  | 'Standard'
  | 'Cards'
  | 'Buttons'
  | 'Modern'
  | 'Organic'
  | 'Blobs'
  | 'Asymmetric';

export interface ShapePreset {
  id: string;
  name: string;
  category: ShapeCategory;
  description?: string;
  isElliptical?: boolean;
  unit: RadiusUnit;
  horizontal: CornerRadius;
  vertical?: CornerRadius;
}

export type ExportTab = 'css' | 'class' | 'var' | 'tailwind' | 'scss';
