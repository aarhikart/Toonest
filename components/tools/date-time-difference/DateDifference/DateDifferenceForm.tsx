'use client';

import React from 'react';
import { DateInput, CountingMode } from '@/lib/date-time/types';
import { getDaysInMonth, getTodayDateInput } from '@/lib/date-time/dateCalculations';
import { formatDateDMY, formatDateLong, formatISODate, parseISODate } from '@/lib/date-time/formatting';
import { ArrowLeftRight, Calendar as CalendarIcon, Clock, Sparkles, Check, AlertTriangle } from 'lucide-react';

interface DateDifferenceFormProps {
  startDate: DateInput;
  endDate: DateInput;
  onStartDateChange: (date: DateInput) => void;
  onEndDateChange: (date: DateInput) => void;
  countingMode: CountingMode;
  onCountingModeChange: (mode: CountingMode) => void;
  onSwapDates: () => void;
  isReversed: boolean;
}

const MONTHS = [
  { value: 1, label: '01 - Jan' },
  { value: 2, label: '02 - Feb' },
  { value: 3, label: '03 - Mar' },
  { value: 4, label: '04 - Apr' },
  { value: 5, label: '05 - May' },
  { value: 6, label: '06 - Jun' },
  { value: 7, label: '07 - Jul' },
  { value: 8, label: '08 - Aug' },
  { value: 9, label: '09 - Sep' },
  { value: 10, label: '10 - Oct' },
  { value: 11, label: '11 - Nov' },
  { value: 12, label: '12 - Dec' },
];

export const DateDifferenceForm: React.FC<DateDifferenceFormProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  countingMode,
  onCountingModeChange,
  onSwapDates,
  isReversed,
}) => {
  const today = getTodayDateInput();

  // Helper for sub-inputs
  const renderDateInputs = (
    label: string,
    date: DateInput,
    onChange: (d: DateInput) => void,
    onSetToday: () => void
  ) => {
    const maxDays = getDaysInMonth(date.year, date.month);
    const daysList = Array.from({ length: maxDays }, (_, i) => i + 1);

    return (
      <div className="space-y-2 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {label}
          </label>
          <button
            type="button"
            onClick={onSetToday}
            className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
          >
            Use Today
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2">
          {/* Day */}
          <div className="col-span-3 space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Day</label>
            <select
              value={date.day}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onChange({ ...date, day: Math.min(val, maxDays) });
              }}
              className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer"
            >
              {daysList.map((d) => (
                <option key={d} value={d}>
                  {String(d).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="col-span-5 space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Month</label>
            <select
              value={date.month}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  const newMax = getDaysInMonth(date.year, val);
                  onChange({ ...date, month: val, day: Math.min(date.day, newMax) });
                }
              }}
              className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer truncate"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year + Native Picker */}
          <div className="col-span-4 space-y-1 relative">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Year</label>
            <div className="relative">
              <input
                type="number"
                min={1900}
                max={2100}
                value={date.year}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    const newMax = getDaysInMonth(val, date.month);
                    onChange({ ...date, year: val, day: Math.min(date.day, newMax) });
                  }
                }}
                className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
              <div
                className="absolute right-2 top-2.5 text-slate-400 hover:text-purple-600 cursor-pointer"
                title="Open calendar picker"
              >
                <CalendarIcon className="w-4 h-4 pointer-events-none" />
                <input
                  type="date"
                  value={formatISODate(date)}
                  onChange={(e) => {
                    const parsed = parseISODate(e.target.value);
                    if (parsed) onChange(parsed);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  aria-label="Pick date from calendar"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          Selected: <strong className="text-slate-700 dark:text-slate-200">{formatDateLong(date)}</strong>
        </div>
      </div>
    );
  };

  // Preset handlers
  const handlePreset = (type: string) => {
    const t = getTodayDateInput();
    switch (type) {
      case 'today':
        onStartDateChange(t);
        onEndDateChange(t);
        break;
      case 'yesterday':
        onStartDateChange({
          year: t.month === 1 && t.day === 1 ? t.year - 1 : t.year,
          month: t.day === 1 ? (t.month === 1 ? 12 : t.month - 1) : t.month,
          day: t.day === 1 ? getDaysInMonth(t.month === 1 ? t.year - 1 : t.year, t.month === 1 ? 12 : t.month - 1) : t.day - 1,
        });
        onEndDateChange(t);
        break;
      case 'tomorrow':
        onStartDateChange(t);
        onEndDateChange({
          year: t.month === 12 && t.day === 31 ? t.year + 1 : t.year,
          month: t.day === getDaysInMonth(t.year, t.month) ? (t.month === 12 ? 1 : t.month + 1) : t.month,
          day: t.day === getDaysInMonth(t.year, t.month) ? 1 : t.day + 1,
        });
        break;
      case 'this_month':
        onStartDateChange({ year: t.year, month: t.month, day: 1 });
        onEndDateChange({ year: t.year, month: t.month, day: getDaysInMonth(t.year, t.month) });
        break;
      case 'this_year':
        onStartDateChange({ year: t.year, month: 1, day: 1 });
        onEndDateChange({ year: t.year, month: 12, day: 31 });
        break;
      case 'plus_30': {
        const d = new Date(Date.UTC(t.year, t.month - 1, t.day));
        d.setUTCDate(d.getUTCDate() + 30);
        onStartDateChange(t);
        onEndDateChange({
          year: d.getUTCFullYear(),
          month: d.getUTCMonth() + 1,
          day: d.getUTCDate(),
        });
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header with Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Date Range Calculation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare two calendar dates or calculate elapsed business days
          </p>
        </div>

        {/* Quick Presets Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'tomorrow', label: 'Tomorrow' },
            { id: 'this_month', label: 'This Month' },
            { id: 'this_year', label: 'This Year' },
            { id: 'plus_30', label: '+30 Days' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePreset(p.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 hover:text-purple-700 dark:hover:text-purple-300 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Start Date */}
        {renderDateInputs('Start Date', startDate, onStartDateChange, () => onStartDateChange(today))}

        {/* Swap Button for Desktop */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            type="button"
            onClick={onSwapDates}
            className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 shadow-md hover:scale-105 transition-transform cursor-pointer"
            title="Swap Start & End Dates"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* End Date */}
        {renderDateInputs('End Date', endDate, onEndDateChange, () => onEndDateChange(today))}
      </div>

      {/* Mobile Swap Button */}
      <div className="flex lg:hidden justify-center">
        <button
          type="button"
          onClick={onSwapDates}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Swap Start and End Dates</span>
        </button>
      </div>

      {/* Warning when start > end */}
      {isReversed && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Start date ({formatDateDMY(startDate)}) is after end date ({formatDateDMY(endDate)}).
            </span>
          </div>
          <button
            type="button"
            onClick={onSwapDates}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            Swap Now
          </button>
        </div>
      )}

      {/* Counting Mode: Exclusive vs Inclusive */}
      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Date Counting Mode
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {countingMode === 'exclusive'
              ? 'Exclusive: Counts elapsed duration between dates (1 Jan to 2 Jan = 1 day)'
              : 'Inclusive: Counts both start and end calendar days (1 Jan to 2 Jan = 2 days)'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => onCountingModeChange('exclusive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              countingMode === 'exclusive'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Exclusive (Elapsed)
          </button>
          <button
            type="button"
            onClick={() => onCountingModeChange('inclusive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              countingMode === 'inclusive'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Inclusive (Both Days)
          </button>
        </div>
      </div>
    </div>
  );
};
