export interface ColorStop {
  id: string;
  color: string; // HEX color, e.g. #5722AF
  position: number; // 0 to 100 percentage
  alpha: number; // 0 to 1
}

export type GradientType =
  | 'linear'
  | 'radial'
  | 'conic'
  | 'repeating-linear'
  | 'repeating-radial'
  | 'repeating-conic';

export type RadialShape = 'circle' | 'ellipse';

export type RadialSize =
  | 'farthest-corner'
  | 'closest-side'
  | 'closest-corner'
  | 'farthest-side';

export interface RadialConfig {
  shape: RadialShape;
  size: RadialSize;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export interface ConicConfig {
  angle: number; // 0 to 360 degrees
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export type SmoothMode = 'standard' | 'smooth' | 'extra-smooth';

export type RandomMood =
  | 'balanced'
  | 'vibrant'
  | 'pastel'
  | 'dark'
  | 'soft'
  | 'colorful';

export type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'
  | 'monochromatic';

export interface GradientConfig {
  name: string;
  type: GradientType;
  stops: ColorStop[];
  angle: number; // 0 to 360 for linear
  radial: RadialConfig;
  conic: ConicConfig;
  smoothMode: SmoothMode;
  repeatingLength?: number; // 0 to 100 percentage for repeating gradients
}

export interface SavedGradient {
  id: string;
  name: string;
  config: GradientConfig;
  createdAt: number;
}

export interface GradientPreset {
  id: string;
  name: string;
  category: string;
  config: GradientConfig;
}

export interface DimensionPreset {
  label: string;
  category: string;
  width: number;
  height: number;
  description: string;
}

export interface ContrastSample {
  position: number; // 0 to 100
  colorHex: string;
  rgb: { r: number; g: number; b: number };
  luminance: number;
  contrastWhite: number;
  contrastBlack: number;
  passesAAWhite: boolean;
  passesAABlack: boolean;
  passesAAAWhite: boolean;
  passesAAABlack: boolean;
}
