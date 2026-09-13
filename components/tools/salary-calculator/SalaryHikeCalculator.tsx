'use client';

import React, { useState } from 'react';
import { calculateSalaryHike } from '@/lib/salary/calculations';
import { formatCurrencyINR } from '@/lib/salary/formatting';
import { TrendingUp, ArrowUpRight, Percent, IndianRupee, Sparkles } from 'lucide-react';

export const SalaryHikeCalculator: React.FC = () => {
  const [currentCTC, setCurrentCTC] = useState<number>(1000000);
  const [mode, setMode] = useState<'percent' | 'new_ctc'>('percent');
  const [hikeValue, setHikeValue] = useState<number>(20);

  const result = calculateSalaryHike(
    currentCTC,
    {
      type: mode === 'percent' ? 'percentage' : 'new_ctc',
      value: hikeValue,
    },
    'new'
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Salary Hike & Appraisal Calculator
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            See how much an appraisal percentage or new job offer actually increases your monthly take-home pay
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Current CTC */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Annual CTC (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="100000"
                step="50000"
                value={currentCTC || ''}
                onChange={(e) => setCurrentCTC(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Appraisal Increment Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('percent');
                  setHikeValue(20);
                }}
                className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  mode === 'percent'
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Hike Percentage (%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('new_ctc');
                  setHikeValue(Math.round(currentCTC * 1.25));
                }}
                className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  mode === 'new_ctc'
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                New Offer CTC (₹)
              </button>
            </div>
          </div>

          {/* Hike Input Field */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {mode === 'percent' ? 'Increment Percentage (%)' : 'New Offered Annual CTC (₹)'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                {mode === 'percent' ? <Percent className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
              </div>
              <input
                type="number"
                step={mode === 'percent' ? '1' : '50000'}
                value={hikeValue || ''}
                onChange={(e) => setHikeValue(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              />
            </div>
          </div>
        </div>

        {/* Increment Results (5 cols) */}
        <div className="lg:col-span-5 bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/50 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Net Monthly In-Hand Increment</span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-[#5722AF] dark:text-[#9B6BE8] tracking-tight mb-1">
              +{formatCurrencyINR(result.monthlyIncrease)}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400"> / mo</span>
            </div>

            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-5 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{result.hikePercentage.toFixed(1)}% CTC Appraisal</span>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm border-t border-purple-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Current In-Hand:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrencyINR(result.currentMonthlyInHand)} / mo
                </span>
              </div>
              <div className="flex justify-between text-[#5722AF] dark:text-purple-300 font-bold">
                <span>New In-Hand:</span>
                <span>
                  {formatCurrencyINR(result.newMonthlyInHand)} / mo
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Annual In-Hand Increase:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  +{formatCurrencyINR(result.annualIncrease)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>New Annual CTC:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrencyINR(result.newCTC)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
