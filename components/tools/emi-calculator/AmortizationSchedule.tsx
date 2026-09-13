'use client';

import React, { useState } from 'react';
import { AmortizationYear, AmortizationMonth } from '@/lib/emi/types';
import { formatCurrencyINR } from '@/lib/emi/formatting';
import { Table, FileSpreadsheet, Printer, ChevronDown, ChevronRight, Calendar } from 'lucide-react';

interface AmortizationScheduleProps {
  yearlySchedule: AmortizationYear[];
  monthlySchedule: AmortizationMonth[];
  principal: number;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  yearlySchedule,
  monthlySchedule,
  principal,
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  const toggleExpandYear = (yearNum: number) => {
    setExpandedYear(expandedYear === yearNum ? null : yearNum);
  };

  const exportCSV = () => {
    const headers = [
      'Month',
      'Year',
      'Opening Balance (INR)',
      'EMI (INR)',
      'Principal Paid (INR)',
      'Interest Paid (INR)',
      'Closing Balance (INR)',
    ];

    const rows = monthlySchedule.map((m) => [
      m.month,
      m.yearNumber,
      m.openingBalance,
      m.emi,
      m.principalPaid,
      m.interestPaid,
      m.closingBalance,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `loan-amortization-schedule-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Loan Amortization Schedule
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Track how every rupee paid goes towards principal reduction vs interest
            </p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'yearly'
                  ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yearly View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Months ({monthlySchedule.length})
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

      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3 w-28">
                {viewMode === 'yearly' ? 'Year' : 'Month'}
              </th>
              <th className="py-3 px-3 text-right">Opening Balance</th>
              <th className="py-3 px-3 text-right">Total Payment</th>
              <th className="py-3 px-3 text-right text-[#5722AF] dark:text-purple-300 font-bold">
                Principal Paid
              </th>
              <th className="py-3 px-3 text-right text-amber-600 dark:text-amber-400 font-bold">
                Interest Paid
              </th>
              <th className="py-3 px-3 text-right">Closing Balance</th>
              <th className="py-3 px-3 w-28 text-center">Paid Off %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {viewMode === 'yearly' ? (
              yearlySchedule.map((y) => {
                const isExpanded = expandedYear === y.yearNumber;
                const paidOffPercent = Math.min(
                  100,
                  Math.max(0, Math.round(((principal - y.closingBalance) / principal) * 100))
                );

                return (
                  <React.Fragment key={y.yearNumber}>
                    <tr
                      onClick={() => toggleExpandYear(y.yearNumber)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors font-medium"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#5722AF]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                          <span>Year {y.yearNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                        {formatCurrencyINR(y.openingBalance)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                        {formatCurrencyINR(y.totalEmi)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#5722AF] dark:text-purple-300">
                        {formatCurrencyINR(y.totalPrincipal)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrencyINR(y.totalInterest)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrencyINR(y.closingBalance)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#5722AF] rounded-full"
                              style={{ width: `${paidOffPercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">
                            {paidOffPercent}%
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Monthly Sub-rows */}
                    {isExpanded &&
                      y.months.map((m) => (
                        <tr
                          key={m.month}
                          className="bg-slate-50/70 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400"
                        >
                          <td className="py-2 px-3 pl-8 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Month {m.month}</span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {formatCurrencyINR(m.openingBalance)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {formatCurrencyINR(m.emi)}
                          </td>
                          <td className="py-2 px-3 text-right text-[#5722AF] dark:text-purple-400 font-semibold">
                            {formatCurrencyINR(m.principalPaid)}
                          </td>
                          <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400 font-semibold">
                            {formatCurrencyINR(m.interestPaid)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrencyINR(m.closingBalance)}
                          </td>
                          <td className="py-2 px-3 text-center text-[10px] text-slate-400">
                            {Math.round(((principal - m.closingBalance) / principal) * 100)}%
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })
            ) : (
              // All Months Flat List
              monthlySchedule.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    Month {m.month} <span className="text-[10px] text-slate-400">(Yr {m.yearNumber})</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                    {formatCurrencyINR(m.openingBalance)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {formatCurrencyINR(m.emi)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#5722AF] dark:text-purple-300 font-bold">
                    {formatCurrencyINR(m.principalPaid)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400 font-bold">
                    {formatCurrencyINR(m.interestPaid)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrencyINR(m.closingBalance)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-xs font-semibold text-slate-500">
                    {Math.round(((principal - m.closingBalance) / principal) * 100)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
