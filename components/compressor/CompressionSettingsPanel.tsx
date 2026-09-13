'use client';

import React, { useState } from 'react';
import {
  CompressionSettings,
  QualityPreset,
  TargetSizeOption,
  OutputFormatOption,
} from '@/lib/compressorTypes';
import {
  Sliders,
  Sparkles,
  Maximize2,
  Tag,
  Shield,
  Palette,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CompressionSettingsPanelProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
  hasTransparency?: boolean;
}

export function CompressionSettingsPanel({
  settings,
  onChange,
  hasTransparency = false,
}: CompressionSettingsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (patch: Partial<CompressionSettings>) => {
    onChange({ ...settings, ...patch });
  };

  const updateResize = (patch: Partial<CompressionSettings['resize']>) => {
    onChange({
      ...settings,
      resize: { ...settings.resize, ...patch },
    });
  };

  const updateNaming = (patch: Partial<CompressionSettings['naming']>) => {
    onChange({
      ...settings,
      naming: { ...settings.naming, ...patch },
    });
  };

  const handlePresetSelect = (preset: QualityPreset) => {
    let q = settings.quality;
    if (preset === 'max') q = 92;
    else if (preset === 'balanced') q = 80;
    else if (preset === 'small') q = 60;

    update({ preset, quality: q });
  };

  // Quality guidance text
  let qualityNote = 'Balanced compression with great visual clarity.';
  if (settings.quality >= 90) {
    qualityNote = 'Very high quality — minimal compression artifacts.';
  } else if (settings.quality < 50) {
    qualityNote = 'Maximum compression — aggressive size reduction.';
  } else if (settings.quality < 75) {
    qualityNote = 'Smaller file size — ideal for high-traffic web pages.';
  }

  return (
    <div className="bg-zinc-50/70 dark:bg-[#161a26] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-6">
      {/* 1. Quality Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Compression Quality Preset
          </label>
          <span className="text-xs font-mono font-bold text-[#5722AF] dark:text-[#9B6BE8]">
            Quality: {settings.quality}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'max', label: 'Maximum Quality', desc: '92% Quality' },
            { id: 'balanced', label: 'Balanced', desc: '80% Quality (Recommended)' },
            { id: 'small', label: 'Small File', desc: '60% Quality' },
            { id: 'custom', label: 'Custom', desc: 'Manual Slider' },
          ].map((p) => {
            const isSelected = settings.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p.id as QualityPreset)}
                className={`py-2.5 px-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#5722AF] bg-white dark:bg-[#1f2537] text-[#5722AF] dark:text-white shadow-xs font-bold ring-1 ring-[#5722AF]'
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

        {/* Quality Slider & Dynamic Guidance */}
        <div className="pt-2 space-y-1.5">
          <input
            type="range"
            min="1"
            max="100"
            value={settings.quality}
            onChange={(e) =>
              update({
                quality: parseInt(e.target.value, 10),
                preset: 'custom',
              })
            }
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
          />
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{qualityNote}</span>
            <span className="font-mono">{settings.quality}%</span>
          </div>
          {settings.quality < 45 && settings.preventExcessiveLoss && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium pt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Very aggressive compression may noticeably reduce image quality.</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Target File Size & Output Format Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
        {/* Target File Size */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Target File Size (Optional Solver)
          </label>
          <select
            value={settings.targetSize}
            onChange={(e) =>
              update({ targetSize: e.target.value as TargetSizeOption })
            }
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
          >
            <option value="none">No Limit (Compress by Quality)</option>
            <option value="5mb">Target: 5 MB</option>
            <option value="2mb">Target: 2 MB</option>
            <option value="1mb">Target: 1 MB</option>
            <option value="500kb">Target: 500 KB</option>
            <option value="250kb">Target: 250 KB</option>
          </select>
          <p className="text-[11px] text-zinc-400">
            Compressor will automatically find the closest quality meeting this limit.
          </p>
        </div>

        {/* Output Format */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Output Format
          </label>
          <select
            value={settings.outputFormat}
            onChange={(e) =>
              update({ outputFormat: e.target.value as OutputFormatOption })
            }
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
          >
            <option value="original">Keep Original Format</option>
            <option value="webp">WebP (High Compression)</option>
            <option value="jpg">JPG / JPEG</option>
            <option value="png">PNG (Lossless)</option>
            <option value="avif">AVIF (Next-Gen)</option>
          </select>
          <p className="text-[11px] text-zinc-400">
            Converting to WebP often yields 30%+ additional reduction.
          </p>
        </div>
      </div>

      {/* Transparency Alert if JPG selected */}
      {(settings.outputFormat === 'jpg' || (settings.outputFormat === 'original' && hasTransparency)) && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2">
          <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>This format does not support transparency. Choose a background fill color:</span>
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
                onClick={() => update({ backgroundColor: bg.val })}
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
          </div>
        </div>
      )}

      {/* Smart Safeguards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.skipIfLarger}
            onChange={(e) => update({ skipIfLarger: e.target.checked })}
            className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
          />
          <span>Skip if compression makes file larger</span>
        </label>

        <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
          <span>Min. Savings Threshold:</span>
          <select
            value={settings.minSavingsPercent}
            onChange={(e) =>
              update({ minSavingsPercent: parseInt(e.target.value, 10) })
            }
            className="px-2 py-1 text-xs bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-lg"
          >
            <option value={0}>Any reduction</option>
            <option value={1}>At least 1%</option>
            <option value={5}>At least 5%</option>
            <option value={10}>At least 10%</option>
            <option value={20}>At least 20%</option>
          </select>
        </div>
      </div>

      {/* 3. Expandable Advanced Controls (Resize, Metadata, Naming) */}
      <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] transition-colors py-1"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#5722AF]" />
            <span>Advanced Settings (Resize, Metadata & Filenames)</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-5 animate-in fade-in duration-150">
            {/* Smart Resize */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.resize.enabled}
                    onChange={(e) => updateResize({ enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5722AF]"
                  />
                  <span>Resize Image</span>
                </label>
              </div>

              {settings.resize.enabled && (
                <div className="space-y-3 pl-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-zinc-500">Scale:</span>
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() =>
                          updateResize({
                            percentage: pct,
                            width: undefined,
                            height: undefined,
                          })
                        }
                        className={`px-2.5 py-1 text-xs rounded-lg border font-mono ${
                          settings.resize.percentage === pct
                            ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-zinc-400">Target Width</label>
                      <input
                        type="number"
                        placeholder="1920"
                        value={settings.resize.width || ''}
                        onChange={(e) =>
                          updateResize({
                            width: parseInt(e.target.value, 10) || undefined,
                            percentage: undefined,
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400">Target Height</label>
                      <input
                        type="number"
                        placeholder="1080"
                        value={settings.resize.height || ''}
                        onChange={(e) =>
                          updateResize({
                            height: parseInt(e.target.value, 10) || undefined,
                            percentage: undefined,
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                    <div className="flex items-center pt-4">
                      <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.resize.preventUpscale}
                          onChange={(e) =>
                            updateResize({ preventUpscale: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#5722AF]"
                        />
                        <span>Do not upscale smaller images</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Option */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.removeMetadata}
                  onChange={(e) => update({ removeMetadata: e.target.checked })}
                  className="w-4 h-4 rounded text-[#5722AF]"
                />
                <span>Remove EXIF metadata (recommended for smaller file sizes)</span>
              </label>
            </div>

            {/* Naming Option */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Output Filename Suffix
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'original', label: 'Keep Original', desc: 'photo.jpg' },
                  { id: 'suffix', label: 'Add -compressed', desc: 'photo-compressed.jpg' },
                  { id: 'custom', label: 'Custom Suffix', desc: 'photo-min.jpg' },
                  { id: 'numbered', label: 'Numbered', desc: '001.jpg' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      updateNaming({
                        mode: opt.id as CompressionSettings['naming']['mode'],
                      })
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      settings.naming.mode === opt.id
                        ? 'border-[#5722AF] bg-white dark:bg-[#1a202e] text-[#5722AF] font-bold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600'
                    }`}
                  >
                    <div className="text-xs">{opt.label}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
