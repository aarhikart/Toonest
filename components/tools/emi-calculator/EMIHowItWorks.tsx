'use client';

import React from 'react';
import { BookOpen, Calculator, AlertTriangle, Lightbulb } from 'lucide-react';

export const EMIHowItWorks: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-sm space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Financial Planning Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How EMI Calculation Works
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
          Master the math behind reducing balance loans, interest amortization, and smart debt management.
        </p>
      </div>

      {/* Formula & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Math Formula Card */}
        <div className="p-5 rounded-xl border border-purple-100 dark:border-slate-700 bg-purple-50/30 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-[#5722AF] text-white">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              The Reducing-Balance EMI Formula
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
            Standard mathematical equation prescribed by the Reserve Bank of India (RBI) for bank loans and mortgages:
          </p>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs text-purple-900 dark:text-purple-300 space-y-1">
            <div>EMI = [P × r × (1 + r)^n] ÷ [(1 + r)^n - 1]</div>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <li><strong>P:</strong> Principal Loan Amount borrowed from the lender.</li>
            <li><strong>r:</strong> Monthly interest rate = Annual Interest Rate ÷ 12 ÷ 100.</li>
            <li><strong>n:</strong> Loan tenure expressed in total number of months.</li>
          </ul>
        </div>

        {/* Flat Rate Warning Card */}
        <div className="p-5 rounded-xl border border-amber-100 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-amber-600 text-white">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Reducing Balance vs. Flat Rate Trap
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
            In a <strong>reducing-balance loan</strong>, interest is calculated each month only on the remaining unpaid principal. As you repay principal, interest reduces continuously.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Beware of dealers advertising <strong>flat interest rates</strong> (often seen in two-wheelers or quick personal loans). A flat rate of 7% is approximately equivalent to a reducing interest rate of <strong>13% to 14% p.a.</strong> because flat interest charges you interest on the initial full principal throughout the entire tenure!
          </p>
        </div>
      </div>

      {/* Strategies to save on interest */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#5722AF]" />
          3 Proven Tactics to Save Lakhs in Loan Interest
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">
              1. Part-Prepayments Early On
            </div>
            <p>
              In the early years of a home loan, up to 70% of your EMI goes purely towards interest. Prepaying even ₹1-2 Lakhs in years 1–3 wipes out compound interest for future years.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">
              2. Annual 5-10% EMI Step-Up
            </div>
            <p>
              As your salary increases annually with appraisals, increase your loan EMI by just 5% each year. This simple step can slash a 20-year loan down to approximately 11-12 years.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">
              3. Home Loan Balance Transfer
            </div>
            <p>
              If your bank’s floating rate does not adjust downwards while competing lenders offer lower rates (by 0.5% or more), consider a balance transfer to reduce interest burden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
