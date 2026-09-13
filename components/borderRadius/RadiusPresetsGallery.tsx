'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';
import { ShapePreset, ShapeCategory, BorderRadiusConfig } from '@/lib/borderRadius/borderRadiusTypes';
import { SHAPE_PRESETS, SHAPE_CATEGORIES } from '@/lib/borderRadius/borderRadiusPresets';
import { formatCornerValues } from '@/lib/borderRadius/borderRadiusEngine';

interface RadiusPresetsGalleryProps {
  onSelectPreset: (preset: ShapePreset) => void;
  onApplyStyle: (style: string) => void;
}

const STYLE_SHORTCUTS = [
  'Sharp',
  'Subtle',
  'Soft',
  'Rounded',
  'Very Rounded',
  'Pill',
  'Organic',
  'Blob',
];

export function RadiusPresetsGallery({
  onSelectPreset,
  onApplyStyle,
}: RadiusPresetsGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredPresets =
    activeCategory === 'All'
      ? SHAPE_PRESETS
      : SHAPE_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Curated Border Radius Presets</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Click any preset card to instantly apply its curvature to your live design
          </p>
        </div>

        {/* Quick Style Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-zinc-400 mr-1 font-semibold hidden sm:inline">
            Styles:
          </span>
          {STYLE_SHORTCUTS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onApplyStyle(st.toLowerCase())}
              className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-[#5722AF] hover:text-[#5722AF] dark:hover:border-[#9B6BE8] dark:hover:text-[#9B6BE8] hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all"
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-100 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === 'All'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          All ({SHAPE_PRESETS.length})
        </button>
        {SHAPE_CATEGORIES.map((cat) => {
          const count = SHAPE_PRESETS.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredPresets.map((preset) => {
          const hStr = formatCornerValues(preset.horizontal, preset.unit, true);
          const vStr = preset.vertical
            ? formatCornerValues(preset.vertical, preset.unit, true)
            : null;
          const radiusCss = vStr ? `${hStr} / ${vStr}` : hStr;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="text-left p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#12151c] hover:border-[#5722AF] dark:hover:border-[#9B6BE8] hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
            >
              {/* Mini Visual Preview */}
              <div className="w-full h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center p-3 overflow-hidden">
                <div
                  style={{
                    borderRadius: radiusCss,
                  }}
                  className="w-14 h-12 bg-gradient-to-br from-[#5722AF] to-[#7B45D1] shadow-sm transition-transform group-hover:scale-105"
                />
              </div>

              {/* Preset Meta */}
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase shrink-0">
                    {preset.category}
                  </span>
                </div>
                {preset.description && (
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                    {preset.description}
                  </p>
                )}
                <div className="text-[10px] font-mono text-[#5722AF] dark:text-[#9B6BE8] font-semibold truncate mt-1">
                  {radiusCss}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
