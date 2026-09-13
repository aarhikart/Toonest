'use client';

import React from 'react';
import { Sparkles, Shield, Palette, Sliders, Download } from 'lucide-react';

export function ColorPaletteHero() {
  return (
    <section className="text-center max-w-3xl mx-auto pt-6 pb-4 px-4">
      {/* Privacy & Feature Pills */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border border-[#5722AF]/20 dark:border-[#5722AF]/30 mb-3 shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Instant Harmonies & WCAG Contrast</span>
        <span className="w-1 h-1 rounded-full bg-[#5722AF] dark:bg-[#9B6BE8]" />
        <span className="text-zinc-600 dark:text-zinc-400 font-normal">Press Spacebar to Generate</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
        Color Palette Generator
      </h1>

      <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
        Create beautiful color palettes for websites, apps, branding and design projects. Generate, customize, save and export your colors in seconds.
      </p>

      {/* Feature Badges */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/70">
          <Palette className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          6 Harmony Modes
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/70">
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          WCAG 2.1 Contrast
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/70">
          <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Shades & Tints
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/70">
          <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          CSS, Tailwind & Image Export
        </span>
      </div>
    </section>
  );
}
