'use client';

import React from 'react';
import { ZodiacInfo, BirthYearInfo, DateInput } from '@/lib/age/types';
import { formatDateLong } from '@/lib/age/dates';
import { Compass, Sparkles, Sun, Calendar, Info } from 'lucide-react';

interface AgeDetailsCardProps {
  birth: DateInput;
  weekday: string;
  zodiac: ZodiacInfo;
  birthYearInfo: BirthYearInfo;
}

export const AgeDetailsCard: React.FC<AgeDetailsCardProps> = ({
  birth,
  weekday,
  zodiac,
  birthYearInfo,
}) => {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Birth Date & Astrological Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Biographical context and calendar properties
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Weekday */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Day of the Week
          </span>
          <div className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-400">
            {weekday}
          </div>
          <p className="text-[11px] text-slate-400">You were born on a {weekday}</p>
        </div>

        {/* Zodiac Sign */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Zodiac Sign
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>{zodiac.symbol}</span>
            <span>{zodiac.sign}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {zodiac.element} Element ({zodiac.dateRange})
          </p>
        </div>

        {/* Leap Year Status */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Birth Year
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {birth.year}
          </div>
          <p className="text-[11px] text-slate-400">
            {birthYearInfo.isLeapYear ? '✓ Leap Year (366 days)' : 'Standard Year (365 days)'}
          </p>
        </div>

        {/* Generation & Decade */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Generation
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {birthYearInfo.generation}
          </div>
          <p className="text-[11px] text-slate-400">
            Born in the {birthYearInfo.decade}
          </p>
        </div>
      </div>
    </div>
  );
};
