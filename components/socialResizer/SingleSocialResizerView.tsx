'use client';

import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  FileImage,
  Loader2,
  Check,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import {
  SocialMediaConfig,
  SocialMediaItem,
  CropSettings,
  SocialMediaPreset,
  OutputFormat,
  FilenameOption,
} from '@/lib/socialMediaTypes';
import { processSocialMediaItem, getTargetDimensions } from '@/lib/socialMediaEngine';
import { formatBytes } from '@/lib/renameEngine';
import { PopularSizesBar } from './PopularSizesBar';
import { PlatformPresetSelector } from './PlatformPresetSelector';
import { SmartCropEditor } from './SmartCropEditor';
import { SelectedPresetCard } from './SelectedPresetCard';

interface SingleSocialResizerViewProps {
  item: SocialMediaItem;
  config: SocialMediaConfig;
  onConfigChange: (updated: Partial<SocialMediaConfig>) => void;
  onSelectPreset: (preset: SocialMediaPreset) => void;
  onCustomSizeChange: (w: number, h: number, unit: 'px' | 'percent') => void;
  onCropChange: (updated: Partial<CropSettings>) => void;
  onResetCrop: () => void;
  onClear: () => void;
  onAddMore: (files: File[]) => void;
}

export function SingleSocialResizerView({
  item,
  config,
  onConfigChange,
  onSelectPreset,
  onCustomSizeChange,
  onCropChange,
  onResetCrop,
  onClear,
  onAddMore,
}: SingleSocialResizerViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const { width: targetW, height: targetH } = getTargetDimensions(config);
  const isUpscaling = item.originalWidth < targetW || item.originalHeight < targetH;

  const handleDownload = async () => {
    setIsProcessing(true);
    setDownloadSuccess(false);

    try {
      const processed = await processSocialMediaItem(item, config);
      if (processed.processedUrl && processed.processedBlob) {
        const link = document.createElement('a');
        link.href = processed.processedUrl;
        link.download = processed.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Details & Quick Action Bar */}
      <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/30 flex items-center justify-center text-[#5722AF] dark:text-[#9B6BE8] shrink-0">
            <FileImage className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
              {item.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span>{formatBytes(item.originalSize)}</span>
              <span>•</span>
              <span>{item.originalWidth} × {item.originalHeight} px (Original)</span>
              <span>•</span>
              <span className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">
                → {targetW} × {targetH} px
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <label
            htmlFor="single-social-add-more-input"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </label>
          <input
            id="single-social-add-more-input"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAddMore(Array.from(e.target.files));
              }
            }}
            className="hidden"
          />

          <button
            type="button"
            onClick={onClear}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Remove</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isProcessing}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#5722AF] hover:bg-[#471a93] active:scale-[0.98] text-white shadow-md shadow-[#5722AF]/25 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resizing Image...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Resized Image</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selected Preset Card */}
      <SelectedPresetCard
        config={config}
        onChangeSize={() => {
          const el = document.getElementById('platform-preset-selector-box');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onCustomSize={() => {
          onCustomSizeChange(config.customWidth, config.customHeight, config.customUnit);
        }}
      />

      {/* Upscaling Warning Notice (if photo is smaller than target) */}
      {isUpscaling && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>This image is smaller than the selected size ({item.originalWidth} × {item.originalHeight} px vs. {targetW} × {targetH} px). Upscaling may reduce quality.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onCustomSizeChange(item.originalWidth, item.originalHeight, 'px')}
              className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-zinc-800 border border-amber-300 dark:border-zinc-700 hover:bg-amber-50 text-amber-900 dark:text-amber-100 transition-colors"
            >
              Keep original maximum size ({item.originalWidth} × {item.originalHeight} px)
            </button>
            <button
              type="button"
              onClick={() => onConfigChange({ doNotUpscale: false })}
              className="px-3 py-1.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
            >
              Allow upscaling
            </button>
          </div>
        </div>
      )}

      {/* Popular Sizes Quick Bar */}
      <PopularSizesBar activePresetId={config.presetId} onSelectPreset={onSelectPreset} />

      {/* Main Workspace Layout (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Smart Crop Editor (7 cols) */}
        <div className="lg:col-span-7">
          <SmartCropEditor
            item={item}
            config={config}
            onCropChange={onCropChange}
            onResetCrop={onResetCrop}
          />
        </div>

        {/* Right Column: Platform & Presets Selector + Export Settings (5 cols) */}
        <div id="platform-preset-selector-box" className="lg:col-span-5 space-y-4">
          <PlatformPresetSelector
            config={config}
            onSelectPreset={onSelectPreset}
            onCustomSizeChange={onCustomSizeChange}
          />

          {/* Export Settings Card */}
          <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <FileCheck className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Export & File Settings
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Output Dimensions display */}
              <div className="p-3 rounded-xl bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border border-[#5722AF]/20 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Output Dimensions:</span>
                <span className="font-mono text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8]">
                  {targetW} × {targetH} px
                </span>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Format
                </label>
                <select
                  value={config.outputFormat}
                  onChange={(e) => onConfigChange({ outputFormat: e.target.value as OutputFormat })}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                >
                  <option value="original">Original Format</option>
                  <option value="jpeg">JPG / JPEG (Standard Social Compatibility)</option>
                  <option value="png">PNG (Lossless Quality)</option>
                  <option value="webp">WebP (Modern Compact)</option>
                  <option value="avif">AVIF (Ultra-Efficient)</option>
                </select>
              </div>

              {/* Quality Slider */}
              {config.outputFormat !== 'png' && (
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    <span>Quality</span>
                    <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                      {config.quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    step={1}
                    value={config.quality}
                    onChange={(e) => onConfigChange({ quality: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                    <button
                      type="button"
                      onClick={() => onConfigChange({ quality: 100 })}
                      className="hover:text-zinc-700"
                    >
                      Maximum (100)
                    </button>
                    <button
                      type="button"
                      onClick={() => onConfigChange({ quality: 90 })}
                      className="hover:text-zinc-700"
                    >
                      High (90)
                    </button>
                    <button
                      type="button"
                      onClick={() => onConfigChange({ quality: 80 })}
                      className="hover:text-zinc-700"
                    >
                      Balanced (80)
                    </button>
                    <button
                      type="button"
                      onClick={() => onConfigChange({ quality: 65 })}
                      className="hover:text-zinc-700"
                    >
                      Smaller (65)
                    </button>
                  </div>
                  {config.quality < 65 && (
                    <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                      Lower quality can reduce file size but may make the image visibly softer or introduce compression artifacts.
                    </p>
                  )}
                </div>
              )}

              {/* Do not upscale checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.doNotUpscale}
                    onChange={(e) => onConfigChange({ doNotUpscale: e.target.checked })}
                    className="rounded accent-[#5722AF] w-4 h-4"
                  />
                  <span>Do not upscale smaller images</span>
                </label>
                <span className="text-[10px] text-zinc-400">Default: ON</span>
              </div>

              {/* Filename Option */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Filename Suffix / Tag
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={config.filenameOption}
                    onChange={(e) =>
                      onConfigChange({ filenameOption: e.target.value as FilenameOption })
                    }
                    className="text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="platform">Platform Tag (e.g. -instagram-1080x1350)</option>
                    <option value="suffix">Custom Suffix</option>
                    <option value="prefix">Custom Prefix</option>
                    <option value="original">Keep Exact Original Name</option>
                  </select>

                  {config.filenameOption === 'suffix' && (
                    <input
                      type="text"
                      value={config.customSuffix}
                      onChange={(e) => onConfigChange({ customSuffix: e.target.value })}
                      placeholder="-social"
                      className="flex-1 text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  )}

                  {config.filenameOption === 'prefix' && (
                    <input
                      type="text"
                      value={config.customPrefix}
                      onChange={(e) => onConfigChange({ customPrefix: e.target.value })}
                      placeholder="social-"
                      className="flex-1 text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
