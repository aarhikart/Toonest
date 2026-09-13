'use client';

import React from 'react';
import {
  ConversionSettings,
  QualityPreset,
} from '@/lib/converterTypes';
import { Sliders, AlertCircle, Sparkles, Shield, Palette } from 'lucide-react';

interface FormatSpecificSettingsProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  hasTransparency?: boolean;
}

export function FormatSpecificSettings({
  settings,
  onChange,
  hasTransparency = false,
}: FormatSpecificSettingsProps) {
  const updateSettings = (patch: Partial<ConversionSettings>) => {
    onChange({ ...settings, ...patch });
  };

  const handlePresetSelect = (preset: QualityPreset) => {
    let quality = settings.quality;
    if (preset === 'best') quality = 95;
    else if (preset === 'balanced') quality = 85;
    else if (preset === 'small') quality = 65;

    updateSettings({ preset, quality });
  };

  return (
    <div className="bg-zinc-50/70 dark:bg-[#161a26] p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-5">
      {/* Quality Presets Bar (for lossy formats: JPG, WebP, AVIF) */}
      {settings.targetFormat !== 'png' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Quality Preset
            </label>
            <span className="text-xs font-mono font-semibold text-[#5722AF] dark:text-[#9B6BE8]">
              {settings.quality}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'best', label: 'Best Quality', desc: '95% Quality' },
              { id: 'balanced', label: 'Balanced', desc: '85% Quality' },
              { id: 'small', label: 'Small File', desc: '65% Quality' },
              { id: 'custom', label: 'Custom', desc: 'Manual Slider' },
            ].map((p) => {
              const isSelected = settings.preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id as QualityPreset)}
                  className={`py-2 px-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#5722AF] bg-white dark:bg-[#1f2537] text-[#5722AF] dark:text-white shadow-xs font-bold'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-[#1a202e] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-xs">{p.label}</div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                    {p.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quality Slider (Visible for Custom or can adjust any preset) */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>More Compression (Smaller)</span>
              <span>Higher Fidelity (Larger)</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={settings.quality}
              onChange={(e) =>
                updateSettings({
                  quality: parseInt(e.target.value, 10),
                  preset: 'custom',
                })
              }
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
            />
          </div>
        </div>
      )}

      {/* Format-Specific Rules */}
      {/* 1. JPG Settings */}
      {settings.targetFormat === 'jpg' && (
        <div className="space-y-4 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.jpegProgressive}
                onChange={(e) => updateSettings({ jpegProgressive: e.target.checked })}
                className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
              />
              <span>Enable Progressive JPEG loading</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.removeMetadata}
                onChange={(e) => updateSettings({ removeMetadata: e.target.checked })}
                className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
              />
              <span>Strip EXIF metadata (reduces file size)</span>
            </label>
          </div>

          {/* Transparency Warning & Background Color Selection */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>JPG does not support transparency. Choose a background fill color:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 pl-6">
              {[
                { label: 'White', val: '#FFFFFF' },
                { label: 'Black', val: '#000000' },
                { label: 'Light Gray', val: '#F3F4F6' },
              ].map((bg) => (
                <button
                  key={bg.label}
                  type="button"
                  onClick={() => updateSettings({ backgroundColor: bg.val })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    settings.backgroundColor === bg.val
                      ? 'border-[#5722AF] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-xs'
                      : 'border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-zinc-300"
                    style={{ backgroundColor: bg.val }}
                  />
                  <span>{bg.label}</span>
                </button>
              ))}

              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <Palette className="w-3.5 h-3.5" />
                <span>Custom:</span>
                <input
                  type="color"
                  value={settings.backgroundColor || '#FFFFFF'}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-zinc-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PNG Settings */}
      {settings.targetFormat === 'png' && (
        <div className="space-y-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            PNG is completely lossless. Compression preserves exact pixel quality.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Compression Strategy
              </label>
              <select
                value={settings.pngCompression}
                onChange={(e) =>
                  updateSettings({
                    pngCompression: e.target.value as 'fast' | 'optimal',
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
              >
                <option value="optimal">Optimal (Max File Size Reduction)</option>
                <option value="fast">Fast (Instant Export)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={settings.removeMetadata}
                onChange={(e) => updateSettings({ removeMetadata: e.target.checked })}
                className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
              />
              <span>Remove metadata & color profiles</span>
            </label>
          </div>
        </div>
      )}

      {/* 3. WebP Settings */}
      {settings.targetFormat === 'webp' && (
        <div className="space-y-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.webpLossless}
                onChange={(e) => updateSettings({ webpLossless: e.target.checked })}
                className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
              />
              <span>Lossless WebP (highest quality, larger size)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.removeMetadata}
                onChange={(e) => updateSettings({ removeMetadata: e.target.checked })}
                className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
              />
              <span>Remove EXIF metadata</span>
            </label>
          </div>
        </div>
      )}

      {/* 4. AVIF Settings */}
      {settings.targetFormat === 'avif' && (
        <div className="space-y-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.removeMetadata}
                onChange={(e) => updateSettings({ removeMetadata: e.target.checked })}
                className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
              />
              <span>Remove metadata</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
