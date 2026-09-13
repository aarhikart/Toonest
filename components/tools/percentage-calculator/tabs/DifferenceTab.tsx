'use client';

import React from 'react';

interface DifferenceTabProps {
  valA: string;
  setValA: (v: string) => void;
  valB: string;
  setValB: (v: string) => void;
}

export const DifferenceTab: React.FC<DifferenceTabProps> = ({
  valA,
  setValA,
  valB,
  setValB,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Value A
        </label>
        <input
          type="number"
          step="any"
          value={valA}
          onChange={(e) => setValA(e.target.value)}
          placeholder="e.g. 10"
          className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <p className="text-[11px] text-slate-400">First value for comparison</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Value B
        </label>
        <input
          type="number"
          step="any"
          value={valB}
          onChange={(e) => setValB(e.target.value)}
          placeholder="e.g. 20"
          className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <p className="text-[11px] text-slate-400">Second value for comparison</p>
      </div>
    </div>
  );
};
