'use client';

import React, { useState, useEffect } from 'react';
import {
  Type,
  Sliders,
  Grid3X3,
  Sparkles,
  RotateCw,
  Bookmark,
  Plus,
  Trash2,
  Check,
  Move,
  Share2,
  FileCheck,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Undo2,
} from 'lucide-react';
import {
  TextLayer,
  TextOverlayConfig,
  TextEffect,
  OutputFormat,
  FilenameOption,
  SocialPresetId,
  SOCIAL_PRESETS,
  BUILT_IN_TEXT_TEMPLATES,
  TextOverlayPreset,
} from '@/lib/textOverlayTypes';

interface TextLayerControlsProps {
  layer: TextLayer | null;
  config: TextOverlayConfig;
  onLayerChange: (updated: Partial<TextLayer>) => void;
  onConfigChange: (updated: Partial<TextOverlayConfig>) => void;
  onApplyTemplate: (style: Partial<TextLayer>) => void;
  onResetLayer: () => void;
}

const FONT_FAMILIES = [
  { label: 'Arial (Sans-serif)', value: 'Arial' },
  { label: 'Helvetica (Modern Sans)', value: 'Helvetica' },
  { label: 'Georgia (Editorial Serif)', value: 'Georgia' },
  { label: 'Times New Roman (Classic Serif)', value: 'Times New Roman' },
  { label: 'Verdana (Clean Screen)', value: 'Verdana' },
  { label: 'Trebuchet MS (Dynamic)', value: 'Trebuchet MS' },
  { label: 'Courier New (Monospace)', value: 'Courier New' },
  { label: 'Impact (Bold Headline)', value: 'Impact' },
  { label: 'Inter / System Sans', value: 'Inter, system-ui' },
];

const QUICK_COLORS = [
  '#FFFFFF',
  '#000000',
  '#5722AF',
  '#EF4444',
  '#3B82F6',
  '#EAB308',
  '#10B981',
  '#64748B',
];

const POSITION_GRID = [
  { label: 'TL', value: 'top-left' },
  { label: 'TC', value: 'top-center' },
  { label: 'TR', value: 'top-right' },
  { label: 'ML', value: 'middle-left' },
  { label: 'C', value: 'center' },
  { label: 'MR', value: 'middle-right' },
  { label: 'BL', value: 'bottom-left' },
  { label: 'BC', value: 'bottom-center' },
  { label: 'BR', value: 'bottom-right' },
] as const;

export function TextLayerControls({
  layer,
  config,
  onLayerChange,
  onConfigChange,
  onApplyTemplate,
  onResetLayer,
}: TextLayerControlsProps) {
  const [activeTab, setActiveTab] = useState<'typography' | 'effects' | 'position' | 'export'>('typography');
  const [customPresets, setCustomPresets] = useState<TextOverlayPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePresetInput, setShowSavePresetInput] = useState(false);

  // Load custom presets
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolnest_text_presets');
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim() || !layer) return;
    const newPreset: TextOverlayPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      description: 'Custom saved style preset',
      isCustom: true,
      layerStyle: {
        fontFamily: layer.fontFamily,
        fontSize: layer.fontSize,
        fontWeight: layer.fontWeight,
        fontStyle: layer.fontStyle,
        color: layer.color,
        opacity: layer.opacity,
        effect: layer.effect,
        outlineColor: layer.outlineColor,
        outlineWidth: layer.outlineWidth,
        shadowColor: layer.shadowColor,
        shadowBlur: layer.shadowBlur,
        shadowOffsetX: layer.shadowOffsetX,
        shadowOffsetY: layer.shadowOffsetY,
        boxColor: layer.boxColor,
        boxOpacity: layer.boxOpacity,
        boxPadding: layer.boxPadding,
        boxBorderRadius: layer.boxBorderRadius,
      },
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('toolnest_text_presets', JSON.stringify(updated));
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
      localStorage.setItem('toolnest_text_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  if (!layer) {
    return (
      <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-8 text-center text-zinc-400 text-xs">
        No active layer selected. Select or add a text layer to edit.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
      {/* Top Header Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-2 sm:p-2.5 bg-zinc-50/70 dark:bg-[#0f121a] flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('typography')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'typography'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text & Font</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('effects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'effects'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Effects</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('position')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'position'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Position</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'export'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onResetLayer}
          title="Reset layer styles"
          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Templates Bar */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-[#11141e] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 text-[11px] font-bold shrink-0 uppercase tracking-wider">
          <Bookmark className="w-3 h-3" />
          <span>Styles:</span>
        </div>

        {BUILT_IN_TEXT_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => onApplyTemplate(tmpl.layerStyle)}
            title={tmpl.description}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-[#5722AF] hover:text-[#5722AF] dark:hover:border-[#9B6BE8] dark:hover:text-[#9B6BE8] shrink-0 transition-all shadow-2xs"
          >
            {tmpl.name}
          </button>
        ))}

        {customPresets.map((preset) => (
          <div
            key={preset.id}
            onClick={() => onApplyTemplate(preset.layerStyle)}
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

        {!showSavePresetInput ? (
          <button
            type="button"
            onClick={() => setShowSavePresetInput(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 shrink-0 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Save Style</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="text"
              placeholder="Style Name..."
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

      {/* Main Tab Panels */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
        {/* TAB 1: TYPOGRAPHY & TEXT */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            {/* Text Input Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Text Content (Supports Multiline)
                </label>
                {/* Dynamic Token Insert Pills */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-400">Tokens:</span>
                  <button
                    type="button"
                    onClick={() => onLayerChange({ text: `${layer.text} {name}` })}
                    title="Insert original filename"
                    className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono"
                  >
                    {'{name}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onLayerChange({ text: `${layer.text} {number}` })}
                    title="Insert sequence number"
                    className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono"
                  >
                    {'{number}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onLayerChange({ text: `${layer.text} {date}` })}
                    title="Insert current date"
                    className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono"
                  >
                    {'{date}'}
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={layer.text}
                onChange={(e) => onLayerChange({ text: e.target.value })}
                placeholder="Enter text..."
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF] resize-none"
              />
            </div>

            {/* Font Family & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Font Family
                </label>
                <select
                  value={layer.fontFamily}
                  onChange={(e) => onLayerChange({ fontFamily: e.target.value })}
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
                  value={layer.fontWeight}
                  onChange={(e) =>
                    onLayerChange({
                      fontWeight: e.target.value as '300' | '400' | '500' | '600' | '700' | '800',
                    })
                  }
                  className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi-Bold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra-Bold (800)</option>
                </select>
              </div>
            </div>

            {/* Font Size & Opacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <span>Font Size</span>
                  <div className="flex items-center gap-1 font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                    <input
                      type="number"
                      min={8}
                      max={300}
                      value={layer.fontSize}
                      onChange={(e) => onLayerChange({ fontSize: Math.max(8, Number(e.target.value)) })}
                      className="w-12 text-center text-xs py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
                    />
                    <span>px</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={240}
                  step={1}
                  value={layer.fontSize}
                  onChange={(e) => onLayerChange({ fontSize: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <span>Opacity</span>
                  <span className="text-[#5722AF] dark:text-[#9B6BE8] font-mono">
                    {layer.opacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={1}
                  value={layer.opacity}
                  onChange={(e) => onLayerChange({ opacity: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Text Color & Alignment */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={layer.color}
                  onChange={(e) => onLayerChange({ color: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer p-0.5 bg-white dark:bg-zinc-800"
                />
                <input
                  type="text"
                  value={layer.color}
                  onChange={(e) => onLayerChange({ color: e.target.value })}
                  className="w-24 text-xs px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200"
                />
                {/* Quick Swatches */}
                <div className="flex items-center gap-1.5 ml-auto">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onLayerChange({ color: c })}
                      className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Alignment, Letter Spacing & Line Height */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Alignment
                </label>
                <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => onLayerChange({ alignment: 'left' })}
                    className={`flex-1 py-1 flex items-center justify-center rounded ${
                      layer.alignment === 'left'
                        ? 'bg-[#5722AF] text-white'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onLayerChange({ alignment: 'center' })}
                    className={`flex-1 py-1 flex items-center justify-center rounded ${
                      layer.alignment === 'center'
                        ? 'bg-[#5722AF] text-white'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onLayerChange({ alignment: 'right' })}
                    className={`flex-1 py-1 flex items-center justify-center rounded ${
                      layer.alignment === 'right'
                        ? 'bg-[#5722AF] text-white'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  <span>Letter Space</span>
                  <span className="font-mono text-[#5722AF]">{layer.letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min={-3}
                  max={20}
                  value={layer.letterSpacing}
                  onChange={(e) => onLayerChange({ letterSpacing: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  <span>Line Height</span>
                  <span className="font-mono text-[#5722AF]">{layer.lineHeight}</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={2.2}
                  step={0.1}
                  value={layer.lineHeight}
                  onChange={(e) => onLayerChange({ lineHeight: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EFFECTS & STYLING */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            {/* Effect Choice */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Style Effect
              </label>
              <select
                value={layer.effect}
                onChange={(e) => onLayerChange({ effect: e.target.value as TextEffect })}
                className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              >
                <option value="none">Plain (No Effect)</option>
                <option value="shadow">Drop Shadow</option>
                <option value="outline">Outline Border</option>
                <option value="background-box">Background Box / Pill</option>
              </select>
            </div>

            {/* Drop Shadow Controls */}
            {layer.effect === 'shadow' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Shadow Color
                  </span>
                  <input
                    type="color"
                    value={layer.shadowColor}
                    onChange={(e) => onLayerChange({ shadowColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>Shadow Blur</span>
                    <span className="font-mono text-[#5722AF]">{layer.shadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={layer.shadowBlur}
                    onChange={(e) => onLayerChange({ shadowBlur: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Offset X</span>
                      <span className="font-mono">{layer.shadowOffsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      value={layer.shadowOffsetX}
                      onChange={(e) => onLayerChange({ shadowOffsetX: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Offset Y</span>
                      <span className="font-mono">{layer.shadowOffsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      value={layer.shadowOffsetY}
                      onChange={(e) => onLayerChange({ shadowOffsetY: Number(e.target.value) })}
                      className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Outline Controls */}
            {layer.effect === 'outline' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Outline Color
                  </span>
                  <input
                    type="color"
                    value={layer.outlineColor}
                    onChange={(e) => onLayerChange({ outlineColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>Outline Thickness</span>
                    <span className="font-mono text-[#5722AF]">{layer.outlineWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={16}
                    value={layer.outlineWidth}
                    onChange={(e) => onLayerChange({ outlineWidth: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Background Box Controls */}
            {layer.effect === 'background-box' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Box Fill Color
                  </span>
                  <input
                    type="color"
                    value={layer.boxColor}
                    onChange={(e) => onLayerChange({ boxColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>Box Opacity</span>
                    <span className="font-mono text-[#5722AF]">{layer.boxOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={layer.boxOpacity}
                    onChange={(e) => onLayerChange({ boxOpacity: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>Padding</span>
                    <span className="font-mono text-[#5722AF]">{layer.boxPadding}px</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={50}
                    value={layer.boxPadding}
                    onChange={(e) => onLayerChange({ boxPadding: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>Corner Border Radius</span>
                    <span className="font-mono text-[#5722AF]">{layer.boxBorderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={layer.boxBorderRadius}
                    onChange={(e) => onLayerChange({ boxBorderRadius: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: POSITION & CANVAS */}
        {activeTab === 'position' && (
          <div className="space-y-4">
            {/* Position 3x3 Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Anchor Position (3×3 Grid)
                </label>
                {layer.position === 'custom' && (
                  <span className="text-[11px] font-semibold text-[#5722AF] dark:text-[#9B6BE8] flex items-center gap-1">
                    <Move className="w-3 h-3" /> Dragged ({layer.customXPercent}%, {layer.customYPercent}%)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 max-w-[210px] mx-auto p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {POSITION_GRID.map((pos) => {
                  const isSelected = layer.position === pos.value;
                  return (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => onLayerChange({ position: pos.value })}
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
                💡 Tip: You can also drag this text layer directly on the image preview!
              </p>
            </div>

            {/* Edge Margins */}
            {layer.position !== 'center' && layer.position !== 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>X Margin</span>
                    <span className="font-mono text-[#5722AF]">{layer.marginOffsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    value={layer.marginOffsetX}
                    onChange={(e) => onLayerChange({ marginOffsetX: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>Y Margin</span>
                    <span className="font-mono text-[#5722AF]">{layer.marginOffsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    value={layer.marginOffsetY}
                    onChange={(e) => onLayerChange({ marginOffsetY: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Rotation */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotation Angle</span>
                </span>
                <span className="text-[#5722AF] dark:text-[#9B6BE8] font-mono">
                  {layer.rotation}°
                </span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                step={5}
                value={layer.rotation}
                onChange={(e) => onLayerChange({ rotation: Number(e.target.value) })}
                className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 mt-2">
                {[-45, -15, 0, 15, 45, 90].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => onLayerChange({ rotation: deg })}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                      layer.rotation === deg
                        ? 'bg-[#5722AF] border-[#5722AF] text-white'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {deg > 0 ? `+${deg}°` : `${deg}°`}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Media Canvas Presets */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Social Media Canvas Aspect
              </label>
              <select
                value={config.socialPreset}
                onChange={(e) => onConfigChange({ socialPreset: e.target.value as SocialPresetId })}
                className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              >
                {SOCIAL_PRESETS.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.label} {sp.width > 0 ? `(${sp.width} × ${sp.height})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* TAB 4: EXPORT & OUTPUT */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Output Format
              </label>
              <select
                value={config.outputFormat}
                onChange={(e) => onConfigChange({ outputFormat: e.target.value as OutputFormat })}
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              >
                <option value="original">Keep Original Format</option>
                <option value="jpeg">JPG / JPEG (Standard Compatibility)</option>
                <option value="png">PNG (Lossless & High Quality)</option>
                <option value="webp">WebP (Modern Small Size)</option>
                <option value="avif">AVIF (Next-Gen Compression)</option>
              </select>
            </div>

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
                  onChange={(e) => onConfigChange({ quality: Number(e.target.value) })}
                  className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Filename Options */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Output Filename Convention
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={config.filenameOption}
                  onChange={(e) => onConfigChange({ filenameOption: e.target.value as FilenameOption })}
                  className="text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="suffix">Append Suffix</option>
                  <option value="prefix">Prepend Prefix</option>
                  <option value="original">Keep Original</option>
                </select>

                {config.filenameOption === 'suffix' && (
                  <input
                    type="text"
                    value={config.customSuffix}
                    onChange={(e) => onConfigChange({ customSuffix: e.target.value })}
                    placeholder="-text-overlay"
                    className="flex-1 text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200"
                  />
                )}

                {config.filenameOption === 'prefix' && (
                  <input
                    type="text"
                    value={config.customPrefix}
                    onChange={(e) => onConfigChange({ customPrefix: e.target.value })}
                    placeholder="text-"
                    className="flex-1 text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200"
                  />
                )}
              </div>
            </div>

            {/* Proportional Scaling Toggle */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Scale Text Proportionally
                </div>
                <p className="text-[11px] text-zinc-400">
                  Maintains consistent relative size across images of different resolutions
                </p>
              </div>
              <button
                type="button"
                onClick={() => onConfigChange({ scaleProportionally: !config.scaleProportionally })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  config.scaleProportionally ? 'bg-[#5722AF]' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.scaleProportionally ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
