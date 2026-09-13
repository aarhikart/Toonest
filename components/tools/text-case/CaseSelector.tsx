'use client';

import React from 'react';
import { CaseMode } from '@/lib/text/types';

interface CaseSelectorProps {
  mode: CaseMode;
  onSelectMode: (mode: CaseMode) => void;
}

export function CaseSelector({ mode, onSelectMode }: CaseSelectorProps) {
  const tabs: { id: CaseMode; label: string; icon: string; example: string }[] = [
    {
      id: 'uppercase',
      label: 'UPPERCASE',
      icon: 'A',
      example: 'HELLO WORLD',
    },
    {
      id: 'lowercase',
      label: 'lowercase',
      icon: 'a',
      example: 'hello world',
    },
    {
      id: 'titlecase',
      label: 'Title Case',
      icon: 'Aa',
      example: 'Hello World',
    },
  ];

  return (
    <div className="w-full" role="tablist" aria-label="Text Case Selection">
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700/70">
        {tabs.map((tab) => {
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectMode(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#151923] text-[#5722AF] dark:text-[#9B6BE8] shadow-xs border border-[#5722AF]/20 dark:border-[#5722AF]/40'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-700/40'
              }`}
            >
              {/* Icon badge */}
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8]'
                    : 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {tab.icon}
              </span>

              {/* Label */}
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
