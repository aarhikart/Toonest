'use client';

import React from 'react';
import { DateInput } from '@/lib/age/types';
import { getDaysInMonth, formatISODate, parseISODate } from '@/lib/age/dates';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateInputFieldsProps {
  label: string;
  date: DateInput;
  onChange: (date: DateInput) => void;
  maxYear?: number;
  minYear?: number;
}

const MONTHS = [
  { value: 1, label: '01 - January' },
  { value: 2, label: '02 - February' },
  { value: 3, label: '03 - March' },
  { value: 4, label: '04 - April' },
  { value: 5, label: '05 - May' },
  { value: 6, label: '06 - June' },
  { value: 7, label: '07 - July' },
  { value: 8, label: '08 - August' },
  { value: 9, label: '09 - September' },
  { value: 10, label: '10 - October' },
  { value: 11, label: '11 - November' },
  { value: 12, label: '12 - December' },
];

export const DateInputFields: React.FC<DateInputFieldsProps> = ({
  label,
  date,
  onChange,
  maxYear = 2100,
  minYear = 1900,
}) => {
  const maxDays = getDaysInMonth(date.year, date.month);

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 31) {
      onChange({ ...date, day: Math.min(val, maxDays) });
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 12) {
      const newMaxDays = getDaysInMonth(date.year, val);
      onChange({
        ...date,
        month: val,
        day: Math.min(date.day, newMaxDays),
      });
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const newMaxDays = getDaysInMonth(val, date.month);
      onChange({
        ...date,
        year: val,
        day: Math.min(date.day, newMaxDays),
      });
    }
  };

  const handleNativePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseISODate(e.target.value);
    if (parsed) {
      onChange(parsed);
    }
  };

  const daysList = Array.from({ length: maxDays }, (_, i) => i + 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <span className="text-[11px] text-slate-400 font-medium">Format: DD/MM/YYYY</span>
      </div>

      <div className="grid grid-cols-12 gap-2">
        {/* Day Select */}
        <div className="col-span-3 sm:col-span-3 space-y-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Day
          </label>
          <select
            value={date.day}
            onChange={handleDayChange}
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            {daysList.map((d) => (
              <option key={d} value={d}>
                {String(d).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div className="col-span-5 sm:col-span-5 space-y-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Month
          </label>
          <select
            value={date.month}
            onChange={handleMonthChange}
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer truncate"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Input */}
        <div className="col-span-4 sm:col-span-4 space-y-1 relative">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Year
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              min={minYear}
              max={maxYear}
              value={date.year}
              onChange={handleYearChange}
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            {/* Native Date Picker Hidden Overlay Trigger */}
            <div className="absolute right-2 top-2.5 text-slate-400 hover:text-purple-600 cursor-pointer" title="Open calendar picker">
              <CalendarIcon className="w-4 h-4 pointer-events-none" />
              <input
                type="date"
                value={formatISODate(date)}
                onChange={handleNativePicker}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Pick date from calendar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
