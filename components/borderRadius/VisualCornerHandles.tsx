'use client';

import React, { useRef } from 'react';
import {
  BorderRadiusConfig,
  CornerRadius,
  RadiusUnit,
} from '@/lib/borderRadius/borderRadiusTypes';

interface VisualCornerHandlesProps {
  config: BorderRadiusConfig;
  elementWidth: number;
  elementHeight: number;
  onUpdateCorner: (
    corner: keyof CornerRadius,
    value: number,
    axis?: 'horizontal' | 'vertical'
  ) => void;
}

export function VisualCornerHandles({
  config,
  elementWidth,
  elementHeight,
  onUpdateCorner,
}: VisualCornerHandlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to convert radius to pixel offset on screen
  const valToPx = (val: number, maxPx: number, unit: RadiusUnit): number => {
    switch (unit) {
      case '%':
        return (val / 100) * maxPx;
      case 'rem':
      case 'em':
        return val * 16;
      case 'px':
      default:
        return Math.min(val, maxPx);
    }
  };

  // Helper to convert drag pixels back to active unit
  const pxToVal = (pxVal: number, maxPx: number, unit: RadiusUnit): number => {
    const clampedPx = Math.max(0, Math.min(pxVal, maxPx));
    switch (unit) {
      case '%':
        return Math.round((clampedPx / maxPx) * 100);
      case 'rem':
      case 'em':
        return Math.round((clampedPx / 16) * 10) / 10;
      case 'px':
      default:
        return Math.round(clampedPx);
    }
  };

  // Pointer drag starter
  const handlePointerDown = (
    e: React.PointerEvent,
    corner: keyof CornerRadius,
    axis: 'both' | 'horizontal' | 'vertical'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;

    const startHVal = config.horizontal[corner];
    const startVVal = config.vertical[corner];

    const maxH = elementWidth / 2;
    const maxV = elementHeight / 2;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!config.isElliptical || axis === 'both') {
        // Standard 4-corner mode: diagonal movement
        let delta = 0;
        if (corner === 'topLeft') delta = (dx + dy) / 2;
        else if (corner === 'topRight') delta = (-dx + dy) / 2;
        else if (corner === 'bottomRight') delta = (-dx + -dy) / 2;
        else if (corner === 'bottomLeft') delta = (dx + -dy) / 2;

        const currentPx = valToPx(startHVal, maxH, config.unit);
        const newPx = currentPx + delta;
        const newVal = pxToVal(newPx, config.unit === '%' ? elementWidth : 300, config.unit);
        onUpdateCorner(corner, newVal);
      } else if (axis === 'horizontal') {
        // Horizontal radius handle
        let deltaX = 0;
        if (corner === 'topLeft' || corner === 'bottomLeft') deltaX = dx;
        else deltaX = -dx;

        const currentPx = valToPx(startHVal, maxH, config.unit);
        const newPx = currentPx + deltaX;
        const newVal = pxToVal(newPx, config.unit === '%' ? 100 : elementWidth, config.unit);
        onUpdateCorner(corner, newVal, 'horizontal');
      } else if (axis === 'vertical') {
        // Vertical radius handle
        let deltaY = 0;
        if (corner === 'topLeft' || corner === 'topRight') deltaY = dy;
        else deltaY = -dy;

        const currentPx = valToPx(startVVal, maxV, config.unit);
        const newPx = currentPx + deltaY;
        const newVal = pxToVal(newPx, config.unit === '%' ? 100 : elementHeight, config.unit);
        onUpdateCorner(corner, newVal, 'vertical');
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const { isElliptical, unit, horizontal, vertical } = config;
  const maxW = elementWidth;
  const maxH = elementHeight;

  // Render standard 4-corner handles when elliptical is false
  if (!isElliptical) {
    const handles: Array<{
      corner: keyof CornerRadius;
      label: string;
      style: React.CSSProperties;
    }> = [
      {
        corner: 'topLeft',
        label: 'TL',
        style: {
          top: `${Math.min(valToPx(horizontal.topLeft, maxH / 2, unit), maxH / 2)}px`,
          left: `${Math.min(valToPx(horizontal.topLeft, maxW / 2, unit), maxW / 2)}px`,
        },
      },
      {
        corner: 'topRight',
        label: 'TR',
        style: {
          top: `${Math.min(valToPx(horizontal.topRight, maxH / 2, unit), maxH / 2)}px`,
          right: `${Math.min(valToPx(horizontal.topRight, maxW / 2, unit), maxW / 2)}px`,
        },
      },
      {
        corner: 'bottomRight',
        label: 'BR',
        style: {
          bottom: `${Math.min(valToPx(horizontal.bottomRight, maxH / 2, unit), maxH / 2)}px`,
          right: `${Math.min(valToPx(horizontal.bottomRight, maxW / 2, unit), maxW / 2)}px`,
        },
      },
      {
        corner: 'bottomLeft',
        label: 'BL',
        style: {
          bottom: `${Math.min(valToPx(horizontal.bottomLeft, maxH / 2, unit), maxH / 2)}px`,
          left: `${Math.min(valToPx(horizontal.bottomLeft, maxW / 2, unit), maxW / 2)}px`,
        },
      },
    ];

    return (
      <div ref={containerRef} className="absolute inset-0 pointer-events-none z-20">
        {handles.map(({ corner, label, style }) => (
          <div
            key={corner}
            onPointerDown={(e) => handlePointerDown(e, corner, 'both')}
            style={style}
            title={`${label}: ${horizontal[corner]}${unit} (Drag to adjust)`}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-grab active:cursor-grabbing group p-1 touch-none"
          >
            <div className="w-5 h-5 rounded-full bg-white dark:bg-[#12121A] border-2 border-[#5722AF] shadow-md flex items-center justify-center transition-transform group-hover:scale-125 group-active:scale-110">
              <div className="w-2 h-2 rounded-full bg-[#5722AF]" />
            </div>
            {/* Value tooltip */}
            <div className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity absolute top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-sm bg-gray-900 text-white text-[10px] font-mono whitespace-nowrap shadow-sm pointer-events-none">
              {horizontal[corner]}{unit}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Elliptical mode: 8 specialized handles (4 horizontal on edges, 4 vertical on edges)
  const hHandles: Array<{
    corner: keyof CornerRadius;
    style: React.CSSProperties;
    val: number;
  }> = [
    {
      corner: 'topLeft',
      style: {
        top: '0px',
        left: `${Math.min(valToPx(horizontal.topLeft, maxW, unit), maxW)}px`,
      },
      val: horizontal.topLeft,
    },
    {
      corner: 'topRight',
      style: {
        top: '0px',
        right: `${Math.min(valToPx(horizontal.topRight, maxW, unit), maxW)}px`,
      },
      val: horizontal.topRight,
    },
    {
      corner: 'bottomRight',
      style: {
        bottom: '0px',
        right: `${Math.min(valToPx(horizontal.bottomRight, maxW, unit), maxW)}px`,
      },
      val: horizontal.bottomRight,
    },
    {
      corner: 'bottomLeft',
      style: {
        bottom: '0px',
        left: `${Math.min(valToPx(horizontal.bottomLeft, maxW, unit), maxW)}px`,
      },
      val: horizontal.bottomLeft,
    },
  ];

  const vHandles: Array<{
    corner: keyof CornerRadius;
    style: React.CSSProperties;
    val: number;
  }> = [
    {
      corner: 'topLeft',
      style: {
        left: '0px',
        top: `${Math.min(valToPx(vertical.topLeft, maxH, unit), maxH)}px`,
      },
      val: vertical.topLeft,
    },
    {
      corner: 'topRight',
      style: {
        right: '0px',
        top: `${Math.min(valToPx(vertical.topRight, maxH, unit), maxH)}px`,
      },
      val: vertical.topRight,
    },
    {
      corner: 'bottomRight',
      style: {
        right: '0px',
        bottom: `${Math.min(valToPx(vertical.bottomRight, maxH, unit), maxH)}px`,
      },
      val: vertical.bottomRight,
    },
    {
      corner: 'bottomLeft',
      style: {
        left: '0px',
        bottom: `${Math.min(valToPx(vertical.bottomLeft, maxH, unit), maxH)}px`,
      },
      val: vertical.bottomLeft,
    },
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-20">
      {/* Horizontal Edge Handles */}
      {hHandles.map(({ corner, style, val }) => (
        <div
          key={`h-${corner}`}
          onPointerDown={(e) => handlePointerDown(e, corner, 'horizontal')}
          style={style}
          title={`H-${corner}: ${val}${unit}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-ew-resize active:cursor-grabbing group p-1 touch-none"
        >
          <div className="w-4 h-4 rounded-full bg-white dark:bg-[#12121A] border-2 border-[#5722AF] shadow-md flex items-center justify-center transition-transform group-hover:scale-125">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5722AF]" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity absolute top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-sm bg-gray-900 text-white text-[9px] font-mono whitespace-nowrap shadow-sm pointer-events-none">
            H: {val}{unit}
          </div>
        </div>
      ))}

      {/* Vertical Edge Handles */}
      {vHandles.map(({ corner, style, val }) => (
        <div
          key={`v-${corner}`}
          onPointerDown={(e) => handlePointerDown(e, corner, 'vertical')}
          style={style}
          title={`V-${corner}: ${val}${unit}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-ns-resize active:cursor-grabbing group p-1 touch-none"
        >
          <div className="w-4 h-4 rounded-full bg-white dark:bg-[#12121A] border-2 border-[#7B45D1] shadow-md flex items-center justify-center transition-transform group-hover:scale-125">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7B45D1]" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity absolute top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-sm bg-gray-900 text-white text-[9px] font-mono whitespace-nowrap shadow-sm pointer-events-none">
            V: {val}{unit}
          </div>
        </div>
      ))}
    </div>
  );
}
