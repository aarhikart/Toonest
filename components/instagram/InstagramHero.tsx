'use client';

import React from 'react';
import { Film, ShieldCheck, Sparkles, Download } from 'lucide-react';

export function InstagramHero() {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-3.5 pt-2 pb-2">
      {/* Category Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-semibold">
        <Film className="w-3.5 h-3.5" />
        <span>Instagram Reel Downloader</span>
      </div>

      {/* Main H1 */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
        Instagram Reel Downloader
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
        Download publicly accessible Instagram Reels quickly and easily.
      </p>

      {/* Usage Note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl mx-auto flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Only download content you own or have permission to save.</span>
      </p>

      {/* Key Feature Highlights */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1 bg-white dark:bg-[#181824] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
          HD Video &amp; Audio
        </span>
        <span className="flex items-center gap-1 bg-white dark:bg-[#181824] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
          <Download className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
          Direct MP4 File
        </span>
        <span className="flex items-center gap-1 bg-white dark:bg-[#181824] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          No Account Required
        </span>
      </div>
    </div>
  );
}
