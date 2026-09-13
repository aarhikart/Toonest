'use client';

import React, { useState, useEffect } from 'react';
import {
  ResizeConfig,
  ResizeMode,
  ResizeUnit,
  CropPosition,
  OrientationMode,
  PresetItem,
} from '@/lib/resizerTypes';
import {
  Link as LinkIcon,
  Unlink,
  Maximize2,
  Sliders,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ResizeControlsProps {
  config: ResizeConfig;
  onChange: (config: ResizeConfig) => void;
  originalWidth?: number;
  originalHeight?: number;
  originalRatioStr?: string;
  hasTransparency?: boolean;
}

const BUILT_IN_PRESETS: PresetItem[] = [
  // Social
  { id: 'ig-post', name: 'Instagram Post', category: 'social', width: 1080, height: 1080, mode: 'fill' },
  { id: 'ig-portrait', name: 'Instagram Portrait', category: 'social', width: 1080, height: 1350, mode: 'fill' },
  { id: 'ig-story', name: 'Instagram Story', category: 'social', width: 1080, height: 1920, mode: 'fill' },
  { id: 'fb-post', name: 'Facebook Post', category: 'social', width: 1200, height: 630, mode: 'fill' },
  { id: 'yt-thumb', name: 'YouTube Thumbnail', category: 'social', width: 1280, height: 720, mode: 'exact' },
  // Web
  { id: 'web-lg', name: 'Web Large', category: 'web', width: 1920, height: 1080, mode: 'fit' },
  { id: 'web-desktop', name: 'Desktop', category: 'web', width: 1600, height: 900, mode: 'fit' },
  { id: 'web-std', name: 'Web Standard', category: 'web', width: 1280, height: 720, mode: 'fit' },
  { id: 'web-med', name: 'Web Medium', category: 'web', width: 1024, height: 576, mode: 'fit' },
  { id: 'web-sm', name: 'Web Small', category: 'web', width: 800, height: 450, mode: 'fit' },
  // Profile
  { id: 'prof-400', name: 'Avatar 400×400', category: 'profile', width: 400, height: 400, mode: 'fill' },
  { id: 'prof-800', name: 'Avatar 800×800', category: 'profile', width: 800, height: 800, mode: 'fill' },
];

export function ResizeControls({
  config,
  onChange,
  originalWidth = 1920,
  originalHeight = 1080,
  originalRatioStr = '16:9',
  hasTransparency = false,
}: ResizeControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPresets, setCustomPresets] = useState<PresetItem[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showAddPreset, setShowAddPreset] = useState(false);

  // Load custom presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolnest_resize_presets');
      if (stored) {
        setCustomPresets(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const newP: PresetItem = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      category: 'custom',
      width: config.width || 1200,
      height: config.height || 800,
      mode: config.mode,
    };
    const updated = [...customPresets, newP];
    setCustomPresets(updated);
    localStorage.setItem('toolnest_resize_presets', JSON.stringify(updated));
    setNewPresetName('');
    setShowAddPreset(false);
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('toolnest_resize_presets', JSON.stringify(updated));
  };

  const update = (patch: Partial<ResizeConfig>) => {
    onChange({ ...config, ...patch });
  };

  // Original aspect ratio decimal
  const aspectDecimal = originalWidth / (originalHeight || 1);

  // Handle Width change with ratio lock
  const handleWidthChange = (w: number) => {
    if (config.maintainAspectRatio && aspectDecimal > 0) {
      const h = Math.round(w / aspectDecimal);
      update({ width: w, height: h });
    } else {
      update({ width: w });
    }
  };

  // Handle Height change with ratio lock
  const handleHeightChange = (h: number) => {
    if (config.maintainAspectRatio && aspectDecimal > 0) {
      const w = Math.round(h * aspectDecimal);
      update({ width: w, height: h });
    } else {
      update({ height: h });
    }
  };

  const applyPreset = (preset: PresetItem) => {
    update({
      width: preset.width,
      height: preset.height,
      mode: preset.mode || config.mode,
    });
  };

  return (
    <div className="bg-zinc-50/70 dark:bg-[#161a26] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-6">
      {/* 1. Dimensions & Aspect Ratio Lock */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-[#5722AF]" />
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Target Dimensions
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">
              Original: {originalWidth} × {originalHeight} px ({originalRatioStr})
            </span>
          </div>
        </div>

        {/* Inputs & Lock Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Width Input */}
          <div className="sm:col-span-5 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
              <span>Width</span>
              <span>{config.unit}</span>
            </div>
            <input
              type="number"
              min="1"
              max="16000"
              value={config.width || ''}
              onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
              placeholder="e.g. 1920"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono focus:border-[#5722AF]"
            />
          </div>

          {/* Aspect Ratio Lock Button */}
          <div className="sm:col-span-2 flex justify-center pt-4 sm:pt-4">
            <button
              type="button"
              onClick={() =>
                update({ maintainAspectRatio: !config.maintainAspectRatio })
              }
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
                config.maintainAspectRatio
                  ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]'
                  : 'border-zinc-300 text-zinc-400 hover:border-zinc-400'
              }`}
              title={
                config.maintainAspectRatio
                  ? 'Aspect Ratio Locked'
                  : 'Aspect Ratio Unlocked'
              }
            >
              {config.maintainAspectRatio ? (
                <>
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-[10px] hidden md:inline">Locked</span>
                </>
              ) : (
                <>
                  <Unlink className="w-4 h-4" />
                  <span className="text-[10px] hidden md:inline">Free</span>
                </>
              )}
            </button>
          </div>

          {/* Height Input */}
          <div className="sm:col-span-5 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
              <span>Height</span>
              <span>{config.unit}</span>
            </div>
            <input
              type="number"
              min="1"
              max="16000"
              value={config.height || ''}
              onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
              placeholder="e.g. 1080"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono focus:border-[#5722AF]"
            />
          </div>
        </div>

        {/* Distortion Warning if unlocked */}
        {!config.maintainAspectRatio && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Unlocking the aspect ratio may stretch or distort the image.</span>
          </div>
        )}
      </div>

      {/* 2. Resize Mode Selector */}
      <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Resize Method
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'exact', label: 'Exact Size', desc: 'Direct dimensions' },
            { id: 'fit', label: 'Fit Within', desc: 'Keep ratio inside box' },
            { id: 'fill', label: 'Fill & Crop', desc: 'Crop excess edges' },
            { id: 'percentage', label: 'Percentage', desc: 'Scale by %' },
            { id: 'longest', label: 'Longest Side', desc: 'Max side constraint' },
            { id: 'shortest', label: 'Shortest Side', desc: 'Min side constraint' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => update({ mode: m.id as ResizeMode })}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                config.mode === m.id
                  ? 'border-[#5722AF] bg-white dark:bg-[#1a202e] text-[#5722AF] dark:text-[#9B6BE8] font-bold shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-[#131722] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
              }`}
            >
              <div className="text-xs">{m.label}</div>
              <div className="text-[10px] text-zinc-400 font-normal truncate">
                {m.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Percentage Quick Pills if mode is percentage */}
        {config.mode === 'percentage' && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">Quick Percentages:</span>
            {[25, 50, 75, 100, 125, 150, 200].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => update({ percentage: pct })}
                className={`px-2.5 py-1 text-xs rounded-lg border font-mono ${
                  config.percentage === pct
                    ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        )}

        {/* Longest Side input */}
        {config.mode === 'longest' && (
          <div className="pt-2">
            <label className="text-xs text-zinc-500">Longest Side (px):</label>
            <input
              type="number"
              value={config.longestSide || 1920}
              onChange={(e) =>
                update({ longestSide: parseInt(e.target.value, 10) || 1920 })
              }
              className="mt-1 w-48 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700"
            />
          </div>
        )}

        {/* Shortest Side input */}
        {config.mode === 'shortest' && (
          <div className="pt-2">
            <label className="text-xs text-zinc-500">Shortest Side (px):</label>
            <input
              type="number"
              value={config.shortestSide || 1080}
              onChange={(e) =>
                update({ shortestSide: parseInt(e.target.value, 10) || 1080 })
              }
              className="mt-1 w-48 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700"
            />
          </div>
        )}

        {/* Crop Anchor Position if mode is fill */}
        {config.mode === 'fill' && (
          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs text-zinc-500">Crop Anchor:</span>
            {(['center', 'top', 'bottom', 'left', 'right'] as CropPosition[]).map(
              (pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => update({ cropPosition: pos })}
                  className={`px-2.5 py-1 text-xs rounded-lg capitalize border ${
                    config.cropPosition === pos
                      ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600'
                  }`}
                >
                  {pos}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* 3. Quick Presets & Custom Presets */}
      <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Quick Presets
          </label>
          <button
            type="button"
            onClick={() => setShowAddPreset(!showAddPreset)}
            className="text-xs font-semibold text-[#5722AF] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Save Current as Custom</span>
          </button>
        </div>

        {/* Add Preset Form */}
        {showAddPreset && (
          <div className="p-3 rounded-xl bg-white dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
            <input
              type="text"
              placeholder="Preset Name (e.g. My Blog Header)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700"
            />
            <button
              type="button"
              onClick={saveCustomPreset}
              className="px-3 py-1.5 text-xs font-bold bg-[#5722AF] text-white rounded-lg"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAddPreset(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Preset Pills */}
        <div className="flex flex-wrap gap-1.5">
          {/* Custom Presets */}
          {customPresets.map((p) => (
            <div
              key={p.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-[#5722AF]/10 text-[#5722AF] border border-[#5722AF]/20"
            >
              <button
                type="button"
                onClick={() => applyPreset(p)}
                className="font-bold hover:underline"
              >
                {p.name} ({p.width}×{p.height})
              </button>
              <button
                type="button"
                onClick={() => deleteCustomPreset(p.id)}
                className="text-rose-500 hover:text-rose-700"
                title="Delete preset"
              >
                ×
              </button>
            </div>
          ))}

          {/* Built-in Presets */}
          {BUILT_IN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-[#1a202e] text-zinc-700 dark:text-zinc-300 hover:border-[#5722AF] transition-colors"
            >
              {p.name} ({p.width}×{p.height})
            </button>
          ))}
        </div>
      </div>

      {/* 4. Smart Safeguards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={config.doNotUpscale}
            onChange={(e) => update({ doNotUpscale: e.target.checked })}
            className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
          />
          <span>Do not upscale smaller images (prevent quality loss)</span>
        </label>

        {/* Orientation Selector */}
        <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
          <span>Orientation:</span>
          <select
            value={config.orientation}
            onChange={(e) =>
              update({ orientation: e.target.value as OrientationMode })
            }
            className="px-2 py-1 text-xs bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-lg"
          >
            <option value="original">Original</option>
            <option value="landscape">Force Landscape</option>
            <option value="portrait">Force Portrait</option>
            <option value="square">Force Square</option>
          </select>
        </div>
      </div>

      {/* 5. Expandable Advanced: Rotate, Quality, Format & Naming */}
      <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] transition-colors py-1"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#5722AF]" />
            <span>Advanced (Rotate, Quality, Output Format & Naming)</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in duration-150">
            {/* Rotate & Flip */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Rotate & Flip
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => update({ rotate: (config.rotate + 90) % 360 })}
                  className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>90° CW</span>
                </button>
                <button
                  type="button"
                  onClick={() => update({ rotate: (config.rotate + 270) % 360 })}
                  className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>90° CCW</span>
                </button>
                <button
                  type="button"
                  onClick={() => update({ flipH: !config.flipH })}
                  className={`px-3 py-1.5 text-xs rounded-xl border flex items-center gap-1.5 ${
                    config.flipH
                      ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                      : 'border-zinc-200'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>
                <button
                  type="button"
                  onClick={() => update({ flipV: !config.flipV })}
                  className={`px-3 py-1.5 text-xs rounded-xl border flex items-center gap-1.5 ${
                    config.flipV
                      ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] font-bold'
                      : 'border-zinc-200'
                  }`}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>
              </div>
            </div>

            {/* Output Format & Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Output Format
                </label>
                <select
                  value={config.outputFormat}
                  onChange={(e) =>
                    update({ outputFormat: e.target.value as any })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
                >
                  <option value="original">Keep Original Format</option>
                  <option value="webp">WebP</option>
                  <option value="jpg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="avif">AVIF</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span>Output Quality</span>
                  <span className="font-mono">{config.quality}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={config.quality}
                  onChange={(e) =>
                    update({ quality: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
                />
              </div>
            </div>

            {/* Transparency background if JPG */}
            {config.outputFormat === 'jpg' && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                <span>JPG does not support transparency. Default fill:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor || '#FFFFFF'}
                    onChange={(e) => update({ backgroundColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border border-zinc-300"
                  />
                  <span>White (#FFFFFF)</span>
                </div>
              </div>
            )}

            {/* Naming Options */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Output Filename Suffix
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'original', label: 'Keep Original', desc: 'photo.jpg' },
                  { id: 'suffix', label: 'Add -resized', desc: 'photo-resized.jpg' },
                  { id: 'custom', label: 'Custom Suffix', desc: 'photo-web.jpg' },
                  { id: 'numbered', label: 'Numbered', desc: 'image-001.jpg' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      update({
                        naming: {
                          ...config.naming,
                          mode: opt.id as any,
                        },
                      })
                    }
                    className={`p-2 rounded-xl border text-left text-xs ${
                      config.naming.mode === opt.id
                        ? 'border-[#5722AF] bg-white dark:bg-[#1a202e] text-[#5722AF] font-bold shadow-xs'
                        : 'border-zinc-200 text-zinc-600'
                    }`}
                  >
                    <div>{opt.label}</div>
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
