'use client';

import React from 'react';
import { CurrencySymbol, TaxMode } from '@/lib/percentage/types';

interface TaxTabProps {
  mode: TaxMode;
  setMode: (m: TaxMode) => void;
  price: string;
  setPrice: (v: string) => void;
  taxPercent: string;
  setTaxPercent: (v: string) => void;
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
}

const COMMON_TAX_RATES = ['5', '12', '18', '20', '28'];

export const TaxTab: React.FC<TaxTabProps> = ({
  mode,
  setMode,
  price,
  setPrice,
  taxPercent,
  setTaxPercent,
  currency,
  setCurrency,
}) => {
  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md">
        <button
          type="button"
          onClick={() => setMode('add_tax')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mode === 'add_tax'
              ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Add Tax (Price Before Tax)
        </button>
        <button
          type="button"
          onClick={() => setMode('reverse_tax')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mode === 'reverse_tax'
              ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Reverse Tax (Price Inc. Tax)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {mode === 'add_tax' ? 'Price Before Tax' : 'Total Price (Including Tax)'}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
              {currency}
            </span>
            <input
              type="number"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {mode === 'add_tax'
              ? 'Net price prior to tax calculation'
              : 'Gross invoice price with tax embedded'}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tax Percentage
            </label>
            <div className="flex items-center gap-1">
              {COMMON_TAX_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setTaxPercent(rate)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                    taxPercent === rate
                      ? 'bg-purple-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              placeholder="e.g. 18"
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-sm">
              %
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Applicable VAT, GST, or sales tax</p>
        </div>
      </div>
    </div>
  );
};
