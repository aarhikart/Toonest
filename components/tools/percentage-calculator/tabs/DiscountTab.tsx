'use client';

import React from 'react';
import { CurrencySymbol } from '@/lib/percentage/types';

interface DiscountTabProps {
  originalPrice: string;
  setOriginalPrice: (v: string) => void;
  discountPercent: string;
  setDiscountPercent: (v: string) => void;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
}

const CURRENCIES: { label: string; symbol: CurrencySymbol }[] = [
  { label: '₹ INR', symbol: '₹' },
  { label: '$ USD', symbol: '$' },
  { label: '€ EUR', symbol: '€' },
  { label: '£ GBP', symbol: '£' },
  { label: '¥ JPY', symbol: '¥' },
];

export const DiscountTab: React.FC<DiscountTabProps> = ({
  originalPrice,
  setOriginalPrice,
  discountPercent,
  setDiscountPercent,
  currency,
  setCurrency,
}) => {
  return (
    <div className="space-y-4">
      {/* Currency Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Currency:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CURRENCIES.map((c) => (
            <button
              key={c.symbol}
              type="button"
              onClick={() => setCurrency(c.symbol)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                currency === c.symbol
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Original Price
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
              {currency}
            </span>
            <input
              type="number"
              step="any"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <p className="text-[11px] text-slate-400">Regular retail price before discount</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Discount Percentage
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="e.g. 20"
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-sm">
              %
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Percentage off original price</p>
        </div>
      </div>
    </div>
  );
};
