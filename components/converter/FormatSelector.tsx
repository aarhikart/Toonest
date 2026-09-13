'use client';

import React, { useEffect, useState } from 'react';
import { ImageFormat } from '@/lib/converterTypes';
import { checkFormatSupport } from '@/lib/conversionEngine';
import { AlertTriangle, Check, Sparkles } from 'lucide-react';

interface FormatSelectorProps {
  selectedFormat: ImageFormat;
  onChange: (format: ImageFormat) => void;
}

export function FormatSelector({ selectedFormat, onChange }: FormatSelectorProps) {
  const [avifSupported, setAvifSupported] = useState(true);

  useEffect(() => {
    setAvifSupported(checkFormatSupport('avif'));
  }, []);

  const formats: {
    id: ImageFormat;
    label: string;
    ext: string;
    description: string;
    supported: boolean;
  }[] = [
    {
      id: 'webp',
      label: 'WebP',
      ext: '.webp',
      description: 'Modern format with strong compression and broad browser support.',
      supported: true,
    },
    {
      id: 'jpg',
      label: 'JPG / JPEG',
      ext: '.jpg',
      description: 'Best for photographs and smaller file sizes.',
      supported: true,
    },
    {
      id: 'png',
      label: 'PNG',
      ext: '.png',
      description: 'Best for transparency and lossless images.',
      supported: true,
    },
    {
      id: 'avif',
      label: 'AVIF',
      ext: '.avif',
      description: 'Modern high-efficiency format with excellent compression.',
      supported: avifSupported,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Target Output Format
        </label>
        <span className="text-[11px] text-zinc-400">
          Selected: <strong className="text-[#5722AF] dark:text-[#9B6BE8] uppercase">{selectedFormat}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {formats.map((fmt) => {
          const isSelected = selectedFormat === fmt.id;
          const isDisabled = !fmt.supported;

          return (
            <button
              key={fmt.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(fmt.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#5722AF] bg-[#5722AF]/5 dark:border-[#9B6BE8] dark:bg-[#5722AF]/15 shadow-xs ring-1 ring-[#5722AF]'
                  : isDisabled
                  ? 'border-zinc-200 dark:border-zinc-800 opacity-40 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900'
                  : 'border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#131722] hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-[#181d2a]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>{fmt.label}</span>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    {fmt.ext}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-[#5722AF] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                {fmt.description}
              </p>
              {isDisabled && (
                <span className="mt-2 text-[10px] font-semibold text-rose-500">
                  Not supported by browser
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* AVIF browser notice if selected or unsupported */}
      {!avifSupported && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <span>
            <strong>Browser Notice:</strong> AVIF conversion is not supported by your current browser. Try Chrome/Edge or select WebP, JPG, or PNG for broad compatibility.
          </span>
        </div>
      )}
    </div>
  );
}
