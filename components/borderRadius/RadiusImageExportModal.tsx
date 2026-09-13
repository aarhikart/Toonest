'use client';

import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, Check } from 'lucide-react';
import { BorderRadiusConfig } from '@/lib/borderRadius/borderRadiusTypes';
import { exportRadiusPreviewToCanvas } from '@/lib/borderRadius/borderRadiusEngine';

interface RadiusImageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BorderRadiusConfig;
}

const DIMENSION_PRESETS = [
  { label: 'Standard (800 × 800)', w: 800, h: 800 },
  { label: 'Social / Dribbble (1200 × 900)', w: 1200, h: 900 },
  { label: 'HD 16:9 (1920 × 1080)', w: 1920, h: 1080 },
  { label: 'Open Graph (1200 × 630)', w: 1200, h: 630 },
];

export function RadiusImageExportModal({
  isOpen,
  onClose,
  config,
}: RadiusImageExportModalProps) {
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [transparentBg, setTransparentBg] = useState(false);
  const [quality, setQuality] = useState(95);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const defaultFilename = `border-radius-${(config.name || 'shape')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')}`;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportRadiusPreviewToCanvas(
        config,
        width,
        height,
        format,
        format === 'image/png' && transparentBg,
        quality / 100
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const ext = format === 'image/png' ? 'png' : 'jpg';
      link.href = url;
      link.download = `${defaultFilename}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export image. Please check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E1E2A] rounded-2xl max-w-lg w-full border border-gray-200 dark:border-[#2D2D3F] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2D2D3F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#5722AF]/10 text-[#5722AF]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Export Shape as Image
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Render and download a high-res raster image of your custom border radius
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#252536] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Format Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('image/png')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  format === 'image/png'
                    ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/15 text-[#5722AF] shadow-xs'
                    : 'border-gray-200 dark:border-[#2D2D3F] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252536]'
                }`}
              >
                PNG (Lossless &amp; Alpha)
              </button>
              <button
                type="button"
                onClick={() => setFormat('image/jpeg')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  format === 'image/jpeg'
                    ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/15 text-[#5722AF] shadow-xs'
                    : 'border-gray-200 dark:border-[#2D2D3F] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252536]'
                }`}
              >
                JPG (Compressed)
              </button>
            </div>
          </div>

          {/* Dimension Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Dimensions Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DIMENSION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setWidth(preset.w);
                    setHeight(preset.h);
                  }}
                  className={`text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    width === preset.w && height === preset.h
                      ? 'border-[#5722AF] bg-[#5722AF]/5 text-[#5722AF] dark:bg-[#5722AF]/15 font-bold'
                      : 'border-gray-200 dark:border-[#2D2D3F] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#252536]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Width & Height */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Width (px)
              </label>
              <input
                type="number"
                min="200"
                max="3840"
                value={width}
                onChange={(e) =>
                  setWidth(Math.max(200, Math.min(3840, Number(e.target.value) || 200)))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2D2D3F] bg-white dark:bg-[#12121A] text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-[#5722AF]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                Height (px)
              </label>
              <input
                type="number"
                min="200"
                max="3840"
                value={height}
                onChange={(e) =>
                  setHeight(Math.max(200, Math.min(3840, Number(e.target.value) || 200)))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2D2D3F] bg-white dark:bg-[#12121A] text-sm text-gray-900 dark:text-white focus:outline-hidden focus:border-[#5722AF]"
              />
            </div>
          </div>

          {/* PNG: Transparent Background Toggle */}
          {format === 'image/png' && (
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Transparent Background
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Exclude canvas background for clean PNG alpha cutout
                </div>
              </div>
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
                className="w-4 h-4 text-[#5722AF] rounded-sm focus:ring-[#5722AF] cursor-pointer"
              />
            </div>
          )}

          {/* JPG: Quality Slider */}
          {format === 'image/jpeg' && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  JPEG Quality
                </span>
                <span className="font-mono text-[#5722AF]">{quality}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 dark:bg-[#181824] border-t border-gray-100 dark:border-[#2D2D3F] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#491B93] hover:to-[#6A3ABF] text-white text-xs font-semibold shadow-md shadow-[#5722AF]/20 transition-all disabled:opacity-50"
          >
            {exportSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Downloaded!</span>
              </>
            ) : isExporting ? (
              <span>Generating Canvas...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
