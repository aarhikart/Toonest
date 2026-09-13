'use client';

import React, { useState } from 'react';
import {
  ConversionSettings,
  CropPreset,
  ResizeMethod,
} from '@/lib/converterTypes';
import {
  Maximize2,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';

interface TransformSettingsProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  originalWidth?: number;
  originalHeight?: number;
}

export function TransformSettings({
  settings,
  onChange,
  originalWidth = 1920,
  originalHeight = 1080,
}: TransformSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateResize = (patch: Partial<ConversionSettings['resize']>) => {
    onChange({
      ...settings,
      resize: { ...settings.resize, ...patch },
    });
  };

  const updateCrop = (patch: Partial<ConversionSettings['crop']>) => {
    onChange({
      ...settings,
      crop: { ...settings.crop, ...patch },
    });
  };

  const updateTransform = (patch: Partial<ConversionSettings['transform']>) => {
    onChange({
      ...settings,
      transform: { ...settings.transform, ...patch },
    });
  };

  // Calculate live preview output dimensions
  let previewW = originalWidth;
  let previewH = originalHeight;

  if (settings.crop.enabled && settings.crop.preset !== 'free') {
    let r = 1;
    if (settings.crop.preset === '1:1') r = 1;
    else if (settings.crop.preset === '4:3') r = 4 / 3;
    else if (settings.crop.preset === '16:9') r = 16 / 9;
    else if (settings.crop.preset === '3:2') r = 3 / 2;
    else if (settings.crop.preset === '9:16') r = 9 / 16;

    if (originalWidth / originalHeight > r) {
      previewW = Math.round(originalHeight * r);
    } else {
      previewH = Math.round(originalWidth / r);
    }
  }

  if (settings.resize.enabled) {
    if (settings.resize.percentage) {
      previewW = Math.round(previewW * (settings.resize.percentage / 100));
      previewH = Math.round(previewH * (settings.resize.percentage / 100));
    } else if (settings.resize.width && !settings.resize.height) {
      previewH = Math.round((previewH / previewW) * settings.resize.width);
      previewW = settings.resize.width;
    } else if (settings.resize.height && !settings.resize.width) {
      previewW = Math.round((previewW / previewH) * settings.resize.height);
      previewH = settings.resize.height;
    } else if (settings.resize.width && settings.resize.height) {
      if (settings.resize.maintainAspectRatio) {
        const ratio = Math.min(
          settings.resize.width / previewW,
          settings.resize.height / previewH
        );
        previewW = Math.round(previewW * ratio);
        previewH = Math.round(previewH * ratio);
      } else {
        previewW = settings.resize.width;
        previewH = settings.resize.height;
      }
    }
  }

  const isRotated =
    settings.transform.rotate === 90 || settings.transform.rotate === 270;
  const finalW = isRotated ? previewH : previewW;
  const finalH = isRotated ? previewW : previewH;

  const hasModifications =
    settings.resize.enabled ||
    settings.crop.enabled ||
    settings.transform.rotate !== 0 ||
    settings.transform.flipH ||
    settings.transform.flipV;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#131722] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-[#161a26] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Resize, Crop, Rotate & Flip</span>
              {hasModifications && (
                <span className="w-2 h-2 rounded-full bg-[#5722AF]" />
              )}
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Live dimension: {finalW} × {finalH} px
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-6 animate-in fade-in duration-150">
          {/* 1. Resize Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.resize.enabled}
                  onChange={(e) => updateResize({ enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
                />
                <span>Enable Image Resizing</span>
              </label>

              {settings.resize.enabled && (
                <span className="text-xs font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {finalW} × {finalH} px
                </span>
              )}
            </div>

            {settings.resize.enabled && (
              <div className="space-y-3 pl-6 pt-1">
                {/* Percentage Quick Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-zinc-500">Scale Presets:</span>
                  {[25, 50, 75, 100, 150, 200].map((pct) => (
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
                      className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-all ${
                        settings.resize.percentage === pct
                          ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Custom Dimensions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400">Target Width (px)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1920"
                      value={settings.resize.width || ''}
                      onChange={(e) =>
                        updateResize({
                          width: parseInt(e.target.value, 10) || undefined,
                          percentage: undefined,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400">Target Height (px)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1080"
                      value={settings.resize.height || ''}
                      onChange={(e) =>
                        updateResize({
                          height: parseInt(e.target.value, 10) || undefined,
                          percentage: undefined,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700"
                    />
                  </div>
                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.resize.maintainAspectRatio}
                        onChange={(e) =>
                          updateResize({ maintainAspectRatio: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-[#5722AF]"
                      />
                      <span>Maintain Aspect Ratio</span>
                    </label>
                  </div>
                </div>

                {/* Max Bounds */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-zinc-400">Max Width (optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2560"
                      value={settings.resize.maxWidth || ''}
                      onChange={(e) =>
                        updateResize({
                          maxWidth: parseInt(e.target.value, 10) || undefined,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400">Max Height (optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1440"
                      value={settings.resize.maxHeight || ''}
                      onChange={(e) =>
                        updateResize({
                          maxHeight: parseInt(e.target.value, 10) || undefined,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Crop Section */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.crop.enabled}
                  onChange={(e) => updateCrop({ enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
                />
                <span>Crop Image (Aspect Ratio)</span>
              </label>
            </div>

            {settings.crop.enabled && (
              <div className="flex flex-wrap gap-2 pl-6">
                {[
                  { label: 'Free Crop', val: 'free' },
                  { label: '1:1 Square', val: '1:1' },
                  { label: '4:3 Standard', val: '4:3' },
                  { label: '16:9 Widescreen', val: '16:9' },
                  { label: '3:2 Classic', val: '3:2' },
                  { label: '9:16 Vertical', val: '9:16' },
                ].map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    onClick={() => updateCrop({ preset: c.val as CropPreset })}
                    className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                      settings.crop.preset === c.val
                        ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Rotate & Flip Section */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Rotate & Flip
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateTransform({
                    rotate: (settings.transform.rotate + 90) % 360,
                  })
                }
                className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 90° CW</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateTransform({
                    rotate: (settings.transform.rotate + 270) % 360,
                  })
                }
                className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rotate 90° CCW</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateTransform({ flipH: !settings.transform.flipH })
                }
                className={`px-3 py-1.5 text-xs rounded-xl border flex items-center gap-1.5 transition-colors ${
                  settings.transform.flipH
                    ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Flip Horizontal</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateTransform({ flipV: !settings.transform.flipV })
                }
                className={`px-3 py-1.5 text-xs rounded-xl border flex items-center gap-1.5 transition-colors ${
                  settings.transform.flipV
                    ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>Flip Vertical</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
