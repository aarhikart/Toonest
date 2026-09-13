'use client';

import React, { useState } from 'react';
import { calculateDiscountGST } from '@/lib/gst/calculations';
import { formatCurrency, numberToWordsINR } from '@/lib/gst/formatting';
import { Tag, ArrowRight, Percent, IndianRupee } from 'lucide-react';

export const DiscountGSTCalculator: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState<number>(5000);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [gstRate, setGstRate] = useState<number>(18);
  const [applyDiscountFirst, setApplyDiscountFirst] = useState<boolean>(true);

  const result = calculateDiscountGST(
    originalPrice,
    discountPercent,
    gstRate,
    applyDiscountFirst
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
            Discount + GST Calculator
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Compute real post-discount taxable values and final customer billing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Original Price */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Original / Catalog Price (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={originalPrice || ''}
                onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                placeholder="Enter catalog price"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF] text-base font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discount % */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Discount Percentage (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Percent className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={discountPercent || ''}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 10"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF] text-base font-semibold"
                />
              </div>
            </div>

            {/* GST Rate % */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                GST Rate (%)
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF] text-base font-semibold"
              >
                <option value={0}>0% (Nil)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          {/* Discount Mode Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Discount Calculation Order
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setApplyDiscountFirst(true)}
                className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all border ${
                  applyDiscountFirst
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300 shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">1. Apply Discount First</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Standard Commercial Law (GST charged on post-discount price)
                </div>
              </button>
              <button
                type="button"
                onClick={() => setApplyDiscountFirst(false)}
                className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-all border ${
                  !applyDiscountFirst
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300 shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">2. Discount on Total</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Consumer coupons or cashback applied after total invoice
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Results (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Final Customer Payable
            </div>
            <div className="text-3xl font-extrabold text-[#5722AF] dark:text-[#9B6BE8] mb-1">
              {formatCurrency(result.finalPayable)}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 italic mb-4">
              {numberToWordsINR(result.finalPayable)}
            </p>

            {/* Breakdown List */}
            <div className="space-y-2 text-sm border-t border-neutral-200 dark:border-neutral-700 pt-3">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Original Price</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formatCurrency(result.originalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount ({result.discountPercent}%)</span>
                <span className="font-semibold">
                  -{formatCurrency(result.discountAmount)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Net Taxable Value</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formatCurrency(result.priceAfterDiscount)}
                </span>
              </div>
              <div className="flex justify-between text-purple-700 dark:text-purple-300">
                <span>GST ({result.gstRate}%)</span>
                <span className="font-semibold">
                  +{formatCurrency(result.gstAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-start gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#5722AF] shrink-0 mt-0.5" />
            <span>
              Under Section 15(3) of the CGST Act, trade discounts shown on the face of the invoice are excluded from taxable turnover.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
