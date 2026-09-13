'use client';

import React, { useState } from 'react';
import {
  Table as TableIcon,
  Download,
  Search,
  FileSpreadsheet,
  Check,
  Copy,
} from 'lucide-react';
import { ExtractedWebData, ExtractedTable } from '@/lib/web-extractor/types';

interface ExtractedTablesTabProps {
  data: ExtractedWebData;
}

export const ExtractedTablesTab: React.FC<ExtractedTablesTabProps> = ({ data }) => {
  const tables = data.tables || [];
  const [selectedTableIdx, setSelectedTableIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  if (tables.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <TableIcon className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-50" />
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
          No HTML Tables Detected
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          The webpage does not appear to contain structured &lt;table&gt; elements. Check the Extracted Text tab for body content.
        </p>
      </div>
    );
  }

  const currentTable = tables[selectedTableIdx] || tables[0];

  const filteredRows = currentTable.rows.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return row.some((cell) => cell.toLowerCase().includes(q));
  });

  const handleExportCsv = () => {
    const csvRows: string[] = [];
    csvRows.push(currentTable.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));
    currentTable.rows.forEach((r) => {
      csvRows.push(r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.domain}-table-${currentTable.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    const jsonData = currentTable.rows.map((row) => {
      const obj: Record<string, string> = {};
      currentTable.headers.forEach((h, i) => {
        obj[h || `Col_${i + 1}`] = row[i] || '';
      });
      return obj;
    });

    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Table Switcher & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        {/* Table selector buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          {tables.map((tbl, i) => (
            <button
              key={tbl.id}
              type="button"
              onClick={() => {
                setSelectedTableIdx(i);
                setSearch('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedTableIdx === i
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Table #{tbl.id} ({tbl.rowCount} rows)
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table rows..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#5722AF]"
            />
          </div>

          <button
            type="button"
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Display */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400">
              {currentTable.headers.map((hdr, hIdx) => (
                <th
                  key={hIdx}
                  className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap"
                >
                  {hdr || `Col ${hIdx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-4 max-w-sm truncate" title={cell}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={currentTable.headers.length || 1}
                  className="py-8 text-center text-zinc-500"
                >
                  No rows matching your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
