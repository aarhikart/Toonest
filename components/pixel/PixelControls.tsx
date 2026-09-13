'use client';

import React, { useState, useEffect } from 'react';
import {
  PixelConfig,
  PixelResizeMode,
  CropPosition,
  OrientationOption,
  PixelPreset,
  PixelNamingMode,
  QualityPreset,
} from '@/lib/pixelTypes';
import {
  Link as LinkIcon,
  Unlink,
  Sliders,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Crop,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface PixelControlsProps {
  config: PixelConfig;
  onChange: (config: PixelConfig) => void;
  originalWidth?: number;
  originalHeight?: number;
  originalRatioStr?: string;
  hasTransparency?: boolean;
}

const BUILT_IN_PRESETS: PixelPreset[] = [
  // Social Media
  { id: 'ig-sq', name: 'Instagram Square (1080×1080)', category: 'social', width: 1080, height: 1080, mode: 'fill' },
  { id: 'ig-port', name: 'Instagram Portrait (1080×1350)', category: 'social', width: 1080, height: 1350, mode: 'fill' },
  { id: 'ig-story', name: 'Instagram Story (1080×1920)', category: 'social', width: 1080, height: 1920, mode: 'fill' },
  { id: 'fb-post', name: 'Facebook Post (1200×630)', category: 'social', width: 1200, height: 630, mode: 'fill' },
  { id: 'li-post', name: 'LinkedIn Post (1200×627)', category: 'social', width: 1200, height: 627, mode: 'fill' },
  { id: 'yt-thumb', name: 'YouTube Thumbnail (1280×720)', category: 'social', width: 1280, height: 720, mode: 'exact' },

  // Website
  { id: 'web-lg', name: 'Large (1920×1080)', category: 'website', width: 1920, height: 1080, mode: 'fit' },
  { id: 'web-desk', name: 'Desktop (1600×900)', category: 'website', width: 1600, height: 900, mode: 'fit' },
  { id: 'web-std', name: 'Standard (1280×720)', category: 'website', width: 1280, height: 720, mode: 'fit' },
  { id: 'web-med', name: 'Medium (1024×768)', category: 'website', width: 1024, height: 768, mode: 'fit' },
  { id: 'web-sm', name: 'Small (800×600)', category: 'website', width: 800, height: 600, mode: 'fit' },

  // Common Square & Standard Sizes
  { id: 'cm-500', name: 'Square 500×500', category: 'common', width: 500, height: 500, mode: 'fill' },
  { id: 'cm-800', name: 'Square 800×800', category: 'common', width: 800, height: 800, mode: 'fill' },
  { id: 'cm-1000', name: 'Square 1000×1000', category: 'common', width: 1000, height: 1000, mode: 'fill' },
  { id: 'cm-1200', name: 'Square 1200×1200', category: 'common', width: 1200, height: 1200, mode: 'fill' },
  { id: 'cm-2000', name: 'Square 2000×2000', category: 'common', width: 2000, height: 2000, mode: 'fill' },
];

export function PixelControls({
  config,
  onChange,
  originalWidth = 1920,
  originalHeight = 1080,
  originalRatioStr = '16:9',
  hasTransparency = false,
}: PixelControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presetTab, setPresetTab] = useState<'social' | 'website' | 'common' | 'custom'>('social');
  const [customPresets, setCustomPresets] = useState<PixelPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showAddPreset, setShowAddPreset] = useState(false);

  // Load custom presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolnest_pixel_presets');
      if (stored) {
        setCustomPresets(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: PixelPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      category: 'custom',
      width: config.width,
      height: config.height,
      mode: config.mode,
    };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('toolnest_pixel_presets', JSON.stringify(updated));
    } catch (e) {}
    setNewPresetName('');
    setShowAddPreset(false);
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('toolnest_pixel_presets', JSON.stringify(updated));
    } catch (e) {}
  };

  const applyPreset = (preset: PixelPreset) => {
    onChange({
      ...config,
      width: preset.width,
      height: preset.height,
      mode: preset.mode || config.mode,
    });
  };

  // Width change handler
  const handleWidthChange = (valStr: string) => {
    const w = parseInt(valStr, 10);
    if (isNaN(w) || w <= 0) {
      onChange({ ...config, width: 0 });
      return;
    }

    if (config.maintainAspectRatio && originalWidth > 0 && originalHeight > 0) {
      const aspect = originalWidth / originalHeight;
      const h = Math.max(1, Math.round(w / aspect));
      onChange({ ...config, width: w, height: h });
    } else {
      onChange({ ...config, width: w });
    }
  };

  // Height change handler
  const handleHeightChange = (valStr: string) => {
    const h = parseInt(valStr, 10);
    if (isNaN(h) || h <= 0) {
      onChange({ ...config, height: 0 });
      return;
    }

    if (config.maintainAspectRatio && originalWidth > 0 && originalHeight > 0) {
      const aspect = originalWidth / originalHeight;
      const w = Math.max(1, Math.round(h * aspect));
      onChange({ ...config, width: w, height: h });
    } else {
      onChange({ ...config, height: h });
    }
  };

  // Maintain aspect ratio toggle handler
  const handleToggleAspectRatio = () => {
    const nextLocked = !config.maintainAspectRatio;
    if (nextLocked && originalWidth > 0 && originalHeight > 0 && config.width > 0) {
      const aspect = originalWidth / originalHeight;
      const h = Math.max(1, Math.round(config.width / aspect));
      onChange({ ...config, maintainAspectRatio: true, height: h });
    } else {
      onChange({ ...config, maintainAspectRatio: nextLocked });
    }
  };

  // Check distortion
  const isRatioDistorted =
    !config.maintainAspectRatio &&
    config.mode === 'exact' &&
    originalWidth > 0 &&
    originalHeight > 0 &&
    config.width > 0 &&
    config.height > 0 &&
    Math.abs(config.width / config.height - originalWidth / originalHeight) > 0.05;

  // Quality presets mapping
  const setQualityPreset = (preset: QualityPreset) => {
    let q = config.quality;
    if (preset === 'max') q = 100;
    else if (preset === 'high') q = 90;
    else if (preset === 'balanced') q = 80;
    else if (preset === 'small') q = 60;

    onChange({
      ...config,
      qualityPreset: preset,
      quality: q,
    });
  };

  const percentageOptions = [25, 50, 75, 100, 125, 150, 200];

  return (
    <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* 1. Header & Main Title */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Pixel Dimensions</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Set exact width &amp; height in pixels
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]">
          Ratio: {originalRatioStr}
        </span>
      </div>

      {/* 2. Core Width & Height Inputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Width Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Width</span>
              <span className="text-[10px] text-zinc-400 font-normal">Orig: {originalWidth} px</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                max="30000"
                value={config.width === 0 ? '' : config.width}
                onChange={(e) => handleWidthChange(e.target.value)}
                placeholder="1920"
                className="w-full text-base sm:text-lg font-bold px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF] transition-all"
              />
              <span className="absolute right-4 text-xs font-bold text-zinc-400 pointer-events-none uppercase">
                px
              </span>
            </div>
          </div>

          {/* Height Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Height</span>
              <span className="text-[10px] text-zinc-400 font-normal">Orig: {originalHeight} px</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                max="30000"
                value={config.height === 0 ? '' : config.height}
                onChange={(e) => handleHeightChange(e.target.value)}
                placeholder="1080"
                className="w-full text-base sm:text-lg font-bold px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF] transition-all"
              />
              <span className="absolute right-4 text-xs font-bold text-zinc-400 pointer-events-none uppercase">
                px
              </span>
            </div>
          </div>
        </div>

        {/* Maintain Aspect Ratio Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-[#161b26] border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleAspectRatio}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                config.maintainAspectRatio
                  ? 'bg-[#5722AF] text-white'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
              }`}
              title={config.maintainAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
            >
              {config.maintainAspectRatio ? (
                <LinkIcon className="w-4 h-4" />
              ) : (
                <Unlink className="w-4 h-4" />
              )}
            </button>
            <div>
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Maintain aspect ratio
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {config.maintainAspectRatio
                  ? 'Locked: Width and height scale proportionally'
                  : 'Unlocked: Enter width and height independently'}
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.maintainAspectRatio}
              onChange={handleToggleAspectRatio}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5722AF]" />
          </label>
        </div>

        {/* Distortion Warning */}
        {isRatioDistorted && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
            <div>
              <span className="font-semibold">Aspect ratio distortion:</span> The entered dimensions deviate from original ratio ({originalRatioStr}). Image will be stretched unless you select &quot;Fit Within&quot; or &quot;Fill Dimensions&quot;.
            </div>
          </div>
        )}
      </div>

      {/* 3. Resize Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
          Resize Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(
            [
              { id: 'exact', label: 'Exact Dimensions', desc: 'Direct W × H' },
              { id: 'fit', label: 'Fit Within', desc: 'Contain bounds' },
              { id: 'fill', label: 'Fill Dimensions', desc: 'Cover & crop' },
              { id: 'percentage', label: 'Percentage', desc: 'Scale by %' },
              { id: 'longest', label: 'Longest Side', desc: 'Max edge' },
              { id: 'shortest', label: 'Shortest Side', desc: 'Min edge' },
            ] as const
          ).map((m) => {
            const isActive = config.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChange({ ...config, mode: m.id })}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#5722AF]/10 border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8] font-bold shadow-xs'
                    : 'bg-zinc-50 dark:bg-[#181d2a] border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                <div className="text-xs font-bold leading-tight">{m.label}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{m.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Mode Controls */}
        {config.mode === 'percentage' && (
          <div className="p-3 bg-zinc-50 dark:bg-[#181d2a] rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2.5">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Quick Percentages</span>
            <div className="flex flex-wrap gap-1.5">
              {percentageOptions.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onChange({ ...config, percentage: pct })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    config.percentage === pct
                      ? 'bg-[#5722AF] text-white shadow-xs'
                      : 'bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={config.percentage}
                onChange={(e) => onChange({ ...config, percentage: Number(e.target.value) })}
                className="w-full accent-[#5722AF] cursor-pointer"
              />
              <span className="text-xs font-mono font-bold w-12 text-right text-[#5722AF]">
                {config.percentage}%
              </span>
            </div>
          </div>
        )}

        {config.mode === 'fill' && (
          <div className="p-3 bg-zinc-50 dark:bg-[#181d2a] rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Crop className="w-3.5 h-3.5 text-[#5722AF]" />
              <span>Crop Anchor Position</span>
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {(['center', 'top', 'bottom', 'left', 'right'] as CropPosition[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => onChange({ ...config, cropPosition: pos })}
                  className={`py-1.5 text-xs rounded-xl font-medium capitalize transition-all cursor-pointer ${
                    config.cropPosition === pos
                      ? 'bg-[#5722AF] text-white shadow-xs'
                      : 'bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        )}

        {(config.mode === 'longest' || config.mode === 'shortest') && (
          <div className="p-3 bg-zinc-50 dark:bg-[#181d2a] rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              {config.mode === 'longest' ? 'Target Longest Side (px)' : 'Target Shortest Side (px)'}
            </label>
            <input
              type="number"
              min="10"
              max="30000"
              value={config.mode === 'longest' ? config.longestSide : config.shortestSide}
              onChange={(e) => {
                const val = Number(e.target.value) || 1080;
                if (config.mode === 'longest') onChange({ ...config, longestSide: val });
                else onChange({ ...config, shortestSide: val });
              }}
              className="w-full px-3 py-2 rounded-xl text-sm font-bold bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
          </div>
        )}
      </div>

      {/* 4. Quick Pixel Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Quick Sizes
          </label>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-[11px] font-semibold">
            {(['social', 'website', 'common', 'custom'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPresetTab(tab)}
                className={`px-2 py-0.5 rounded-lg capitalize transition-all cursor-pointer ${
                  presetTab === tab
                    ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {presetTab !== 'custom' ? (
            BUILT_IN_PRESETS.filter((p) => p.category === presetTab).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50 dark:bg-[#181d2a] hover:bg-[#5722AF]/5 hover:border-[#5722AF]/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-[#5722AF] truncate">
                  {preset.name}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  {preset.width} × {preset.height} px
                </div>
              </button>
            ))
          ) : (
            <>
              {customPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#181d2a]"
                >
                  <button
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="text-left flex-1 truncate cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {preset.width} × {preset.height} px
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCustomPreset(preset.id)}
                    className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Delete preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {showAddPreset ? (
                <div className="col-span-1 sm:col-span-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex gap-2">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Preset Name (e.g. My Banner)"
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={saveCustomPreset}
                    className="px-3 py-1 bg-[#5722AF] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPreset(false)}
                    className="px-2 py-1 text-zinc-500 text-xs rounded-lg cursor-pointer hover:bg-zinc-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddPreset(true)}
                  className="col-span-1 sm:col-span-2 p-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/5 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Current Dimensions as Preset</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 5. Smart Resize: Do not upscale smaller images */}
      <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#161b26] border border-zinc-200/80 dark:border-zinc-800 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Do not upscale smaller images
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            If an image is smaller than target dimensions, keep its original resolution to avoid pixelation.
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={config.doNotUpscale}
            onChange={(e) => onChange({ ...config, doNotUpscale: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5722AF]" />
        </label>
      </div>

      {/* 6. Advanced Settings Accordion */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors cursor-pointer py-1"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced Settings (Orientation, Quality, Format &amp; Naming)</span>
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in">
            {/* Orientation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Orientation
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['original', 'landscape', 'portrait', 'square'] as OrientationOption[]).map((ori) => (
                  <button
                    key={ori}
                    type="button"
                    onClick={() => onChange({ ...config, orientation: ori })}
                    className={`py-2 text-xs rounded-xl font-medium capitalize transition-all cursor-pointer ${
                      config.orientation === ori
                        ? 'bg-[#5722AF] text-white shadow-xs'
                        : 'bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    {ori}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Quality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Image Quality</span>
                <span className="font-mono font-bold text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.quality}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'max', label: 'Max (100%)' },
                    { id: 'high', label: 'High (90%)' },
                    { id: 'balanced', label: 'Balanced (80%)' },
                    { id: 'small', label: 'Small (60%)' },
                  ] as const
                ).map((qp) => (
                  <button
                    key={qp.id}
                    type="button"
                    onClick={() => setQualityPreset(qp.id)}
                    className={`py-1.5 text-[11px] rounded-xl font-semibold transition-all cursor-pointer ${
                      config.qualityPreset === qp.id
                        ? 'bg-[#5722AF] text-white shadow-xs'
                        : 'bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={config.quality}
                onChange={(e) =>
                  onChange({
                    ...config,
                    quality: Number(e.target.value),
                    qualityPreset: 'custom',
                  })
                }
                className="w-full accent-[#5722AF] cursor-pointer mt-1"
              />
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Output Format
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['original', 'jpg', 'png', 'webp', 'avif'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => onChange({ ...config, outputFormat: fmt })}
                    className={`py-2 text-xs rounded-xl font-bold uppercase transition-all cursor-pointer ${
                      config.outputFormat === fmt
                        ? 'bg-[#5722AF] text-white shadow-xs'
                        : 'bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {/* Background Color for JPG */}
              {config.outputFormat === 'jpg' && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200 dark:border-zinc-700 text-xs">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Background Fill Color</span>
                    <span className="text-[10px] text-zinc-400">Replaces transparent pixels when saving to JPG</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-600 bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {config.backgroundColor}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Output Filename Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Output Filename Format
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'suffix', label: 'Add Suffix (-resized)' },
                    { id: 'dimensions', label: 'Add Dimensions (-1920x1080)' },
                    { id: 'original', label: 'Keep Original Name' },
                    { id: 'prefix', label: 'Add Prefix (resized-)' },
                  ] as const
                ).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => onChange({ ...config, namingMode: n.id })}
                    className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                      config.namingMode === n.id
                        ? 'bg-[#5722AF]/10 border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8]'
                        : 'bg-zinc-50 dark:bg-[#181d2a] border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    {n.label}
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
