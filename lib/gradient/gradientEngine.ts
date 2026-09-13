import {
  GradientConfig,
  ColorStop,
  RandomMood,
  HarmonyType,
  ContrastSample,
  DimensionPreset,
} from './gradientTypes';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  calculateRelativeLuminance,
  calculateContrastRatio,
  findNearestColorName,
  normalizeHex,
} from '../colorEngine';

// --- Color Stop Helpers ---

export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  const clampedAlpha = Math.max(0, Math.min(1, Math.round(alpha * 100) / 100));
  if (clampedAlpha >= 1) return normalizeHex(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
}

export function formatColorStop(stop: ColorStop): string {
  const colorStr =
    stop.alpha < 1 ? hexToRgba(stop.color, stop.alpha) : normalizeHex(stop.color);
  return `${colorStr} ${Math.round(stop.position)}%`;
}

// --- Smooth Interpolation Helpers ---

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getEffectiveStops(config: GradientConfig): ColorStop[] {
  const sorted = [...config.stops].sort((a, b) => a.position - b.position);

  if (config.smoothMode === 'standard' || sorted.length < 2) {
    return sorted;
  }

  // Generate intermediate eased color stops for natural blending without banding
  const stepsPerSegment = config.smoothMode === 'extra-smooth' ? 3 : 2;
  const result: ColorStop[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const s1 = sorted[i];
    const s2 = sorted[i + 1];
    result.push(s1);

    const rgb1 = hexToRgb(s1.color);
    const rgb2 = hexToRgb(s2.color);

    for (let step = 1; step <= stepsPerSegment; step++) {
      const rawT = step / (stepsPerSegment + 1);
      // Smooth sinusoidal / cubic easing
      const easeT = rawT * rawT * (3 - 2 * rawT);

      const r = Math.round(lerp(rgb1.r, rgb2.r, easeT));
      const g = Math.round(lerp(rgb1.g, rgb2.g, easeT));
      const b = Math.round(lerp(rgb1.b, rgb2.b, easeT));
      const a = lerp(s1.alpha, s2.alpha, easeT);
      const pos = lerp(s1.position, s2.position, rawT);

      result.push({
        id: `smooth-${i}-${step}`,
        color: rgbToHex(r, g, b),
        position: Math.round(pos * 10) / 10,
        alpha: Math.round(a * 100) / 100,
      });
    }
  }

  result.push(sorted[sorted.length - 1]);
  return result;
}

// --- CSS Generator ---

export function generateGradientCss(config: GradientConfig): string {
  const stops = getEffectiveStops(config);
  const stopsString = stops.map(formatColorStop).join(', ');

  switch (config.type) {
    case 'linear':
      return `linear-gradient(${config.angle}deg, ${stopsString})`;

    case 'radial':
      return `radial-gradient(${config.radial.shape} ${config.radial.size} at ${config.radial.x}% ${config.radial.y}%, ${stopsString})`;

    case 'conic':
      return `conic-gradient(from ${config.conic.angle}deg at ${config.conic.x}% ${config.conic.y}%, ${stopsString})`;

    case 'repeating-linear': {
      const stepDist = config.repeatingLength || 25;
      const repeatingStops = stops
        .map((s) => {
          const colorStr =
            s.alpha < 1 ? hexToRgba(s.color, s.alpha) : normalizeHex(s.color);
          const scaledPos = Math.round((s.position / 100) * stepDist);
          return `${colorStr} ${scaledPos}%`;
        })
        .join(', ');
      return `repeating-linear-gradient(${config.angle}deg, ${repeatingStops})`;
    }

    case 'repeating-radial': {
      const stepDist = config.repeatingLength || 25;
      const repeatingStops = stops
        .map((s) => {
          const colorStr =
            s.alpha < 1 ? hexToRgba(s.color, s.alpha) : normalizeHex(s.color);
          const scaledPos = Math.round((s.position / 100) * stepDist);
          return `${colorStr} ${scaledPos}%`;
        })
        .join(', ');
      return `repeating-radial-gradient(${config.radial.shape} ${config.radial.size} at ${config.radial.x}% ${config.radial.y}%, ${repeatingStops})`;
    }

    case 'repeating-conic': {
      const stepDist = config.repeatingLength || 45;
      const repeatingStops = stops
        .map((s) => {
          const colorStr =
            s.alpha < 1 ? hexToRgba(s.color, s.alpha) : normalizeHex(s.color);
          const scaledPos = Math.round((s.position / 100) * stepDist);
          return `${colorStr} ${scaledPos}deg`;
        })
        .join(', ');
      return `repeating-conic-gradient(from ${config.conic.angle}deg at ${config.conic.x}% ${config.conic.y}%, ${repeatingStops})`;
    }

    default:
      return `linear-gradient(${config.angle}deg, ${stopsString})`;
  }
}

export function generateCssRule(
  config: GradientConfig,
  selector = '.gradient-background'
): string {
  const cssValue = generateGradientCss(config);
  const fallbackHex = config.stops[0]?.color || '#5722AF';

  return `${selector} {\n  background: ${fallbackHex};\n  background: ${cssValue};\n}`;
}

export function generateCssVariable(
  config: GradientConfig,
  varName = '--gradient-primary'
): string {
  return `${varName}: ${generateGradientCss(config)};`;
}

export function generateScss(
  config: GradientConfig,
  varName = '$gradient-primary'
): string {
  return `${varName}: ${generateGradientCss(config)};`;
}

export function generateJson(config: GradientConfig): string {
  const exportData = {
    name: config.name,
    type: config.type,
    angle: config.angle,
    radial: config.radial,
    conic: config.conic,
    smoothMode: config.smoothMode,
    stops: config.stops.map((s) => ({
      color: s.color,
      position: s.position,
      alpha: s.alpha,
    })),
    css: generateGradientCss(config),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(exportData, null, 2);
}

// --- Random Gradient Generator ---

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomGradient(mood: RandomMood = 'balanced'): GradientConfig {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const angle = angles[randomInt(0, angles.length - 1)];

  let h1 = randomInt(0, 360);
  let h2 = (h1 + randomInt(40, 140)) % 360;
  let s1 = 70;
  let s2 = 75;
  let l1 = 50;
  let l2 = 55;

  switch (mood) {
    case 'vibrant':
      s1 = randomInt(80, 100);
      s2 = randomInt(85, 100);
      l1 = randomInt(45, 60);
      l2 = randomInt(50, 65);
      break;

    case 'pastel':
      s1 = randomInt(50, 75);
      s2 = randomInt(55, 80);
      l1 = randomInt(75, 88);
      l2 = randomInt(78, 92);
      break;

    case 'dark':
      s1 = randomInt(40, 80);
      s2 = randomInt(50, 85);
      l1 = randomInt(10, 25);
      l2 = randomInt(18, 35);
      break;

    case 'soft':
      s1 = randomInt(35, 60);
      s2 = randomInt(40, 65);
      l1 = randomInt(55, 75);
      l2 = randomInt(60, 80);
      break;

    case 'colorful': {
      // 3 stops with high saturation
      const h3 = (h2 + randomInt(40, 100)) % 360;
      const rgb1 = hslToRgb(h1, 85, 55);
      const rgb2 = hslToRgb(h2, 85, 55);
      const rgb3 = hslToRgb(h3, 85, 55);
      const stops: ColorStop[] = [
        { id: 'stop-0', color: rgbToHex(rgb1.r, rgb1.g, rgb1.b), position: 0, alpha: 1 },
        { id: 'stop-1', color: rgbToHex(rgb2.r, rgb2.g, rgb2.b), position: 50, alpha: 1 },
        { id: 'stop-2', color: rgbToHex(rgb3.r, rgb3.g, rgb3.b), position: 100, alpha: 1 },
      ];
      return {
        name: generateGradientName(stops),
        type: 'linear',
        angle,
        stops,
        radial: { shape: 'circle', size: 'farthest-corner', x: 50, y: 50 },
        conic: { angle: 0, x: 50, y: 50 },
        smoothMode: 'standard',
      };
    }

    case 'balanced':
    default:
      s1 = randomInt(60, 85);
      s2 = randomInt(65, 90);
      l1 = randomInt(40, 60);
      l2 = randomInt(45, 68);
      break;
  }

  const rgb1 = hslToRgb(h1, s1, l1);
  const rgb2 = hslToRgb(h2, s2, l2);

  const stops: ColorStop[] = [
    { id: 'stop-0', color: rgbToHex(rgb1.r, rgb1.g, rgb1.b), position: 0, alpha: 1 },
    { id: 'stop-1', color: rgbToHex(rgb2.r, rgb2.g, rgb2.b), position: 100, alpha: 1 },
  ];

  return {
    name: generateGradientName(stops),
    type: 'linear',
    angle,
    stops,
    radial: { shape: 'circle', size: 'farthest-corner', x: 50, y: 50 },
    conic: { angle: 0, x: 50, y: 50 },
    smoothMode: 'standard',
  };
}

// --- Color Harmony Generator ---

export function generateHarmonyGradient(
  baseHex: string,
  harmony: HarmonyType,
  angle = 135
): GradientConfig {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const stops: ColorStop[] = [];

  switch (harmony) {
    case 'complementary': {
      const compH = (hsl.h + 180) % 360;
      const rgb2 = hslToRgb(compH, hsl.s, hsl.l);
      stops.push(
        { id: 'stop-0', color: normalizeHex(baseHex), position: 0, alpha: 1 },
        { id: 'stop-1', color: rgbToHex(rgb2.r, rgb2.g, rgb2.b), position: 100, alpha: 1 }
      );
      break;
    }

    case 'analogous': {
      const h1 = (hsl.h - 30 + 360) % 360;
      const h2 = hsl.h;
      const h3 = (hsl.h + 30) % 360;
      const rgbA = hslToRgb(h1, hsl.s, Math.max(25, hsl.l - 5));
      const rgbB = hslToRgb(h2, hsl.s, hsl.l);
      const rgbC = hslToRgb(h3, hsl.s, Math.min(85, hsl.l + 10));
      stops.push(
        { id: 'stop-0', color: rgbToHex(rgbA.r, rgbA.g, rgbA.b), position: 0, alpha: 1 },
        { id: 'stop-1', color: rgbToHex(rgbB.r, rgbB.g, rgbB.b), position: 50, alpha: 1 },
        { id: 'stop-2', color: rgbToHex(rgbC.r, rgbC.g, rgbC.b), position: 100, alpha: 1 }
      );
      break;
    }

    case 'triadic': {
      const h2 = (hsl.h + 120) % 360;
      const h3 = (hsl.h + 240) % 360;
      const rgb2 = hslToRgb(h2, hsl.s, hsl.l);
      const rgb3 = hslToRgb(h3, hsl.s, hsl.l);
      stops.push(
        { id: 'stop-0', color: normalizeHex(baseHex), position: 0, alpha: 1 },
        { id: 'stop-1', color: rgbToHex(rgb2.r, rgb2.g, rgb2.b), position: 50, alpha: 1 },
        { id: 'stop-2', color: rgbToHex(rgb3.r, rgb3.g, rgb3.b), position: 100, alpha: 1 }
      );
      break;
    }

    case 'split-complementary': {
      const h2 = (hsl.h + 150) % 360;
      const h3 = (hsl.h + 210) % 360;
      const rgb2 = hslToRgb(h2, hsl.s, hsl.l);
      const rgb3 = hslToRgb(h3, hsl.s, hsl.l);
      stops.push(
        { id: 'stop-0', color: normalizeHex(baseHex), position: 0, alpha: 1 },
        { id: 'stop-1', color: rgbToHex(rgb2.r, rgb2.g, rgb2.b), position: 50, alpha: 1 },
        { id: 'stop-2', color: rgbToHex(rgb3.r, rgb3.g, rgb3.b), position: 100, alpha: 1 }
      );
      break;
    }

    case 'tetradic': {
      const h2 = (hsl.h + 90) % 360;
      const h3 = (hsl.h + 180) % 360;
      const h4 = (hsl.h + 270) % 360;
      const rgb2 = hslToRgb(h2, hsl.s, hsl.l);
      const rgb3 = hslToRgb(h3, hsl.s, hsl.l);
      const rgb4 = hslToRgb(h4, hsl.s, hsl.l);
      stops.push(
        { id: 'stop-0', color: normalizeHex(baseHex), position: 0, alpha: 1 },
        { id: 'stop-1', color: rgbToHex(rgb2.r, rgb2.g, rgb2.b), position: 33, alpha: 1 },
        { id: 'stop-2', color: rgbToHex(rgb3.r, rgb3.g, rgb3.b), position: 66, alpha: 1 },
        { id: 'stop-3', color: rgbToHex(rgb4.r, rgb4.g, rgb4.b), position: 100, alpha: 1 }
      );
      break;
    }

    case 'monochromatic': {
      const l1 = Math.max(15, hsl.l - 25);
      const l2 = hsl.l;
      const l3 = Math.min(92, hsl.l + 25);
      const rgb1 = hslToRgb(hsl.h, Math.min(100, hsl.s + 10), l1);
      const rgb2 = hslToRgb(hsl.h, hsl.s, l2);
      const rgb3 = hslToRgb(hsl.h, Math.max(15, hsl.s - 15), l3);
      stops.push(
        { id: 'stop-0', color: rgbToHex(rgb1.r, rgb1.g, rgb1.b), position: 0, alpha: 1 },
        { id: 'stop-1', color: rgbToHex(rgb2.r, rgb2.g, rgb2.b), position: 50, alpha: 1 },
        { id: 'stop-2', color: rgbToHex(rgb3.r, rgb3.g, rgb3.b), position: 100, alpha: 1 }
      );
      break;
    }
  }

  return {
    name: generateGradientName(stops),
    type: 'linear',
    angle,
    stops,
    radial: { shape: 'circle', size: 'farthest-corner', x: 50, y: 50 },
    conic: { angle: 0, x: 50, y: 50 },
    smoothMode: 'standard',
  };
}

// --- Evocative Gradient Namer ---

export function generateGradientName(stops: ColorStop[]): string {
  if (stops.length === 0) return 'Custom Gradient';
  const c1 = hexToRgb(stops[0].color);
  const name1 = findNearestColorName(c1.r, c1.g, c1.b);

  if (stops.length === 1) return name1;

  const c2 = hexToRgb(stops[stops.length - 1].color);
  const name2 = findNearestColorName(c2.r, c2.g, c2.b);

  const modifiers = ['Sunset', 'Breeze', 'Haze', 'Glow', 'Horizon', 'Fusion', 'Cascade', 'Drift'];
  const mod = modifiers[Math.abs(c1.r + c2.b) % modifiers.length];

  // E.g. "Royal Purple to Sky Blue" or "Royal Glow"
  return `${name1.split(' ')[0]} ${mod}`;
}

// --- Multi-Point Contrast Checker ---

export function sampleColorAtPosition(
  stops: ColorStop[],
  targetPercent: number
): { r: number; g: number; b: number; a: number } {
  if (stops.length === 0) return { r: 255, g: 255, b: 255, a: 1 };
  const sorted = [...stops].sort((a, b) => a.position - b.position);

  if (targetPercent <= sorted[0].position) {
    const rgb = hexToRgb(sorted[0].color);
    return { ...rgb, a: sorted[0].alpha };
  }

  if (targetPercent >= sorted[sorted.length - 1].position) {
    const last = sorted[sorted.length - 1];
    const rgb = hexToRgb(last.color);
    return { ...rgb, a: last.alpha };
  }

  // Find surrounding stops
  let left = sorted[0];
  let right = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].position <= targetPercent && sorted[i + 1].position >= targetPercent) {
      left = sorted[i];
      right = sorted[i + 1];
      break;
    }
  }

  const range = right.position - left.position;
  const t = range === 0 ? 0 : (targetPercent - left.position) / range;

  const rgb1 = hexToRgb(left.color);
  const rgb2 = hexToRgb(right.color);

  return {
    r: Math.round(lerp(rgb1.r, rgb2.r, t)),
    g: Math.round(lerp(rgb1.g, rgb2.g, t)),
    b: Math.round(lerp(rgb1.b, rgb2.b, t)),
    a: lerp(left.alpha, right.alpha, t),
  };
}

export function evaluateGradientContrast(stops: ColorStop[]): ContrastSample[] {
  const samplePoints = [0, 25, 50, 75, 100];

  return samplePoints.map((pos) => {
    const sample = sampleColorAtPosition(stops, pos);
    // Blend with white background if transparent
    const effectiveR = Math.round(sample.r * sample.a + 255 * (1 - sample.a));
    const effectiveG = Math.round(sample.g * sample.a + 255 * (1 - sample.a));
    const effectiveB = Math.round(sample.b * sample.a + 255 * (1 - sample.a));
    const lum = calculateRelativeLuminance({ r: effectiveR, g: effectiveG, b: effectiveB });

    const contrastWhite = calculateContrastRatio(lum, 1.0);
    const contrastBlack = calculateContrastRatio(lum, 0.0);

    return {
      position: pos,
      colorHex: rgbToHex(effectiveR, effectiveG, effectiveB),
      rgb: { r: effectiveR, g: effectiveG, b: effectiveB },
      luminance: Math.round(lum * 1000) / 1000,
      contrastWhite,
      contrastBlack,
      passesAAWhite: contrastWhite >= 4.5,
      passesAABlack: contrastBlack >= 4.5,
      passesAAAWhite: contrastWhite >= 7.0,
      passesAAABlack: contrastBlack >= 7.0,
    };
  });
}

// --- URL Sharing Serialization ---

export function serializeGradientToUrl(config: GradientConfig): string {
  const data = {
    t: config.type,
    a: config.angle,
    s: config.stops.map((s) => [s.color.replace('#', ''), s.position, s.alpha]),
    r: [config.radial.shape[0], config.radial.x, config.radial.y],
    c: [config.conic.angle, config.conic.x, config.conic.y],
  };

  try {
    return encodeURIComponent(btoa(JSON.stringify(data)));
  } catch {
    return '';
  }
}

export function deserializeGradientFromUrl(query: string): GradientConfig | null {
  if (!query) return null;
  try {
    const decoded = JSON.parse(atob(decodeURIComponent(query)));
    if (!decoded || !decoded.s || !Array.isArray(decoded.s)) return null;

    const stops: ColorStop[] = decoded.s.map(
      (item: [string, number, number], idx: number) => ({
        id: `stop-${idx}`,
        color: normalizeHex(item[0]),
        position: item[1] || 0,
        alpha: item[2] !== undefined ? item[2] : 1,
      })
    );

    return {
      name: 'Shared Gradient',
      type: decoded.t || 'linear',
      angle: decoded.a !== undefined ? decoded.a : 135,
      stops,
      radial: {
        shape: decoded.r?.[0] === 'e' ? 'ellipse' : 'circle',
        size: 'farthest-corner',
        x: decoded.r?.[1] !== undefined ? decoded.r[1] : 50,
        y: decoded.r?.[2] !== undefined ? decoded.r[2] : 50,
      },
      conic: {
        angle: decoded.c?.[0] !== undefined ? decoded.c[0] : 0,
        x: decoded.c?.[1] !== undefined ? decoded.c[1] : 50,
        y: decoded.c?.[2] !== undefined ? decoded.c[2] : 50,
      },
      smoothMode: 'standard',
    };
  } catch (err) {
    console.error('Failed to deserialize gradient from URL:', err);
    return null;
  }
}

// --- Canvas Image Exporter ---

export async function exportGradientToCanvasBlob(
  config: GradientConfig,
  width: number,
  height: number,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.95
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // If JPG, fill white background first
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  const stops = getEffectiveStops(config);

  if (config.type === 'linear' || config.type === 'repeating-linear') {
    // Convert angle to canvas line coordinates
    const rad = ((config.angle - 90) * Math.PI) / 180;
    const length = Math.abs(width * Math.sin(rad)) + Math.abs(height * Math.cos(rad));
    const cx = width / 2;
    const cy = height / 2;
    const x0 = cx - (Math.cos(rad) * length) / 2;
    const y0 = cy - (Math.sin(rad) * length) / 2;
    const x1 = cx + (Math.cos(rad) * length) / 2;
    const y1 = cy + (Math.sin(rad) * length) / 2;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s) => {
      const colorStr =
        s.alpha < 1 ? hexToRgba(s.color, s.alpha) : normalizeHex(s.color);
      grad.addColorStop(Math.max(0, Math.min(1, s.position / 100)), colorStr);
    });

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (config.type === 'radial' || config.type === 'repeating-radial') {
    const cx = (config.radial.x / 100) * width;
    const cy = (config.radial.y / 100) * height;
    const radius = Math.max(width, height) / 2;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    stops.forEach((s) => {
      const colorStr =
        s.alpha < 1 ? hexToRgba(s.color, s.alpha) : normalizeHex(s.color);
      grad.addColorStop(Math.max(0, Math.min(1, s.position / 100)), colorStr);
    });

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (config.type === 'conic' || config.type === 'repeating-conic') {
    const cx = (config.conic.x / 100) * width;
    const cy = (config.conic.y / 100) * height;
    const startAngleRad = (config.conic.angle * Math.PI) / 180;

    if (typeof ctx.createConicGradient === 'function') {
      const grad = ctx.createConicGradient(startAngleRad, cx, cy);
      stops.forEach((s) => {
        const colorStr =
          s.alpha < 1 ? hexToRgba(s.color, s.alpha) : normalizeHex(s.color);
        grad.addColorStop(Math.max(0, Math.min(1, s.position / 100)), colorStr);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Fallback: draw linear gradient if createConicGradient not supported in older browsers
      const grad = ctx.createLinearGradient(0, 0, width, height);
      stops.forEach((s) => {
        const colorStr =
          s.alpha < 1 ? hexToRgba(s.color, s.alpha) : normalizeHex(s.color);
        grad.addColorStop(Math.max(0, Math.min(1, s.position / 100)), colorStr);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate image blob'));
      },
      format,
      quality
    );
  });
}

export const SOCIAL_MEDIA_PRESETS: DimensionPreset[] = [
  { label: 'Instagram Square', category: 'Instagram', width: 1080, height: 1080, description: '1:1 feed square' },
  { label: 'Instagram Portrait', category: 'Instagram', width: 1080, height: 1350, description: '4:5 vertical feed' },
  { label: 'Instagram / TikTok Story', category: 'Instagram', width: 1080, height: 1920, description: '9:16 full screen' },
  { label: 'Facebook Post', category: 'Facebook', width: 1200, height: 630, description: '1.91:1 landscape' },
  { label: 'Facebook Cover', category: 'Facebook', width: 1640, height: 856, description: 'Profile / page cover' },
  { label: 'YouTube Thumbnail', category: 'YouTube', width: 1280, height: 720, description: '16:9 HD video card' },
  { label: 'LinkedIn Post', category: 'LinkedIn', width: 1200, height: 627, description: 'Standard article share' },
  { label: 'X / Twitter Post', category: 'X', width: 1600, height: 900, description: '16:9 timeline banner' },
  { label: 'Desktop 1080p', category: 'Wallpaper', width: 1920, height: 1080, description: '16:9 Full HD' },
  { label: 'Square Standard', category: 'Wallpaper', width: 800, height: 800, description: 'Classic 800px card' },
];
