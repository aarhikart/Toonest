'use client';

import React, { useState } from 'react';
import { PixelFileItem, PixelConfig, PixelCustomOverride } from '@/lib/pixelTypes';
import { X, Check, RotateCcw, Link as LinkIcon, Unlink } from 'lucide-react';
import { formatBytes } from '@/lib/renameEngine';

interface PixelPerItemModalProps {
  item: PixelFileItem;
  globalConfig: PixelConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (override: PixelCustomOverride | undefined) => void;
}

export function PixelPerItemModal({
  item,
  globalConfig,
  isOpen,
  onClose,
  onSave,
}: PixelPerItemModalProps) {
  const current = item.customOverride || {};
  const [width, setWidth] = useState(current.width ?? item.targetWidth ?? globalConfig.width);
  const [height, setHeight] = useState(current.height ?? item.targetHeight ?? globalConfig.height);
  const [maintainRatio, setMaintainRatio] = useState(
    current.maintainAspectRatio ?? globalConfig.maintainAspectRatio
  );
  const [mode, setMode] = useState(current.mode ?? globalConfig.mode);
  const [format, setFormat] = useState(current.outputFormat ?? globalConfig.outputFormat);
  const [quality, setQuality] = useState(current.quality ?? globalConfig.quality);

  if (!isOpen) return null;

  const handleWidthChange = (valStr: string) => {
    const w = parseInt(valStr, 10);
    if (isNaN(w) || w <= 0) {
      setWidth(0);
      return;
    }
    setWidth(w);
    if (maintainRatio && item.originalWidth > 0 && item.originalHeight > 0) {
      const aspect = item.originalWidth / item.originalHeight;
      setHeight(Math.max(1, Math.round(w / aspect)));
    }
  };

  const handleHeightChange = (valStr: string) => {
    const h = parseInt(valStr, 10);
    if (isNaN(h) || h <= 0) {
      setHeight(0);
      return;
    }
    setHeight(h);
    if (maintainRatio && item.originalWidth > 0 && item.originalHeight > 0) {
      const aspect = item.originalWidth / item.originalHeight;
      setWidth(Math.max(1, Math.round(h * aspect)));
    }
  };

  const handleSave = () => {
    const override: PixelCustomOverride = {
      width,
      height,
      maintainAspectRatio: maintainRatio,
      mode,
      outputFormat: format,
      quality,
    };
    onSave(override);
    onClose();
  };

  const handleResetToGlobal = () => {
    onSave(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131722] rounded-3xl max-w-lg w-full p-6 space-y-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Custom Settings for Image
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-sm mt-0.5">
              {item.originalName} ({item.originalWidth} × {item.originalHeight} px)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/80 dark:border-zinc-700/80">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={item.originalName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-zinc-800 dark:text-zinc-200">
              Original: {item.originalWidth} × {item.originalHeight} px
            </div>
            <div className="text-zinc-400">
              Size: {formatBytes(item.originalSize)} &bull; Ratio: {item.originalRatio}
            </div>
          </div>
        </div>

        {/* Width and Height */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Custom Width (px)
            </label>
            <input
              type="number"
              min="1"
              max="30000"
              value={width === 0 ? '' : width}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Custom Height (px)
            </label>
            <input
              type="number"
              min="1"
              max="30000"
              value={height === 0 ? '' : height}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
          </div>
        </div>

        {/* Maintain Aspect Ratio Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-xs">
          <div className="flex items-center gap-2">
            {maintainRatio ? (
              <LinkIcon className="w-4 h-4 text-[#5722AF]" />
            ) : (
              <Unlink className="w-4 h-4 text-zinc-400" />
            )}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Maintain Aspect Ratio
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMaintainRatio(!maintainRatio)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
              maintainRatio
                ? 'bg-[#5722AF] text-white'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
            }`}
          >
            {maintainRatio ? 'Locked' : 'Unlocked'}
          </button>
        </div>

        {/* Output Format */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Output Format
          </label>
          <div className="grid grid-cols-5 gap-1">
            {(['original', 'jpg', 'png', 'webp', 'avif'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`py-1.5 text-xs rounded-xl font-bold uppercase cursor-pointer ${
                  format === fmt
                    ? 'bg-[#5722AF] text-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleResetToGlobal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-600 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Global</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5722AF] hover:bg-[#7B45D1] transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Custom Override</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
