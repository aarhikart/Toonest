'use client';

import React from 'react';
import { TimeInput, TimeFormat, MidnightMode } from '@/lib/date-time/types';
import { ArrowLeftRight, Clock, Sparkles } from 'lucide-react';

interface TimeDifferenceFormProps {
  startTime: TimeInput;
  endTime: TimeInput;
  onStartTimeChange: (time: TimeInput) => void;
  onEndTimeChange: (time: TimeInput) => void;
  timeFormat: TimeFormat;
  onTimeFormatChange: (format: TimeFormat) => void;
  midnightMode: MidnightMode;
  onMidnightModeChange: (mode: MidnightMode) => void;
  onSwapTimes: () => void;
}

export const TimeDifferenceForm: React.FC<TimeDifferenceFormProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  timeFormat,
  onTimeFormatChange,
  midnightMode,
  onMidnightModeChange,
  onSwapTimes,
}) => {
  const getNowTime = (): TimeInput => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (timeFormat === '12h') {
      const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
      const hours12 = h % 12 === 0 ? 12 : h % 12;
      return { hours: hours12, minutes: m, seconds: s, ampm };
    }
    return { hours: h, minutes: m, seconds: s };
  };

  const renderTimeInput = (
    label: string,
    time: TimeInput,
    onChange: (t: TimeInput) => void,
    onSetNow: () => void
  ) => {
    const maxHour = timeFormat === '12h' ? 12 : 23;
    const minHour = timeFormat === '12h' ? 1 : 0;

    return (
      <div className="space-y-2 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {label}
          </label>
          <button
            type="button"
            onClick={onSetNow}
            className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
          >
            Use Now
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2">
          {/* Hours */}
          <div className={`${timeFormat === '12h' ? 'col-span-3' : 'col-span-4'} space-y-1`}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Hours</label>
            <input
              type="number"
              min={minHour}
              max={maxHour}
              value={time.hours}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onChange({ ...time, hours: Math.min(maxHour, Math.max(minHour, val)) });
              }}
              className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2.5 text-center focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Minutes */}
          <div className={`${timeFormat === '12h' ? 'col-span-3' : 'col-span-4'} space-y-1`}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Mins</label>
            <input
              type="number"
              min={0}
              max={59}
              value={time.minutes}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onChange({ ...time, minutes: Math.min(59, Math.max(0, val)) });
              }}
              className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2.5 text-center focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Seconds */}
          <div className={`${timeFormat === '12h' ? 'col-span-3' : 'col-span-4'} space-y-1`}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase">Secs</label>
            <input
              type="number"
              min={0}
              max={59}
              value={time.seconds}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onChange({ ...time, seconds: Math.min(59, Math.max(0, val)) });
              }}
              className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2.5 text-center focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* AM / PM (for 12h) */}
          {timeFormat === '12h' && (
            <div className="col-span-3 space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Period</label>
              <select
                value={time.ampm || 'AM'}
                onChange={(e) => onChange({ ...time, ampm: e.target.value as 'AM' | 'PM' })}
                className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handlePreset = (presetId: string) => {
    switch (presetId) {
      case 'work':
        if (timeFormat === '12h') {
          onStartTimeChange({ hours: 9, minutes: 0, seconds: 0, ampm: 'AM' });
          onEndTimeChange({ hours: 5, minutes: 0, seconds: 0, ampm: 'PM' });
        } else {
          onStartTimeChange({ hours: 9, minutes: 0, seconds: 0 });
          onEndTimeChange({ hours: 17, minutes: 0, seconds: 0 });
        }
        onMidnightModeChange('same_day');
        break;
      case 'night':
        if (timeFormat === '12h') {
          onStartTimeChange({ hours: 10, minutes: 0, seconds: 0, ampm: 'PM' });
          onEndTimeChange({ hours: 2, minutes: 0, seconds: 0, ampm: 'AM' });
        } else {
          onStartTimeChange({ hours: 22, minutes: 0, seconds: 0 });
          onEndTimeChange({ hours: 2, minutes: 0, seconds: 0 });
        }
        onMidnightModeChange('next_day');
        break;
      case 'meeting':
        if (timeFormat === '12h') {
          onStartTimeChange({ hours: 11, minutes: 30, seconds: 0, ampm: 'AM' });
          onEndTimeChange({ hours: 12, minutes: 15, seconds: 0, ampm: 'PM' });
        } else {
          onStartTimeChange({ hours: 11, minutes: 30, seconds: 0 });
          onEndTimeChange({ hours: 12, minutes: 15, seconds: 0 });
        }
        onMidnightModeChange('same_day');
        break;
      default:
        break;
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Top Controls: Format + Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Time Difference Calculation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compute exact hours, minutes, and seconds between two clock times
          </p>
        </div>

        {/* 12h / 24h toggle & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onTimeFormatChange('12h')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeFormat === '12h'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              12-Hour (AM/PM)
            </button>
            <button
              type="button"
              onClick={() => onTimeFormatChange('24h')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeFormat === '24h'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              24-Hour
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePreset('work')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              9 AM – 5 PM
            </button>
            <button
              type="button"
              onClick={() => handlePreset('night')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              10 PM – 2 AM
            </button>
            <button
              type="button"
              onClick={() => handlePreset('meeting')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              11:30 – 12:15
            </button>
          </div>
        </div>
      </div>

      {/* Time Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Start Time */}
        {renderTimeInput('Start Time', startTime, onStartTimeChange, () => onStartTimeChange(getNowTime()))}

        {/* Desktop Swap Button */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            type="button"
            onClick={onSwapTimes}
            className="p-2.5 rounded-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 shadow-md hover:scale-105 transition-transform cursor-pointer"
            title="Swap Start & End Times"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* End Time */}
        {renderTimeInput('End Time', endTime, onEndTimeChange, () => onEndTimeChange(getNowTime()))}
      </div>

      {/* Mobile Swap */}
      <div className="flex lg:hidden justify-center">
        <button
          type="button"
          onClick={onSwapTimes}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Swap Start and End Times</span>
        </button>
      </div>

      {/* Midnight Crossing Configuration */}
      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Overnight & Midnight Handling
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Choose whether the end time is on the same day or crosses into the next day (e.g. 10 PM to 2 AM)
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => onMidnightModeChange('auto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              midnightMode === 'auto'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Auto Detect
          </button>
          <button
            type="button"
            onClick={() => onMidnightModeChange('same_day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              midnightMode === 'same_day'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Same Day
          </button>
          <button
            type="button"
            onClick={() => onMidnightModeChange('next_day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              midnightMode === 'next_day'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Next Day (+24h)
          </button>
        </div>
      </div>
    </div>
  );
};
