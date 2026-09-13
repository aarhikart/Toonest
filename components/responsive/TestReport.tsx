'use client';

import React from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
} from 'lucide-react';
import { TestSession } from '@/lib/responsive/types';
import { calculateReportSummary, exportSessionToCSV, exportSessionToJSON } from '@/lib/responsive/report';

interface TestReportProps {
  session: TestSession;
}

export const TestReport: React.FC<TestReportProps> = ({ session }) => {
  const summary = calculateReportSummary(session);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <span className="text-[11px] font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider">
            QA Summary Report
          </span>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
            {session.url || 'Website Test'}
          </h3>
          <p className="text-xs text-zinc-400">
            Recorded: {new Date(session.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => exportSessionToCSV(session)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportSessionToJSON(session)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
          <span className="text-xs text-zinc-500 font-semibold">Total Viewports</span>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {summary.totalTested}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Passed
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {summary.passed}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Warnings
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {summary.warnings}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {summary.failed}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Viewport Category Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Mobile</span>
              <span>{summary.categoryBreakdown.mobile.passed} / {summary.categoryBreakdown.mobile.total}</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5" /> Tablet</span>
              <span>{summary.categoryBreakdown.tablet.passed} / {summary.categoryBreakdown.tablet.total}</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5" /> Laptop</span>
              <span>{summary.categoryBreakdown.laptop.passed} / {summary.categoryBreakdown.laptop.total}</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /> Desktop</span>
              <span>{summary.categoryBreakdown.desktop.passed} / {summary.categoryBreakdown.desktop.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Issues */}
      {session.selectedIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">
            Flagged Responsive Issues ({session.selectedIssues.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {session.selectedIssues.map((iss) => (
              <span key={iss} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-medium">
                {iss}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {session.notes && (
        <div className="space-y-1.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Developer Notes
          </h4>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {session.notes}
          </p>
        </div>
      )}
    </div>
  );
};
