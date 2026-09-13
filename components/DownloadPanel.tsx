'use client';

import React, { useState } from 'react';
import { ImageFileItem } from '@/lib/types';
import {
  Download,
  Archive,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface DownloadPanelProps {
  items: ImageFileItem[];
  duplicateCount: number;
  onDownload: (customZipName: string) => Promise<void>;
  isProcessing: boolean;
  progressPercent: number;
  progressMessage: string;
}

export function DownloadPanel({
  items,
  duplicateCount,
  onDownload,
  isProcessing,
  progressPercent,
  progressMessage,
}: DownloadPanelProps) {
  const [zipName, setZipName] = useState('renamed-images');
  const isSingle = items.length === 1;
  const hasDuplicates = duplicateCount > 0;

  const handleStartDownload = () => {
    if (hasDuplicates || isProcessing || items.length === 0) return;
    const cleanZip = (zipName.trim() || 'renamed-images').replace(/\.zip$/i, '');
    onDownload(`${cleanZip}.zip`);
  };

  return (
    <div className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-md p-6 sm:p-7 space-y-5">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Ready to Export {items.length} Image{items.length > 1 ? 's' : ''}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
              {isSingle ? 'Direct Download' : 'ZIP Bundle'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isSingle
              ? 'Click to instantly save your renamed file to your computer.'
              : 'All files will be compressed into a high-speed ZIP archive locally in your browser.'}
          </p>
        </div>

        {/* Optional Custom ZIP Filename input (only shown if multi-file) */}
        {!isSingle && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
              ZIP Name:
            </label>
            <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 focus-within:border-[#5722AF]">
              <input
                type="text"
                value={zipName}
                onChange={(e) => setZipName(e.target.value)}
                placeholder="renamed-images"
                className="text-xs bg-transparent border-none focus:outline-none text-zinc-900 dark:text-white w-32 sm:w-40 font-mono"
              />
              <span className="text-xs text-zinc-400 font-mono">.zip</span>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Progress Bar when processing */}
      {isProcessing && (
        <div className="space-y-2 p-4 rounded-xl bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border border-[#5722AF]/20 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#5722AF] dark:text-[#9B6BE8] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {progressMessage || 'Renaming and packaging images...'}
            </span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] transition-all duration-200 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action CTA and Warnings */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {hasDuplicates ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Please resolve {duplicateCount} duplicate filename{duplicateCount > 1 ? 's' : ''} before exporting.
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              All filenames are unique and ready for export.
            </span>
          )}
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          disabled={hasDuplicates || isProcessing || items.length === 0}
          onClick={handleStartDownload}
          className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#4C1D9B] hover:to-[#6C3BC4] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#5722AF]/20 hover:shadow-lg hover:shadow-[#5722AF]/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#5722AF] focus:ring-offset-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Packaging...</span>
            </>
          ) : isSingle ? (
            <>
              <Download className="w-4 h-4" />
              <span>Rename & Download Image</span>
            </>
          ) : (
            <>
              <FileArchive className="w-4 h-4" />
              <span>Rename & Download ZIP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
