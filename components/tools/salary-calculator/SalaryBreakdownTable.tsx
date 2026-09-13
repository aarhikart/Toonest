'use client';

import React, { useState } from 'react';
import { SalaryBreakdownResult } from '@/lib/salary/types';
import { formatCurrencyINR } from '@/lib/salary/formatting';
import { Table, FileSpreadsheet, Printer } from 'lucide-react';

interface SalaryBreakdownTableProps {
  breakdown: SalaryBreakdownResult;
}

export const SalaryBreakdownTable: React.FC<SalaryBreakdownTableProps> = ({ breakdown }) => {
  const [view, setView] = useState<'both' | 'monthly' | 'annual'>('both');

  const exportCSV = () => {
    const headers = ['Salary Component', 'Category', 'Monthly (INR)', 'Annual (INR)'];
    const rows = [
      ['Basic Salary', 'Earnings', breakdown.basicSalaryMonthly, breakdown.basicSalaryAnnual],
      ['House Rent Allowance (HRA)', 'Earnings', breakdown.hraMonthly, breakdown.hraAnnual],
      ['Special Allowance', 'Earnings', breakdown.specialAllowanceMonthly, breakdown.specialAllowanceAnnual],
      ['Gross Salary', 'Total Earnings', breakdown.grossSalaryMonthly, breakdown.grossSalaryAnnual],
      ['Employer EPF', 'Employer Retirals', breakdown.employerPFMonthly, breakdown.employerPFAnnual],
      ['Employer Gratuity', 'Employer Retirals', breakdown.employerGratuityMonthly, breakdown.employerGratuityAnnual],
      ['Total Employer Contributions', 'Employer Retirals', breakdown.totalEmployerContributionsMonthly, breakdown.totalEmployerContributionsAnnual],
      ['Employee EPF', 'Employee Deductions', breakdown.employeePFMonthly, breakdown.employeePFAnnual],
      ['Professional Tax (PT)', 'Employee Deductions', breakdown.professionalTaxMonthly, breakdown.professionalTaxAnnual],
      ['Income Tax (TDS)', 'Employee Deductions', breakdown.incomeTaxMonthly, breakdown.incomeTaxAnnual],
      ['Total Deductions', 'Total Deductions', breakdown.totalDeductionsMonthly, breakdown.totalDeductionsAnnual],
      ['Net Take-Home Pay', 'Net In-Hand', breakdown.netInHandMonthly, breakdown.netInHandAnnual],
    ];

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(',').replace(/\n/g, ''))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `salary-breakdown-${breakdown.annualCTC}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Itemized Salary Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear distinction between CTC, Gross Salary, Employer Retirals, and In-Hand
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setView('both')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                view === 'both'
                  ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => setView('monthly')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                view === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setView('annual')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                view === 'annual'
                  ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Annual
            </button>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-[#5722AF] dark:text-purple-400" />
            Print
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Component</th>
              {(view === 'both' || view === 'monthly') && (
                <th className="py-3 px-4 text-right">Monthly (₹)</th>
              )}
              {(view === 'both' || view === 'annual') && (
                <th className="py-3 px-4 text-right">Annual (₹)</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {/* 1. EARNINGS */}
            <tr className="bg-purple-50/50 dark:bg-purple-950/20 font-bold text-xs uppercase tracking-wider text-purple-900 dark:text-purple-300">
              <td colSpan={view === 'both' ? 3 : 2} className="py-2.5 px-4">
                1. Earnings (Gross Components)
              </td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="py-2.5 px-4 pl-6 font-medium text-slate-800 dark:text-slate-200">
                Basic Salary
              </td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.basicSalaryMonthly)}</td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.basicSalaryAnnual)}</td>
              )}
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="py-2.5 px-4 pl-6 font-medium text-slate-800 dark:text-slate-200">
                House Rent Allowance (HRA)
              </td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.hraMonthly)}</td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.hraAnnual)}</td>
              )}
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="py-2.5 px-4 pl-6 font-medium text-slate-800 dark:text-slate-200">
                Special Allowance / Other Allowances
              </td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.specialAllowanceMonthly)}</td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.specialAllowanceAnnual)}</td>
              )}
            </tr>
            <tr className="font-bold bg-slate-100/70 dark:bg-slate-800/60 text-slate-900 dark:text-white">
              <td className="py-2.5 px-4">Total Gross Salary (A)</td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.grossSalaryMonthly)}</td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.grossSalaryAnnual)}</td>
              )}
            </tr>

            {/* 2. EMPLOYER CONTRIBUTIONS */}
            <tr className="bg-blue-50/50 dark:bg-blue-950/20 font-bold text-xs uppercase tracking-wider text-blue-900 dark:text-blue-300">
              <td colSpan={view === 'both' ? 3 : 2} className="py-2.5 px-4">
                2. Employer Retirals (Part of CTC, Not Paid in Monthly Gross)
              </td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="py-2.5 px-4 pl-6 font-medium text-slate-800 dark:text-slate-200">
                Employer EPF Contribution
              </td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.employerPFMonthly)}</td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.employerPFAnnual)}</td>
              )}
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="py-2.5 px-4 pl-6 font-medium text-slate-800 dark:text-slate-200">
                Employer Gratuity Provision
              </td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.employerGratuityMonthly)}</td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.employerGratuityAnnual)}</td>
              )}
            </tr>
            <tr className="font-bold bg-slate-100/70 dark:bg-slate-800/60 text-slate-900 dark:text-white">
              <td className="py-2.5 px-4">Total Employer Retirals (B)</td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.totalEmployerContributionsMonthly)}</td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right">{formatCurrencyINR(breakdown.totalEmployerContributionsAnnual)}</td>
              )}
            </tr>

            {/* 3. EMPLOYEE DEDUCTIONS */}
            <tr className="bg-red-50/50 dark:bg-red-950/20 font-bold text-xs uppercase tracking-wider text-red-900 dark:text-red-300">
              <td colSpan={view === 'both' ? 3 : 2} className="py-2.5 px-4">
                3. Employee Deductions (Subtracted from Gross Salary)
              </td>
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="py-2.5 px-4 pl-6 font-medium text-slate-800 dark:text-slate-200">
                Employee EPF Deduction
              </td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right text-red-600 dark:text-red-400">
                  -{formatCurrencyINR(breakdown.employeePFMonthly)}
                </td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right text-red-600 dark:text-red-400">
                  -{formatCurrencyINR(breakdown.employeePFAnnual)}
                </td>
              )}
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="py-2.5 px-4 pl-6 font-medium text-slate-800 dark:text-slate-200">
                Professional Tax (PT)
              </td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right text-red-600 dark:text-red-400">
                  -{formatCurrencyINR(breakdown.professionalTaxMonthly)}
                </td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right text-red-600 dark:text-red-400">
                  -{formatCurrencyINR(breakdown.professionalTaxAnnual)}
                </td>
              )}
            </tr>
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="py-2.5 px-4 pl-6 font-medium text-slate-800 dark:text-slate-200">
                Income Tax / TDS ({breakdown.taxResult.regime.toUpperCase()})
              </td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right text-red-600 dark:text-red-400">
                  -{formatCurrencyINR(breakdown.incomeTaxMonthly)}
                </td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right text-red-600 dark:text-red-400">
                  -{formatCurrencyINR(breakdown.incomeTaxAnnual)}
                </td>
              )}
            </tr>
            <tr className="font-bold bg-slate-100/70 dark:bg-slate-800/60 text-slate-900 dark:text-white">
              <td className="py-2.5 px-4">Total Employee Deductions (C)</td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-2.5 px-4 text-right text-red-600 dark:text-red-400">
                  -{formatCurrencyINR(breakdown.totalDeductionsMonthly)}
                </td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-2.5 px-4 text-right text-red-600 dark:text-red-400">
                  -{formatCurrencyINR(breakdown.totalDeductionsAnnual)}
                </td>
              )}
            </tr>

            {/* 4. NET TAKE-HOME PAY */}
            <tr className="bg-purple-100 dark:bg-purple-950/60 font-extrabold text-sm sm:text-base text-[#5722AF] dark:text-[#9B6BE8]">
              <td className="py-3 px-4">Net Take-Home Pay (A - C)</td>
              {(view === 'both' || view === 'monthly') && (
                <td className="py-3 px-4 text-right">{formatCurrencyINR(breakdown.netInHandMonthly)}</td>
              )}
              {(view === 'both' || view === 'annual') && (
                <td className="py-3 px-4 text-right">{formatCurrencyINR(breakdown.netInHandAnnual)}</td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
