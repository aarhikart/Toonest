'use client';

import React from 'react';
import { Maximize2, ShieldCheck, Sparkles } from 'lucide-react';

export function PixelHero() {
  return (
    <div className="text-center space-y-4 pt-4 pb-2">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/20 dark:border-[#5722AF]/40 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-bold tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
        <span>Free &bull; In-Browser Processing &bull; No Server Uploads</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
        Image Pixel Size Changer
      </h1>

      {/* Subtitle */}
      <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Change the width and height of your images in pixels. Resize one image or hundreds of images at once.
      </p>

      {/* Compact explanation */}
      <p className="max-w-xl mx-auto text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500 inline shrink-0" />
        <span>Set exact pixel dimensions, maintain aspect ratio, and download your resized images instantly.</span>
      </p>
    </div>
  );
}
