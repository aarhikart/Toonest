'use client';

import React from 'react';
import { FileText, Shield, Sparkles, Layers, Sliders, Image as ImageIcon } from 'lucide-react';

export function PdfToJpgHero() {
  return (
    <section className="text-center space-y-4 py-4 sm:py-6 max-w-4xl mx-auto">
      {/* Privacy & Trust Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/20 dark:border-[#5722AF]/30 text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8] shadow-xs">
        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>100% In-Browser • High-Resolution DPI • Your files are processed locally</span>
      </div>

      {/* Main H1 Title */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          PDF to JPG{' '}
          <span className="bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] bg-clip-text text-transparent">
            Converter
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Convert PDF pages into high-quality JPG images quickly and securely. Process all pages or
          only the pages you need directly in your browser.
        </p>
      </div>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 font-medium">
          <Layers className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Page Range & Selective Export</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 font-medium">
          <Sliders className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Custom DPI & Quality Control</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 font-medium">
          <ImageIcon className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Batch Conversion & ZIP Package</span>
        </div>
      </div>
    </section>
  );
}
