'use client';

import React from 'react';

interface PercentageTabProps {
  mode: 'what_is_x_of_y' | 'x_is_what_percent_of_y';
  setMode: (mode: 'what_is_x_of_y' | 'x_is_what_percent_of_y') => void;
  valX: string;
  setValX: (v: string) => void;
  valY: string;
  setValY: (v: string) => void;
}

export const PercentageTab: React.FC<PercentageTabProps> = ({
  mode,
  setMode,
  valX,
  setValX,
  valY,
  setValY,
}) => {
  return (
    <div className="space-y-4">
      {/* Sub-mode Switcher */}
      <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm">
        <button
          type="button"
          onClick={() => setMode('what_is_x_of_y')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mode === 'what_is_x_of_y'
              ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          What is X% of Y?
        </button>
        <button
          type="button"
          onClick={() => setMode('x_is_what_percent_of_y')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mode === 'x_is_what_percent_of_y'
              ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          X is what % of Y?
        </button>
      </div>

      {mode === 'what_is_x_of_y' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Percentage (X%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={valX}
                onChange={(e) => setValX(e.target.value)}
                placeholder="e.g. 20"
                className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <span className="absolute right-3 top-2.5 text-slate-400 font-bold text-sm">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-400">The percentage rate</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Total / Whole Number (Y)
            </label>
            <input
              type="number"
              step="any"
              value={valY}
              onChange={(e) => setValY(e.target.value)}
              placeholder="e.g. 500"
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <p className="text-[11px] text-slate-400">The base amount or number</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Part Value (X)
            </label>
            <input
              type="number"
              step="any"
              value={valX}
              onChange={(e) => setValX(e.target.value)}
              placeholder="e.g. 50"
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <p className="text-[11px] text-slate-400">The portion or numerator</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Whole Value (Y)
            </label>
            <input
              type="number"
              step="any"
              value={valY}
              onChange={(e) => setValY(e.target.value)}
              placeholder="e.g. 200"
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <p className="text-[11px] text-slate-400">The total base or denominator</p>
          </div>
        </div>
      )}
    </div>
  );
};
