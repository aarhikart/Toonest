'use client';

import React from 'react';

interface StatisticCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sublabel?: string;
  highlight?: boolean;
}

export function StatisticCard({
  label,
  value,
  icon,
  sublabel,
  highlight = false,
}: StatisticCardProps) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between ${
        highlight
          ? 'bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border-[#5722AF]/30 dark:border-[#5722AF]/40 shadow-xs'
          : 'bg-white dark:bg-[#12151e] border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
        <div
          className={`p-2 rounded-xl transition-colors ${
            highlight
              ? 'bg-[#5722AF]/15 text-[#5722AF] dark:text-[#9B6BE8]'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {icon}
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {sublabel && (
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
