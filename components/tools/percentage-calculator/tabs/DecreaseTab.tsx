'use client';

import React from 'react';

interface DecreaseTabProps {
  original: string;
  setOriginal: (v: string) => void;
  newValue: string;
  setNewValue: (v: string) => void;
}

export const DecreaseTab: React.FC<DecreaseTabProps> = ({
  original,
  setOriginal,
  newValue,
  setNewValue,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Original Value
        </label>
        <input
          type="number"
          step="any"
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          placeholder="e.g. 500"
          className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <p className="text-[11px] text-slate-400">The starting baseline value</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          New / Decreased Value
        </label>
        <input
          type="number"
          step="any"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="e.g. 400"
          className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <p className="text-[11px] text-slate-400">The new amount after decrease</p>
      </div>
    </div>
  );
};
