'use client';

import React, { useState } from 'react';
import { DateInput } from '@/lib/age/types';
import { calculateAgeDifference } from '@/lib/age/calculations';
import { formatDateLong, formatWithCommas } from '@/lib/age/dates';
import { DateInputFields } from './DateInputFields';
import { ArrowLeftRight, Users, Sparkles } from 'lucide-react';

export const AgeDifferenceCard: React.FC = () => {
  const [p1, setP1] = useState<DateInput>({ year: 1995, month: 8, day: 15 });
  const [p2, setP2] = useState<DateInput>({ year: 1998, month: 12, day: 20 });

  const result = calculateAgeDifference(p1, p2);

  const handleSwap = () => {
    const temp = { ...p1 };
    setP1(p2);
    setP2(temp);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Age Difference Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compare two birth dates and see the exact gap in years, months, and days
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer self-start sm:self-center"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Swap People</span>
        </button>
      </div>

      {/* 2 Date Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
            Person 1
          </div>
          <DateInputFields
            label="Person 1 Date of Birth"
            date={p1}
            onChange={setP1}
          />
        </div>

        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
            Person 2
          </div>
          <DateInputFields
            label="Person 2 Date of Birth"
            date={p2}
            onChange={setP2}
          />
        </div>
      </div>

      {/* Difference Output Box */}
      <div className="p-6 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            Age Difference
          </span>
          <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">
            {formatWithCommas(result.totalDays)} Total Days Gap
          </span>
        </div>

        {result.older === 'same' ? (
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            Both individuals share the exact same date of birth!
          </div>
        ) : (
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-purple-100">
              {result.diff.years} Years, {result.diff.months} Months, {result.diff.days} Days
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              <strong className="text-purple-700 dark:text-purple-400 font-bold">
                {result.older === 'person1' ? 'Person 1' : 'Person 2'}
              </strong>{' '}
              is older by{' '}
              <strong>
                {result.diff.years} years, {result.diff.months} months, and {result.diff.days} days
              </strong>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
