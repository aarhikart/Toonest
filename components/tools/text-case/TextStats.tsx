'use client';

import React from 'react';
import { TextStatistics } from '@/lib/text/types';
import { AlignLeft, Hash, FileText, Space, Type } from 'lucide-react';

interface TextStatsProps {
  stats: TextStatistics;
}

export function TextStats({ stats }: TextStatsProps) {
  const items = [
    {
      label: 'Characters',
      value: stats.characters.toLocaleString(),
      icon: <Type className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />,
    },
    {
      label: 'Without Spaces',
      value: stats.charactersNoSpaces.toLocaleString(),
      icon: <Space className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />,
    },
    {
      label: 'Words',
      value: stats.words.toLocaleString(),
      icon: <AlignLeft className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />,
    },
    {
      label: 'Lines',
      value: stats.lines.toLocaleString(),
      icon: <FileText className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />,
    },
    {
      label: 'Sentences',
      value: stats.sentences.toLocaleString(),
      icon: <Hash className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#12151e] rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-3 sm:p-4 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-center">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800"
          >
            <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">
              {item.icon}
              <span className="truncate">{item.label}</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white font-mono">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
