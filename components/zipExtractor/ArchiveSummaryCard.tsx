'use client';

import React from 'react';
import {
  FileArchive,
  Folder,
  FileText,
  HardDrive,
  Sparkles,
  RefreshCw,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { ArchiveMetadata } from '@/lib/zipExtractorTypes';
import { formatFileSize } from '@/lib/zipExtractorEngine';

interface ArchiveSummaryCardProps {
  metadata: ArchiveMetadata;
  onChangeArchive: () => void;
  onExtractAll: () => void;
}

export function ArchiveSummaryCard({
  metadata,
  onChangeArchive,
  onExtractAll,
}: ArchiveSummaryCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0 shadow-xs">
            <FileArchive className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white truncate font-mono">
              {metadata.filename}
            </h2>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span>ZIP Archive</span>
              <span>•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Ready to extract
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onChangeArchive}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change ZIP</span>
          </button>
          <button
            type="button"
            onClick={onExtractAll}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 rounded-xl shadow-md shadow-[#5722AF]/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extract All</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Files */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-0.5">
          <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Files
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
            {metadata.fileCount}
          </div>
        </div>

        {/* Total Folders */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-0.5">
          <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Folders
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
            {metadata.folderCount}
          </div>
        </div>

        {/* Compressed Archive Size */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-0.5">
          <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Compressed
          </div>
          <div className="text-lg font-bold text-[#5722AF] dark:text-[#9B6BE8] font-mono">
            {formatFileSize(metadata.archiveSize)}
          </div>
        </div>

        {/* Uncompressed Total Size */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-0.5">
          <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Uncompressed
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
            {formatFileSize(metadata.totalUncompressedSize)}
          </div>
        </div>
      </div>

      {/* Archive Comment if available */}
      {metadata.comment && (
        <div className="text-xs p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold text-[#5722AF] dark:text-[#9B6BE8]">Archive Comment: </span>
          <span className="font-mono text-[11px]">{metadata.comment}</span>
        </div>
      )}
    </div>
  );
}
