'use client';

import React, { useState } from 'react';
import { TimeInput, TimeFormat } from '@/lib/date-time/types';
import { addToTime, subtractFromTime } from '@/lib/date-time/timeCalculations';
import { formatTime } from '@/lib/date-time/formatting';
import { Clock, Plus, Minus, Copy, Check, Moon, Sun } from 'lucide-react';

interface TimeAddSubtractProps {
  timeFormat: TimeFormat;
}

export const TimeAddSubtract: React.FC<TimeAddSubtractProps> = ({
  timeFormat,
}) => {
  const [baseTime, setBaseTime] = useState<TimeInput>({
    hours: timeFormat === '12h' ? 11 : 23,
    minutes: 30,
    seconds: 0,
    ampm: 'PM',
  });

  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [hoursToAdd, setHoursToAdd] = useState('2');
  const [minutesToAdd, setMinutesToAdd] = useState('45');
  const [secondsToAdd, setSecondsToAdd] = useState('0');

  const [copied, setCopied] = useState(false);

  const addValues = {
    hours: parseInt(hoursToAdd, 10) || 0,
    minutes: parseInt(minutesToAdd, 10) || 0,
    seconds: parseInt(secondsToAdd, 10) || 0,
  };

  const result =
    operation === 'add'
      ? addToTime(baseTime, addValues, timeFormat)
      : subtractFromTime(baseTime, addValues, timeFormat);

  const formattedBase = formatTime(baseTime, timeFormat);
  const formattedResult = formatTime(result.time, timeFormat);

  const handleCopy = async () => {
    const text = [
      `Base Time: ${formattedBase}`,
      `Operation: ${operation.toUpperCase()} ${addValues.hours}h ${addValues.minutes}m ${addValues.seconds}s`,
      `Result Time: ${formattedResult} ${result.dayRollover > 0 ? '(Next Day)' : result.dayRollover < 0 ? '(Previous Day)' : '(Same Day)'}`,
      `Calculated on ToolNest Time Calculator`,
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
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add or Subtract Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate exact shift endpoints, departure/arrival times, and midnight crossings
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
            <span>Add Time</span>
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

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Base Time */}
        <div className="lg:col-span-5 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Base Starting Time
          </label>
          <div className="grid grid-cols-12 gap-2">
            <div className={`${timeFormat === '12h' ? 'col-span-4' : 'col-span-6'} space-y-1`}>
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Hours</label>
              <input
                type="number"
                min={timeFormat === '12h' ? 1 : 0}
                max={timeFormat === '12h' ? 12 : 23}
                value={baseTime.hours}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setBaseTime({ ...baseTime, hours: val });
                }}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-center"
              />
            </div>
            <div className={`${timeFormat === '12h' ? 'col-span-4' : 'col-span-6'} space-y-1`}>
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Mins</label>
              <input
                type="number"
                min={0}
                max={59}
                value={baseTime.minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setBaseTime({ ...baseTime, minutes: val });
                }}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-center"
              />
            </div>
            {timeFormat === '12h' && (
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">AM/PM</label>
                <select
                  value={baseTime.ampm || 'AM'}
                  onChange={(e) => setBaseTime({ ...baseTime, ampm: e.target.value as 'AM' | 'PM' })}
                  className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Adjustments */}
        <div className="lg:col-span-7 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Time to {operation === 'add' ? 'Add' : 'Subtract'}
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Hours</label>
              <input
                type="number"
                min={0}
                value={hoursToAdd}
                onChange={(e) => setHoursToAdd(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Minutes</label>
              <input
                type="number"
                min={0}
                value={minutesToAdd}
                onChange={(e) => setMinutesToAdd(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Seconds</label>
              <input
                type="number"
                min={0}
                value={secondsToAdd}
                onChange={(e) => setSecondsToAdd(e.target.value)}
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
            Resulting Clock Time
          </span>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-purple-100 mt-0.5 flex items-center gap-2">
            <span>{formattedResult}</span>
            {result.dayRollover > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                +1 Next Day
              </span>
            )}
            {result.dayRollover < 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                -1 Previous Day
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Calculated from {formattedBase} with {operation} of {addValues.hours}h {addValues.minutes}m.
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
