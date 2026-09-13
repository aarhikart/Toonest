'use client';

import React from 'react';
import {
  Maximize2,
  Square,
  Circle,
  CreditCard,
  MousePointer,
  ImageIcon,
  Type,
  Palette,
} from 'lucide-react';
import { PreviewSettings, PreviewObject } from '@/lib/boxShadow/shadowTypes';

interface PreviewControlsProps {
  preview: PreviewSettings;
  onUpdatePreview: (updates: Partial<PreviewSettings>) => void;
}

const ELEMENT_BG_OPTIONS = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Light Gray', value: '#F8FAFC' },
  { label: 'Dark Slate', value: '#0F172A' },
  { label: 'Brand Purple', value: '#5722AF' },
];

const RADIUS_PRESETS = [
  { label: '0', value: 0 },
  { label: '4', value: 4 },
  { label: '8', value: 8 },
  { label: '12', value: 12 },
  { label: '16', value: 16 },
  { label: '24', value: 24 },
  { label: '32', value: 32 },
  { label: 'Circle', value: 999 },
];

export function PreviewControls({
  preview,
  onUpdatePreview,
}: PreviewControlsProps) {
  const objects: { id: PreviewObject; label: string; icon: React.ReactNode }[] = [
    { id: 'card', label: 'Card', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'button', label: 'Button', icon: <MousePointer className="w-3.5 h-3.5" /> },
    { id: 'circle', label: 'Circle', icon: <Circle className="w-3.5 h-3.5" /> },
    { id: 'image', label: 'Image', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'input', label: 'Input', icon: <Type className="w-3.5 h-3.5" /> },
    { id: 'custom', label: 'Custom', icon: <Square className="w-3.5 h-3.5" /> },
  ];

  const handleSizePreset = (w: number, h: number) => {
    onUpdatePreview({ width: w, height: h });
  };

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors space-y-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Preview Stage Settings</span>
        </h3>
      </div>

      {/* 1. Preview Object Switcher */}
      <div>
        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
          Preview Element Object
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {objects.map((obj) => (
            <button
              key={obj.id}
              type="button"
              onClick={() => onUpdatePreview({ object: obj.id })}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                preview.object === obj.id
                  ? 'bg-[#5722AF] text-white border-[#5722AF] font-bold shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {obj.icon}
              <span className="text-[10px]">{obj.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Dimensions: Width, Height, Size Presets */}
      <div>
        <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
          <span>Element Dimensions</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSizePreset(180, 120)}
              className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            >
              Small
            </button>
            <button
              type="button"
              onClick={() => handleSizePreset(240, 160)}
              className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => handleSizePreset(320, 220)}
              className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            >
              Large
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-zinc-500 block mb-1">Width (px)</span>
            <input
              type="number"
              min="80"
              max="500"
              value={preview.width}
              onChange={(e) =>
                onUpdatePreview({ width: parseInt(e.target.value, 10) || 100 })
              }
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1.5 font-mono outline-none"
            />
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 block mb-1">Height (px)</span>
            <input
              type="number"
              min="40"
              max="400"
              value={preview.height}
              onChange={(e) =>
                onUpdatePreview({ height: parseInt(e.target.value, 10) || 100 })
              }
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1.5 font-mono outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Border Radius */}
      <div>
        <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
          <span>Border Radius</span>
          <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
            {preview.borderRadius}px
          </span>
        </div>

        <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1">
          {RADIUS_PRESETS.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => onUpdatePreview({ borderRadius: r.value })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                preview.borderRadius === r.value
                  ? 'bg-[#5722AF] text-white border-[#5722AF]'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={Math.min(100, preview.borderRadius)}
          onChange={(e) =>
            onUpdatePreview({ borderRadius: parseInt(e.target.value, 10) })
          }
          className="w-full accent-[#5722AF] cursor-pointer"
        />
      </div>

      {/* 4. Element Surface Color */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
          Element Surface Color
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="color"
            value={preview.elementBg}
            onChange={(e) => onUpdatePreview({ elementBg: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 p-0"
          />
          {ELEMENT_BG_OPTIONS.map((bg) => (
            <button
              key={bg.label}
              type="button"
              onClick={() => onUpdatePreview({ elementBg: bg.value })}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${
                preview.elementBg.toLowerCase() === bg.value.toLowerCase()
                  ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                  : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/20"
                style={{ backgroundColor: bg.value }}
              />
              <span>{bg.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
