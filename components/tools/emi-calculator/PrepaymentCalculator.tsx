'use client';

import React, { useState } from 'react';
import { PrepaymentType, PrepaymentImpact } from '@/lib/emi/types';
import { calculatePrepayment } from '@/lib/emi/calculations';
import { formatCurrencyINR, formatTenure } from '@/lib/emi/formatting';
import { PiggyBank, Sparkles, Clock, ArrowRight, IndianRupee } from 'lucide-react';

interface PrepaymentCalculatorProps {
  principal: number;
  annualRate: number;
  tenureMonths: number;
}

export const PrepaymentCalculator: React.FC<PrepaymentCalculatorProps> = ({
  principal,
  annualRate,
  tenureMonths,
}) => {
  const [prepayType, setPrepayType] = useState<PrepaymentType>('lump_sum');
  const [prepayAmount, setPrepayAmount] = useState<number>(Math.round(principal * 0.1));
  const [startMonth, setStartMonth] = useState<number>(24);
  const [impactType, setImpactType] = useState<PrepaymentImpact>('reduce_tenure');

  const result = calculatePrepayment(
    principal,
    annualRate,
    tenureMonths,
    prepayType,
    prepayAmount,
    startMonth,
    impactType
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          <PiggyBank className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Loan Prepayment & Foreclosure Calculator
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            See how part-prepayments reduce your loan tenure or cut monthly EMIs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Prepayment Mode Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Prepayment Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPrepayType('lump_sum')}
                className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  prepayType === 'lump_sum'
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                One-Time Lump Sum
              </button>
              <button
                type="button"
                onClick={() => setPrepayType('recurring_monthly')}
                className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  prepayType === 'recurring_monthly'
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Extra Monthly Payment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prepayment Amount */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {prepayType === 'lump_sum' ? 'Prepayment Amount (₹)' : 'Extra Monthly Amount (₹)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={prepayAmount || ''}
                  onChange={(e) => setPrepayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                />
              </div>
            </div>

            {/* Starting Month */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {prepayType === 'lump_sum' ? 'Pay After (Month Number)' : 'Start Extra Payment At'}
              </label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              >
                <option value={6}>Month 6 (After 6 Months)</option>
                <option value={12}>Month 12 (After 1 Year)</option>
                <option value={24}>Month 24 (After 2 Years)</option>
                <option value={36}>Month 36 (After 3 Years)</option>
                <option value={60}>Month 60 (After 5 Years)</option>
                <option value={120}>Month 120 (After 10 Years)</option>
              </select>
            </div>
          </div>

          {/* Impact Choice */}
          {prepayType === 'lump_sum' && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Prepayment Strategy Goal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImpactType('reduce_tenure')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    impactType === 'reduce_tenure'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs">Reduce Loan Tenure (Recommended)</div>
                  <div className="text-[11px] font-normal opacity-75 mt-0.5">
                    Closes loan years earlier; saves maximum compound interest
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setImpactType('reduce_emi')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    impactType === 'reduce_emi'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs">Reduce Monthly EMI</div>
                  <div className="text-[11px] font-normal opacity-75 mt-0.5">
                    Keeps tenure same; lowers monthly repayment amount
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Savings Card (5 cols) */}
        <div className="lg:col-span-5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Total Interest Savings</span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mb-2">
              {formatCurrencyINR(result.interestSaved)}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
              By making this prepayment, you cut out pure interest charges that would have gone to the bank.
            </p>

            {/* Metric Comparison */}
            <div className="space-y-3 text-xs sm:text-sm border-t border-emerald-100 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Time Saved:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  {formatTenure(result.tenureSavedMonths)} earlier
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">New Payoff Tenure:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatTenure(result.newTenureMonths)}
                </span>
              </div>

              {impactType === 'reduce_emi' && prepayType === 'lump_sum' && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <span className="text-slate-800 dark:text-slate-200">New Monthly EMI:</span>
                  <span className="text-[#5722AF] dark:text-purple-400">
                    {formatCurrencyINR(result.newEMI)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              RBI Guidelines: Floating-rate home loans given to individual borrowers carry 0% prepayment or foreclosure penalty in India.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
