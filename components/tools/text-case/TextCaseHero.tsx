'use client';

import React from 'react';
import { Type, ShieldCheck, Sparkles } from 'lucide-react';

export function TextCaseHero() {
  return (
    <section className="relative pt-6 pb-4 sm:pt-10 sm:pb-6 text-center max-w-3xl mx-auto px-4">
      {/* Category Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/20 dark:border-[#5722AF]/30 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-bold mb-4 shadow-xs">
        <Type className="w-3.5 h-3.5" />
        <span>Text Tools</span>
        <span className="w-1 h-1 rounded-full bg-[#5722AF]/40 dark:bg-[#9B6BE8]/40" />
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">100% Client-Side</span>
      </div>

      {/* Main Title H1 */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
        Text Case Converter
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Convert text to uppercase, lowercase, or title case instantly.
      </p>

      {/* Privacy Notice Pill */}
      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Your text is processed directly in your browser and is never uploaded to any server.</span>
      </div>
    </section>
  );
}
