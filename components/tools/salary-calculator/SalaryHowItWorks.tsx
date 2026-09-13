'use client';

import React from 'react';
import { BookOpen, HelpCircle, Layers, CheckCircle } from 'lucide-react';

export const SalaryHowItWorks: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-sm space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Indian Compensation Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How CTC Converts to In-Hand Salary
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
          Understanding the math of Cost-to-Company (CTC), Gross Salary, PF retirals, and Income Tax deductions.
        </p>
      </div>

      {/* Grid of Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CTC Card */}
        <div className="p-5 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-[#5722AF] text-white">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              1. Cost to Company (CTC)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            The total annual financial expense the employer incurs on an employee. It includes direct salary plus hidden employer contributions (Employer EPF, Gratuity reserve, and insurance).
          </p>
          <div className="mt-3 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-purple-200 dark:border-slate-700 font-mono text-[11px] text-purple-900 dark:text-purple-300">
            CTC = Gross Salary + Employer PF + Gratuity
          </div>
        </div>

        {/* Gross Salary Card */}
        <div className="p-5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              2. Gross Salary
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            The total earnings credited to an employee before statutory employee deductions like employee PF, Professional Tax, and Income Tax (TDS).
          </p>
          <div className="mt-3 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-slate-700 font-mono text-[11px] text-blue-900 dark:text-blue-300">
            Gross = Basic + HRA + Special Allowance
          </div>
        </div>

        {/* Net In-Hand Card */}
        <div className="p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              3. In-Hand (Take-Home)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            The actual net money transferred into your savings bank account on pay day after all deductions have been subtracted.
          </p>
          <div className="mt-3 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-slate-700 font-mono text-[11px] text-emerald-900 dark:text-emerald-300">
            In-Hand = Gross - (Employee PF + PT + Tax)
          </div>
        </div>
      </div>

      {/* New vs Old Tax Regime Details for FY 2026-27 */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Tax Slabs & Rules (FY 2026-27 / AY 2027-28)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">
              New Tax Regime (Section 115BAC - Default)
            </div>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li><strong>Standard Deduction:</strong> ₹75,000 for salaried employees.</li>
              <li><strong>Zero Tax Threshold:</strong> Full rebate under Section 87A up to ₹7,00,000 taxable income (Gross up to ₹7.75 Lakh pays ₹0 tax!).</li>
              <li><strong>Slabs:</strong> 0-3L (0%), 3-7L (5%), 7-10L (10%), 10-12L (15%), 12-15L (20%), &gt;15L (30%).</li>
              <li>No documentation required; no need to submit fake rent receipts or lock money in 80C.</li>
            </ul>
          </div>
          <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">
              Old Tax Regime (With Chapter VI-A Deductions)
            </div>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li><strong>Standard Deduction:</strong> ₹50,000.</li>
              <li><strong>Section 80C:</strong> Up to ₹1,50,000 (EPF, PPF, ELSS, Life Insurance).</li>
              <li><strong>HRA Exemption:</strong> Deduct actual rent paid under Rule 2A.</li>
              <li><strong>Section 80D & 24(b):</strong> Up to ₹25,000 for health insurance and ₹2,00,000 for home loan interest.</li>
              <li>Beneficial only if your total itemized deductions exceed ₹3.75 - ₹4.00 Lakhs!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
