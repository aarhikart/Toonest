'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Palette,
  Maximize2,
  FileText,
  Layers,
} from 'lucide-react';
import {
  PdfConversionConfig,
  DpiPreset,
  QualityPreset,
} from '@/lib/pdfToJpgTypes';

interface PdfSettingsPanelProps {
  config: PdfConversionConfig;
  onChangeConfig: (newConfig: PdfConversionConfig) => void;
  samplePageWidth?: number;  // original pt width (e.g. 595 for A4)
  samplePageHeight?: number; // original pt height (e.g. 842 for A4)
}

export function PdfSettingsPanel({
  config,
  onChangeConfig,
  samplePageWidth = 595,
  samplePageHeight = 842,
}: PdfSettingsPanelProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Calculate estimated dimensions at current DPI
  const dpiScale = config.dpi / 72;
  let estimatedWidth = Math.round(samplePageWidth * dpiScale);
  let estimatedHeight = Math.round(samplePageHeight * dpiScale);

  if (config.resizeMode === 'percent' && config.resizePercent !== 100) {
    estimatedWidth = Math.round(estimatedWidth * (config.resizePercent / 100));
    estimatedHeight = Math.round(estimatedHeight * (config.resizePercent / 100));
  } else if (config.resizeMode === 'width' && config.resizeWidth) {
    estimatedWidth = config.resizeWidth;
    estimatedHeight = config.maintainAspectRatio
      ? Math.round(estimatedWidth * (samplePageHeight / samplePageWidth))
      : config.resizeHeight || estimatedHeight;
  } else if (config.resizeMode === 'height' && config.resizeHeight) {
    estimatedHeight = config.resizeHeight;
    estimatedWidth = config.maintainAspectRatio
      ? Math.round(estimatedHeight * (samplePageWidth / samplePageHeight))
      : config.resizeWidth || estimatedWidth;
  }

  const handleQualityPreset = (preset: QualityPreset) => {
    switch (preset) {
      case 'max':
        onChangeConfig({ ...config, quality: 95 });
        break;
      case 'high':
        onChangeConfig({ ...config, quality: 90 });
        break;
      case 'balanced':
        onChangeConfig({ ...config, quality: 80 });
        break;
      case 'small':
        onChangeConfig({ ...config, quality: 65 });
        break;
    }
  };

  const handleDpiPreset = (val: number) => {
    onChangeConfig({ ...config, dpi: val });
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
            Conversion Settings
          </h3>
        </div>
        {/* Format Selector Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => onChangeConfig({ ...config, outputFormat: 'jpg' })}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              config.outputFormat === 'jpg'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            JPG
          </button>
          <button
            type="button"
            onClick={() => onChangeConfig({ ...config, outputFormat: 'png' })}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              config.outputFormat === 'png'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            PNG
          </button>
        </div>
      </div>

      {/* Primary Grid: Quality / Lossless Info & DPI Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.outputFormat === 'jpg' ? (
          /* 1. JPG Quality Control */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                JPG Quality ({config.quality}%)
              </label>
              <span className="text-[11px] text-zinc-400">
                Higher quality = larger file
              </span>
            </div>

            <input
              type="range"
              min={30}
              max={100}
              value={config.quality}
              onChange={(e) => onChangeConfig({ ...config, quality: parseInt(e.target.value) })}
              className="w-full accent-[#5722AF] cursor-pointer"
            />

            {/* Quality Presets */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
              {[
                { id: 'small', label: 'Small', val: 65 },
                { id: 'balanced', label: 'Balanced', val: 80 },
                { id: 'high', label: 'High', val: 90 },
                { id: 'max', label: 'Max', val: 95 },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQualityPreset(p.id as QualityPreset)}
                  className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                    config.quality === p.val
                      ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Lossless PNG Quality Info */
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Lossless PNG Compression
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Pixel-Perfect
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
              PNG preserves sharp text, diagram linework, and transparent backgrounds with zero compression artifacts.
            </p>
          </div>
        )}

        {/* 2. Resolution / DPI (Section 11) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-zinc-700 dark:text-zinc-300">
              Resolution ({config.dpi} DPI)
            </label>
            <span className="text-[11px] text-zinc-400">
              Sharpness & Clarity
            </span>
          </div>

          {/* DPI Presets */}
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
            {[72, 96, 150, 200, 300].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleDpiPreset(val)}
                className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  config.dpi === val
                    ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <Info className="w-3 h-3 text-zinc-400 shrink-0" />
            <span>Higher DPI produces sharper images but increases file size.</span>
          </p>
        </div>
      </div>

      {/* Estimated Dimensions Banner (Section 12) */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">
          Estimated Output Dimensions ({config.outputFormat.toUpperCase()}):
        </span>
        <span className="font-bold font-mono text-[#5722AF] dark:text-[#9B6BE8]">
          {estimatedWidth} × {estimatedHeight} px
        </span>
      </div>

      {/* Transparent Background Option for PNG */}
      {config.outputFormat === 'png' && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-zinc-700 dark:text-zinc-300 block">
              Transparent Background
            </span>
            <span className="text-[11px] text-zinc-400">
              Preserve transparent canvas for logos and vector graphics
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onChangeConfig({ ...config, transparentBackground: !config.transparentBackground })
            }
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              config.transparentBackground
                ? 'bg-[#5722AF] text-white border-[#5722AF]'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            {config.transparentBackground ? 'Transparent ON' : 'Opaque White'}
          </button>
        </div>
      )}

      {/* Background Color Control (when opaque) */}
      {(!config.transparentBackground || config.outputFormat === 'jpg') && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-zinc-700 dark:text-zinc-300 block">
              Background Fill Color
            </span>
            <span className="text-[11px] text-zinc-400">
              Fills background beneath document elements (default: White)
            </span>
          </div>

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
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => onChangeConfig({ ...config, backgroundColor: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-white dark:bg-zinc-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings Collapsible (Section 15 & 16) */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors cursor-pointer"
        >
          <span>Advanced Options (Resizing & Naming)</span>
          {isAdvancedOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {isAdvancedOpen && (
          <div className="mt-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-3.5 text-xs animate-in fade-in duration-150">
            {/* Custom Resizing */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Custom Output Resizing
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'original', label: 'Original Size' },
                  { id: 'percent', label: 'By Percent' },
                  { id: 'width', label: 'Exact Width' },
                  { id: 'height', label: 'Exact Height' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onChangeConfig({ ...config, resizeMode: mode.id as any })}
                    className={`py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                      config.resizeMode === mode.id
                        ? 'bg-[#5722AF] text-white'
                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {config.resizeMode === 'percent' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-zinc-500">Scale Percentage:</span>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={config.resizePercent}
                    onChange={(e) =>
                      onChangeConfig({ ...config, resizePercent: parseInt(e.target.value) || 100 })
                    }
                    className="w-20 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none font-mono"
                  />
                  <span>%</span>
                </div>
              )}

              {config.resizeMode === 'width' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-zinc-500">Target Width:</span>
                  <input
                    type="number"
                    min={100}
                    max={8000}
                    value={config.resizeWidth || estimatedWidth}
                    onChange={(e) =>
                      onChangeConfig({ ...config, resizeWidth: parseInt(e.target.value) || 1000 })
                    }
                    className="w-24 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none font-mono"
                  />
                  <span>px</span>
                </div>
              )}

              {config.resizeMode === 'height' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-zinc-500">Target Height:</span>
                  <input
                    type="number"
                    min={100}
                    max={8000}
                    value={config.resizeHeight || estimatedHeight}
                    onChange={(e) =>
                      onChangeConfig({ ...config, resizeHeight: parseInt(e.target.value) || 1000 })
                    }
                    className="w-24 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none font-mono"
                  />
                  <span>px</span>
                </div>
              )}
            </div>

            {/* Output Naming Settings (Section 16) */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Filename Pattern
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pdf-name', label: 'Keep PDF Name' },
                  { id: 'custom-prefix', label: 'Custom Prefix' },
                  { id: 'custom-suffix', label: 'Custom Suffix' },
                ].map((pat) => (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => onChangeConfig({ ...config, namingPattern: pat.id as any })}
                    className={`py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                      config.namingPattern === pat.id
                        ? 'bg-[#5722AF] text-white'
                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>

              {config.namingPattern === 'custom-prefix' && (
                <input
                  type="text"
                  placeholder="e.g. document-export"
                  value={config.customPrefix}
                  onChange={(e) => onChangeConfig({ ...config, customPrefix: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none text-zinc-900 dark:text-white mt-1"
                />
              )}

              {/* Number padding */}
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span className="text-zinc-500">Number Padding:</span>
                {[
                  { pad: 1, sample: '1' },
                  { pad: 2, sample: '01' },
                  { pad: 3, sample: '001' },
                  { pad: 4, sample: '0001' },
                ].map((p) => (
                  <button
                    key={p.pad}
                    type="button"
                    onClick={() => onChangeConfig({ ...config, numberPadding: p.pad })}
                    className={`px-2 py-0.5 rounded font-mono ${
                      config.numberPadding === p.pad
                        ? 'bg-[#5722AF] text-white font-bold'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {p.sample}
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
