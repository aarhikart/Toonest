'use client';

import React from 'react';
import { Percent, Calculator, Sparkles } from 'lucide-react';

export const PercentageCalculatorHero: React.FC = () => {
  return (
    <div className="text-center space-y-3 pt-2 pb-6 max-w-3xl mx-auto px-4">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold tracking-wide">
        <Percent className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        <span>Calculator Tools</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Percentage Calculator
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
        Calculate percentages, increases, decreases, discounts, taxes, tips, profit,
        loss and more instantly with mathematical precision.
      </p>
    </div>
  );
};
