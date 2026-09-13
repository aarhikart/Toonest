'use client';

import React from 'react';
import { Type, ShieldCheck, Sparkles, Layers, Zap, Lock } from 'lucide-react';

export function TextOverlayHero() {
  return (
    <div className="relative overflow-hidden pt-4 pb-8 sm:pb-10 text-center">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5722AF]/10 dark:bg-[#5722AF]/15 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Trust Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-semibold mb-4">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>100% In-Browser Processing • Zero Server Upload • Unlimited Text Layers</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
        Image Text Overlay{' '}
        <span className="bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] bg-clip-text text-transparent">
          & Bulk Editor
        </span>
      </h1>

      <p className="mt-3.5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Add custom text, typography, promotional captions, and multiple graphic layers to your photos.
        Direct canvas dragging, rich styling effects, dynamic bulk tokens, and instant ZIP export.
      </p>

      {/* Feature Badges */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-300">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <Layers className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Multiple Text Layers</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <Sparkles className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Shadows, Outlines & Badges</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <Zap className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Bulk Dynamic Tokens (`{'{name}'}`, `{'{number}'}`)</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>100% Private In-Browser</span>
        </div>
      </div>
    </div>
  );
}
