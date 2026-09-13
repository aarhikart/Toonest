'use client';

import React from 'react';
import {
  FileText,
  X,
  HardDrive,
  Folder,
  Tag,
  Clock,
  Info,
  Shield,
} from 'lucide-react';
import { ZipEntryItem } from '@/lib/zipExtractorTypes';
import { formatFileSize } from '@/lib/zipExtractorEngine';

interface FileDetailsModalProps {
  entry: ZipEntryItem | null;
  onClose: () => void;
  onOpenPreview: (entry: ZipEntryItem) => void;
}

export function FileDetailsModal({
  entry,
  onClose,
  onOpenPreview,
}: FileDetailsModalProps) {
  if (!entry) return null;

  const ext = entry.name.includes('.') ? entry.name.split('.').pop()?.toUpperCase() : 'NONE';
  const lastModifiedFormatted = entry.date ? entry.date.toLocaleString() : 'Unknown';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Archive Entry Details"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate font-mono">
                {entry.name}
              </h3>
              <p className="text-xs text-zinc-400 truncate">Entry Metadata</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata List */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
          <div className="py-2 flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5" /> Archive Path
            </span>
            <span className="font-semibold text-[#5722AF] dark:text-[#9B6BE8] font-mono text-[11px] truncate max-w-[60%]">
              {entry.path}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Category
            </span>
            <span className="font-semibold uppercase text-zinc-700 dark:text-zinc-300">
              {entry.category}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" /> Uncompressed Size
            </span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300 font-mono">
              {formatFileSize(entry.uncompressedSize)}
            </span>
          </div>

          {entry.compressedSize && (
            <div className="py-2 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> Compressed Size
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300 font-mono">
                {formatFileSize(entry.compressedSize)}
              </span>
            </div>
          )}

          <div className="py-2 flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Last Modified
            </span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {lastModifiedFormatted}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
          >
            Close
          </button>
          {!entry.isDirectory && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPreview(entry);
              }}
              className="px-4 py-1.5 text-xs font-semibold bg-[#5722AF] text-white rounded-xl shadow-xs hover:bg-[#491c94]"
            >
              Open Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
