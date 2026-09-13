'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Image as ImageIcon,
  Check,
  Sparkles,
} from 'lucide-react';
import { GradientConfig, DimensionPreset } from '@/lib/gradient/gradientTypes';
import {
  SOCIAL_MEDIA_PRESETS,
  exportGradientToCanvasBlob,
} from '@/lib/gradient/gradientEngine';

interface ImageExportModalProps {
  config: GradientConfig;
  onClose: () => void;
}

export function ImageExportModal({ config, onClose }: ImageExportModalProps) {
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(630);
  const [quality, setQuality] = useState<number>(95);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleSelectPreset = (preset: DimensionPreset) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const blob = await exportGradientToCanvasBlob(
        config,
        width,
        height,
        format,
        quality / 100
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'image/png' ? 'png' : 'jpg';
      a.download = `${config.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${width}x${height}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Download Gradient Image
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Export high-resolution PNG or JPG rendered client-side
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Format Selector */}
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Image Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('image/png')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                  format === 'image/png'
                    ? 'bg-[#5722AF] text-white border-[#5722AF]'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                PNG (Lossless & Alpha)
              </button>
              <button
                type="button"
                onClick={() => setFormat('image/jpeg')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                  format === 'image/jpeg'
                    ? 'bg-[#5722AF] text-white border-[#5722AF]'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                JPG (Smaller File Size)
              </button>
            </div>
          </div>

          {/* JPG Quality slider if JPG */}
          {format === 'image/jpeg' && (
            <div>
              <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>JPEG Compression Quality</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">{quality}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>
          )}

          {/* Social Media & Wallpaper Dimension Presets */}
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Dimension Presets
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {SOCIAL_MEDIA_PRESETS.map((p) => {
                const isSelected = width === p.width && height === p.height;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#5722AF]/10 border-[#5722AF] text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] font-bold'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="truncate font-semibold">{p.label}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {p.width} × {p.height}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Width & Height */}
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Custom Dimensions (px)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-zinc-500 block mb-1">Width</span>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={width}
                  onChange={(e) => setWidth(Math.max(10, parseInt(e.target.value, 10) || 100))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono outline-none"
                />
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 block mb-1">Height</span>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={height}
                  onChange={(e) => setHeight(Math.max(10, parseInt(e.target.value, 10) || 100))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            {width} × {height} px
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] text-white font-bold text-xs shadow-md hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Rendering...' : 'Download Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
