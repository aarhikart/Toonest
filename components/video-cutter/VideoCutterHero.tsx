'use client';

import React from 'react';
import { Scissors, Zap, FileArchive, ShieldCheck, Sparkles, Clock, Film } from 'lucide-react';

export function VideoCutterHero() {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-4 pt-2 pb-6">
      {/* Feature Badges */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[#5722AF] dark:text-purple-300 text-xs font-semibold shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
        <span>Fast Lossless Video Segmenter</span>
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          Auto 10-Min Split
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
        Video Cutter &{' '}
        <span className="bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] bg-clip-text text-transparent">
          ZIP Slicer
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Upload long MP4 or MKV videos (even 3+ hours) and automatically cut them into perfect{' '}
        <strong className="text-zinc-900 dark:text-white font-semibold">10-minute clips</strong> (or any custom length). Download all clips together in a single, organized{' '}
        <strong className="text-zinc-900 dark:text-white font-semibold">ZIP file</strong> with zero loss in video quality.
      </p>

      {/* Feature Highlights Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Zero Re-encoding Lossless Cut</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#5722AF] dark:text-purple-400 shrink-0" />
          <span>10-Minute & Custom Intervals</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xs">
          <FileArchive className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>1-Click Single ZIP Download</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>100% Private Local Processing</span>
        </div>
      </div>
    </div>
  );
}
