'use client';

import React from 'react';
import { Sparkles, FileText, ArrowRight } from 'lucide-react';
import { JpgToPdfConfig } from '@/lib/jpgToPdfTypes';
import { MARGIN_PRESETS_MM } from '@/lib/jpgToPdfEngine';

interface JpgConversionSummaryBarProps {
  totalImages: number;
  config: JpgToPdfConfig;
  onCreatePdf: () => void;
  disabled?: boolean;
}

export function JpgConversionSummaryBar({
  totalImages,
  config,
  onCreatePdf,
  disabled = false,
}: JpgConversionSummaryBarProps) {
  const marginLabel =
    config.marginPreset === 'none'
      ? '0 mm'
      : config.marginPreset === 'small'
      ? '5 mm'
      : config.marginPreset === 'medium'
      ? '10 mm'
      : config.marginPreset === 'large'
      ? '20 mm'
      : 'Custom';

  return (
    <div className="sticky bottom-4 z-30 max-w-3xl mx-auto w-full">
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Metrics Overview (Section 22) */}
        <div className="text-xs text-center sm:text-left space-y-0.5">
          <div className="font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <span>
              {totalImages} {totalImages === 1 ? 'Image' : 'Images'}
            </span>
            <span>•</span>
            <span className="text-[#5722AF] dark:text-[#9B6BE8]">
              {totalImages} PDF {totalImages === 1 ? 'Page' : 'Pages'}
            </span>
            <span>•</span>
            <span className="uppercase text-zinc-500">{config.pageSize}</span>
          </div>
          <div className="text-zinc-500 dark:text-zinc-400">
            Orientation: {config.orientation} • Quality: {config.quality}% • Margin: {marginLabel} •{' '}
            {config.separatePdfs ? 'Separate PDFs' : 'One PDF'}
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          disabled={disabled || totalImages === 0}
          onClick={onCreatePdf}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg hover:shadow-[#5722AF]/35 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {config.separatePdfs ? 'Create Separate PDFs' : 'Create PDF'} ({totalImages}{' '}
            {totalImages === 1 ? 'page' : 'pages'})
          </span>
        </button>
      </div>
    </div>
  );
}
