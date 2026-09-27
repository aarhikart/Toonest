'use client';

import React from 'react';
import { CleaningProgress } from '@/lib/video-metadata/types';
import { RefreshCw, CheckCircle2, Clock, Zap, ShieldCheck } from 'lucide-react';

interface ProcessingStatusCardProps {
  progress: CleaningProgress | null;
  cleaningMode: string;
}

function formatSecs(secs: number): string {
  if (!secs || isNaN(secs)) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function ProcessingStatusCard({ progress, cleaningMode }: ProcessingStatusCardProps) {
  const percent = progress?.percent || 15;
  const isVerifying = progress?.status === 'verifying';
  const isReencoding = cleaningMode === 'reencode';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900/60 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {isVerifying
                ? 'Verifying Cleaned MP4 with FFprobe...'
                : isReencoding
                ? 'Re-encoding & Deep Cleaning MP4...'
                : 'Removing Metadata & Creating Clean MP4...'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isVerifying
                ? 'Running secondary inspection to confirm all removable tags are stripped.'
                : 'Piping working stream copy through bitexact container normalization.'}
            </p>
          </div>
        </div>

        <span className="text-xl sm:text-2xl font-black font-mono text-[#5722AF] dark:text-[#9B6BE8] self-end sm:self-auto">
          {percent}%
        </span>
      </div>

      {/* Real Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#5722AF] to-[#8C52FF] transition-all duration-300 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>

        {progress && progress.totalDurationSeconds > 0 && (
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Processed: {formatSecs(progress.currentTimeSeconds)} / {formatSecs(progress.totalDurationSeconds)}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Speed: {progress.speed || '1.0x'}
            </span>
          </div>
        )}
      </div>

      {/* Step Progress Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Upload Complete</span>
        </div>

        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Metadata Inspected</span>
        </div>

        <div className="flex items-center gap-2 text-[#5722AF] dark:text-[#9B6BE8] font-bold">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5722AF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5722AF]"></span>
          </span>
          <span>{isVerifying ? 'Cleaning Done' : 'Removing Tags'}</span>
        </div>

        <div className={`flex items-center gap-2 font-medium ${isVerifying ? 'text-[#5722AF] font-bold' : 'text-zinc-400'}`}>
          {isVerifying ? (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5722AF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5722AF]"></span>
            </span>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
          )}
          <span>Verification</span>
        </div>
      </div>
    </div>
  );
}
