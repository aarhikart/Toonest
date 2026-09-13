'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';
import { ShadowPreset, ShadowLayer } from '@/lib/boxShadow/shadowTypes';
import {
  SHADOW_PRESETS,
  SHADOW_CATEGORIES,
} from '@/lib/boxShadow/shadowPresets';
import { generateBoxShadowCss } from '@/lib/boxShadow/shadowEngine';

interface ShadowPresetsGalleryProps {
  onSelectPreset: (layers: ShadowLayer[], name: string) => void;
  onApplyStylePreset: (style: 'subtle' | 'soft' | 'balanced' | 'strong' | 'dramatic') => void;
}

export function ShadowPresetsGallery({
  onSelectPreset,
  onApplyStylePreset,
}: ShadowPresetsGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredPresets =
    activeCategory === 'All'
      ? SHADOW_PRESETS
      : SHADOW_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Curated Box Shadow Presets</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Click any preset card to load its layers directly into the live generator
          </p>
        </div>

        {/* Quick Style Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-zinc-400 mr-1 font-semibold hidden sm:inline">
            Quick Styles:
          </span>
          {(['subtle', 'soft', 'balanced', 'strong', 'dramatic'] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onApplyStylePreset(style)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#5722AF]/10 hover:text-[#5722AF] dark:hover:bg-[#5722AF]/20 dark:hover:text-[#9B6BE8] transition-colors"
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {SHADOW_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              activeCategory === cat
                ? 'bg-[#5722AF] text-white border-[#5722AF] shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredPresets.map((preset) => {
          const shadowCss = generateBoxShadowCss(preset.layers);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.layers, preset.name)}
              className="group text-left rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 hover:border-[#5722AF]/50 bg-zinc-50 dark:bg-zinc-900/50 p-3 shadow-xs hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
              title={`Load: ${preset.name}`}
            >
              {/* Swatch Container */}
              <div className="w-full h-24 flex items-center justify-center bg-zinc-100/70 dark:bg-zinc-800/50 rounded-lg mb-2.5 p-3">
                <div
                  className="w-14 h-10 rounded-md bg-white dark:bg-zinc-900 transition-transform group-hover:scale-105"
                  style={{ boxShadow: shadowCss }}
                />
              </div>

              {/* Title & Category */}
              <div className="flex items-center justify-between w-full">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {preset.category} • {preset.layers.length} {preset.layers.length === 1 ? 'layer' : 'layers'}
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
