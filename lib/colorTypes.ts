export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface CmykColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ColorItem {
  id: string;
  hex: string;
  rgb: RgbColor;
  hsl: HslColor;
  cmyk: CmykColor;
  name: string;
  isLocked: boolean;
  luminance: number; // 0 (black) to 1 (white)
  contrastWhite: number; // WCAG contrast ratio vs #FFFFFF (1 to 21)
  contrastBlack: number; // WCAG contrast ratio vs #000000 (1 to 21)
  isDark: boolean; // true if text should be white, false if text should be dark
}

export type HarmonyMode =
  | 'random'
  | 'complementary'
  | 'monochromatic'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary';

export interface SavedPalette {
  id: string;
  name: string;
  colors: string[]; // array of HEX strings
  createdAt: number;
}

export type ExportTab = 'css' | 'tailwind' | 'json' | 'image' | 'share';
