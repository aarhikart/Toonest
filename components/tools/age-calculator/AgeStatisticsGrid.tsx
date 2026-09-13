'use client';

import React from 'react';
import { TotalStats } from '@/lib/age/types';
import { formatWithCommas } from '@/lib/age/dates';
import { CalendarDays, Clock, Hourglass, Info } from 'lucide-react';

interface AgeStatisticsGridProps {
  stats: TotalStats;
}

export const AgeStatisticsGrid: React.FC<AgeStatisticsGridProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Months',
      value: formatWithCommas(stats.months),
      desc: 'Completed calendar months',
      icon: <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    },
    {
      label: 'Total Weeks',
      value: formatWithCommas(stats.weeks),
      desc: 'Approximate full 7-day weeks',
      icon: <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      label: 'Total Days',
      value: formatWithCommas(stats.days),
      desc: 'Exact elapsed solar days',
      icon: <Hourglass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      label: 'Total Hours',
      value: formatWithCommas(stats.hours),
      desc: 'Based on 24-hour calendar days',
      icon: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    },
    {
      label: 'Total Minutes',
      value: formatWithCommas(stats.minutes),
      desc: 'Standard elapsed minutes',
      icon: <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    },
    {
      label: 'Total Seconds',
      value: formatWithCommas(stats.seconds),
      desc: 'Calculated calendar seconds',
      icon: <Hourglass className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
  ];

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Lifetime Time Passed
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total elapsed duration across different units of measurement
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1 hover:border-purple-200 dark:hover:border-purple-900/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stat.value}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {stat.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-[11px] text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <span>
          Note: Hours, minutes, and seconds are calculated from calendar midnight dates. Exact birth time was not provided.
        </span>
      </div>
    </div>
  );
};
