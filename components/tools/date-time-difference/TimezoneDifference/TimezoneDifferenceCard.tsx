'use client';

import React, { useState, useEffect } from 'react';
import { COMMON_TIMEZONES, calculateTimeZoneDifference } from '@/lib/date-time/timezone';
import { Globe, ArrowLeftRight, Clock, Sparkles } from 'lucide-react';

export const TimezoneDifferenceCard: React.FC = () => {
  const [tz1, setTz1] = useState('America/New_York');
  const [tz2, setTz2] = useState('Asia/Kolkata');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const result = calculateTimeZoneDifference(tz1, tz2, currentTime);

  const handleSwap = () => {
    const temp = tz1;
    setTz1(tz2);
    setTz2(temp);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Time Zone Difference & Conversion
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compare local clocks and exact time offsets across international timezones
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer self-start sm:self-center"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Swap Time Zones</span>
        </button>
      </div>

      {/* 2 Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Timezone 1 */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Origin Time Zone
          </label>
          <select
            value={tz1}
            onChange={(e) => setTz1(e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.name} value={tz.name}>
                {tz.label}
              </option>
            ))}
          </select>

          <div className="pt-2">
            <span className="text-[11px] text-slate-400 block">Current Local Time</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {result.time1}
            </div>
          </div>
        </div>

        {/* Timezone 2 */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Target Time Zone
          </label>
          <select
            value={tz2}
            onChange={(e) => setTz2(e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.name} value={tz.name}>
                {tz.label}
              </option>
            ))}
          </select>

          <div className="pt-2">
            <span className="text-[11px] text-slate-400 block">Current Local Time</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {result.time2}
            </div>
          </div>
        </div>
      </div>

      {/* Difference Description Result */}
      <div className="p-6 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
          Time Zone Offset Difference
        </span>
        <div className="text-lg sm:text-2xl font-black text-purple-900 dark:text-purple-100">
          {result.description}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Offsets dynamically account for standard time and Daylight Saving Time (DST) changes in each respective territory via official IANA timezone rules.
        </p>
      </div>
    </div>
  );
};
