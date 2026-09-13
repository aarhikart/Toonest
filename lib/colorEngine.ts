import { ColorItem, HarmonyMode, RgbColor, HslColor, CmykColor } from './colorTypes';

// --- Color Conversion Utilities ---

export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

export function normalizeHex(hex: string): string {
  let clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) {
    clean = clean.padEnd(6, '0').slice(0, 6);
  }
  return `#${clean.toUpperCase()}`;
}

export function hexToRgb(hex: string): RgbColor {
  const norm = normalizeHex(hex).replace('#', '');
  const r = parseInt(norm.substring(0, 2), 16) || 0;
  const g = parseInt(norm.substring(2, 4), 16) || 0;
  const b = parseInt(norm.substring(4, 6), 16) || 0;
  return { r, g, b };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): HslColor {
  const rNorm = Math.max(0, Math.min(255, r)) / 255;
  const gNorm = Math.max(0, Math.min(255, g)) / 255;
  const bNorm = Math.max(0, Math.min(255, b)) / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const d = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hNorm = ((h % 360) + 360) % 360 / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tAdj = t;
    if (tAdj < 0) tAdj += 1;
    if (tAdj > 1) tAdj -= 1;
    if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj;
    if (tAdj < 1 / 2) return q;
    if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);

  return { r, g, b };
}

export function rgbToCmyk(r: number, g: number, b: number): CmykColor {
  const rNorm = Math.max(0, Math.min(255, r)) / 255;
  const gNorm = Math.max(0, Math.min(255, g)) / 255;
  const bNorm = Math.max(0, Math.min(255, b)) / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);

  return {
    c: Math.max(0, Math.min(100, c)),
    m: Math.max(0, Math.min(100, m)),
    y: Math.max(0, Math.min(100, y)),
    k: Math.round(k * 100),
  };
}

// --- WCAG 2.1 Luminance & Contrast ---

export function calculateRelativeLuminance(rgb: RgbColor): number {
  const transform = (v: number) => {
    const norm = v / 255;
    return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
  };

  const r = transform(rgb.r);
  const g = transform(rgb.g);
  const b = transform(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function calculateContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

// --- Color Name Dictionary & Matcher ---

const COLOR_NAMES: Array<{ name: string; hex: string }> = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Snow', hex: '#F9FAFB' },
  { name: 'Ghost White', hex: '#F8F9FA' },
  { name: 'Light Slate', hex: '#E2E8F0' },
  { name: 'Cool Gray', hex: '#94A3B8' },
  { name: 'Slate Gray', hex: '#64748B' },
  { name: 'Charcoal', hex: '#334155' },
  { name: 'Midnight', hex: '#0F172A' },
  { name: 'Obsidian Black', hex: '#050505' },
  { name: 'Pure Black', hex: '#000000' },

  // Purples / Violets
  { name: 'Royal Purple', hex: '#5722AF' },
  { name: 'Electric Violet', hex: '#7B45D1' },
  { name: 'Medium Orchid', hex: '#9B6BE8' },
  { name: 'Soft Lilac', hex: '#C9B5F2' },
  { name: 'Lavender Mist', hex: '#F4F0FC' },
  { name: 'Deep Indigo', hex: '#431407' },
  { name: 'Amethyst', hex: '#8B5CF6' },
  { name: 'Plum Violet', hex: '#6D28D9' },
  { name: 'Dark Violet', hex: '#4C1D95' },
  { name: 'Mauve', hex: '#B794F4' },
  { name: 'Iris', hex: '#5B21B6' },

  // Blues
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Sapphire', hex: '#1D4ED8' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Cobalt Blue', hex: '#3B82F6' },
  { name: 'Sky Blue', hex: '#60A5FA' },
  { name: 'Ice Blue', hex: '#93C5FD' },
  { name: 'Baby Blue', hex: '#BFDBFE' },
  { name: 'Pale Azure', hex: '#EFF6FF' },
  { name: 'Ocean Cyan', hex: '#06B6D4' },
  { name: 'Deep Teal', hex: '#0E7490' },
  { name: 'Cerulean', hex: '#0284C7' },

  // Greens
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Forest Green', hex: '#047857' },
  { name: 'Jade', hex: '#059669' },
  { name: 'Pine Green', hex: '#064E3B' },
  { name: 'Mint Green', hex: '#34D399' },
  { name: 'Seafoam', hex: '#6EE7B7' },
  { name: 'Pastel Mint', hex: '#A7F3D0' },
  { name: 'Lime Green', hex: '#84CC16' },
  { name: 'Olive Green', hex: '#65A30D' },
  { name: 'Chartreuse', hex: '#A3E635' },

  // Yellows & Oranges
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Sun Yellow', hex: '#FBBF24' },
  { name: 'Canary Yellow', hex: '#FDE047' },
  { name: 'Warm Orange', hex: '#F97316' },
  { name: 'Tangerine', hex: '#FB923C' },
  { name: 'Burnt Orange', hex: '#EA580C' },
  { name: 'Dark Rust', hex: '#C2410C' },
  { name: 'Peach', hex: '#FDBA74' },
  { name: 'Warm Sand', hex: '#FED7AA' },

  // Reds & Pinks
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Ruby Red', hex: '#DC2626' },
  { name: 'Scarlet', hex: '#B91C1C' },
  { name: 'Dark Burgundy', hex: '#991B1B' },
  { name: 'Coral Pink', hex: '#F43F5E' },
  { name: 'Rose Red', hex: '#E11D48' },
  { name: 'Hot Pink', hex: '#EC4899' },
  { name: 'Blush Pink', hex: '#F472B6' },
  { name: 'Pastel Pink', hex: '#FBCFE8' },
  { name: 'Magenta', hex: '#D946EF' },
  { name: 'Fuchsia', hex: '#C026D3' },
];

export function findNearestColorName(r: number, g: number, b: number): string {
  let minDistance = Infinity;
  let closestName = 'Custom Color';

  for (const item of COLOR_NAMES) {
    const itemRgb = hexToRgb(item.hex);
    // Weighted Euclidean RGB distance
    const dr = (r - itemRgb.r) * 0.3;
    const dg = (g - itemRgb.g) * 0.59;
    const db = (b - itemRgb.b) * 0.11;
    const dist = dr * dr + dg * dg + db * db;

    if (dist < minDistance) {
      minDistance = dist;
      closestName = item.name;
    }
  }

  return closestName;
}

// --- Create Complete Color Item ---

export function createColorItem(hexInput: string, id?: string, isLocked = false): ColorItem {
  const hex = normalizeHex(hexInput);
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const luminance = calculateRelativeLuminance(rgb);
  const contrastWhite = calculateContrastRatio(luminance, 1.0);
  const contrastBlack = calculateContrastRatio(luminance, 0.0);
  const isDark = luminance < 0.42; // When luminance < 0.42, white text has superior contrast
  const name = findNearestColorName(rgb.r, rgb.g, rgb.b);

  return {
    id: id || Math.random().toString(36).substring(2, 9),
    hex,
    rgb,
    hsl,
    cmyk,
    name,
    isLocked,
    luminance,
    contrastWhite,
    contrastBlack,
    isDark,
  };
}

// --- Default ToolNest Starter Palette ---
export const DEFAULT_PALETTE_HEX = [
  '#5722AF',
  '#7B45D1',
  '#9B6BE8',
  '#C9B5F2',
  '#F4F0FC',
];

export function createDefaultPalette(): ColorItem[] {
  return DEFAULT_PALETTE_HEX.map((hex) => createColorItem(hex));
}

// --- Harmony Generators ---

function getRandomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateRandomHex(): string {
  // Generate appealing, non-muddy colors by constraining saturation & lightness
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(getRandomBetween(45, 90));
  const l = Math.floor(getRandomBetween(25, 78));
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function generateHarmonyHexes(
  baseHex: string,
  mode: HarmonyMode,
  count: number
): string[] {
  const baseRgb = hexToRgb(baseHex);
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const results: string[] = [];

  switch (mode) {
    case 'complementary': {
      // Base + Opposite + Varied Lightness/Saturation
      const compHue = (baseHsl.h + 180) % 360;
      for (let i = 0; i < count; i++) {
        if (i === 0) {
          results.push(baseHex);
        } else if (i === 1) {
          const rgb = hslToRgb(compHue, baseHsl.s, baseHsl.l);
          results.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        } else if (i % 2 === 0) {
          // Tint or shade of base
          const step = Math.floor(i / 2);
          const lAdj = Math.min(92, Math.max(15, baseHsl.l + (step % 2 === 0 ? 22 * step : -18 * step)));
          const rgb = hslToRgb(baseHsl.h, Math.max(25, baseHsl.s - step * 10), lAdj);
          results.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        } else {
          // Tint or shade of complement
          const step = Math.floor(i / 2);
          const lAdj = Math.min(92, Math.max(15, baseHsl.l + (step % 2 === 0 ? -18 * step : 22 * step)));
          const rgb = hslToRgb(compHue, Math.max(25, baseHsl.s - step * 8), lAdj);
          results.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
      }
      break;
    }

    case 'monochromatic': {
      // Same hue, smooth gradient of lightness across count
      const minL = 16;
      const maxL = 92;
      const stepL = (maxL - minL) / Math.max(1, count - 1);
      for (let i = 0; i < count; i++) {
        const l = Math.round(minL + i * stepL);
        // Vary saturation slightly so darker tones are richer and light tones are airy
        const s = Math.round(Math.max(20, Math.min(95, baseHsl.s + (50 - l) * 0.25)));
        const rgb = hslToRgb(baseHsl.h, s, l);
        results.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
    }

    case 'analogous': {
      // Hues clustered around baseHue (±30°, ±60°)
      const spread = 28;
      const half = Math.floor(count / 2);
      for (let i = 0; i < count; i++) {
        const offset = (i - half) * spread;
        const h = (baseHsl.h + offset + 360) % 360;
        const l = Math.min(88, Math.max(22, baseHsl.l + (i % 2 === 0 ? 8 : -8)));
        const rgb = hslToRgb(h, baseHsl.s, l);
        results.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
    }

    case 'triadic': {
      // 3 equilateral points on color wheel (0°, 120°, 240°)
      const hues = [baseHsl.h, (baseHsl.h + 120) % 360, (baseHsl.h + 240) % 360];
      for (let i = 0; i < count; i++) {
        const h = hues[i % 3];
        const step = Math.floor(i / 3);
        const l = Math.min(90, Math.max(18, baseHsl.l + (step * 25 * (step % 2 === 0 ? 1 : -1))));
        const s = Math.max(30, Math.min(90, baseHsl.s - step * 12));
        const rgb = hslToRgb(h, s, l);
        results.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
    }

    case 'tetradic': {
      // 4 points on wheel (0°, 90°, 180°, 270°)
      const hues = [
        baseHsl.h,
        (baseHsl.h + 90) % 360,
        (baseHsl.h + 180) % 360,
        (baseHsl.h + 270) % 360,
      ];
      for (let i = 0; i < count; i++) {
        const h = hues[i % 4];
        const step = Math.floor(i / 4);
        const l = Math.min(90, Math.max(20, baseHsl.l + (step * 20)));
        const rgb = hslToRgb(h, baseHsl.s, l);
        results.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
    }

    case 'split-complementary': {
      // Base + (base + 150°) + (base + 210°)
      const hues = [baseHsl.h, (baseHsl.h + 150) % 360, (baseHsl.h + 210) % 360];
      for (let i = 0; i < count; i++) {
        const h = hues[i % 3];
        const step = Math.floor(i / 3);
        const l = Math.min(88, Math.max(20, baseHsl.l + (step === 0 ? 0 : step % 2 === 0 ? 18 : -18)));
        const rgb = hslToRgb(h, baseHsl.s, l);
        results.push(rgbToHex(rgb.r, rgb.g, rgb.b));
      }
      break;
    }

    case 'random':
    default: {
      for (let i = 0; i < count; i++) {
        results.push(generateRandomHex());
      }
      break;
    }
  }

  return results.slice(0, count);
}

/**
 * Regenerates the palette preserving locked colors.
 */
export function regeneratePalette(
  currentPalette: ColorItem[],
  mode: HarmonyMode = 'random',
  explicitBaseHex?: string
): ColorItem[] {
  const count = currentPalette.length;

  // Determine base color: either explicit, or first locked color, or first color
  const firstLocked = currentPalette.find((c) => c.isLocked);
  const baseHex = explicitBaseHex || (firstLocked ? firstLocked.hex : currentPalette[0]?.hex || '#5722AF');

  // If in random mode, randomize unlocked colors individually
  if (mode === 'random') {
    return currentPalette.map((item) => {
      if (item.isLocked) return item;
      return createColorItem(generateRandomHex(), item.id, false);
    });
  }

  // Generate candidate harmony colors
  const harmonyHexes = generateHarmonyHexes(baseHex, mode, count);

  // Merge with locked colors
  return currentPalette.map((item, idx) => {
    if (item.isLocked) return item;
    const nextHex = harmonyHexes[idx] || generateRandomHex();
    return createColorItem(nextHex, item.id, false);
  });
}

// --- Shades and Tints Generator ---

export interface ShadeOrTint {
  step: number; // 0 to 10
  hex: string;
  isDark: boolean;
  contrastWhite: number;
  contrastBlack: number;
}

export function generateShadesAndTints(hexInput: string): {
  tints: ShadeOrTint[]; // lighter towards white
  shades: ShadeOrTint[]; // darker towards black
} {
  const hex = normalizeHex(hexInput);
  const rgb = hexToRgb(hex);

  const tints: ShadeOrTint[] = [];
  const shades: ShadeOrTint[] = [];

  for (let i = 1; i <= 10; i++) {
    const factor = i / 10;

    // Tint: mix with white (255, 255, 255)
    const tintR = Math.round(rgb.r + (255 - rgb.r) * factor);
    const tintG = Math.round(rgb.g + (255 - rgb.g) * factor);
    const tintB = Math.round(rgb.b + (255 - rgb.b) * factor);
    const tintHex = rgbToHex(tintR, tintG, tintB);
    const tintLum = calculateRelativeLuminance({ r: tintR, g: tintG, b: tintB });

    tints.push({
      step: i * 10,
      hex: tintHex,
      isDark: tintLum < 0.42,
      contrastWhite: calculateContrastRatio(tintLum, 1.0),
      contrastBlack: calculateContrastRatio(tintLum, 0.0),
    });

    // Shade: mix with black (0, 0, 0)
    const shadeR = Math.round(rgb.r * (1 - factor));
    const shadeG = Math.round(rgb.g * (1 - factor));
    const shadeB = Math.round(rgb.b * (1 - factor));
    const shadeHex = rgbToHex(shadeR, shadeG, shadeB);
    const shadeLum = calculateRelativeLuminance({ r: shadeR, g: shadeG, b: shadeB });

    shades.push({
      step: i * 10,
      hex: shadeHex,
      isDark: shadeLum < 0.42,
      contrastWhite: calculateContrastRatio(shadeLum, 1.0),
      contrastBlack: calculateContrastRatio(shadeLum, 0.0),
    });
  }

  return { tints, shades };
}

// --- Exporters ---

export function exportAsCssVariables(palette: ColorItem[]): string {
  const lines = palette.map((color, index) => {
    return `  --color-${index + 1}: ${color.hex.toLowerCase()}; /* ${color.name} - rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}) */`;
  });

  return `:root {\n${lines.join('\n')}\n}`;
}

export function exportAsTailwind(palette: ColorItem[]): string {
  const colorEntries = palette
    .map((c, i) => `        '${(i + 1) * 100}': '${c.hex.toLowerCase()}', // ${c.name}`)
    .join('\n');

  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${colorEntries}\n        },\n      },\n    },\n  },\n};`;
}

export function exportAsJson(palette: ColorItem[]): string {
  const data = {
    generator: 'ToolNest Color Palette Generator',
    exportedAt: new Date().toISOString(),
    palette: palette.map((c) => ({
      hex: c.hex,
      rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
      hsl: `hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`,
      cmyk: `cmyk(${c.cmyk.c}%, ${c.cmyk.m}%, ${c.cmyk.y}%, ${c.cmyk.k}%)`,
      name: c.name,
      luminance: Math.round(c.luminance * 1000) / 1000,
      contrastWhite: c.contrastWhite,
      contrastBlack: c.contrastBlack,
    })),
  };

  return JSON.stringify(data, null, 2);
}

export function exportAsUrlQuery(palette: ColorItem[]): string {
  const hexList = palette.map((c) => c.hex.replace('#', '').toLowerCase()).join('-');
  return hexList;
}

export function parseColorsFromUrlQuery(query: string): string[] | null {
  if (!query) return null;
  const parts = query.split('-');
  const validHexes: string[] = [];
  for (const p of parts) {
    if (/^[0-9a-fA-F]{3,6}$/.test(p)) {
      validHexes.push(normalizeHex(p));
    }
  }
  return validHexes.length >= 2 ? validHexes.slice(0, 8) : null;
}

/**
 * Renders the color palette onto an HTML Canvas and exports as PNG blob
 */
export async function exportToCanvasPng(
  palette: ColorItem[],
  paletteTitle = 'ToolNest Palette'
): Promise<Blob> {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Top header bar
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('ToolNest', 40, 50);

  ctx.fillStyle = '#64748B';
  ctx.font = '500 16px system-ui, -apple-system, sans-serif';
  ctx.fillText(paletteTitle, 150, 50);

  const swatchesY = 80;
  const swatchesHeight = 460;
  const swatchWidth = (width - 80) / palette.length;

  palette.forEach((color, index) => {
    const x = 40 + index * swatchWidth;

    // Fill color swatch rectangle
    ctx.fillStyle = color.hex;
    ctx.fillRect(x, swatchesY, swatchWidth, swatchesHeight);

    // Text info inside swatch bottom
    const textColor = color.isDark ? '#FFFFFF' : '#0F172A';
    ctx.fillStyle = textColor;

    // HEX label
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(color.hex, x + swatchWidth / 2, swatchesY + swatchesHeight - 65);

    // Color name
    ctx.font = '500 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(color.name, x + swatchWidth / 2, swatchesY + swatchesHeight - 35);

    // RGB
    ctx.font = '400 12px monospace';
    ctx.fillText(
      `${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`,
      x + swatchWidth / 2,
      swatchesY + swatchesHeight - 15
    );
  });

  // Bottom footer bar
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '400 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('Generated with ToolNest Color Palette Generator • toolnest.dev', 40, 595);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate PNG blob from canvas'));
    }, 'image/png');
  });
}
