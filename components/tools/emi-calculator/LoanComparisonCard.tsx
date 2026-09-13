'use client';

import React, { useState } from 'react';
import { compareLoans } from '@/lib/emi/calculations';
import { formatCurrencyINR } from '@/lib/emi/formatting';
import { Scale, CheckCircle2, IndianRupee } from 'lucide-react';

export const LoanComparisonCard: React.FC = () => {
  const [loanA, setLoanA] = useState({
    principal: 4000000,
    annualRate: 8.5,
    tenureYears: 20,
    processingFeePercent: 0.5,
  });

  const [loanB, setLoanB] = useState({
    principal: 4000000,
    annualRate: 8.75,
    tenureYears: 20,
    processingFeePercent: 0.0,
  });

  const { optionA, optionB, emiDifference, totalCostDifference, cheaperOption } = compareLoans(
    loanA,
    loanB
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Compare Two Loan Offers
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Side-by-side comparison including interest rate differences and upfront processing fees
          </p>
        </div>
      </div>

      {/* Comparison Outcome Banner */}
      <div className="mt-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {cheaperOption === 'Equal'
              ? 'Both loan offers cost the exact same amount'
              : `${cheaperOption === 'A' ? 'Loan Option A' : 'Loan Option B'} is cheaper overall by ${formatCurrencyINR(totalCostDifference)}!`}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          EMI Difference: <span className="text-[#5722AF] dark:text-purple-400">{formatCurrencyINR(emiDifference)} / mo</span>
        </div>
      </div>

      {/* Side by Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Loan Option A */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            cheaperOption === 'A'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Loan Option A
            </h4>
            {cheaperOption === 'A' && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Better Deal
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Loan Amount (₹)
              </label>
              <input
                type="number"
                value={loanA.principal}
                onChange={(e) => setLoanA({ ...loanA, principal: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={loanA.annualRate}
                  onChange={(e) => setLoanA({ ...loanA, annualRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Tenure (Yrs)</label>
                <input
                  type="number"
                  value={loanA.tenureYears}
                  onChange={(e) => setLoanA({ ...loanA, tenureYears: parseFloat(e.target.value) || 1 })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanA.processingFeePercent}
                  onChange={(e) => setLoanA({ ...loanA, processingFeePercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Results for Option A */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly EMI:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrencyINR(optionA.monthlyEMI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Interest:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrencyINR(optionA.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processing Fee:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrencyINR(optionA.processingFeeAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold text-[#5722AF] dark:text-purple-300">
                <span>Total Cost:</span>
                <span>{formatCurrencyINR(optionA.totalCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Option B */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            cheaperOption === 'B'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Loan Option B
            </h4>
            {cheaperOption === 'B' && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Better Deal
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Loan Amount (₹)
              </label>
              <input
                type="number"
                value={loanB.principal}
                onChange={(e) => setLoanB({ ...loanB, principal: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={loanB.annualRate}
                  onChange={(e) => setLoanB({ ...loanB, annualRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Tenure (Yrs)</label>
                <input
                  type="number"
                  value={loanB.tenureYears}
                  onChange={(e) => setLoanB({ ...loanB, tenureYears: parseFloat(e.target.value) || 1 })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanB.processingFeePercent}
                  onChange={(e) => setLoanB({ ...loanB, processingFeePercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Results for Option B */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly EMI:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrencyINR(optionB.monthlyEMI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Interest:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrencyINR(optionB.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processing Fee:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrencyINR(optionB.processingFeeAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold text-[#5722AF] dark:text-purple-300">
                <span>Total Cost:</span>
                <span>{formatCurrencyINR(optionB.totalCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
