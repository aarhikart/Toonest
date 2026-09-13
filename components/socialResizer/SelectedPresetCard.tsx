'use client';

import React from 'react';
import { Sliders, Sparkles, Check, ArrowRight } from 'lucide-react';
import { SocialMediaConfig, SocialMediaPreset } from '@/lib/socialMediaTypes';
import { getPresetById } from '@/lib/socialMediaPresets';
import { getTargetDimensions } from '@/lib/socialMediaEngine';

interface SelectedPresetCardProps {
  config: SocialMediaConfig;
  onChangeSize: () => void;
  onCustomSize: () => void;
}

export function SelectedPresetCard({
  config,
  onChangeSize,
  onCustomSize,
}: SelectedPresetCardProps) {
  const preset = getPresetById(config.presetId);
  const { width, height } = getTargetDimensions(config);
  const isCustom = config.presetId === 'custom' || preset.isCustom;

  return (
    <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-[#131620] dark:to-[#0f121a] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-3.5">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#5722AF] dark:text-[#9B6BE8]">
            Selected Target
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white mt-0.5">
          {isCustom ? 'Custom Dimensions' : preset.name}
        </h3>
        <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
            {width} × {height} px
          </span>
          <span>•</span>
          <span>{isCustom ? `${width}:${height}` : preset.aspectRatio} aspect ratio</span>
          {!isCustom && (
            <>
              <span>•</span>
              <span className="capitalize">{preset.platform}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onChangeSize}
          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-[#5722AF] hover:text-[#5722AF] text-zinc-700 dark:text-zinc-300 transition-all"
        >
          Change Size
        </button>
        <button
          type="button"
          onClick={onCustomSize}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isCustom
              ? 'bg-[#5722AF] border-[#5722AF] text-white shadow-xs'
              : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-[#5722AF] hover:text-[#5722AF] text-zinc-700 dark:text-zinc-300'
          }`}
        >
          Custom Size
        </button>
      </div>
    </div>
  );
}
