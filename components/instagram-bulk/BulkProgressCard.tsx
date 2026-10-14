'use client';

import React from 'react';
import {
  FolderArchive,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  XCircle,
  FileCheck,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { BatchProgressUpdate } from '@/lib/instagram/bulkZipManager';

interface BulkProgressCardProps {
  totalItems: number;
  selectedCount: number;
  progress: BatchProgressUpdate | null;
  isDownloading: boolean;
  onStartZipDownload: () => void;
  onCancelDownload: () => void;
  onRetryFailed: () => void;
  onReset: () => void;
  failedCount: number;
  completedCount: number;
  fileName?: string | null;
}

export function BulkProgressCard({
  totalItems,
  selectedCount,
  progress,
  isDownloading,
  onStartZipDownload,
  onCancelDownload,
  onRetryFailed,
  onReset,
  failedCount,
  completedCount,
  fileName,
}: BulkProgressCardProps) {
  const percent = progress?.percent || 0;
  const isComplete = progress?.status === 'completed';
  const totalMB = ((progress?.totalBytes || 0) / (1024 * 1024)).toFixed(1);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Bulk Export Queue
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {totalItems} Reels Detected
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {fileName ? `Loaded from ${fileName} • ` : ''}
            Selected <strong className="text-zinc-700 dark:text-zinc-200">{selectedCount} of {totalItems}</strong> reels for download
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isDownloading}
            className="px-3.5 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50 transition-colors"
          >
            Clear / Upload New
          </button>

          {failedCount > 0 && !isDownloading && (
            <button
              type="button"
              onClick={onRetryFailed}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Failed ({failedCount})
            </button>
          )}

          {isDownloading ? (
            <button
              type="button"
              onClick={onCancelDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all"
            >
              <XCircle className="w-4 h-4" />
              Cancel Download
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartZipDownload}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white shadow-md shadow-sky-600/20 transition-all hover:scale-[1.01]"
            >
              <FolderArchive className="w-4 h-4" />
              Download All as ZIP ({selectedCount} Reels)
            </button>
          )}
        </div>
      </div>

      {/* Real-time Progress Bar & Status */}
      {(isDownloading || isComplete || progress?.status === 'error') && (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              {isDownloading ? (
                <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" />
              ) : isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              {progress?.message || (isDownloading ? 'Downloading clips...' : 'Ready')}
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {percent}% • {completedCount}/{totalItems} Saved ({totalMB} MB)
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete
                  ? 'bg-emerald-500'
                  : progress?.status === 'error'
                  ? 'bg-red-500'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {progress?.currentFilename && isDownloading && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
              <span>Current file: </span>
              <strong className="text-zinc-700 dark:text-zinc-300 font-mono">
                {progress.currentFilename}
              </strong>
            </div>
          )}
        </div>
      )}

      {/* Info notice about title-based naming format */}
      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-sky-500" />
          <span>
            Files are automatically formatted as: <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-sky-600 dark:text-sky-400 font-mono text-[11px]">#2 - Dont be a baddy.mp4</code>
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Lossless MP4 • Bundled in single ZIP archive
        </span>
      </div>
    </div>
  );
}
