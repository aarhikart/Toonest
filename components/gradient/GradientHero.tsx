'use client';

import React from 'react';
import { Sparkles, Layers, Sliders, ShieldCheck } from 'lucide-react';

export function GradientHero() {
  return (
    <section className="text-center max-w-3xl mx-auto pt-6 pb-4 px-4">
      {/* Privacy & Feature Pills */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border border-[#5722AF]/20 dark:border-[#5722AF]/30 mb-3 shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Linear, Radial, Conic & Repeating</span>
        <span className="w-1 h-1 rounded-full bg-[#5722AF] dark:bg-[#9B6BE8]" />
        <span className="text-zinc-600 dark:text-zinc-400 font-normal">100% Client-Side</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
        Gradient Generator
      </h1>

      <p className="mt-2 text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto">
        Create beautiful CSS gradients online with full control over colors, direction, stops and styles.
      </p>

      <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
        Design custom linear, radial and conic gradients, preview them instantly, and copy production-ready CSS.
      </p>

      {/* Feature Badges */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/70">
          <Layers className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          Visual Draggable Stops
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/70">
          <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Linear, Radial & Conic
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/70">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          WCAG Contrast Tested
        </span>
      </div>
    </section>
  );
}
