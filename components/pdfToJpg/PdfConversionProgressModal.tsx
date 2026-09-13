'use client';

import React from 'react';
import { Loader2, Sparkles, XCircle, Shield, FileText } from 'lucide-react';
import { ConversionProgress } from '@/lib/pdfToJpgTypes';

interface PdfConversionProgressModalProps {
  progress: ConversionProgress;
  onCancel: () => void;
  targetFormat?: string;
}

export function PdfConversionProgressModal({
  progress,
  onCancel,
  targetFormat = 'JPG',
}: PdfConversionProgressModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`Converting PDF to ${targetFormat}`}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-150">
        {/* Animated Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5722AF] to-[#7B45D1] flex items-center justify-center text-white shadow-xl shadow-[#5722AF]/30">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>

        {/* Title and Percentage */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Converting to {targetFormat}
          </h2>
          <div className="text-3xl font-extrabold text-[#5722AF] dark:text-[#9B6BE8]">
            {progress.percent}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-200/60 dark:border-zinc-700/60">
            <div
              className="bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] h-full rounded-full transition-all duration-200"
              style={{ width: `${Math.max(4, Math.min(100, progress.percent))}%` }}
            />
          </div>

          {/* Current Status Info */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
              <span className="truncate max-w-[65%] font-medium">
                {progress.currentPdfName}
              </span>
              <span>
                Page {progress.currentPageNumber} of {progress.totalPagesForPdf}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300 font-semibold">
              <span>Overall:</span>
              <span>
                {progress.totalConvertedPages} / {progress.totalTargetPages} pages completed
              </span>
            </div>
          </div>
        </div>

        {/* Local Reassurance */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 pt-1">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Rendering locally on HTML5 canvas</span>
        </div>

        {/* Cancel Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Conversion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
