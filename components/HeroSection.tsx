'use client';

import React from 'react';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="pt-10 pb-8 sm:pt-14 sm:pb-10 text-center px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Subtle trust badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border border-[#5722AF]/20 dark:border-[#5722AF]/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Private Client-Side Processing • No Server Uploads</span>
        </div>

        {/* Main Heading with refined purple accent */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Image Bulk Rename <span className="bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] bg-clip-text text-transparent">Images</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl font-medium text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto">
          Rename hundreds of images in seconds with simple, flexible bulk renaming tools.
        </p>

        {/* Supporting text */}
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Upload your images, choose a naming pattern, preview the results, and download your renamed files.
        </p>

        {/* Quick feature highlights */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Instant Live Preview</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Sequential & Pattern Renaming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Duplicate Conflict Protection</span>
          </div>
        </div>
      </div>
    </section>
  );
}
