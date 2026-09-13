'use client';

import React, { useState } from 'react';
import { DateDiffResult } from '@/lib/date-time/types';
import { formatDateLong, formatWithCommas } from '@/lib/date-time/formatting';
import { getDayOfWeekName } from '@/lib/date-time/dateCalculations';
import {
  Copy,
  Check,
  Share2,
  Calendar,
  Briefcase,
  Coffee,
  CalendarDays,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DateDifferenceResultProps {
  result: DateDiffResult;
  onShare: () => void;
  onReset: () => void;
}

export const DateDifferenceResult: React.FC<DateDifferenceResultProps> = ({
  result,
  onShare,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const { calendarDiff, totalUnits, businessDays, start, end, isInclusive } =
    result;

  const startWeekday = getDayOfWeekName(start);
  const endWeekday = getDayOfWeekName(end);

  const handleCopy = async () => {
    const text = [
      `Date Difference: ${calendarDiff.years} Years, ${calendarDiff.months} Months, ${calendarDiff.days} Days`,
      `Start Date: ${formatDateLong(start)} (${startWeekday})`,
      `End Date: ${formatDateLong(end)} (${endWeekday})`,
      `Counting Mode: ${isInclusive ? 'Inclusive (both dates counted)' : 'Exclusive (elapsed duration)'}`,
      `Total Days: ${formatWithCommas(totalUnits.days)}`,
      `Total Weeks: ${formatWithCommas(totalUnits.weeks)} weeks + ${totalUnits.remainingDays} days`,
      `Business Days: ${formatWithCommas(businessDays.businessDays)}`,
      `Weekend Days: ${formatWithCommas(businessDays.weekendDays)}`,
      `Total Hours: ${formatWithCommas(totalUnits.hours)}`,
      `Calculated on ToolNest Date Difference Calculator`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Hero Result Card */}
      <div className="rounded-3xl bg-gradient-to-b from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-950/20 border border-purple-200/80 dark:border-purple-900/50 p-6 sm:p-8 shadow-lg shadow-purple-950/5 space-y-6">
        {/* Header with Copy and Share */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Calculated Calendar Difference
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {isInclusive ? 'Inclusive (both start and end dates included)' : 'Exclusive (elapsed time between dates)'}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Share calculation link"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-xs shadow-purple-600/20 active:scale-[0.98] cursor-pointer"
              title="Copy result summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Big Calendar Difference Display */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
          {/* Years */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs">
            <div className="text-3xl sm:text-5xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
              {calendarDiff.years}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">
              {calendarDiff.years === 1 ? 'Year' : 'Years'}
            </div>
          </div>

          {/* Months */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs">
            <div className="text-3xl sm:text-5xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
              {calendarDiff.months}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">
              {calendarDiff.months === 1 ? 'Month' : 'Months'}
            </div>
          </div>

          {/* Days */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs">
            <div className="text-3xl sm:text-5xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
              {calendarDiff.days}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">
              {calendarDiff.days === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>

        {/* Start / End Range Bar */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-slate-400 font-medium">From:</span>{' '}
            <strong className="text-slate-900 dark:text-white">
              {formatDateLong(start)} ({startWeekday})
            </strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium">To:</span>{' '}
            <strong className="text-slate-900 dark:text-white">
              {formatDateLong(end)} ({endWeekday})
            </strong>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Total Units Grid + Business/Weekend Days Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Duration Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Total Elapsed Duration
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Days</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatWithCommas(totalUnits.days)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Weeks</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 truncate">
                {formatWithCommas(totalUnits.weeks)}{' '}
                <span className="text-xs font-semibold text-slate-400">
                  + {totalUnits.remainingDays}d
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Hours</span>
              <div className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {formatWithCommas(totalUnits.hours)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Minutes</span>
              <div className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {formatWithCommas(totalUnits.minutes)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 col-span-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Seconds</span>
              <div className="text-base sm:text-xl font-bold text-purple-700 dark:text-purple-400 mt-0.5">
                {formatWithCommas(totalUnits.seconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Business Days and Weekends Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Work & Weekend Breakdown
              </h3>
            </div>
            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
              {formatWithCommas(totalUnits.days)} Days Total
            </span>
          </div>

          <div className="space-y-3">
            {/* Weekdays */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100 block">
                    Working / Business Days
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Monday – Friday excluding custom holidays
                  </span>
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200">
                {formatWithCommas(businessDays.businessDays)}
              </span>
            </div>

            {/* Weekends */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-100 block">
                    Weekend Days
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    Saturday & Sunday
                  </span>
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-200">
                {formatWithCommas(businessDays.weekendDays)}
              </span>
            </div>

            {/* Custom Excluded Holidays (if any) */}
            {businessDays.holidayDays > 0 && (
              <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 flex items-center justify-between text-xs text-purple-900 dark:text-purple-100">
                <span>Custom Holidays Excluded:</span>
                <strong className="font-bold">{businessDays.holidayDays} Days</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
