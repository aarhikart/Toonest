'use client';

import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  Maximize2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Check,
  Plus,
  Trash2,
  FileCode,
  Package,
  Layers,
  Undo,
  Redo,
  RotateCcw as ResetIcon,
  Sparkles,
} from 'lucide-react';
import {
  FaviconConfig,
  IconShape,
  BackgroundType,
  GradientType,
  ImageFit,
  PackageOptions,
} from '@/lib/faviconTypes';
import {
  FAVICON_SIZE_PRESETS,
  QUICK_PACKAGE_PRESETS,
} from '@/lib/faviconPresets';

interface FaviconControlsProps {
  config: FaviconConfig;
  onChange: (updated: Partial<FaviconConfig>) => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function FaviconControls({
  config,
  onChange,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: FaviconControlsProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'transform' | 'sizes' | 'manifest'>('appearance');

  // Custom size form
  const [customW, setCustomW] = useState(256);
  const [customH, setCustomH] = useState(256);

  const handleAddCustomSize = () => {
    const w = Math.max(16, Math.min(1024, customW));
    const h = Math.max(16, Math.min(1024, customH));

    if (config.customSizes.some((s) => s.width === w && s.height === h)) return;

    onChange({
      customSizes: [...config.customSizes, { width: w, height: h }],
    });
  };

  const handleRemoveCustomSize = (index: number) => {
    const updated = config.customSizes.filter((_, i) => i !== index);
    onChange({ customSizes: updated });
  };

  const toggleSizeId = (id: string) => {
    if (config.selectedSizeIds.includes(id)) {
      if (config.selectedSizeIds.length <= 1) return; // keep at least 1
      onChange({ selectedSizeIds: config.selectedSizeIds.filter((s) => s !== id) });
    } else {
      onChange({ selectedSizeIds: [...config.selectedSizeIds, id] });
    }
  };

  const applyQuickPreset = (sizeIds: string[]) => {
    onChange({ selectedSizeIds: sizeIds });
  };

  const updatePackageOption = (key: keyof PackageOptions, val: boolean) => {
    onChange({
      packageOptions: {
        ...config.packageOptions,
        [key]: val,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Top Toolbar: Tabs & Undo/Redo/Reset */}
      <div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-zinc-50/50 dark:bg-[#0f121a]">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-900 p-0.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'appearance'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Appearance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transform')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'transform'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Transform
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sizes')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sizes'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Sizes ({config.selectedSizeIds.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'manifest'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Manifest & Code
          </button>
        </div>

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onReset}
            title="Reset to default settings"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <ResetIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
        {/* ==================== TAB 1: APPEARANCE ==================== */}
        {activeTab === 'appearance' && (
          <div className="space-y-4">
            {/* Shape Mask */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Icon Shape Mask
              </label>
              <div className="grid grid-cols-5 gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                {(['original', 'square', 'rounded', 'circle', 'squircle'] as IconShape[]).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => onChange({ shape })}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      config.shape === shape
                        ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Radius (when rounded) */}
            {config.shape === 'rounded' && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Corner Radius</span>
                  <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                    {config.cornerRadius}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={config.cornerRadius}
                  onChange={(e) => onChange({ cornerRadius: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                />
              </div>
            )}

            {/* Background Mode */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Background Fill
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                {(['transparent', 'solid', 'gradient'] as BackgroundType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange({ backgroundType: type })}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      config.backgroundType === type
                        ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Solid Color Options */}
            {config.backgroundType === 'solid' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Solid Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => onChange({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => onChange({ backgroundColor: e.target.value })}
                    className="text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono w-28 bg-white dark:bg-zinc-800"
                  />
                  <div className="flex items-center gap-1 ml-auto">
                    {['#FFFFFF', '#000000', '#5722AF', '#0F172A'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onChange({ backgroundColor: c })}
                        style={{ backgroundColor: c }}
                        className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-600 shadow-2xs"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Gradient Options */}
            {config.backgroundType === 'gradient' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Gradient Style
                  </label>
                  <div className="flex items-center gap-1">
                    {(['linear', 'radial'] as GradientType[]).map((gt) => (
                      <button
                        key={gt}
                        type="button"
                        onClick={() => onChange({ gradientType: gt })}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          config.gradientType === gt
                            ? 'bg-[#5722AF] text-white'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        {gt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-500 block mb-1">Start</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.gradientStart}
                        onChange={(e) => onChange({ gradientStart: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={config.gradientStart}
                        onChange={(e) => onChange({ gradientStart: e.target.value })}
                        className="text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono w-20 bg-white dark:bg-zinc-800"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-500 block mb-1">End</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={config.gradientEnd}
                        onChange={(e) => onChange({ gradientEnd: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={config.gradientEnd}
                        onChange={(e) => onChange({ gradientEnd: e.target.value })}
                        className="text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono w-20 bg-white dark:bg-zinc-800"
                      />
                    </div>
                  </div>
                </div>

                {config.gradientType === 'linear' && (
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Angle</span>
                      <span className="font-mono text-[#5722AF]">{config.gradientAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={config.gradientAngle}
                      onChange={(e) => onChange({ gradientAngle: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: TRANSFORM ==================== */}
        {activeTab === 'transform' && (
          <div className="space-y-4">
            {/* Image Fit */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Image Fit
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                {(['contain', 'cover', 'custom'] as ImageFit[]).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => onChange({ imageFit: fit })}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      config.imageFit === fit
                        ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            {/* Padding Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Icon Padding</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.padding}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={config.padding}
                onChange={(e) => onChange({ padding: Number(e.target.value) })}
                className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
              />
            </div>

            {/* Zoom Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Zoom Scale</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.zoom}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={300}
                step={5}
                value={config.zoom}
                onChange={(e) => onChange({ zoom: Number(e.target.value) })}
                className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
              />
            </div>

            {/* Position Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  <span>Horizontal X</span>
                  <span className="font-mono text-[#5722AF]">{config.positionX}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.positionX}
                  onChange={(e) => onChange({ positionX: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  <span>Vertical Y</span>
                  <span className="font-mono text-[#5722AF]">{config.positionY}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.positionY}
                  onChange={(e) => onChange({ positionY: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Position Presets */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => onChange({ positionX: 50, positionY: 0 })}
                className="flex-1 py-1 rounded text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
              >
                Top
              </button>
              <button
                type="button"
                onClick={() => onChange({ positionX: 50, positionY: 50 })}
                className="flex-1 py-1 rounded text-[11px] font-bold text-[#5722AF] bg-white dark:bg-zinc-800 shadow-2xs"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => onChange({ positionX: 50, positionY: 100 })}
                className="flex-1 py-1 rounded text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
              >
                Bottom
              </button>
              <button
                type="button"
                onClick={() => onChange({ positionX: 0, positionY: 50 })}
                className="flex-1 py-1 rounded text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => onChange({ positionX: 100, positionY: 50 })}
                className="flex-1 py-1 rounded text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
              >
                Right
              </button>
            </div>

            {/* Rotation & Flips */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Orientation & Rotation
                </span>
                <span className="font-mono text-xs text-[#5722AF]">{config.rotation}°</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={config.rotation}
                  onChange={(e) => onChange({ rotation: Number(e.target.value) })}
                  className="flex-1 accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => onChange({ flipH: !config.flipH })}
                  title="Flip Horizontal"
                  className={`p-1.5 rounded-lg border transition-colors ${
                    config.flipH
                      ? 'bg-[#5722AF] text-white border-[#5722AF]'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ flipV: !config.flipV })}
                  title="Flip Vertical"
                  className={`p-1.5 rounded-lg border transition-colors ${
                    config.flipV
                      ? 'bg-[#5722AF] text-white border-[#5722AF]'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600'
                  }`}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Rotation Buttons */}
              <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-500">
                {[-90, -45, 0, 45, 90].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => onChange({ rotation: deg })}
                    className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 hover:border-[#5722AF]"
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: SIZES & PACKAGE ==================== */}
        {activeTab === 'sizes' && (
          <div className="space-y-4">
            {/* Quick Packages */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Quick Size Packages
              </label>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PACKAGE_PRESETS.map((qp) => (
                  <button
                    key={qp.id}
                    type="button"
                    onClick={() => applyQuickPreset(qp.sizeIds)}
                    className="p-2 text-left rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-[#5722AF]/5 transition-all"
                  >
                    <span className="block text-xs font-bold text-zinc-900 dark:text-white">
                      {qp.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                      {qp.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Standard Size Presets Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Included Favicon Formats & Dimensions
              </label>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {FAVICON_SIZE_PRESETS.map((preset) => {
                  const isChecked = config.selectedSizeIds.includes(preset.id);
                  return (
                    <label
                      key={preset.id}
                      className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all text-xs ${
                        isChecked
                          ? 'border-[#5722AF]/50 bg-[#5722AF]/5 dark:bg-[#5722AF]/10'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSizeId(preset.id)}
                          className="rounded accent-[#5722AF] w-3.5 h-3.5"
                        />
                        <div>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {preset.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 block">
                            {preset.filename}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {preset.recommendedFormat}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Custom Icon Dimensions Adder */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Add Custom Icon Size
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-zinc-400">W:</span>
                  <input
                    type="number"
                    min={16}
                    max={1024}
                    value={customW}
                    onChange={(e) => setCustomW(Number(e.target.value))}
                    className="w-16 text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-zinc-400">H:</span>
                  <input
                    type="number"
                    min={16}
                    max={1024}
                    value={customH}
                    onChange={(e) => setCustomH(Number(e.target.value))}
                    className="w-16 text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5722AF] text-white hover:bg-[#471a93] flex items-center gap-1 ml-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Custom sizes pills */}
              {config.customSizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {config.customSizes.map((cs, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono"
                    >
                      <span>{cs.width}×{cs.height}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomSize(i)}
                        className="text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Package Bundle Options */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                ZIP Package Contents
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'includeIco' as const, label: 'favicon.ico (Multi-res)' },
                  { key: 'includePng' as const, label: 'PNG Icons' },
                  { key: 'includeAppleTouch' as const, label: 'Apple Touch Icon' },
                  { key: 'includeAndroidPwa' as const, label: 'Android PWA Icons' },
                  { key: 'includeSvg' as const, label: 'favicon.svg Vector' },
                  { key: 'includeManifest' as const, label: 'site.webmanifest' },
                  { key: 'includeHtmlSnippet' as const, label: 'HTML Snippet' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.packageOptions[item.key]}
                      onChange={(e) => updatePackageOption(item.key, e.target.checked)}
                      className="rounded accent-[#5722AF] w-3.5 h-3.5"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300 text-[11px]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: MANIFEST & CODE ==================== */}
        {activeTab === 'manifest' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Website / App Title
                </label>
                <input
                  type="text"
                  value={config.websiteName}
                  onChange={(e) => onChange({ websiteName: e.target.value })}
                  placeholder="My Website"
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Short App Name (PWA)
                </label>
                <input
                  type="text"
                  value={config.shortName}
                  onChange={(e) => onChange({ shortName: e.target.value })}
                  placeholder="Website"
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.themeColor}
                      onChange={(e) => onChange({ themeColor: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.themeColor}
                      onChange={(e) => onChange({ themeColor: e.target.value })}
                      className="text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono w-24 bg-white dark:bg-zinc-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Manifest BG Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.manifestBgColor}
                      onChange={(e) => onChange({ manifestBgColor: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.manifestBgColor}
                      onChange={(e) => onChange({ manifestBgColor: e.target.value })}
                      className="text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono w-24 bg-white dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Filename Prefix (e.g. favicon)
                </label>
                <input
                  type="text"
                  value={config.filenamePrefix}
                  onChange={(e) => onChange({ filenamePrefix: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  placeholder="favicon"
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono"
                />
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  e.g. {config.filenamePrefix || 'favicon'}-16x16.png, {config.filenamePrefix || 'favicon'}-32x32.png
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
