'use client';

import React, { useState } from 'react';
import { Copy, Check, Share2, Sparkles, Calendar } from 'lucide-react';
import { AgeCalculationResult } from '@/lib/age/types';
import { formatDateLong } from '@/lib/age/dates';

interface AgeResultCardProps {
  result: AgeCalculationResult;
  onShare: () => void;
}

export const AgeResultCard: React.FC<AgeResultCardProps> = ({
  result,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);

  const { exactAge, birth, target, weekday } = result;

  const handleCopy = async () => {
    const text = [
      `Age: ${exactAge.years} years, ${exactAge.months} months, ${exactAge.days} days`,
      `Date of Birth: ${formatDateLong(birth)} (${weekday})`,
      `Calculated As Of: ${formatDateLong(target)}`,
      `Total Days: ${result.totalStats.days.toLocaleString()}`,
      `Next Birthday: ${formatDateLong(result.birthday.nextBirthday)} (${result.birthday.daysUntil} days remaining)`,
      `Calculated on ToolNest Age Calculator`,
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
    <div className="rounded-3xl bg-gradient-to-b from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-950/20 border border-purple-200/80 dark:border-purple-900/50 p-6 sm:p-8 shadow-lg shadow-purple-950/5 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            Calculated Exact Age
          </span>
          {result.birthday.isBirthdayToday && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 animate-bounce">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Birthday Today!
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
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
            title="Copy age summary to clipboard"
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

      {/* Main Big Age Display */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
        {/* Years */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs">
          <div className="text-3xl sm:text-5xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
            {exactAge.years}
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">
            {exactAge.years === 1 ? 'Year' : 'Years'}
          </div>
        </div>

        {/* Months */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs">
          <div className="text-3xl sm:text-5xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
            {exactAge.months}
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">
            {exactAge.months === 1 ? 'Month' : 'Months'}
          </div>
        </div>

        {/* Days */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 shadow-xs">
          <div className="text-3xl sm:text-5xl font-black text-purple-700 dark:text-purple-400 tracking-tight">
            {exactAge.days}
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">
            {exactAge.days === 1 ? 'Day' : 'Days'}
          </div>
        </div>
      </div>

      {/* Contextual Sub-Notes */}
      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div>
          <span className="text-slate-400 font-medium">Born on:</span>{' '}
          <span className="font-bold text-slate-800 dark:text-white">
            {formatDateLong(birth)} ({weekday})
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Age calculated on:</span>{' '}
          <span className="font-bold text-slate-800 dark:text-white">
            {formatDateLong(target)} {result.isCustomDate && '(Custom Date)'}
          </span>
        </div>
      </div>
    </div>
  );
};
