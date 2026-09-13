'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export function AIVideoDetectorHero() {
  return (
    <section className="relative pt-6 pb-4 sm:pt-10 sm:pb-6 text-center max-w-3xl mx-auto px-4">
      {/* Category Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/20 dark:border-[#5722AF]/30 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-bold mb-4 shadow-xs">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>AI Media Analysis</span>
        <span className="w-1 h-1 rounded-full bg-[#5722AF]/40 dark:bg-[#9B6BE8]/40" />
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Probabilistic Model</span>
      </div>

      {/* Main Title H1 */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
        AI Video Detector
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Analyze a video and estimate whether it is likely AI-generated, authentic, or manipulated using temporal and visual signal inspection.
      </p>

      {/* Probabilistic Disclaimer Pill */}
      <div className="mt-3.5 inline-flex items-center gap-2 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
        <span>Detection results are probabilistic and should not be treated as definitive proof.</span>
      </div>
    </section>
  );
}
