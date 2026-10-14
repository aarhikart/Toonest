'use client';

import React from 'react';
import { Scissors, RefreshCw, FileArchive, Zap } from 'lucide-react';
import { CuttingProgress } from '@/lib/video-cutter/types';

interface CuttingProgressCardProps {
  progress: CuttingProgress | null;
}

export function CuttingProgressCard({ progress }: CuttingProgressCardProps) {
  const percent = progress?.percent || 20;
  const stage = progress?.stage || 'cutting';
  const message = progress?.message || 'Processing and cutting video clips...';

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-purple-200 dark:border-purple-800/80 p-6 sm:p-10 shadow-lg shadow-purple-500/5 text-center space-y-6 animate-in fade-in duration-300">
      <div className="relative w-16 h-16 mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-[#5722AF]/10 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center animate-pulse">
          {stage === 'zipping' ? (
            <FileArchive className="w-8 h-8" />
          ) : (
            <Scissors className="w-8 h-8 animate-bounce" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-zinc-800 rounded-full shadow-xs">
          <RefreshCw className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] animate-spin" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-black text-xl text-zinc-900 dark:text-white">
          {stage === 'zipping'
            ? 'Creating ZIP Archive...'
            : 'Cutting Video into Clips...'}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          {message}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-200/80 dark:border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${Math.min(100, Math.max(10, percent))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-mono">
          <span>{stage.toUpperCase()}</span>
          <span className="font-bold text-[#5722AF] dark:text-[#9B6BE8]">{percent}%</span>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[11px] font-medium text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/80">
        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Lossless stream copy active: zero quality loss &amp; fast completion</span>
      </div>
    </div>
  );
}
