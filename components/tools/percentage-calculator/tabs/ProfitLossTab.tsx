'use client';

import React from 'react';
import { CurrencySymbol } from '@/lib/percentage/types';

interface ProfitLossTabProps {
  costPrice: string;
  setCostPrice: (v: string) => void;
  sellingPrice: string;
  setSellingPrice: (v: string) => void;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
}

export const ProfitLossTab: React.FC<ProfitLossTabProps> = ({
  costPrice,
  setCostPrice,
  sellingPrice,
  setSellingPrice,
  currency,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Cost Price (CP)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
            {currency}
          </span>
          <input
            type="number"
            step="any"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="e.g. 100"
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <p className="text-[11px] text-slate-400">Total expenditure to purchase or produce</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Selling Price (SP)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
            {currency}
          </span>
          <input
            type="number"
            step="any"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="e.g. 125"
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <p className="text-[11px] text-slate-400">Final revenue amount from sale</p>
      </div>
    </div>
  );
};
