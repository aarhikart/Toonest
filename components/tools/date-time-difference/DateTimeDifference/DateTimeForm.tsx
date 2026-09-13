'use client';

import React, { useState } from 'react';
import { DateTimeInput, TimeFormat } from '@/lib/date-time/types';
import { calculateDateTimeDifference } from '@/lib/date-time/timeCalculations';
import { formatISODate, parseISODate, formatDateLong, formatTime, formatWithCommas } from '@/lib/date-time/formatting';
import { getTodayDateInput } from '@/lib/date-time/dateCalculations';
import { CalendarClock, ArrowLeftRight, Copy, Check, Sparkles } from 'lucide-react';

export const DateTimeForm: React.FC = () => {
  const today = getTodayDateInput();

  const [start, setStart] = useState<DateTimeInput>({
    date: today,
    time: { hours: 10, minutes: 30, seconds: 0, ampm: 'AM' },
  });

  const [end, setEnd] = useState<DateTimeInput>({
    date: {
      year: today.year,
      month: today.month,
      day: Math.min(28, today.day + 3),
    },
    time: { hours: 2, minutes: 15, seconds: 0, ampm: 'PM' },
  });

  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const [copied, setCopied] = useState(false);

  const result = calculateDateTimeDifference(start, end, timeFormat);

  const handleSwap = () => {
    const temp = { ...start };
    setStart(end);
    setEnd(temp);
  };

  const handleCopy = async () => {
    const text = [
      `Date & Time Difference: ${result.days} Days, ${result.hours} Hours, ${result.minutes} Minutes`,
      `Start: ${formatDateLong(start.date)}, ${formatTime(start.time, timeFormat)}`,
      `End: ${formatDateLong(end.date)}, ${formatTime(end.time, timeFormat)}`,
      `Total Hours: ${formatWithCommas(result.totalHours)}`,
      `Total Minutes: ${formatWithCommas(result.totalMinutes)}`,
      `Total Seconds: ${formatWithCommas(result.totalSeconds)}`,
      `Calculated on ToolNest`,
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
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8]">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Combined Date & Time Difference
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate exact days, hours, and minutes across different dates and times
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer self-start sm:self-center"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Swap Start & End</span>
        </button>
      </div>

      {/* 2 Column Start & End Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start DateTime */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
            Start Date & Time
          </span>
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Date</label>
            <input
              type="date"
              value={formatISODate(start.date)}
              onChange={(e) => {
                const p = parseISODate(e.target.value);
                if (p) setStart({ ...start, date: p });
              }}
              className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Hour</label>
              <input
                type="number"
                min="1"
                max="12"
                value={start.time.hours}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setStart({ ...start, time: { ...start.time, hours: val } });
                }}
                className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Min</label>
              <input
                type="number"
                min="0"
                max="59"
                value={start.time.minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setStart({ ...start, time: { ...start.time, minutes: val } });
                }}
                className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Period</label>
              <select
                value={start.time.ampm || 'AM'}
                onChange={(e) => setStart({ ...start, time: { ...start.time, ampm: e.target.value as 'AM' | 'PM' } })}
                className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* End DateTime */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
            End Date & Time
          </span>
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Date</label>
            <input
              type="date"
              value={formatISODate(end.date)}
              onChange={(e) => {
                const p = parseISODate(e.target.value);
                if (p) setEnd({ ...end, date: p });
              }}
              className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Hour</label>
              <input
                type="number"
                min="1"
                max="12"
                value={end.time.hours}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setEnd({ ...end, time: { ...end.time, hours: val } });
                }}
                className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Min</label>
              <input
                type="number"
                min="0"
                max="59"
                value={end.time.minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setEnd({ ...end, time: { ...end.time, minutes: val } });
                }}
                className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Period</label>
              <select
                value={end.time.ampm || 'PM'}
                onChange={(e) => setEnd({ ...end, time: { ...end.time, ampm: e.target.value as 'AM' | 'PM' } })}
                className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Result Display */}
      <div className="p-6 rounded-3xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            Combined Date & Time Difference
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Result</span>
              </>
            )}
          </button>
        </div>

        <div className="text-2xl sm:text-4xl font-black text-purple-900 dark:text-purple-100">
          {result.days} Days, {result.hours} Hours, {result.minutes} Minutes
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 text-xs">
            <span className="text-slate-400 block">Total Hours</span>
            <strong className="text-base text-slate-900 dark:text-white">
              {formatWithCommas(result.totalHours)} hrs
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 text-xs">
            <span className="text-slate-400 block">Total Minutes</span>
            <strong className="text-base text-slate-900 dark:text-white">
              {formatWithCommas(result.totalMinutes)} mins
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 text-xs">
            <span className="text-slate-400 block">Total Seconds</span>
            <strong className="text-base text-purple-700 dark:text-purple-300">
              {formatWithCommas(result.totalSeconds)} secs
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
