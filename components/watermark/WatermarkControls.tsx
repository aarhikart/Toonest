'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Type,
  Image as ImageIcon,
  Grid3X3,
  RotateCw,
  Copy,
  Layers,
  Sparkles,
  Sliders,
  Bookmark,
  Trash2,
  Plus,
  FileCheck,
  Check,
  Move,
  Undo2,
} from 'lucide-react';
import {
  WatermarkConfig,
  WatermarkPosition,
  TextEffect,
  OutputFormat,
  FilenameOption,
  WatermarkPreset,
  BUILT_IN_PRESETS,
} from '@/lib/watermarkTypes';

interface WatermarkControlsProps {
  config: WatermarkConfig;
  onChange: (updated: Partial<WatermarkConfig>) => void;
  onReset: () => void;
  onApplyPreset: (presetConfig: Partial<WatermarkConfig>) => void;
  isCustomOverride?: boolean;
}

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Inter / Sans', value: 'Inter, system-ui' },
];

const POSITION_GRID: { label: string; value: WatermarkPosition }[] = [
  { label: 'TL', value: 'top-left' },
  { label: 'TC', value: 'top-center' },
  { label: 'TR', value: 'top-right' },
  { label: 'ML', value: 'middle-left' },
  { label: 'C', value: 'center' },
  { label: 'MR', value: 'middle-right' },
  { label: 'BL', value: 'bottom-left' },
  { label: 'BC', value: 'bottom-center' },
  { label: 'BR', value: 'bottom-right' },
];

export function WatermarkControls({
  config,
  onChange,
  onReset,
  onApplyPreset,
  isCustomOverride = false,
}: WatermarkControlsProps) {
  const [activeTab, setActiveTab] = useState<'watermark' | 'position' | 'output'>('watermark');
  const [customPresets, setCustomPresets] = useState<WatermarkPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePresetInput, setShowSavePresetInput] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load custom presets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolnest_watermark_presets');
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: WatermarkPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      description: 'Custom user preset',
      isCustom: true,
      config: { ...config },
    };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('toolnest_watermark_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewPresetName('');
    setShowSavePresetInput(false);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('toolnest_watermark_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onChange({
        type: 'image',
        logoFile: file,
        logoUrl: url,
        logoWidth: img.naturalWidth,
        logoHeight: img.naturalHeight,
      });
    };
    img.src = url;
  };

  const handleRemoveLogo = () => {
    if (config.logoUrl) {
      URL.revokeObjectURL(config.logoUrl);
    }
    onChange({
      logoFile: null,
      logoUrl: null,
      logoWidth: 0,
      logoHeight: 0,
    });
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
      {/* Controls Header Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-2 sm:p-2.5 bg-zinc-50/70 dark:bg-[#0f121a] flex items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('watermark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'watermark'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Watermark</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('position')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'position'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Position & Tilt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'output'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          title="Reset to defaults"
          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Quick Bar */}
      <div className="p-3 sm:p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-[#11141e] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[11px] font-bold shrink-0 uppercase tracking-wider">
          <Bookmark className="w-3 h-3" />
          <span>Presets:</span>
        </div>

        {/* Built-in Presets */}
        {BUILT_IN_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyPreset(preset.config)}
            title={preset.description}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-[#5722AF] hover:text-[#5722AF] dark:hover:border-[#9B6BE8] dark:hover:text-[#9B6BE8] shrink-0 transition-all shadow-2xs"
          >
            {preset.name}
          </button>
        ))}

        {/* Custom Presets */}
        {customPresets.map((preset) => (
          <div
            key={preset.id}
            onClick={() => onApplyPreset(preset.config)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/30 text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/20 shrink-0 cursor-pointer transition-all"
          >
            <span>{preset.name}</span>
            <button
              type="button"
              onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
              className="text-zinc-400 hover:text-red-500 transition-colors ml-0.5"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}

        {/* Save Preset Trigger */}
        {!showSavePresetInput ? (
          <button
            type="button"
            onClick={() => setShowSavePresetInput(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 shrink-0 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Save Custom</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="text"
              placeholder="Preset Name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="text-xs px-2 py-0.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 w-28 focus:outline-none focus:border-[#5722AF]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveCustomPreset();
                if (e.key === 'Escape') setShowSavePresetInput(false);
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveCustomPreset}
              className="p-1 rounded bg-[#5722AF] text-white hover:bg-[#481c91] text-xs"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setShowSavePresetInput(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs px-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
        {/* TAB 1: WATERMARK CONTENT & STYLE */}
        {activeTab === 'watermark' && (
          <div className="space-y-4">
            {/* Watermark Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => onChange({ type: 'text' })}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  config.type === 'text'
                    ? 'bg-white dark:bg-[#1b2030] text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Text Watermark</span>
              </button>

              <button
                type="button"
                onClick={() => onChange({ type: 'image' })}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  config.type === 'image'
                    ? 'bg-white dark:bg-[#1b2030] text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Logo / Graphic</span>
              </button>
            </div>

            {/* TEXT WATERMARK SETTINGS */}
            {config.type === 'text' && (
              <div className="space-y-4">
                {/* Text Input */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Watermark Text (Supports Multiline)
                  </label>
                  <textarea
                    rows={2}
                    value={config.text}
                    onChange={(e) => onChange({ text: e.target.value })}
                    placeholder="Enter watermark text..."
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF] resize-none"
                  />
                </div>

                {/* Font & Weight Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Font Family
                    </label>
                    <select
                      value={config.fontFamily}
                      onChange={(e) => onChange({ fontFamily: e.target.value })}
                      className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Font Weight
                    </label>
                    <select
                      value={config.fontWeight}
                      onChange={(e) =>
                        onChange({
                          fontWeight: e.target.value as 'normal' | 'bold' | '600' | '800',
                        })
                      }
                      className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                    >
                      <option value="normal">Normal (400)</option>
                      <option value="600">Semi-Bold (600)</option>
                      <option value="bold">Bold (700)</option>
                      <option value="800">Extra-Bold (800)</option>
                    </select>
                  </div>
                </div>

                {/* Font Size & Opacity Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      <span>Font Size</span>
                      <span className="text-[#5722AF] dark:text-[#9B6BE8] font-mono">
                        {config.fontSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={180}
                      step={1}
                      value={config.fontSize}
                      onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      <span>Text Opacity</span>
                      <span className="text-[#5722AF] dark:text-[#9B6BE8] font-mono">
                        {config.textOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={config.textOpacity}
                      onChange={(e) => onChange({ textOpacity: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Color & Style Effect Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => onChange({ textColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer p-0.5 bg-white dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={config.textColor}
                        onChange={(e) => onChange({ textColor: e.target.value })}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Styling Effect
                    </label>
                    <select
                      value={config.textEffect}
                      onChange={(e) => onChange({ textEffect: e.target.value as TextEffect })}
                      className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                    >
                      <option value="none">Plain (None)</option>
                      <option value="shadow">Drop Shadow</option>
                      <option value="outline">Outline Border</option>
                      <option value="background-box">Background Box</option>
                    </select>
                  </div>
                </div>

                {/* Effect sub-controls */}
                {config.textEffect === 'outline' && (
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      <span>Outline Thickness</span>
                      <span className="font-mono text-[#5722AF]">{config.outlineWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={config.outlineWidth}
                      onChange={(e) => onChange({ outlineWidth: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                        Outline Color:
                      </span>
                      <input
                        type="color"
                        value={config.outlineColor}
                        onChange={(e) => onChange({ outlineColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer p-0 bg-transparent"
                      />
                    </div>
                  </div>
                )}

                {config.textEffect === 'background-box' && (
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      <span>Box Opacity</span>
                      <span className="font-mono text-[#5722AF]">{config.boxOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={config.boxOpacity}
                      onChange={(e) => onChange({ boxOpacity: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      <span>Box Padding</span>
                      <span className="font-mono text-[#5722AF]">{config.boxPadding}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={30}
                      value={config.boxPadding}
                      onChange={(e) => onChange({ boxPadding: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                        Box Color:
                      </span>
                      <input
                        type="color"
                        value={config.boxColor}
                        onChange={(e) => onChange({ boxColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer p-0 bg-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LOGO WATERMARK SETTINGS */}
            {config.type === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Upload Logo / Watermark Graphic
                  </label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/webp,image/jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload-input"
                  />

                  {config.logoUrl ? (
                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-300 dark:border-zinc-700 p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={config.logoUrl}
                            alt="Logo preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
                            {config.logoFile?.name || 'Logo Image'}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {config.logoWidth} × {config.logoHeight} px
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <label
                          htmlFor="logo-upload-input"
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors"
                        >
                          Replace
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="logo-upload-input"
                      className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-[#9B6BE8] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-900/30"
                    >
                      <ImageIcon className="w-6 h-6 text-[#5722AF] dark:text-[#9B6BE8] mb-1.5" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Click to select watermark logo
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-0.5">
                        PNG (with transparency), SVG, WebP, JPG
                      </span>
                    </label>
                  )}
                </div>

                {/* Logo Scale & Opacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      <span>Logo Scale (% Width)</span>
                      <span className="text-[#5722AF] dark:text-[#9B6BE8] font-mono">
                        {config.logoScalePercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={90}
                      step={1}
                      value={config.logoScalePercent}
                      onChange={(e) => onChange({ logoScalePercent: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      <span>Logo Opacity</span>
                      <span className="text-[#5722AF] dark:text-[#9B6BE8] font-mono">
                        {config.logoOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={config.logoOpacity}
                      onChange={(e) => onChange({ logoOpacity: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POSITION, ROTATION & TILING */}
        {activeTab === 'position' && (
          <div className="space-y-4">
            {/* Position 3x3 Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Anchor Position (9-Point Grid)
                </label>
                {config.position === 'custom' && (
                  <span className="text-[11px] font-semibold text-[#5722AF] dark:text-[#9B6BE8] flex items-center gap-1">
                    <Move className="w-3 h-3" /> Custom Dragged
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 max-w-[210px] mx-auto p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {POSITION_GRID.map((pos) => {
                  const isSelected = config.position === pos.value;
                  return (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => onChange({ position: pos.value })}
                      className={`h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#5722AF] text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-[#5722AF]'
                      }`}
                    >
                      {pos.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-zinc-400 text-center mt-2">
                💡 Tip: You can also click & drag the watermark directly on the canvas preview!
              </p>
            </div>

            {/* Edge Margin */}
            {config.position !== 'center' && config.position !== 'custom' && !config.isTiled && (
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <span>Edge Margin Distance</span>
                  <span className="text-[#5722AF] dark:text-[#9B6BE8] font-mono">
                    {config.marginOffset}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={2}
                  value={config.marginOffset}
                  onChange={(e) => onChange({ marginOffset: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Rotation Controls */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotation Angle</span>
                </span>
                <span className="text-[#5722AF] dark:text-[#9B6BE8] font-mono">
                  {config.rotation}°
                </span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                step={5}
                value={config.rotation}
                onChange={(e) => onChange({ rotation: Number(e.target.value) })}
                className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 mt-2">
                {[-45, -30, 0, 30, 45].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => onChange({ rotation: deg })}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                      config.rotation === deg
                        ? 'bg-[#5722AF] border-[#5722AF] text-white'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {deg > 0 ? `+${deg}°` : `${deg}°`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tiling / Repeating Watermark Switch */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#5722AF]" />
                    <span>Repeat / Tile Across Image</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Full protective diagonal pattern coverage
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ isTiled: !config.isTiled })}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    config.isTiled ? 'bg-[#5722AF]' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.isTiled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {config.isTiled && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Tile Spacing X</span>
                      <span className="font-mono text-[#5722AF]">{config.tileSpacingX}px</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={300}
                      step={10}
                      value={config.tileSpacingX}
                      onChange={(e) => onChange({ tileSpacingX: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Tile Spacing Y</span>
                      <span className="font-mono text-[#5722AF]">{config.tileSpacingY}px</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={300}
                      step={10}
                      value={config.tileSpacingY}
                      onChange={(e) => onChange({ tileSpacingY: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: OUTPUT SETTINGS */}
        {activeTab === 'output' && (
          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Output Image Format
              </label>
              <select
                value={config.outputFormat}
                onChange={(e) => onChange({ outputFormat: e.target.value as OutputFormat })}
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              >
                <option value="original">Original Format (Keep Same)</option>
                <option value="jpeg">JPG / JPEG (Standard Compatibility)</option>
                <option value="png">PNG (Lossless & High Quality)</option>
                <option value="webp">WebP (Modern Small File Size)</option>
                <option value="avif">AVIF (Next-Gen Compression)</option>
              </select>
            </div>

            {/* Quality Slider (JPG / WebP / AVIF) */}
            {config.outputFormat !== 'png' && (
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <span>Compression Quality</span>
                  <span className="text-[#5722AF] dark:text-[#9B6BE8] font-mono">
                    {config.quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  step={1}
                  value={config.quality}
                  onChange={(e) => onChange({ quality: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Filename Options */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Output File Naming
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={config.filenameOption}
                    onChange={(e) => onChange({ filenameOption: e.target.value as FilenameOption })}
                    className="text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="suffix">Append Suffix</option>
                    <option value="prefix">Prepend Prefix</option>
                    <option value="original">Keep Exact Original Name</option>
                  </select>

                  {config.filenameOption === 'suffix' && (
                    <input
                      type="text"
                      value={config.customSuffix}
                      onChange={(e) => onChange({ customSuffix: e.target.value })}
                      placeholder="-watermarked"
                      className="flex-1 text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  )}

                  {config.filenameOption === 'prefix' && (
                    <input
                      type="text"
                      value={config.customPrefix}
                      onChange={(e) => onChange({ customPrefix: e.target.value })}
                      placeholder="watermarked-"
                      className="flex-1 text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer info note */}
      {isCustomOverride && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-700 dark:text-amber-300 font-medium text-center">
          Custom override active for this specific photo.
        </div>
      )}
    </div>
  );
}
