'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { formatFileSize } from '@/lib/zipExtractorEngine';

interface ZipBombWarningModalProps {
  compressedSize: number;
  uncompressedSize: number;
  onProceed: () => void;
  onCancel: () => void;
}

export function ZipBombWarningModal({
  compressedSize,
  uncompressedSize,
  onProceed,
  onCancel,
}: ZipBombWarningModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="High Expansion Ratio Warning"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-amber-300 dark:border-amber-800 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            High Expansion Warning
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This archive contains an unusually large amount of compressed data and may require
            significant browser memory to extract.
          </p>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 grid grid-cols-2 gap-2 text-center text-xs">
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase font-bold">Archive Size</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
              {formatFileSize(compressedSize)}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[10px] uppercase font-bold">Expands To</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
              {formatFileSize(uncompressedSize)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel Extraction
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
