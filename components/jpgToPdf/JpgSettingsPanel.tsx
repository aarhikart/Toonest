'use client';

import React, { useState } from 'react';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Maximize2,
  FileText,
  Palette,
  Layers,
  Info,
  Tag,
  Shield,
} from 'lucide-react';
import {
  JpgToPdfConfig,
  PdfPageSize,
  PdfOrientation,
  ImageFitMode,
  MarginPreset,
  ImageAlignment,
  PdfCompressionMode,
} from '@/lib/jpgToPdfTypes';
import { PAGE_SIZES_PT, PT_TO_MM, sanitizeFilename } from '@/lib/jpgToPdfEngine';

interface JpgSettingsPanelProps {
  config: JpgToPdfConfig;
  onChangeConfig: (newConfig: JpgToPdfConfig) => void;
  totalImages: number;
}

export function JpgSettingsPanel({
  config,
  onChangeConfig,
  totalImages,
}: JpgSettingsPanelProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handlePageSizeChange = (size: PdfPageSize) => {
    onChangeConfig({ ...config, pageSize: size });
  };

  const handleOrientationChange = (orientation: PdfOrientation) => {
    onChangeConfig({ ...config, orientation });
  };

  const handleFitChange = (fit: ImageFitMode) => {
    onChangeConfig({ ...config, imageFit: fit });
  };

  const handleMarginPresetChange = (preset: MarginPreset) => {
    onChangeConfig({ ...config, marginPreset: preset });
  };

  const handleAlignmentChange = (alignment: ImageAlignment) => {
    onChangeConfig({ ...config, alignment });
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
            PDF Document Settings
          </h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] font-semibold">
          {config.separatePdfs ? 'Separate PDFs' : 'Single Combined PDF'}
        </span>
      </div>

      {/* 1. Page Size Selector (Section 9) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-zinc-700 dark:text-zinc-300">
            Page Size
          </label>
          <span className="text-[11px] text-zinc-400 font-mono">
            {config.pageSize.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
          {[
            { id: 'a4', label: 'A4' },
            { id: 'letter', label: 'Letter' },
            { id: 'a3', label: 'A3' },
            { id: 'a5', label: 'A5' },
            { id: 'legal', label: 'Legal' },
            { id: 'original', label: 'Fit Image' },
            { id: 'custom', label: 'Custom' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePageSizeChange(item.id as PdfPageSize)}
              className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                config.pageSize === item.id
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom Dimensions Input if Custom selected */}
        {config.pageSize === 'custom' && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-zinc-500 dark:text-zinc-400 block mb-1">
                Width (mm)
              </label>
              <input
                type="number"
                min={50}
                max={1500}
                value={config.customWidthMm}
                onChange={(e) =>
                  onChangeConfig({ ...config, customWidthMm: parseInt(e.target.value) || 210 })
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-zinc-500 dark:text-zinc-400 block mb-1">
                Height (mm)
              </label>
              <input
                type="number"
                min={50}
                max={1500}
                value={config.customHeightMm}
                onChange={(e) =>
                  onChangeConfig({ ...config, customHeightMm: parseInt(e.target.value) || 297 })
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Orientation (Section 10) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-zinc-700 dark:text-zinc-300">
            Page Orientation
          </label>
          <span className="text-[11px] text-zinc-400">
            Auto matches image aspect ratio
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
          {[
            { id: 'auto', label: 'Auto' },
            { id: 'portrait', label: 'Portrait' },
            { id: 'landscape', label: 'Landscape' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleOrientationChange(item.id as PdfOrientation)}
              className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                config.orientation === item.id
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Image Fit & Alignment (Sections 11 & 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Image Fit */}
        <div className="space-y-2">
          <label className="font-bold text-zinc-700 dark:text-zinc-300 text-xs block">
            Image Fit Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
            {[
              { id: 'fit', label: 'Fit Page' },
              { id: 'fill', label: 'Fill Page' },
              { id: 'original', label: 'Original' },
              { id: 'custom', label: 'Custom' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleFitChange(item.id as ImageFitMode)}
                className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  config.imageFit === item.id
                    ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom scale slider if custom fit */}
          {config.imageFit === 'custom' && (
            <div className="space-y-1 pt-1 text-xs">
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Scale</span>
                <span className="font-mono">{config.customScalePercent}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                value={config.customScalePercent}
                onChange={(e) =>
                  onChangeConfig({ ...config, customScalePercent: parseInt(e.target.value) })
                }
                className="w-full accent-[#5722AF]"
              />
            </div>
          )}
        </div>

        {/* Alignment */}
        <div className="space-y-2">
          <label className="font-bold text-zinc-700 dark:text-zinc-300 text-xs block">
            Image Alignment
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
            {[
              { id: 'center', label: 'Center' },
              { id: 'top', label: 'Top' },
              { id: 'bottom', label: 'Bottom' },
              { id: 'left', label: 'Left' },
              { id: 'right', label: 'Right' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAlignmentChange(item.id as ImageAlignment)}
                className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  config.alignment === item.id
                    ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Margins Selector (Section 12) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-zinc-700 dark:text-zinc-300">
            Page Margins
          </label>
          <span className="text-[11px] text-zinc-400">
            {config.marginPreset === 'none'
              ? '0 mm'
              : config.marginPreset === 'small'
              ? '5 mm'
              : config.marginPreset === 'medium'
              ? '10 mm (Standard)'
              : config.marginPreset === 'large'
              ? '20 mm'
              : 'Custom'}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
          {[
            { id: 'none', label: 'None' },
            { id: 'small', label: '5 mm' },
            { id: 'medium', label: '10 mm' },
            { id: 'large', label: '20 mm' },
            { id: 'custom', label: 'Custom' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleMarginPresetChange(item.id as MarginPreset)}
              className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                config.marginPreset === item.id
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {config.marginPreset === 'custom' && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 grid grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-zinc-400 text-[10px] block mb-1">Top (mm)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={config.customMarginsMm.top}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    customMarginsMm: {
                      ...config.customMarginsMm,
                      top: Math.max(0, parseInt(e.target.value) || 0),
                    },
                  })
                }
                className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-[10px] block mb-1">Right (mm)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={config.customMarginsMm.right}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    customMarginsMm: {
                      ...config.customMarginsMm,
                      right: Math.max(0, parseInt(e.target.value) || 0),
                    },
                  })
                }
                className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-[10px] block mb-1">Bottom (mm)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={config.customMarginsMm.bottom}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    customMarginsMm: {
                      ...config.customMarginsMm,
                      bottom: Math.max(0, parseInt(e.target.value) || 0),
                    },
                  })
                }
                className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-[10px] block mb-1">Left (mm)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={config.customMarginsMm.left}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    customMarginsMm: {
                      ...config.customMarginsMm,
                      left: Math.max(0, parseInt(e.target.value) || 0),
                    },
                  })
                }
                className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Output Mode Toggle: Combine vs Separate (Section 19) */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-zinc-700 dark:text-zinc-300 block">
            Create separate PDF for each image
          </span>
          <span className="text-[11px] text-zinc-400">
            Generate individual PDF files instead of one merged document
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChangeConfig({ ...config, separatePdfs: !config.separatePdfs })}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            config.separatePdfs
              ? 'bg-[#5722AF] text-white border-[#5722AF]'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
          }`}
        >
          {config.separatePdfs ? 'Separate Files' : 'One PDF'}
        </button>
      </div>

      {/* 6. Collapsible Advanced Settings (Section 20) */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center justify-between w-full text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced PDF Settings</span>
          </div>
          {isAdvancedOpen ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {isAdvancedOpen && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs animate-in fade-in duration-150">
            {/* Image Quality Control (Section 15) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Image Quality ({config.quality}%)
                </label>
                <span className="text-[11px] text-zinc-400">
                  Higher quality produces a larger PDF
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                value={config.quality}
                onChange={(e) =>
                  onChangeConfig({ ...config, quality: parseInt(e.target.value) })
                }
                className="w-full accent-[#5722AF] cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center text-[11px] font-semibold">
                {[
                  { label: 'Small (65)', val: 65 },
                  { label: 'Balanced (80)', val: 80 },
                  { label: 'High (90)', val: 90 },
                  { label: 'Max (95)', val: 95 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => onChangeConfig({ ...config, quality: p.val })}
                    className={`py-1 rounded cursor-pointer ${
                      config.quality === p.val
                        ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color Control (Section 14) */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Page Background Color
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, backgroundColor: '#ffffff' })}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                    config.backgroundColor.toLowerCase() === '#ffffff'
                      ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF]'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600'
                  }`}
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, backgroundColor: '#000000' })}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                    config.backgroundColor.toLowerCase() === '#000000'
                      ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF]'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600'
                  }`}
                >
                  Black
                </button>
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => onChangeConfig({ ...config, backgroundColor: e.target.value })}
                  className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            {/* PDF Filename Control (Section 17) */}
            <div className="space-y-2">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Output PDF Filename
              </label>
              <input
                type="text"
                value={config.filename}
                onChange={(e) =>
                  onChangeConfig({ ...config, filename: sanitizeFilename(e.target.value) })
                }
                placeholder="converted-images.pdf"
                className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-0.5">Prefix (Optional)</label>
                  <input
                    type="text"
                    value={config.filenamePrefix || ''}
                    onChange={(e) =>
                      onChangeConfig({ ...config, filenamePrefix: e.target.value })
                    }
                    placeholder="e.g. Doc"
                    className="w-full px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-0.5">Suffix (Optional)</label>
                  <input
                    type="text"
                    value={config.filenameSuffix || ''}
                    onChange={(e) =>
                      onChangeConfig({ ...config, filenameSuffix: e.target.value })
                    }
                    placeholder="e.g. final"
                    className="w-full px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Document Metadata (Section 21) */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Document Metadata
                </span>
                <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.removeMetadata}
                    onChange={(e) =>
                      onChangeConfig({ ...config, removeMetadata: e.target.checked })
                    }
                    className="rounded text-[#5722AF]"
                  />
                  <span>Strip all metadata</span>
                </label>
              </div>

              {!config.removeMetadata && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-0.5">Title</label>
                      <input
                        type="text"
                        value={config.metadata.title || ''}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            metadata: { ...config.metadata, title: e.target.value },
                          })
                        }
                        placeholder="e.g. Vacation Album"
                        className="w-full px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-0.5">Author</label>
                      <input
                        type="text"
                        value={config.metadata.author || ''}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            metadata: { ...config.metadata, author: e.target.value },
                          })
                        }
                        placeholder="e.g. John Doe"
                        className="w-full px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-0.5">Subject</label>
                      <input
                        type="text"
                        value={config.metadata.subject || ''}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            metadata: { ...config.metadata, subject: e.target.value },
                          })
                        }
                        placeholder="e.g. Photography Portfolio"
                        className="w-full px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-0.5">Keywords</label>
                      <input
                        type="text"
                        value={config.metadata.keywords || ''}
                        onChange={(e) =>
                          onChangeConfig({
                            ...config,
                            metadata: { ...config.metadata, keywords: e.target.value },
                          })
                        }
                        placeholder="e.g. photos, album, travel"
                        className="w-full px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
