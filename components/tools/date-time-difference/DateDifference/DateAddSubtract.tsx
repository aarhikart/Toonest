'use client';

import React, { useState } from 'react';
import { DateInput, AddSubtractDateParams } from '@/lib/date-time/types';
import { addToDate, subtractFromDate, getTodayDateInput } from '@/lib/date-time/dateCalculations';
import { formatDateDMY, formatDateLong, formatISODate, parseISODate } from '@/lib/date-time/formatting';
import { CalendarPlus, CalendarMinus, Plus, Minus, Copy, Check, Clock } from 'lucide-react';

export const DateAddSubtract: React.FC = () => {
  const [baseDate, setBaseDate] = useState<DateInput>(getTodayDateInput());
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');

  const [years, setYears] = useState<string>('0');
  const [months, setMonths] = useState<string>('0');
  const [weeks, setWeeks] = useState<string>('0');
  const [days, setDays] = useState<string>('10');

  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('0');

  const [copied, setCopied] = useState(false);

  const params: AddSubtractDateParams = {
    years: parseInt(years, 10) || 0,
    months: parseInt(months, 10) || 0,
    weeks: parseInt(weeks, 10) || 0,
    days: parseInt(days, 10) || 0,
    hours: parseInt(hours, 10) || 0,
    minutes: parseInt(minutes, 10) || 0,
  };

  const result =
    operation === 'add'
      ? addToDate(baseDate, params)
      : subtractFromDate(baseDate, params);

  const handleCopy = async () => {
    const text = [
      `Base Date: ${formatDateLong(baseDate)}`,
      `Operation: ${operation.toUpperCase()}`,
      `Adjustments: ${params.years}y ${params.months}m ${params.weeks}w ${params.days}d ${params.hours}h ${params.minutes}m`,
      `Result Date: ${formatDateLong(result.date)} (${result.weekday})`,
      result.time ? `Result Time: ${String(result.time.hours).padStart(2, '0')}:${String(result.time.minutes).padStart(2, '0')}` : '',
      `Calculated on ToolNest`,
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8]">
            {operation === 'add' ? (
              <CalendarPlus className="w-5 h-5" />
            ) : (
              <CalendarMinus className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add or Subtract Time From a Date
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate future or past deadlines, milestones, and project targets
            </p>
          </div>
        </div>

        {/* Operation Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setOperation('add')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              operation === 'add'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Date</span>
          </button>
          <button
            type="button"
            onClick={() => setOperation('subtract')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              operation === 'subtract'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Subtract</span>
          </button>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Base Date Picker */}
        <div className="lg:col-span-5 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Base Starting Date
          </label>
          <input
            type="date"
            value={formatISODate(baseDate)}
            onChange={(e) => {
              const parsed = parseISODate(e.target.value);
              if (parsed) setBaseDate(parsed);
            }}
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
          <div className="text-[11px] text-slate-500">
            Selected: <strong className="text-slate-700 dark:text-slate-200">{formatDateLong(baseDate)}</strong>
          </div>
        </div>

        {/* Right: Units to Add/Subtract */}
        <div className="lg:col-span-7 space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Values to {operation === 'add' ? 'Add' : 'Subtract'}
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Years</label>
              <input
                type="number"
                min="0"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Months</label>
              <input
                type="number"
                min="0"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Weeks</label>
              <input
                type="number"
                min="0"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Days</label>
              <input
                type="number"
                min="0"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2"
              />
            </div>
          </div>

          {/* Optional Hours & Minutes */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-600" />
                Hours (Optional)
              </label>
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-600" />
                Minutes (Optional)
              </label>
              <input
                type="number"
                min="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="p-6 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
            Calculated Target Date
          </span>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-purple-100 mt-0.5">
            {formatDateLong(result.date)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Falls on a <strong className="text-purple-800 dark:text-purple-300">{result.weekday}</strong>
            {result.time && (
              <>
                {' '}at{' '}
                <strong>
                  {String(result.time.hours).padStart(2, '0')}:
                  {String(result.time.minutes).padStart(2, '0')}
                </strong>
              </>
            )}
            .
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-xs shrink-0 cursor-pointer"
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
    </div>
  );
};
