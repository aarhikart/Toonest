'use client';

import React from 'react';
import { TitleCaseOptions, TitleCaseStyle } from '@/lib/text/types';
import { SlidersHorizontal, Info } from 'lucide-react';

interface TitleCaseSettingsProps {
  options: TitleCaseOptions;
  onChangeOptions: (options: TitleCaseOptions) => void;
}

export function TitleCaseSettings({
  options,
  onChangeOptions,
}: TitleCaseSettingsProps) {
  const styles: { id: TitleCaseStyle; label: string; desc: string }[] = [
    {
      id: 'standard',
      label: 'Standard Title Case',
      desc: 'Keeps articles & prepositions lowercase (e.g., "The Lord of the Rings")',
    },
    {
      id: 'every-word',
      label: 'Every Word',
      desc: 'Capitalizes every single word (e.g., "The Lord Of The Rings")',
    },
    {
      id: 'sentence',
      label: 'Sentence-Like',
      desc: 'Capitalizes only the first letter of each sentence',
    },
  ];

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 text-xs space-y-2.5 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Title Case Style:</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {styles.map((s) => {
          const isSelected = options.style === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChangeOptions({ ...options, style: s.id })}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#5722AF] bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8]'
                  : 'border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70'
              }`}
            >
              <div className="font-semibold text-xs mb-0.5">{s.label}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-snug">
                {s.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
