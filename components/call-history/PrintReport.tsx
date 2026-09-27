'use client';

import React from 'react';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { CallRecord, CallStatistics, ContactSummary } from '@/lib/call-history/types';
import { formatCallDate, formatPhoneNumberForDisplay } from '@/lib/call-history/normalizer';

interface PrintReportProps {
  isOpen: boolean;
  onClose: () => void;
  records: CallRecord[];
  stats: CallStatistics;
  topContacts: ContactSummary[];
  filterLabel: string;
}

export function PrintReport({
  isOpen,
  onClose,
  records,
  stats,
  topContacts,
  filterLabel,
}: PrintReportProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 print:hidden bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
            <Printer className="w-4 h-4 text-[#5722AF]" />
            <span>Print Call History Summary Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5722AF] hover:bg-[#682BC9] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-call-report" className="p-8 sm:p-10 space-y-6 overflow-y-auto flex-1 bg-white text-zinc-900 font-sans print:p-0">
          {/* Document Header */}
          <div className="border-b-2 border-zinc-800 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                Call History Summary Report
              </h1>
              <p className="text-xs text-zinc-600 mt-1">
                Authorized call record analytics &bull; Generated locally in browser
              </p>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <div>Date Generated: <strong>{generatedDate}</strong></div>
              <div>Scope: <strong>{filterLabel}</strong></div>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-4 gap-3 text-center border border-zinc-200 rounded-2xl p-4 bg-zinc-50/50">
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Total Calls</span>
              <div className="text-2xl font-black text-zinc-900 mt-0.5">
                {stats.totalCalls.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Incoming</span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {stats.incomingCalls.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Outgoing</span>
              <div className="text-2xl font-black text-blue-700 mt-0.5">
                {stats.outgoingCalls.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Missed / Unanswered</span>
              <div className="text-2xl font-black text-rose-700 mt-0.5">
                {stats.missedCalls.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Duration Statistics */}
          <div className="grid grid-cols-3 gap-3 text-center border border-zinc-200 rounded-2xl p-4">
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Total Talk Duration</span>
              <div className="text-lg font-black text-zinc-900 mt-0.5">
                {stats.totalDurationFormatted}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Avg Call Duration</span>
              <div className="text-lg font-black text-zinc-900 mt-0.5">
                {stats.averageDurationFormatted}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Longest Call</span>
              <div className="text-lg font-black text-zinc-900 mt-0.5">
                {stats.longestCallFormatted}
              </div>
            </div>
          </div>

          {/* Top Contacted Numbers */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-1.5">
              Top Contacted Numbers
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 text-[11px] uppercase">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Contact / Number</th>
                  <th className="py-2 text-center">Total Calls</th>
                  <th className="py-2 text-center">In / Out / Missed</th>
                  <th className="py-2 text-right">Total Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topContacts.slice(0, 8).map((c, i) => (
                  <tr key={i} className="py-1.5">
                    <td className="py-2 text-zinc-400 font-bold">{i + 1}</td>
                    <td className="py-2 font-medium text-zinc-900">
                      {c.contactName ? `${c.contactName} (${formatPhoneNumberForDisplay(c.phoneNumber)})` : formatPhoneNumberForDisplay(c.phoneNumber)}
                    </td>
                    <td className="py-2 text-center font-bold text-zinc-900">{c.totalCalls}</td>
                    <td className="py-2 text-center text-zinc-600">
                      {c.incoming} In / {c.outgoing} Out / {c.missed} Missed
                    </td>
                    <td className="py-2 text-right font-mono font-bold text-zinc-900">
                      {c.totalDurationFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Call Records Sample */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-1.5">
              Recent Call Logs Preview (First 10 of {records.length})
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 text-[11px] uppercase">
                  <th className="py-1.5">Date & Time</th>
                  <th className="py-1.5">Phone Number</th>
                  <th className="py-1.5">Contact</th>
                  <th className="py-1.5 text-center">Type</th>
                  <th className="py-1.5 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {records.slice(0, 10).map((r, i) => (
                  <tr key={i}>
                    <td className="py-1.5 font-mono text-[11px] text-zinc-700">
                      {formatCallDate(r.timestamp)} {r.time}
                    </td>
                    <td className="py-1.5 font-mono text-[11px] text-zinc-900">
                      {formatPhoneNumberForDisplay(r.phoneNumber)}
                    </td>
                    <td className="py-1.5 text-zinc-700">
                      {r.contactName || '-'}
                    </td>
                    <td className="py-1.5 text-center font-semibold text-zinc-900">
                      {r.type}
                    </td>
                    <td className="py-1.5 text-right font-mono text-zinc-900">
                      {r.durationFormatted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Notice */}
          <div className="pt-6 border-t border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>ToolNest Call History Analyzer &bull; Private & Secure Local Analytics</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
