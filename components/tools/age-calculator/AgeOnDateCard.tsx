'use client';

import React, { useState } from 'react';
import { DateInput } from '@/lib/age/types';
import { calculateExactAge } from '@/lib/age/calculations';
import { formatDateLong, compareDates, getTodayDateInput } from '@/lib/age/dates';
import { DateInputFields } from './DateInputFields';
import { CalendarSearch, ArrowRight, Check } from 'lucide-react';

interface AgeOnDateCardProps {
  birthDate: DateInput;
}

export const AgeOnDateCard: React.FC<AgeOnDateCardProps> = ({ birthDate }) => {
  const today = getTodayDateInput();
  const [targetDate, setTargetDate] = useState<DateInput>({
    year: today.year + 5,
    month: 1,
    day: 1,
  });

  const cmp = compareDates(targetDate, birthDate);
  const isValidTarget = cmp >= 0;

  const ageResult = isValidTarget
    ? calculateExactAge(birthDate, targetDate)
    : null;

  const isFuture = compareDates(targetDate, today) > 0;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
          <CalendarSearch className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Age on a Specific Date
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Check what your exact age was in the past or will be in the future
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <DateInputFields
            label="Select Target Calculation Date"
            date={targetDate}
            onChange={setTargetDate}
            minYear={birthDate.year}
            maxYear={birthDate.year + 120}
          />
        </div>

        <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex flex-col justify-center space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isFuture ? 'Your Age Will Be' : 'Your Age Was'}
          </span>

          {isValidTarget && ageResult ? (
            <>
              <div className="text-xl sm:text-2xl font-black text-purple-900 dark:text-purple-100">
                {ageResult.years} Years, {ageResult.months} Months, {ageResult.days} Days
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                On <strong className="text-purple-700 dark:text-purple-300">{formatDateLong(targetDate)}</strong>,
                measured from your birthday on {formatDateLong(birthDate)}.
              </p>
            </>
          ) : (
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              The target calculation date cannot be earlier than your date of birth.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
