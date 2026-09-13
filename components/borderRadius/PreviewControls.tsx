'use client';

import React from 'react';
import {
  Square,
  Circle,
  CreditCard,
  MousePointer,
  ImageIcon,
  Type,
  Maximize2,
  Sliders,
  Palette,
  Shield,
} from 'lucide-react';
import {
  PreviewSettings,
  PreviewObject,
  PreviewSizePreset,
} from '@/lib/borderRadius/borderRadiusTypes';

interface PreviewControlsProps {
  preview: PreviewSettings;
  onUpdatePreview: (updates: Partial<PreviewSettings>) => void;
}

const OBJECTS: Array<{
  id: PreviewObject;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: 'rectangle', label: 'Box', icon: <Square className="w-3.5 h-3.5" /> },
  { id: 'card', label: 'Card', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { id: 'button', label: 'Button', icon: <MousePointer className="w-3.5 h-3.5" /> },
  { id: 'image', label: 'Image', icon: <ImageIcon className="w-3.5 h-3.5" /> },
  { id: 'circle', label: 'Circle', icon: <Circle className="w-3.5 h-3.5" /> },
  { id: 'input', label: 'Input', icon: <Type className="w-3.5 h-3.5" /> },
];

const SIZE_PRESETS: Array<{
  id: PreviewSizePreset;
  label: string;
  w: number;
  h: number;
}> = [
  { id: 'small', label: 'Small (180×120)', w: 180, h: 120 },
  { id: 'medium', label: 'Medium (260×180)', w: 260, h: 180 },
  { id: 'large', label: 'Large (360×240)', w: 360, h: 240 },
  { id: 'square', label: 'Square (300×300)', w: 300, h: 300 },
];

const ELEMENT_COLORS = [
  { label: 'Brand Purple', value: '#5722AF' },
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#D97706' },
  { label: 'Rose', value: '#E11D48' },
  { label: 'Dark Slate', value: '#0F172A' },
  { label: 'White', value: '#FFFFFF' },
];

export function PreviewControls({
  preview,
  onUpdatePreview,
}: PreviewControlsProps) {
  const handleSelectSize = (preset: PreviewSizePreset, w: number, h: number) => {
    onUpdatePreview({
      sizePreset: preset,
      width: w,
      height: h,
    });
  };

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Preview Element & Border</span>
        </h3>
      </div>

      {/* 1. Preview Object Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Element Type
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {OBJECTS.map((obj) => (
            <button
              key={obj.id}
              type="button"
              onClick={() => onUpdatePreview({ object: obj.id })}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${
                preview.object === obj.id
                  ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] shadow-2xs font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              {obj.icon}
              <span className="text-[10px]">{obj.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Preview Dimensions & Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Dimensions Preset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {SIZE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectSize(p.id, p.w, p.h)}
              className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-all text-center ${
                preview.sizePreset === p.id &&
                preview.width === p.w &&
                preview.height === p.h
                  ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Width and Height */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-[11px] text-zinc-400 font-medium block mb-1">
              Width (px)
            </span>
            <input
              type="number"
              min="100"
              max="1000"
              value={preview.width}
              onChange={(e) =>
                onUpdatePreview({
                  width: Math.max(100, Math.min(1000, Number(e.target.value) || 100)),
                  sizePreset: 'custom',
                })
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#12121A] text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#5722AF]"
            />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 font-medium block mb-1">
              Height (px)
            </span>
            <input
              type="number"
              min="100"
              max="1000"
              value={preview.height}
              onChange={(e) =>
                onUpdatePreview({
                  height: Math.max(100, Math.min(1000, Number(e.target.value) || 100)),
                  sizePreset: 'custom',
                })
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#12121A] text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#5722AF]"
            />
          </div>
        </div>
      </div>

      {/* 3. Element Surface Color */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-[#5722AF]" />
            Element Color
          </span>
          <span className="font-mono text-[11px] text-zinc-400">
            {preview.elementBg}
          </span>
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {ELEMENT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onUpdatePreview({ elementBg: c.value })}
              title={c.label}
              className={`w-6 h-6 rounded-full border transition-all ${
                preview.elementBg === c.value
                  ? 'border-[#5722AF] ring-2 ring-[#5722AF]/40 scale-110'
                  : 'border-zinc-300 dark:border-zinc-600 hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
          {/* Custom Color Input */}
          <input
            type="color"
            value={preview.elementBg}
            onChange={(e) => onUpdatePreview({ elementBg: e.target.value })}
            className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-600 cursor-pointer overflow-hidden p-0"
            title="Choose custom element color"
          />
        </div>
      </div>

      {/* 4. Optional Border Controls */}
      <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Element Border
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdatePreview({
                border: {
                  ...preview.border,
                  enabled: !preview.border.enabled,
                },
              })
            }
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              preview.border.enabled
                ? 'bg-[#5722AF] text-white'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {preview.border.enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {preview.border.enabled && (
          <div className="space-y-3 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
            {/* Border Width */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Width</span>
                <span className="font-mono font-semibold">{preview.border.width}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={preview.border.width}
                onChange={(e) =>
                  onUpdatePreview({
                    border: {
                      ...preview.border,
                      width: Number(e.target.value),
                    },
                  })
                }
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
              />
            </div>

            {/* Border Style & Color */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Style</span>
                <select
                  value={preview.border.style}
                  onChange={(e) =>
                    onUpdatePreview({
                      border: {
                        ...preview.border,
                        style: e.target.value as 'solid' | 'dashed' | 'dotted',
                      },
                    })
                  }
                  className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#12121A] text-xs font-medium text-zinc-900 dark:text-white"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Color</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={preview.border.color}
                    onChange={(e) =>
                      onUpdatePreview({
                        border: {
                          ...preview.border,
                          color: e.target.value,
                        },
                      })
                    }
                    className="w-7 h-7 rounded-md border border-zinc-300 dark:border-zinc-600 cursor-pointer p-0"
                  />
                  <span className="text-xs font-mono text-zinc-500">
                    {preview.border.color}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
