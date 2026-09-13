'use client';

import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { SOCIAL_MEDIA_PRESETS, POPULAR_PRESET_IDS } from '@/lib/socialMediaPresets';
import { SocialMediaPreset } from '@/lib/socialMediaTypes';

interface PopularSizesBarProps {
  activePresetId: string;
  onSelectPreset: (preset: SocialMediaPreset) => void;
}

export function PopularSizesBar({ activePresetId, onSelectPreset }: PopularSizesBarProps) {
  const popularPresets = POPULAR_PRESET_IDS.map((id) =>
    SOCIAL_MEDIA_PRESETS.find((p) => p.id === id)
  ).filter((p): p is SocialMediaPreset => p !== undefined);

  return (
    <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-3 sm:p-3.5 shadow-sm space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
        <Sparkles className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
        <span>Popular Social Media Sizes:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {popularPresets.map((preset) => {
          const isSelected = preset.id === activePresetId;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left border shrink-0 transition-all ${
                isSelected
                  ? 'border-[#5722AF] bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">{preset.name.replace(' — ', ' ')}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                  <span>{preset.width} × {preset.height} px</span>
                  <span>•</span>
                  <span>{preset.aspectRatio}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
