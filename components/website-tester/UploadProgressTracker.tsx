'use client';

import React from 'react';
import { UploadProgressInfo } from '@/lib/website-tester/types';
import { formatBytes, formatSpeed } from '@/lib/website-tester/validator';
import { XCircle, Activity, Clock, Zap } from 'lucide-react';

interface UploadProgressTrackerProps {
  progress: UploadProgressInfo;
  isUploading: boolean;
  onCancelUpload: () => void;
}

export function UploadProgressTracker({
  progress,
  isUploading,
  onCancelUpload
}: UploadProgressTrackerProps) {
  if (!isUploading && progress.percent === 0) return null;

  const percentClamped = Math.min(100, Math.max(0, Math.round(progress.percent)));
  const totalBlocks = 20;
  const filledBlocks = Math.round((percentClamped / 100) * totalBlocks);
  const asciiBar = '█'.repeat(filledBlocks) + '░'.repeat(Math.max(0, totalBlocks - filledBlocks));

  return (
    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5722AF] dark:bg-[#9B6BE8] animate-pulse" />
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {isUploading ? 'Uploading test payload...' : 'Upload Complete'}
          </span>
          <span className="font-mono font-bold text-[#5722AF] dark:text-[#9B6BE8]">
            {percentClamped}%
          </span>
        </div>

        {isUploading && (
          <button
            type="button"
            onClick={onCancelUpload}
            className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-[11px] font-bold transition flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Upload</span>
          </button>
        )}
      </div>

      {/* Styled Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] transition-all duration-150 rounded-full"
          style={{ width: `${percentClamped}%` }}
        />
      </div>

      {/* Retro / ASCII progress visualizer */}
      <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tracking-wider select-none truncate">
        {asciiBar} {percentClamped}%
      </div>

      {/* Metrics Row: Speed, Sizes, Time */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
        <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 font-semibold block">Transferred</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {formatBytes(progress.loadedBytes)} / {formatBytes(progress.totalBytes)}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 font-semibold block">Upload Speed</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
            {formatSpeed(progress.speedBps)}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 font-semibold block">Time Elapsed</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            {progress.elapsedTimeSec.toFixed(1)}s
          </span>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 font-semibold block">Remaining (est.)</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {progress.remainingTimeSec > 0 ? `${progress.remainingTimeSec.toFixed(1)}s` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
