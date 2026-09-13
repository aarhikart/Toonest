'use client';

import React from 'react';
import { Image as ImageIcon, Images, Sparkles } from 'lucide-react';

export type ConverterMode = 'single' | 'bulk';

interface ModeSelectorProps {
  mode: ConverterMode;
  onChange: (mode: ConverterMode) => void;
  fileCount: number;
}

export function ModeSelector({ mode, onChange, fileCount }: ModeSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-none">
            Convert Images
          </h2>
          {fileCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
              {fileCount} file{fileCount > 1 ? 's' : ''} loaded
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Transform image formats with instant browser-based processing
        </p>
      </div>

      {/* Mode Switcher Segmented Control */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#1a202e] p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => onChange('single')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'single'
              ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Single Image</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('bulk')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mode === 'bulk'
              ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Images className="w-3.5 h-3.5" />
          <span>Bulk Images</span>
        </button>
      </div>
    </div>
  );
}
