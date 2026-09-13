'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, Palette, Pipette } from 'lucide-react';
import { RandomMood, HarmonyType } from '@/lib/gradient/gradientTypes';
import { isValidHex, normalizeHex } from '@/lib/colorEngine';

interface RandomHarmonyBarProps {
  onGenerateRandom: (mood: RandomMood) => void;
  onGenerateHarmony: (baseHex: string, harmony: HarmonyType) => void;
  currentBaseColor?: string;
}

export function RandomHarmonyBar({
  onGenerateRandom,
  onGenerateHarmony,
  currentBaseColor = '#5722AF',
}: RandomHarmonyBarProps) {
  const [selectedMood, setSelectedMood] = useState<RandomMood>('balanced');
  const [anchorColor, setAnchorColor] = useState<string>(currentBaseColor);

  const moods: { id: RandomMood; label: string }[] = [
    { id: 'balanced', label: 'Balanced' },
    { id: 'vibrant', label: 'Vibrant' },
    { id: 'pastel', label: 'Pastel' },
    { id: 'dark', label: 'Dark' },
    { id: 'soft', label: 'Soft' },
    { id: 'colorful', label: 'Colorful' },
  ];

  const harmonies: { id: HarmonyType; label: string }[] = [
    { id: 'complementary', label: 'Complementary' },
    { id: 'analogous', label: 'Analogous' },
    { id: 'triadic', label: 'Triadic' },
    { id: 'split-complementary', label: 'Split-Comp' },
    { id: 'tetradic', label: 'Tetradic' },
    { id: 'monochromatic', label: 'Monochromatic' },
  ];

  const handleAnchorChange = (val: string) => {
    setAnchorColor(val);
  };

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors space-y-4">
      {/* 1. Random Gradient Generator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Random Gradient Generator</span>
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Generate fresh curated gradient combinations by mood
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value as RandomMood)}
            className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-xl px-2.5 py-2 outline-none cursor-pointer"
          >
            {moods.map((m) => (
              <option key={m.id} value={m.id} className="bg-white dark:bg-zinc-800">
                {m.label} Mood
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onGenerateRandom(selectedMood)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] text-white font-bold text-xs shadow-md shadow-[#5722AF]/20 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate Random</span>
          </button>
        </div>
      </div>

      {/* 2. Color Harmony Generator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative group/anchor">
            <input
              type="color"
              value={isValidHex(anchorColor) ? normalizeHex(anchorColor) : '#5722AF'}
              onChange={(e) => handleAnchorChange(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              title="Select Base Color"
            />
            <div
              className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 shadow-xs flex items-center justify-center cursor-pointer group-hover/anchor:scale-105 transition-transform"
              style={{ backgroundColor: anchorColor }}
            >
              <Pipette className="w-3.5 h-3.5 text-white mix-blend-difference" />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Color Harmony Schemes</span>
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Build harmonious gradients anchored on{' '}
              <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                {anchorColor}
              </span>
            </p>
          </div>
        </div>

        {/* Harmony Quick Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {harmonies.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onGenerateHarmony(anchorColor, h.id)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#5722AF]/10 hover:text-[#5722AF] dark:hover:bg-[#5722AF]/20 dark:hover:text-[#9B6BE8] border border-zinc-200/80 dark:border-zinc-700/80 transition-colors"
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
