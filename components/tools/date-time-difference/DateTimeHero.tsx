'use client';

import React from 'react';
import { CalendarClock, ShieldCheck, Zap } from 'lucide-react';

export const DateTimeHero: React.FC = () => {
  return (
    <section className="text-center space-y-4 pt-2 pb-6">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-semibold shadow-xs">
        <CalendarClock className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
        <span>Professional Date & Time Utility</span>
        <span className="w-1 h-1 rounded-full bg-purple-400"></span>
        <span className="text-[11px] text-purple-700 dark:text-purple-300 font-normal">
          100% Client-Side
        </span>
      </div>

      {/* Main H1 */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Date & Time Difference Calculator
      </h1>

      {/* Subtitle */}
      <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
        Calculate the exact difference between two dates or times in seconds, minutes, hours, days, months, and years. Fast, accurate calculations directly in your browser.
      </p>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Zero Data Uploaded
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Business Days & Midnight Crossing
        </span>
      </div>
    </section>
  );
};
