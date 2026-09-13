'use client';

import React from 'react';
import { Sparkles, Shield, Image as ImageIcon, Zap, CheckCircle2 } from 'lucide-react';

export function PdfToPngHero() {
  return (
    <div className="text-center space-y-4 max-w-3xl mx-auto pt-2 pb-1">
      {/* Privacy Guarantee Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>100% Private In-Browser Processing • No Server Uploads</span>
      </div>

      {/* Main H1 Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        PDF to PNG{' '}
        <span className="bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] bg-clip-text text-transparent">
          Converter
        </span>
      </h1>

      {/* Descriptive Lead Paragraph */}
      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Convert PDF pages to lossless, high-definition PNG images directly in your browser. Preserve transparent backgrounds, crisp typography, and vector diagram clarity with customizable DPI and batch downloads.
      </p>

      {/* Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Lossless Compression
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Transparency Support
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Custom DPI (72 to 300+)
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Selective Page Ranges
        </span>
      </div>
    </div>
  );
}
