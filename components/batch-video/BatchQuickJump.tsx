'use client';

import React from 'react';
import { CheckCircle2, Download, Play, Layers } from 'lucide-react';

export interface BatchItemInfo {
  index: number; // 1-based index (1, 2, 3...)
  startIdx: number; // 1-based start (e.g. 1, 101)
  endIdx: number; // 1-based end (e.g. 100, 200)
  count: number;
  isCompleted: boolean;
  isDownloading: boolean;
}

interface BatchQuickJumpProps {
  batches: BatchItemInfo[];
  activeBatchIndex: number;
  onSelectBatch: (batchIndex: number) => void;
  onDownloadBatch: (batchIndex: number) => void;
  isAnyDownloading: boolean;
}

export function BatchQuickJump({
  batches,
  activeBatchIndex,
  onSelectBatch,
  onDownloadBatch,
  isAnyDownloading,
}: BatchQuickJumpProps) {
  if (!batches || batches.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Batch Navigator & Quick Jump ({batches.length} Batches)
          </h3>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Click any batch to jump or download
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto pr-1">
        {batches.map((batch) => {
          const isActive = batch.index === activeBatchIndex;
          const isCompleted = batch.isCompleted;
          const isCurrentDownloading = batch.isDownloading;

          return (
            <div
              key={batch.index}
              onClick={() => onSelectBatch(batch.index)}
              className={`relative group cursor-pointer p-3 rounded-xl border text-left transition-all ${
                isCurrentDownloading
                  ? 'border-[#5722AF] bg-[#5722AF]/10 ring-2 ring-[#5722AF]/40 shadow-sm'
                  : isActive
                  ? 'border-[#5722AF] bg-purple-50/70 dark:bg-purple-950/30 ring-1 ring-[#5722AF]/30 shadow-xs'
                  : isCompleted
                  ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-400'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-black ${
                    isActive
                      ? 'text-[#5722AF] dark:text-[#9B6BE8]'
                      : isCompleted
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  Batch #{batch.index}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrentDownloading ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5722AF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5722AF]"></span>
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {batch.count} vids
                  </span>
                )}
              </div>

              <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate mb-2">
                {batch.startIdx} – {batch.endIdx}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[10px] text-zinc-400">
                  {isCompleted
                    ? 'Saved'
                    : isCurrentDownloading
                    ? 'Zipping...'
                    : isActive
                    ? 'Selected'
                    : 'Pending'}
                </span>

                <button
                  type="button"
                  disabled={isAnyDownloading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadBatch(batch.index);
                  }}
                  className={`p-1 rounded-md text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#5722AF] text-white hover:bg-[#682BC9]'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#5722AF] hover:text-white'
                  }`}
                  title={`Download Batch #${batch.index}`}
                >
                  <Download className="w-2.5 h-2.5" />
                  <span>ZIP</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
