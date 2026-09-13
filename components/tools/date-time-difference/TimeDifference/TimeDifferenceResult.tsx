'use client';

import React, { useState } from 'react';
import { TimeDiffResult, TimeInput, TimeFormat, PrecisionMode } from '@/lib/date-time/types';
import { formatTime, formatWithCommas, formatDecimalWithPrecision } from '@/lib/date-time/formatting';
import {
  Copy,
  Check,
  Share2,
  Clock,
  Moon,
  Sparkles,
  Zap,
} from 'lucide-react';

interface TimeDifferenceResultProps {
  result: TimeDiffResult;
  startTime: TimeInput;
  endTime: TimeInput;
  timeFormat: TimeFormat;
  precision: PrecisionMode;
  onShare: () => void;
}

export const TimeDifferenceResult: React.FC<TimeDifferenceResultProps> = ({
  result,
  startTime,
  endTime,
  timeFormat,
  precision,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);

  const startFormatted = formatTime(startTime, timeFormat);
  const endFormatted = formatTime(endTime, timeFormat);

  const handleCopy = async () => {
    const text = [
      `Time Difference: ${result.hours} Hours, ${result.minutes} Minutes, ${result.seconds} Seconds`,
      `Start Time: ${startFormatted}`,
      `End Time: ${endFormatted}${result.crossedMidnight ? ' (Next Day)' : ''}`,
      `Total Hours: ${formatDecimalWithPrecision(result.totalHours, precision)}`,
      `Total Minutes: ${formatDecimalWithPrecision(result.totalMinutes, precision)}`,
      `Total Seconds: ${formatWithCommas(result.totalSeconds)}`,
      `Calculated on ToolNest Time Difference Calculator`,
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
        {/* Header with Share and Copy */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Calculated Time Difference
            </span>
            {result.crossedMidnight && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <Moon className="w-3 h-3 text-indigo-500" />
                Crosses Midnight
              </span>
            )}
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

        {/* Big Time Display */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
          {/* Hours */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs">
            <div className="text-3xl sm:text-5xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
              {result.hours}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">
              {result.hours === 1 ? 'Hour' : 'Hours'}
            </div>
          </div>

          {/* Minutes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs">
            <div className="text-3xl sm:text-5xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
              {result.minutes}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">
              {result.minutes === 1 ? 'Minute' : 'Minutes'}
            </div>
          </div>

          {/* Seconds */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs">
            <div className="text-3xl sm:text-5xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
              {result.seconds}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">
              {result.seconds === 1 ? 'Second' : 'Seconds'}
            </div>
          </div>
        </div>

        {/* Start / End Range Bar */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-slate-400 font-medium">Start Time:</span>{' '}
            <strong className="text-slate-900 dark:text-white">{startFormatted}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium">End Time:</span>{' '}
            <strong className="text-slate-900 dark:text-white">
              {endFormatted} {result.crossedMidnight && '(Next Day)'}
            </strong>
          </div>
        </div>
      </div>

      {/* Detailed Units Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Hours</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatDecimalWithPrecision(result.totalHours, precision)}
          </div>
          <span className="text-[10px] text-slate-400">hours elapsed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Minutes</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatDecimalWithPrecision(result.totalMinutes, precision)}
          </div>
          <span className="text-[10px] text-slate-400">minutes elapsed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Seconds</span>
          <div className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400">
            {formatWithCommas(result.totalSeconds)}
          </div>
          <span className="text-[10px] text-slate-400">seconds elapsed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Milliseconds</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatWithCommas(result.totalMilliseconds)}
          </div>
          <span className="text-[10px] text-slate-400">ms elapsed</span>
        </div>
      </div>
    </div>
  );
};
