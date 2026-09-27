'use client';

import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Printer,
  Check,
  FolderArchive,
  Layers,
} from 'lucide-react';
import { CallRecord, CallStatistics, ContactSummary } from '@/lib/call-history/types';
import { exportToCsv, exportToJson, exportToExcel } from '@/lib/call-history/export';
import { PrintReport } from './PrintReport';

interface ExportPanelProps {
  filteredRecords: CallRecord[];
  allRecords: CallRecord[];
  stats: CallStatistics;
  topContacts: ContactSummary[];
  filterLabel: string;
}

export function ExportPanel({
  filteredRecords,
  allRecords,
  stats,
  topContacts,
  filterLabel,
}: ExportPanelProps) {
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const targetRecords = exportScope === 'filtered' ? filteredRecords : allRecords;

  const handleExportCsv = () => {
    const filename = `call_history_${exportScope}_(${targetRecords.length}).csv`;
    exportToCsv(targetRecords, filename);
  };

  const handleExportJson = () => {
    const filename = `call_history_${exportScope}_(${targetRecords.length}).json`;
    exportToJson(targetRecords, filename);
  };

  const handleExportExcel = () => {
    const filename = `call_history_${exportScope}_(${targetRecords.length}).xlsx`;
    exportToExcel(targetRecords, filename);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-[#5722AF]" />
            <span>Export & Reports</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Save your analyzed records in common formats or generate a summary report
          </p>
        </div>

        {/* Scope selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setExportScope('filtered')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              exportScope === 'filtered'
                ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Filtered ({filteredRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setExportScope('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              exportScope === 'all'
                ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            All Records ({allRecords.length})
          </button>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CSV */}
        <button
          type="button"
          onClick={handleExportCsv}
          className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all text-left space-y-2 cursor-pointer group shadow-2xs"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Export CSV</h4>
            <p className="text-[11px] text-zinc-400">Comma-separated spreadsheet values</p>
          </div>
        </button>

        {/* Excel (.xlsx) */}
        <button
          type="button"
          onClick={handleExportExcel}
          className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all text-left space-y-2 cursor-pointer group shadow-2xs"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Export Excel (XLSX)</h4>
            <p className="text-[11px] text-zinc-400">Formatted Microsoft Excel workbook</p>
          </div>
        </button>

        {/* JSON */}
        <button
          type="button"
          onClick={handleExportJson}
          className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all text-left space-y-2 cursor-pointer group shadow-2xs"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Export JSON</h4>
            <p className="text-[11px] text-zinc-400">Raw structured JSON schema array</p>
          </div>
        </button>

        {/* Print Report */}
        <button
          type="button"
          onClick={() => setShowPrintModal(true)}
          className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/10 hover:bg-[#5722AF]/10 border border-[#5722AF]/20 transition-all text-left space-y-2 cursor-pointer group shadow-2xs"
        >
          <div className="w-9 h-9 rounded-xl bg-[#5722AF] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Print / PDF Report</h4>
            <p className="text-[11px] text-zinc-400">Formatted summary document for print or PDF</p>
          </div>
        </button>
      </div>

      {/* Print Report Modal */}
      <PrintReport
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        records={targetRecords}
        stats={stats}
        topContacts={topContacts}
        filterLabel={filterLabel}
      />
    </div>
  );
}
