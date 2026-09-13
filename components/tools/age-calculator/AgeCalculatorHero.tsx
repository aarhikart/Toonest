'use client';

import React from 'react';
import { Calendar, Clock, ShieldCheck } from 'lucide-react';

export const AgeCalculatorHero: React.FC = () => {
  return (
    <div className="text-center space-y-3 pt-2 pb-6 max-w-3xl mx-auto px-4">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold tracking-wide">
        <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        <span>Calculator Tools</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Age Calculator
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
        Calculate your exact age in years, months and days, and find out how much time has
        passed since your date of birth with calendar precision.
      </p>

      {/* Supporting Text */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          Real-time calendar arithmetic
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          100% Private (No data leaves your browser)
        </span>
      </div>
    </div>
  );
};
