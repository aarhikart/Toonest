'use client';

import React from 'react';
import { ShieldCheck, Zap, Maximize2, Sparkles } from 'lucide-react';

export function ResizerHero() {
  return (
    <section className="pt-10 pb-8 sm:pt-14 sm:pb-10 text-center px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border border-[#5722AF]/20 dark:border-[#5722AF]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Client-Side Processing • Originals Never Modified</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Image <span className="bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] bg-clip-text text-transparent">Resize</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl font-medium text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto">
          Resize images to exact dimensions, percentages, or maximum sizes in seconds.
        </p>

        {/* Supporting text */}
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Change image width and height individually or resize hundreds of images at once while preserving the quality and proportions you choose.
        </p>

        {/* Quick Highlights */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Exact Dimensions & Lock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Social & Web Presets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Fit, Fill & Smart Upscale Guard</span>
          </div>
        </div>
      </div>
    </section>
  );
}
