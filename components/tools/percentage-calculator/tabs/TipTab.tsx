'use client';

import React from 'react';
import { CurrencySymbol } from '@/lib/percentage/types';
import { Users } from 'lucide-react';

interface TipTabProps {
  billAmount: string;
  setBillAmount: (v: string) => void;
  tipPercent: string;
  setTipPercent: (v: string) => void;
  numPeople: string;
  setNumPeople: (v: string) => void;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
}

const TIP_PRESETS = ['5', '10', '15', '18', '20', '25'];

export const TipTab: React.FC<TipTabProps> = ({
  billAmount,
  setBillAmount,
  tipPercent,
  setTipPercent,
  numPeople,
  setNumPeople,
  currency,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bill Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Bill Subtotal
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
              {currency}
            </span>
            <input
              type="number"
              step="any"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder="e.g. 2500"
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <p className="text-[11px] text-slate-400">Total dining or service bill</p>
        </div>

        {/* Number of People */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Split Between (People)</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={numPeople}
            onChange={(e) => setNumPeople(e.target.value)}
            placeholder="1"
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <p className="text-[11px] text-slate-400">Number of guests sharing the bill</p>
        </div>
      </div>

      {/* Tip Percentage with Preset Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Tip Percentage
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {TIP_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTipPercent(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tipPercent === p
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p}%
            </button>
          ))}
          <div className="relative w-28">
            <input
              type="number"
              step="any"
              value={tipPercent}
              onChange={(e) => setTipPercent(e.target.value)}
              placeholder="Custom"
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 pr-6 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span className="absolute right-2.5 top-1.5 text-slate-400 font-bold text-xs">
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
