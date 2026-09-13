import { GradientPreset, GradientConfig } from './gradientTypes';

function makeLinear(
  name: string,
  category: string,
  angle: number,
  stops: Array<{ color: string; position: number; alpha?: number }>
): GradientPreset {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name,
    category,
    config: {
      name,
      type: 'linear',
      angle,
      stops: stops.map((s, idx) => ({
        id: `stop-${idx}`,
        color: s.color,
        position: s.position,
        alpha: s.alpha !== undefined ? s.alpha : 1,
      })),
      radial: { shape: 'circle', size: 'farthest-corner', x: 50, y: 50 },
      conic: { angle: 0, x: 50, y: 50 },
      smoothMode: 'standard',
    },
  };
}

export const PRESET_CATEGORIES = [
  'All',
  'Popular',
  'Sunset',
  'Ocean',
  'Purple Dream',
  'Fire',
  'Forest',
  'Sky',
  'Aurora',
  'Peach',
  'Cotton Candy',
  'Midnight',
  'Royal',
  'Tropical',
  'Pastel',
  'Cyber',
  'Minimal',
];

export const GRADIENT_PRESETS: GradientPreset[] = [
  // Popular
  makeLinear('ToolNest Signature', 'Popular', 135, [
    { color: '#5722AF', position: 0 },
    { color: '#7B45D1', position: 50 },
    { color: '#9B6BE8', position: 100 },
  ]),
  makeLinear('Hyper Flame', 'Popular', 90, [
    { color: '#FF4E50', position: 0 },
    { color: '#F9D423', position: 100 },
  ]),
  makeLinear('Neon Glow', 'Popular', 135, [
    { color: '#00F2FE', position: 0 },
    { color: '#4FACFE', position: 100 },
  ]),
  makeLinear('Deep Violet', 'Popular', 180, [
    { color: '#130CB7', position: 0 },
    { color: '#52E5E7', position: 100 },
  ]),

  // Sunset
  makeLinear('California Sunset', 'Sunset', 135, [
    { color: '#FA709A', position: 0 },
    { color: '#FEE140', position: 100 },
  ]),
  makeLinear('Dusk Romance', 'Sunset', 180, [
    { color: '#2B5876', position: 0 },
    { color: '#4E4376', position: 100 },
  ]),
  makeLinear('Golden Hour', 'Sunset', 45, [
    { color: '#ED4264', position: 0 },
    { color: '#FFEDBC', position: 100 },
  ]),
  makeLinear('Venice Twilight', 'Sunset', 135, [
    { color: '#085078', position: 0 },
    { color: '#85D8CE', position: 100 },
  ]),

  // Ocean
  makeLinear('Pacific Blue', 'Ocean', 135, [
    { color: '#2E3192', position: 0 },
    { color: '#1BFFFF', position: 100 },
  ]),
  makeLinear('Deep Blue Sea', 'Ocean', 180, [
    { color: '#0052D4', position: 0 },
    { color: '#4364F7', position: 50 },
    { color: '#6FB1FC', position: 100 },
  ]),
  makeLinear('Marine Coral', 'Ocean', 90, [
    { color: '#2193B0', position: 0 },
    { color: '#6DD5ED', position: 100 },
  ]),

  // Purple Dream
  makeLinear('Cosmic Fusion', 'Purple Dream', 135, [
    { color: '#5722AF', position: 0 },
    { color: '#8B5CF6', position: 50 },
    { color: '#EC4899', position: 100 },
  ]),
  makeLinear('Amethyst Haze', 'Purple Dream', 90, [
    { color: '#4E54C8', position: 0 },
    { color: '#8F94FB', position: 100 },
  ]),
  makeLinear('Electric Lavender', 'Purple Dream', 135, [
    { color: '#7F00FF', position: 0 },
    { color: '#E100FF', position: 100 },
  ]),

  // Fire
  makeLinear('Blazing Ember', 'Fire', 45, [
    { color: '#F83600', position: 0 },
    { color: '#FE8C00', position: 100 },
  ]),
  makeLinear('Molten Lava', 'Fire', 180, [
    { color: '#FF0844', position: 0 },
    { color: '#FFB199', position: 100 },
  ]),

  // Forest
  makeLinear('Emerald Canopy', 'Forest', 135, [
    { color: '#0BA360', position: 0 },
    { color: '#3CBA92', position: 100 },
  ]),
  makeLinear('Moss & Cedar', 'Forest', 90, [
    { color: '#134E5E', position: 0 },
    { color: '#71B280', position: 100 },
  ]),

  // Sky
  makeLinear('Azure Horizon', 'Sky', 180, [
    { color: '#89F7FE', position: 0 },
    { color: '#66A6FF', position: 100 },
  ]),
  makeLinear('Morning Mist', 'Sky', 135, [
    { color: '#E0C3FC', position: 0 },
    { color: '#8EC5FC', position: 100 },
  ]),

  // Aurora
  makeLinear('Northern Lights', 'Aurora', 135, [
    { color: '#00C6FF', position: 0 },
    { color: '#0072FF', position: 50 },
    { color: '#00F260', position: 100 },
  ]),
  makeLinear('Polar Glow', 'Aurora', 45, [
    { color: '#0575E6', position: 0 },
    { color: '#00F260', position: 100 },
  ]),

  // Peach
  makeLinear('Sweet Peach', 'Peach', 90, [
    { color: '#FFD269', position: 0 },
    { color: '#FF4E50', position: 100 },
  ]),
  makeLinear('Warm Apricot', 'Peach', 135, [
    { color: '#FF9A8B', position: 0 },
    { color: '#FF6A88', position: 55 },
    { color: '#FF99AC', position: 100 },
  ]),

  // Cotton Candy
  makeLinear('Pastel Dream', 'Cotton Candy', 135, [
    { color: '#A18CD1', position: 0 },
    { color: '#FBC2EB', position: 100 },
  ]),
  makeLinear('Sugar Floss', 'Cotton Candy', 90, [
    { color: '#F6D365', position: 0 },
    { color: '#FDA085', position: 100 },
  ]),

  // Midnight
  makeLinear('Obsidian Void', 'Midnight', 135, [
    { color: '#0F2027', position: 0 },
    { color: '#203A43', position: 50 },
    { color: '#2C5364', position: 100 },
  ]),
  makeLinear('Night Sky', 'Midnight', 180, [
    { color: '#000428', position: 0 },
    { color: '#004E92', position: 100 },
  ]),

  // Royal
  makeLinear('Imperial Velvet', 'Royal', 135, [
    { color: '#141E30', position: 0 },
    { color: '#243B55', position: 100 },
  ]),
  makeLinear('Crown Jewel', 'Royal', 45, [
    { color: '#5722AF', position: 0 },
    { color: '#D97706', position: 100 },
  ]),

  // Tropical
  makeLinear('Island Breeze', 'Tropical', 90, [
    { color: '#00B4DB', position: 0 },
    { color: '#0083B0', position: 100 },
  ]),
  makeLinear('Mango Punch', 'Tropical', 135, [
    { color: '#FFE000', position: 0 },
    { color: '#799F0C', position: 100 },
  ]),

  // Pastel
  makeLinear('Soft Lilac Whisper', 'Pastel', 135, [
    { color: '#E0C3FC', position: 0 },
    { color: '#8EC5FC', position: 100 },
  ]),
  makeLinear('Spring Mint', 'Pastel', 90, [
    { color: '#D4FC79', position: 0 },
    { color: '#96E6A1', position: 100 },
  ]),

  // Cyber
  makeLinear('Cyber Matrix', 'Cyber', 135, [
    { color: '#F72585', position: 0 },
    { color: '#7209B7', position: 35 },
    { color: '#3A0CA3', position: 70 },
    { color: '#4CC9F0', position: 100 },
  ]),
  makeLinear('Synthwave Sunset', 'Cyber', 180, [
    { color: '#FF007F', position: 0 },
    { color: '#7928CA', position: 50 },
    { color: '#00DFD8', position: 100 },
  ]),

  // Minimal
  makeLinear('Pure Monochrome', 'Minimal', 180, [
    { color: '#F5F5F7', position: 0 },
    { color: '#D2D2D7', position: 100 },
  ]),
  makeLinear('Titanium Slate', 'Minimal', 135, [
    { color: '#1E293B', position: 0 },
    { color: '#0F172A', position: 100 },
  ]),
];

export const DEFAULT_GRADIENT_CONFIG: GradientConfig = {
  name: 'ToolNest Purple',
  type: 'linear',
  angle: 135,
  stops: [
    { id: 'stop-0', color: '#5722AF', position: 0, alpha: 1 },
    { id: 'stop-1', color: '#9B6BE8', position: 100, alpha: 1 },
  ],
  radial: { shape: 'circle', size: 'farthest-corner', x: 50, y: 50 },
  conic: { angle: 0, x: 50, y: 50 },
  smoothMode: 'standard',
};
