'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { GradientPreset, GradientConfig } from '@/lib/gradient/gradientTypes';
import {
  GRADIENT_PRESETS,
  PRESET_CATEGORIES,
} from '@/lib/gradient/gradientPresets';
import { generateGradientCss } from '@/lib/gradient/gradientEngine';

interface GradientPresetsGalleryProps {
  onSelectPreset: (config: GradientConfig) => void;
}

export function GradientPresetsGallery({
  onSelectPreset,
}: GradientPresetsGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredPresets =
    activeCategory === 'All'
      ? GRADIENT_PRESETS
      : GRADIENT_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Curated Preset Gallery</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Click any preset to load its colors, direction, and stops into the generator
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {PRESET_CATEGORIES.map((cat) => (
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
          const css = generateGradientCss(preset.config);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.config)}
              className="group text-left rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 hover:border-[#5722AF]/50 bg-zinc-50 dark:bg-zinc-900/50 shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
              title={`Load preset: ${preset.name}`}
            >
              {/* Swatch */}
              <div
                className="w-full h-24 transition-transform group-hover:scale-105"
                style={{ background: css }}
              />

              {/* Info Label */}
              <div className="p-2.5 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                    {preset.category}
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
