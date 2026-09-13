import {
  BorderRadiusConfig,
  CornerRadius,
  RadiusUnit,
} from './borderRadiusTypes';

// --- CSS String Formatter ---

export function formatCornerValues(
  corners: CornerRadius,
  unit: RadiusUnit,
  shortenIfEqual = true
): string {
  const { topLeft, topRight, bottomRight, bottomLeft } = corners;
  if (
    shortenIfEqual &&
    topLeft === topRight &&
    topRight === bottomRight &&
    bottomRight === bottomLeft
  ) {
    return `${topLeft}${unit}`;
  }
  return `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`;
}

export function generateBorderRadiusCss(config: BorderRadiusConfig): string {
  const { isElliptical, unit, horizontal, vertical } = config;

  if (!isElliptical) {
    return formatCornerValues(horizontal, unit, true);
  }

  const hStr = formatCornerValues(horizontal, unit, false);
  const vStr = formatCornerValues(vertical, unit, false);
  return `${hStr} / ${vStr}`;
}

// --- Class, Variable, Tailwind, and SCSS Generators ---

export function generateCssClass(
  config: BorderRadiusConfig,
  className = 'rounded-custom'
): string {
  const safeClassName = className.trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'rounded-custom';
  const radius = generateBorderRadiusCss(config);
  return `.${safeClassName} {\n  border-radius: ${radius};\n}`;
}

export function generateCssVariable(
  config: BorderRadiusConfig,
  varName = '--custom-radius'
): string {
  const safeVarName = varName.startsWith('--') ? varName : `--${varName}`;
  const radius = generateBorderRadiusCss(config);
  return `:root {\n  ${safeVarName}: ${radius};\n}\n\n.element {\n  border-radius: var(${safeVarName});\n}`;
}

export function generateTailwindClass(config: BorderRadiusConfig): string {
  const { isElliptical, unit, horizontal } = config;

  if (!isElliptical) {
    const { topLeft, topRight, bottomRight, bottomLeft } = horizontal;
    if (
      topLeft === topRight &&
      topRight === bottomRight &&
      bottomRight === bottomLeft
    ) {
      if (unit === 'px' && topLeft === 9999) return 'rounded-full';
      return `rounded-[${topLeft}${unit}]`;
    }
    return `rounded-tl-[${topLeft}${unit}] rounded-tr-[${topRight}${unit}] rounded-br-[${bottomRight}${unit}] rounded-bl-[${bottomLeft}${unit}]`;
  }

  // Elliptical arbitrary property in Tailwind
  const fullCss = generateBorderRadiusCss(config);
  const sanitized = fullCss.replace(/\s+/g, '_');
  return `[border-radius:${sanitized}]`;
}

export function generateScss(
  config: BorderRadiusConfig,
  varName = '$custom-radius'
): string {
  const safeVarName = varName.startsWith('$') ? varName : `$${varName}`;
  const radius = generateBorderRadiusCss(config);
  return `${safeVarName}: ${radius};\n\n.element {\n  border-radius: ${safeVarName};\n}`;
}

// --- Random Radius Generator ---

export function generateRandomRadius(
  style: 'minimal' | 'balanced' | 'organic' | 'playful' | 'extreme' = 'balanced',
  currentConfig?: BorderRadiusConfig
): BorderRadiusConfig {
  const base = currentConfig || {
    isLinked: false,
    isElliptical: false,
    unit: 'px' as RadiusUnit,
    horizontal: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
    vertical: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
    preview: {
      object: 'card' as const,
      sizePreset: 'medium' as const,
      width: 260,
      height: 180,
      previewBg: '#F5F5F7',
      elementBg: '#5722AF',
      border: { enabled: false, width: 2, style: 'solid' as const, color: '#7B45D1' },
      showGuides: false,
    },
  };

  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (style) {
    case 'minimal':
      return {
        ...base,
        name: 'Random Minimal',
        isLinked: Math.random() > 0.5,
        isElliptical: false,
        unit: 'px',
        horizontal: {
          topLeft: rand(2, 12),
          topRight: rand(2, 12),
          bottomRight: rand(2, 12),
          bottomLeft: rand(2, 12),
        },
        vertical: {
          topLeft: 6,
          topRight: 6,
          bottomRight: 6,
          bottomLeft: 6,
        },
      };

    case 'balanced':
      return {
        ...base,
        name: 'Random Balanced',
        isLinked: false,
        isElliptical: false,
        unit: 'px',
        horizontal: {
          topLeft: rand(8, 48),
          topRight: rand(8, 48),
          bottomRight: rand(8, 48),
          bottomLeft: rand(8, 48),
        },
        vertical: {
          topLeft: 24,
          topRight: 24,
          bottomRight: 24,
          bottomLeft: 24,
        },
      };

    case 'organic':
      return {
        ...base,
        name: 'Random Organic Blob',
        isLinked: false,
        isElliptical: true,
        unit: '%',
        horizontal: {
          topLeft: rand(30, 70),
          topRight: rand(30, 70),
          bottomRight: rand(30, 70),
          bottomLeft: rand(30, 70),
        },
        vertical: {
          topLeft: rand(30, 70),
          topRight: rand(30, 70),
          bottomRight: rand(30, 70),
          bottomLeft: rand(30, 70),
        },
      };

    case 'playful':
      return {
        ...base,
        name: 'Random Playful',
        isLinked: false,
        isElliptical: Math.random() > 0.5,
        unit: 'px',
        horizontal: {
          topLeft: rand(0, 80),
          topRight: rand(10, 90),
          bottomRight: rand(0, 80),
          bottomLeft: rand(10, 90),
        },
        vertical: {
          topLeft: rand(10, 70),
          topRight: rand(10, 70),
          bottomRight: rand(10, 70),
          bottomLeft: rand(10, 70),
        },
      };

    case 'extreme':
    default:
      return {
        ...base,
        name: 'Random Extreme',
        isLinked: false,
        isElliptical: true,
        unit: '%',
        horizontal: {
          topLeft: rand(15, 85),
          topRight: rand(15, 85),
          bottomRight: rand(15, 85),
          bottomLeft: rand(15, 85),
        },
        vertical: {
          topLeft: rand(15, 85),
          topRight: rand(15, 85),
          bottomRight: rand(15, 85),
          bottomLeft: rand(15, 85),
        },
      };
  }
}

// --- URL Serialization & Sharing ---

export function serializeRadiusToUrl(config: BorderRadiusConfig): string {
  try {
    const payload = {
      n: config.name,
      l: config.isLinked ? 1 : 0,
      e: config.isElliptical ? 1 : 0,
      u: config.unit,
      h: [
        config.horizontal.topLeft,
        config.horizontal.topRight,
        config.horizontal.bottomRight,
        config.horizontal.bottomLeft,
      ],
      v: [
        config.vertical.topLeft,
        config.vertical.topRight,
        config.vertical.bottomRight,
        config.vertical.bottomLeft,
      ],
      p: [
        config.preview.object,
        config.preview.width,
        config.preview.height,
        config.preview.elementBg,
        config.preview.previewBg,
      ],
    };
    return encodeURIComponent(btoa(JSON.stringify(payload)));
  } catch (err) {
    console.error('Failed to serialize radius:', err);
    return '';
  }
}

export function deserializeRadiusFromUrl(query: string): BorderRadiusConfig | null {
  try {
    const jsonStr = atob(decodeURIComponent(query));
    const d = JSON.parse(jsonStr);

    return {
      name: d.n || 'Shared Border Radius',
      isLinked: d.l === 1,
      isElliptical: d.e === 1,
      unit: d.u || 'px',
      horizontal: {
        topLeft: d.h?.[0] ?? 16,
        topRight: d.h?.[1] ?? 16,
        bottomRight: d.h?.[2] ?? 16,
        bottomLeft: d.h?.[3] ?? 16,
      },
      vertical: {
        topLeft: d.v?.[0] ?? 16,
        topRight: d.v?.[1] ?? 16,
        bottomRight: d.v?.[2] ?? 16,
        bottomLeft: d.v?.[3] ?? 16,
      },
      preview: {
        object: d.p?.[0] || 'card',
        sizePreset: 'medium',
        width: d.p?.[1] || 260,
        height: d.p?.[2] || 180,
        elementBg: d.p?.[3] || '#5722AF',
        previewBg: d.p?.[4] || '#F5F5F7',
        border: {
          enabled: false,
          width: 2,
          style: 'solid',
          color: '#7B45D1',
        },
        showGuides: false,
      },
    };
  } catch (err) {
    console.error('Failed to deserialize radius from URL:', err);
    return null;
  }
}

// --- Canvas Image Exporter ---

export async function exportRadiusPreviewToCanvas(
  config: BorderRadiusConfig,
  exportWidth = 1200,
  exportHeight = 800,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  transparentBg = false,
  quality = 0.95
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain 2D canvas context');

  // 1. Draw Canvas Background
  if (!transparentBg || format === 'image/jpeg') {
    ctx.fillStyle = config.preview.previewBg || '#F5F5F7';
    ctx.fillRect(0, 0, exportWidth, exportHeight);
  }

  // 2. Scale Element to fit comfortably inside export dimensions
  const elemW = config.preview.width;
  const elemH = config.preview.height;
  const scale = Math.min(exportWidth / (elemW * 1.8), exportHeight / (elemH * 1.8), 2.5);

  const targetW = elemW * scale;
  const targetH = elemH * scale;
  const x = (exportWidth - targetW) / 2;
  const y = (exportHeight - targetH) / 2;

  // Convert radius units to concrete pixels on target element
  const toPx = (val: number, refDim: number, unit: RadiusUnit) => {
    switch (unit) {
      case '%':
        return (val / 100) * refDim;
      case 'rem':
      case 'em':
        return val * 16 * scale;
      case 'px':
      default:
        return Math.min(val * scale, refDim);
    }
  };

  const tlX = toPx(config.horizontal.topLeft, targetW, config.unit);
  const trX = toPx(config.horizontal.topRight, targetW, config.unit);
  const brX = toPx(config.horizontal.bottomRight, targetW, config.unit);
  const blX = toPx(config.horizontal.bottomLeft, targetW, config.unit);

  const tlY = config.isElliptical
    ? toPx(config.vertical.topLeft, targetH, config.unit)
    : tlX;
  const trY = config.isElliptical
    ? toPx(config.vertical.topRight, targetH, config.unit)
    : trX;
  const brY = config.isElliptical
    ? toPx(config.vertical.bottomRight, targetH, config.unit)
    : brX;
  const blY = config.isElliptical
    ? toPx(config.vertical.bottomLeft, targetH, config.unit)
    : blX;

  // 3. Draw Path using native roundRect with PointInit or Bezier
  ctx.save();
  ctx.beginPath();

  if (typeof ctx.roundRect === 'function') {
    try {
      ctx.roundRect(x, y, targetW, targetH, [
        { x: tlX, y: tlY },
        { x: trX, y: trY },
        { x: brX, y: brY },
        { x: blX, y: blY },
      ]);
    } catch {
      // Fallback simple roundRect with scalar numbers
      ctx.roundRect(x, y, targetW, targetH, [tlX, trX, brX, blX]);
    }
  } else {
    // Custom Bezier path fallback
    ctx.moveTo(x + tlX, y);
    ctx.lineTo(x + targetW - trX, y);
    ctx.quadraticCurveTo(x + targetW, y, x + targetW, y + trY);
    ctx.lineTo(x + targetW, y + targetH - brY);
    ctx.quadraticCurveTo(x + targetW, y + targetH, x + targetW - brX, y + targetH);
    ctx.lineTo(x + blX, y + targetH);
    ctx.quadraticCurveTo(x, y + targetH, x, y + targetH - blY);
    ctx.lineTo(x, y + tlY);
    ctx.quadraticCurveTo(x, y, x + tlX, y);
    ctx.closePath();
  }

  // 4. Fill Element Base
  ctx.fillStyle = config.preview.elementBg || '#5722AF';
  ctx.fill();

  // 5. Stroke Border if enabled
  if (config.preview.border.enabled && config.preview.border.width > 0) {
    ctx.lineWidth = config.preview.border.width * scale;
    ctx.strokeStyle = config.preview.border.color || '#7B45D1';
    if (config.preview.border.style === 'dashed') {
      ctx.setLineDash([8 * scale, 6 * scale]);
    } else if (config.preview.border.style === 'dotted') {
      ctx.setLineDash([3 * scale, 4 * scale]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
  }

  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode canvas to blob'));
      },
      format,
      quality
    );
  });
}
