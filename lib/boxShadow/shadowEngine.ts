import { ShadowLayer, ShadowConfig } from './shadowTypes';
import { hexToRgb, normalizeHex } from '../colorEngine';

export function hexToRgbaString(hex: string, opacityPercent: number): string {
  const rgb = hexToRgb(hex);
  const alpha = Math.max(0, Math.min(1, Math.round((opacityPercent / 100) * 100) / 100));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function formatSingleShadow(layer: ShadowLayer): string {
  const insetPart = layer.inset ? 'inset ' : '';
  const colorPart = hexToRgbaString(layer.color, layer.opacity);
  return `${insetPart}${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px ${colorPart}`;
}

export function generateBoxShadowCss(layers: ShadowLayer[]): string {
  const enabledLayers = layers.filter((l) => l.enabled);
  if (enabledLayers.length === 0) return 'none';
  return enabledLayers.map(formatSingleShadow).join(', ');
}

export function generateCssClass(
  layers: ShadowLayer[],
  className = 'shadow-custom'
): string {
  const enabled = layers.filter((l) => l.enabled);
  const cleanName = className.trim().replace(/^[^a-zA-Z_]/, '').replace(/[^a-zA-Z0-9_-]/g, '') || 'shadow-custom';

  if (enabled.length === 0) {
    return `.${cleanName} {\n  box-shadow: none;\n}`;
  }

  if (enabled.length === 1) {
    return `.${cleanName} {\n  box-shadow: ${formatSingleShadow(enabled[0])};\n}`;
  }

  const lines = enabled.map((l, idx) => {
    const comma = idx < enabled.length - 1 ? ',' : ';';
    return `    ${formatSingleShadow(l)}${comma}`;
  });

  return `.${cleanName} {\n  box-shadow:\n${lines.join('\n')}\n}`;
}

export function generateCssVariable(
  layers: ShadowLayer[],
  varName = '--custom-shadow'
): string {
  const enabled = layers.filter((l) => l.enabled);
  const cleanVar = varName.startsWith('--') ? varName : `--${varName}`;

  if (enabled.length === 0) {
    return `:root {\n  ${cleanVar}: none;\n}\n\n.element {\n  box-shadow: var(${cleanVar});\n}`;
  }

  if (enabled.length === 1) {
    return `:root {\n  ${cleanVar}: ${formatSingleShadow(enabled[0])};\n}\n\n.element {\n  box-shadow: var(${cleanVar});\n}`;
  }

  const lines = enabled.map((l, idx) => {
    const comma = idx < enabled.length - 1 ? ',' : ';';
    return `    ${formatSingleShadow(l)}${comma}`;
  });

  return `:root {\n  ${cleanVar}:\n${lines.join('\n')}\n}\n\n.element {\n  box-shadow: var(${cleanVar});\n}`;
}

export function generateTailwindClass(layers: ShadowLayer[]): string {
  const enabled = layers.filter((l) => l.enabled);
  if (enabled.length === 0) return 'shadow-none';

  // In Tailwind arbitrary values:
  // Spaces inside shadow definition become underscores:
  // e.g. 0 10px 30px rgba(0,0,0,0.15) -> 0_10px_30px_rgba(0,0,0,0.15)
  // Commas between layers stay as commas
  const tailwindSegments = enabled.map((layer) => {
    const insetPart = layer.inset ? 'inset_' : '';
    const rgb = hexToRgb(layer.color);
    const alpha = Math.max(0, Math.min(1, Math.round((layer.opacity / 100) * 100) / 100));
    const colorStr = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
    return `${insetPart}${layer.offsetX}px_${layer.offsetY}px_${layer.blur}px_${layer.spread}px_${colorStr}`;
  });

  return `shadow-[${tailwindSegments.join(',')}]`;
}

export function generateScss(
  layers: ShadowLayer[],
  varName = '$custom-shadow'
): string {
  const css = generateBoxShadowCss(layers);
  const cleanVar = varName.startsWith('$') ? varName : `$${varName}`;
  return `${cleanVar}: ${css};\n\n.element {\n  box-shadow: ${cleanVar};\n}`;
}

// --- Direction & Softness Macro Controls ---

export function applyDirectionToLayer(
  layer: ShadowLayer,
  distance: number,
  angleDeg: number
): ShadowLayer {
  // Angle: 0deg is Top, 90deg is Right, 180deg is Bottom, 270deg is Left
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const offsetX = Math.round(distance * Math.cos(rad));
  const offsetY = Math.round(distance * Math.sin(rad));

  return {
    ...layer,
    offsetX: Math.max(-100, Math.min(100, offsetX)),
    offsetY: Math.max(-100, Math.min(100, offsetY)),
  };
}

export function applySoftnessToLayer(
  layer: ShadowLayer,
  softness: number
): ShadowLayer {
  const factor = Math.max(0, Math.min(100, softness)) / 100;
  // Blur scales with softness (e.g. 0 -> 4px, 100 -> 80px)
  const blur = Math.round(4 + factor * 76);
  // Spread shrinks slightly as softness increases to avoid heavy halos
  const spread = Math.round(4 - factor * 8);
  // Opacity decreases as softness increases
  const opacity = Math.round(40 - factor * 26);

  return {
    ...layer,
    blur,
    spread,
    opacity: Math.max(5, opacity),
  };
}

// --- Random Shadow Generator ---

export function generateRandomShadow(
  style: 'soft' | 'strong' | 'minimal' | 'floating' | 'dramatic' | 'inset' = 'soft'
): ShadowLayer[] {
  const id = `layer-${Date.now()}`;

  switch (style) {
    case 'strong':
      return [
        {
          id,
          inset: false,
          offsetX: Math.floor(Math.random() * 8) + 4,
          offsetY: Math.floor(Math.random() * 12) + 8,
          blur: Math.floor(Math.random() * 10) + 4,
          spread: 0,
          color: '#000000',
          opacity: Math.floor(Math.random() * 25) + 35,
          enabled: true,
        },
      ];

    case 'minimal':
      return [
        {
          id,
          inset: false,
          offsetX: 0,
          offsetY: Math.floor(Math.random() * 3) + 1,
          blur: Math.floor(Math.random() * 6) + 3,
          spread: 0,
          color: '#000000',
          opacity: Math.floor(Math.random() * 6) + 6,
          enabled: true,
        },
      ];

    case 'floating':
      return [
        {
          id: `${id}-0`,
          inset: false,
          offsetX: 0,
          offsetY: Math.floor(Math.random() * 10) + 15,
          blur: Math.floor(Math.random() * 15) + 30,
          spread: -6,
          color: '#000000',
          opacity: 18,
          enabled: true,
        },
        {
          id: `${id}-1`,
          inset: false,
          offsetX: 0,
          offsetY: 4,
          blur: 10,
          spread: -1,
          color: '#000000',
          opacity: 8,
          enabled: true,
        },
      ];

    case 'dramatic':
      return [
        {
          id,
          inset: false,
          offsetX: Math.floor(Math.random() * 10) - 5,
          offsetY: Math.floor(Math.random() * 20) + 25,
          blur: Math.floor(Math.random() * 25) + 50,
          spread: -10,
          color: '#000000',
          opacity: 35,
          enabled: true,
        },
      ];

    case 'inset':
      return [
        {
          id,
          inset: true,
          offsetX: 0,
          offsetY: Math.floor(Math.random() * 4) + 2,
          blur: Math.floor(Math.random() * 8) + 8,
          spread: 0,
          color: '#000000',
          opacity: 18,
          enabled: true,
        },
      ];

    case 'soft':
    default:
      return [
        {
          id,
          inset: false,
          offsetX: 0,
          offsetY: Math.floor(Math.random() * 8) + 6,
          blur: Math.floor(Math.random() * 16) + 20,
          spread: -2,
          color: '#000000',
          opacity: Math.floor(Math.random() * 8) + 10,
          enabled: true,
        },
      ];
  }
}

export function generateStyleShadow(
  style: 'subtle' | 'soft' | 'balanced' | 'strong' | 'dramatic'
): ShadowLayer[] {
  const ts = Date.now().toString(36);

  switch (style) {
    case 'subtle':
      return [
        {
          id: `layer-${ts}-0`,
          inset: false,
          offsetX: 0,
          offsetY: 2,
          blur: 6,
          spread: 0,
          color: '#000000',
          opacity: 8,
          enabled: true,
        },
      ];

    case 'soft':
      return [
        {
          id: `layer-${ts}-0`,
          inset: false,
          offsetX: 0,
          offsetY: 2,
          blur: 4,
          spread: -1,
          color: '#000000',
          opacity: 6,
          enabled: true,
        },
        {
          id: `layer-${ts}-1`,
          inset: false,
          offsetX: 0,
          offsetY: 12,
          blur: 24,
          spread: -4,
          color: '#000000',
          opacity: 12,
          enabled: true,
        },
      ];

    case 'balanced':
      return [
        {
          id: `layer-${ts}-0`,
          inset: false,
          offsetX: 0,
          offsetY: 1,
          blur: 3,
          spread: 0,
          color: '#000000',
          opacity: 10,
          enabled: true,
        },
        {
          id: `layer-${ts}-1`,
          inset: false,
          offsetX: 0,
          offsetY: 8,
          blur: 16,
          spread: -2,
          color: '#000000',
          opacity: 15,
          enabled: true,
        },
      ];

    case 'strong':
      return [
        {
          id: `layer-${ts}-0`,
          inset: false,
          offsetX: 0,
          offsetY: 4,
          blur: 6,
          spread: -1,
          color: '#000000',
          opacity: 15,
          enabled: true,
        },
        {
          id: `layer-${ts}-1`,
          inset: false,
          offsetX: 0,
          offsetY: 16,
          blur: 32,
          spread: -4,
          color: '#000000',
          opacity: 28,
          enabled: true,
        },
      ];

    case 'dramatic':
      return [
        {
          id: `layer-${ts}-0`,
          inset: false,
          offsetX: 0,
          offsetY: 2,
          blur: 8,
          spread: 0,
          color: '#000000',
          opacity: 20,
          enabled: true,
        },
        {
          id: `layer-${ts}-1`,
          inset: false,
          offsetX: 0,
          offsetY: 25,
          blur: 50,
          spread: -10,
          color: '#000000',
          opacity: 35,
          enabled: true,
        },
      ];
  }
}

// --- URL Serialization & Sharing ---

export function serializeShadowToUrl(config: ShadowConfig): string {
  const data = {
    n: config.name,
    l: config.layers.map((l) => [
      l.inset ? 1 : 0,
      l.offsetX,
      l.offsetY,
      l.blur,
      l.spread,
      l.color.replace('#', ''),
      l.opacity,
      l.enabled ? 1 : 0,
    ]),
    p: [
      config.preview.object,
      config.preview.width,
      config.preview.height,
      config.preview.borderRadius,
      config.preview.elementBg.replace('#', ''),
      config.preview.previewBg.replace('#', ''),
    ],
  };

  try {
    return encodeURIComponent(btoa(JSON.stringify(data)));
  } catch {
    return '';
  }
}

export function deserializeShadowFromUrl(query: string): ShadowConfig | null {
  if (!query) return null;
  try {
    const decoded = JSON.parse(atob(decodeURIComponent(query)));
    if (!decoded || !decoded.l || !Array.isArray(decoded.l)) return null;

    const layers: ShadowLayer[] = decoded.l.map(
      (arr: [number, number, number, number, number, string, number, number], idx: number) => ({
        id: `layer-${idx}`,
        inset: arr[0] === 1,
        offsetX: arr[1] ?? 0,
        offsetY: arr[2] ?? 10,
        blur: arr[3] ?? 30,
        spread: arr[4] ?? 0,
        color: normalizeHex(arr[5] || '000000'),
        opacity: arr[6] ?? 20,
        enabled: arr[7] !== 0,
      })
    );

    return {
      name: decoded.n || 'Shared Shadow',
      layers,
      preview: {
        object: decoded.p?.[0] || 'card',
        width: decoded.p?.[1] || 240,
        height: decoded.p?.[2] || 160,
        borderRadius: decoded.p?.[3] ?? 16,
        elementBg: normalizeHex(decoded.p?.[4] || 'FFFFFF'),
        previewBg: normalizeHex(decoded.p?.[5] || 'F5F5F5'),
        borderWidth: 0,
        borderColor: '#E2E8F0',
      },
    };
  } catch (err) {
    console.error('Failed to parse shadow from URL:', err);
    return null;
  }
}

// --- Canvas Image Exporter ---

export async function exportShadowPreviewToCanvas(
  config: ShadowConfig,
  exportWidth = 1200,
  exportHeight = 630,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  transparentBg = false,
  quality = 0.95
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // Fill Canvas Background
  if (!transparentBg || format === 'image/jpeg') {
    ctx.fillStyle = config.preview.previewBg || '#F5F5F5';
    ctx.fillRect(0, 0, exportWidth, exportHeight);
  }

  // Calculate scaling factor to fit preview object into export canvas
  const previewW = config.preview.width;
  const previewH = config.preview.height;
  const scale = Math.min(exportWidth / (previewW * 2.2), exportHeight / (previewH * 2.2), 2.5);

  const targetW = previewW * scale;
  const targetH = previewH * scale;
  const x = (exportWidth - targetW) / 2;
  const y = (exportHeight - targetH) / 2;
  const r = config.preview.borderRadius * scale;

  const enabledLayers = config.layers.filter((l) => l.enabled);

  // Render outer shadows first
  const outerLayers = enabledLayers.filter((l) => !l.inset);
  for (const layer of outerLayers) {
    ctx.save();
    ctx.shadowColor = hexToRgbaString(layer.color, layer.opacity);
    ctx.shadowOffsetX = layer.offsetX * scale;
    ctx.shadowOffsetY = layer.offsetY * scale;
    ctx.shadowBlur = layer.blur * scale;

    ctx.fillStyle = config.preview.elementBg || '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x, y, targetW, targetH, r);
    ctx.fill();
    ctx.restore();
  }

  // Render the Element Base
  ctx.save();
  ctx.fillStyle = config.preview.elementBg || '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(x, y, targetW, targetH, r);
  ctx.fill();

  if (config.preview.borderWidth > 0) {
    ctx.strokeStyle = config.preview.borderColor || '#E2E8F0';
    ctx.lineWidth = config.preview.borderWidth * scale;
    ctx.stroke();
  }
  ctx.restore();

  // Render inset shadows (clipped to element shape)
  const insetLayers = enabledLayers.filter((l) => l.inset);
  if (insetLayers.length > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, targetW, targetH, r);
    ctx.clip();

    for (const layer of insetLayers) {
      ctx.save();
      ctx.shadowColor = hexToRgbaString(layer.color, layer.opacity);
      ctx.shadowOffsetX = layer.offsetX * scale;
      ctx.shadowOffsetY = layer.offsetY * scale;
      ctx.shadowBlur = layer.blur * scale;

      // Draw large frame outside element to cast shadow inwards
      ctx.beginPath();
      ctx.rect(x - targetW, y - targetH, targetW * 3, targetH * 3);
      ctx.roundRect(x, y, targetW, targetH, r);
      ctx.fillStyle = '#000000';
      ctx.fill('evenodd');
      ctx.restore();
    }
    ctx.restore();
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
