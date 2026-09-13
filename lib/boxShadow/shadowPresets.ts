import { ShadowPreset, ShadowLayer, ShadowConfig } from './shadowTypes';

export const SHADOW_CATEGORIES = [
  'All',
  'Subtle',
  'Cards',
  'Buttons',
  'Modern',
  'Dramatic',
  'Inset',
];

function makePreset(
  name: string,
  category: ShadowPreset['category'],
  layers: Array<{
    inset?: boolean;
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    color?: string;
    opacity: number;
  }>
): ShadowPreset {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name,
    category,
    layers: layers.map((l, idx) => ({
      id: `layer-${idx}`,
      inset: !!l.inset,
      offsetX: l.offsetX,
      offsetY: l.offsetY,
      blur: l.blur,
      spread: l.spread,
      color: l.color || '#000000',
      opacity: l.opacity,
      enabled: true,
    })),
  };
}

export const SHADOW_PRESETS: ShadowPreset[] = [
  // Subtle
  makePreset('Soft Feather', 'Subtle', [
    { offsetX: 0, offsetY: 4, blur: 12, spread: 0, opacity: 8 },
  ]),
  makePreset('Tiny Border Glow', 'Subtle', [
    { offsetX: 0, offsetY: 1, blur: 3, spread: 0, opacity: 12 },
  ]),
  makePreset('Minimal Elevation', 'Subtle', [
    { offsetX: 0, offsetY: 2, blur: 6, spread: 0, opacity: 10 },
  ]),
  makePreset('Light Ambient', 'Subtle', [
    { offsetX: 0, offsetY: 6, blur: 16, spread: -2, opacity: 10 },
  ]),

  // Cards
  makePreset('Standard Card', 'Cards', [
    { offsetX: 0, offsetY: 4, blur: 12, spread: 0, opacity: 10 },
    { offsetX: 0, offsetY: 1, blur: 3, spread: 0, opacity: 8 },
  ]),
  makePreset('Floating Card', 'Cards', [
    { offsetX: 0, offsetY: 15, blur: 35, spread: -5, opacity: 16 },
    { offsetX: 0, offsetY: 5, blur: 15, spread: 0, opacity: 8 },
  ]),
  makePreset('Elevated Card', 'Cards', [
    { offsetX: 0, offsetY: 20, blur: 40, spread: -10, opacity: 20 },
    { offsetX: 0, offsetY: 8, blur: 16, spread: -2, opacity: 12 },
  ]),
  makePreset('Material Surface', 'Cards', [
    { offsetX: 0, offsetY: 3, blur: 6, spread: 0, opacity: 12 },
    { offsetX: 0, offsetY: 1, blur: 3, spread: 0, opacity: 24 },
  ]),

  // Buttons
  makePreset('Button Shadow', 'Buttons', [
    { offsetX: 0, offsetY: 2, blur: 4, spread: 0, opacity: 16 },
  ]),
  makePreset('Raised Button', 'Buttons', [
    { offsetX: 0, offsetY: 4, blur: 10, spread: 0, opacity: 18 },
    { offsetX: 0, offsetY: 1, blur: 3, spread: 0, opacity: 10 },
  ]),
  makePreset('Pressed Button', 'Buttons', [
    { inset: true, offsetX: 0, offsetY: 2, blur: 4, spread: 0, opacity: 25 },
  ]),

  // Modern
  makePreset('Clean UI Multi-Layer', 'Modern', [
    { offsetX: 0, offsetY: 2, blur: 4, spread: -1, opacity: 6 },
    { offsetX: 0, offsetY: 4, blur: 12, spread: -2, opacity: 10 },
    { offsetX: 0, offsetY: 16, blur: 32, spread: -4, opacity: 14 },
  ]),
  makePreset('Premium Floating Glass', 'Modern', [
    { offsetX: 0, offsetY: 25, blur: 50, spread: -12, opacity: 22 },
    { offsetX: 0, offsetY: 10, blur: 20, spread: -5, opacity: 10 },
  ]),
  makePreset('Soft Neumorphic Glow', 'Modern', [
    { offsetX: -8, offsetY: -8, blur: 20, spread: 0, color: '#FFFFFF', opacity: 90 },
    { offsetX: 8, offsetY: 8, blur: 20, spread: 0, color: '#000000', opacity: 15 },
  ]),

  // Dramatic
  makePreset('Deep Shadow', 'Dramatic', [
    { offsetX: 0, offsetY: 30, blur: 60, spread: -12, opacity: 30 },
  ]),
  makePreset('Strong Hard Drop', 'Dramatic', [
    { offsetX: 8, offsetY: 8, blur: 0, spread: 0, opacity: 85 },
  ]),
  makePreset('Long Sunset Cast', 'Dramatic', [
    { offsetX: 12, offsetY: 24, blur: 48, spread: 0, opacity: 25 },
    { offsetX: 4, offsetY: 8, blur: 16, spread: 0, opacity: 15 },
  ]),

  // Inset
  makePreset('Soft Inset Well', 'Inset', [
    { inset: true, offsetX: 0, offsetY: 3, blur: 8, spread: 0, opacity: 15 },
  ]),
  makePreset('Deep Recessed Cave', 'Inset', [
    { inset: true, offsetX: 0, offsetY: 6, blur: 18, spread: 2, opacity: 25 },
  ]),
  makePreset('Pressed Surface', 'Inset', [
    { inset: true, offsetX: 0, offsetY: 4, blur: 12, spread: 0, opacity: 20 },
    { inset: true, offsetX: 0, offsetY: 1, blur: 3, spread: 0, opacity: 15 },
  ]),
];

export const DEFAULT_SHADOW_CONFIG: ShadowConfig = {
  name: 'Default Clean Shadow',
  layers: [
    {
      id: 'layer-0',
      inset: false,
      offsetX: 0,
      offsetY: 10,
      blur: 30,
      spread: 0,
      color: '#000000',
      opacity: 20,
      enabled: true,
    },
  ],
  preview: {
    object: 'card',
    width: 240,
    height: 160,
    borderRadius: 16,
    elementBg: '#FFFFFF',
    previewBg: '#F5F5F5',
    borderWidth: 0,
    borderColor: '#E2E8F0',
  },
};
