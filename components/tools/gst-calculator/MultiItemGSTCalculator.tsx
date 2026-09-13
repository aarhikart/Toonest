'use client';

import React, { useState } from 'react';
import { GSTType } from '@/lib/gst/types';
import { calculateInvoice } from '@/lib/gst/calculations';
import { formatCurrency, numberToWordsINR } from '@/lib/gst/formatting';
import { Plus, Trash2, FileSpreadsheet, Printer, Layers } from 'lucide-react';

interface RowItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  gstRate: number;
}

const initialRows: RowItem[] = [
  { id: '1', name: 'Web Development Services', quantity: 1, unitPrice: 25000, discountPercent: 0, gstRate: 18 },
  { id: '2', name: 'Software License', quantity: 2, unitPrice: 3500, discountPercent: 10, gstRate: 18 },
  { id: '3', name: 'Printed Documentation', quantity: 5, unitPrice: 300, discountPercent: 0, gstRate: 5 },
];

export const MultiItemGSTCalculator: React.FC = () => {
  const [items, setItems] = useState<RowItem[]>(initialRows);
  const [gstType, setGstType] = useState<GSTType>('cgst_sgst');

  const { computedItems, summary } = calculateInvoice(items, gstType);

  const handleAddItem = () => {
    const newItem: RowItem = {
      id: Date.now().toString(),
      name: `Item ${items.length + 1}`,
      quantity: 1,
      unitPrice: 1000,
      discountPercent: 0,
      gstRate: 18,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof RowItem, val: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const exportCSV = () => {
    const headers = ['Item Name', 'Qty', 'Unit Price', 'Discount %', 'Taxable Amount', 'GST Rate', 'GST Amount', 'Total'];
    const rows = computedItems.map((ci) => [
      `"${ci.name}"`,
      ci.quantity,
      ci.unitPrice,
      `${ci.discountPercent}%`,
      ci.taxableAmount,
      `${ci.gstRate}%`,
      ci.gstAmount,
      ci.total,
    ]);

    const summaryRows = [
      [],
      ['Total Taxable', summary.taxableAmount],
      ['Total GST', summary.totalGST],
      ...(gstType === 'cgst_sgst'
        ? [
            ['CGST', summary.cgstAmount],
            ['SGST', summary.sgstAmount],
          ]
        : [['IGST', summary.igstAmount]]),
      ['Grand Total', summary.grandTotal],
    ];

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(',')), ...summaryRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gst-invoice-summary-${Date.now()}.csv`);
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
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Multi-Item GST Invoice Generator
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Calculate line-by-line GST with multiple rate slabs and item discounts
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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

      {/* Tax Type Filter for Invoice */}
      <div className="flex items-center justify-end gap-2 mb-4 text-xs">
        <span className="text-slate-500 font-medium">Supply Type:</span>
        <button
          type="button"
          onClick={() => setGstType('cgst_sgst')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            gstType === 'cgst_sgst'
              ? 'bg-[#5722AF] text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Intra-State (CGST + SGST)
        </button>
        <button
          type="button"
          onClick={() => setGstType('igst')}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
            gstType === 'igst'
              ? 'bg-[#5722AF] text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Inter-State (IGST)
        </button>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl mb-4">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3">Item Description</th>
              <th className="py-3 px-2 w-20 text-center">Qty</th>
              <th className="py-3 px-2 w-28 text-right">Price (₹)</th>
              <th className="py-3 px-2 w-24 text-center">Disc (%)</th>
              <th className="py-3 px-2 w-28 text-center">GST Slab</th>
              <th className="py-3 px-3 text-right">Taxable (₹)</th>
              <th className="py-3 px-3 text-right">GST (₹)</th>
              <th className="py-3 px-3 text-right">Total (₹)</th>
              <th className="py-3 px-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {computedItems.map((ci) => (
              <tr key={ci.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="p-2">
                  <input
                    type="text"
                    value={ci.name}
                    onChange={(e) => handleUpdateItem(ci.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#5722AF]"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="1"
                    value={ci.quantity}
                    onChange={(e) => handleUpdateItem(ci.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#5722AF]"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={ci.unitPrice}
                    onChange={(e) => handleUpdateItem(ci.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#5722AF]"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={ci.discountPercent}
                    onChange={(e) => handleUpdateItem(ci.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#5722AF]"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={ci.gstRate}
                    onChange={(e) => handleUpdateItem(ci.id, 'gstRate', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#5722AF]"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </td>
                <td className="p-2 text-right font-medium text-slate-800 dark:text-slate-200">
                  {formatCurrency(ci.taxableAmount)}
                </td>
                <td className="p-2 text-right font-medium text-purple-700 dark:text-purple-300">
                  {formatCurrency(ci.gstAmount)}
                </td>
                <td className="p-2 text-right font-bold text-slate-900 dark:text-white">
                  {formatCurrency(ci.total)}
                </td>
                <td className="p-2 text-center">
                  <button
                    type="button"
                    title="Delete item"
                    disabled={items.length <= 1}
                    onClick={() => handleRemoveItem(ci.id)}
                    className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <button
        type="button"
        onClick={handleAddItem}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors mb-6"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Line Item
      </button>

      {/* Invoice Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        {/* Rate Group Slab Summary */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2.5">
            GST Slab-wise Breakdown
          </h4>
          <div className="space-y-1.5 text-xs">
            {summary.rateGroups.map((rg) => (
              <div key={rg.rate} className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">
                  {rg.rate}% GST (Taxable: {formatCurrency(rg.taxableAmount)})
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(rg.gstAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grand Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Subtotal (Before Discount)</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>
          {summary.totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Total Item Discounts</span>
              <span className="font-semibold">
                -{formatCurrency(summary.totalDiscount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Net Taxable Value</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency(summary.taxableAmount)}
            </span>
          </div>

          {gstType === 'cgst_sgst' ? (
            <>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-2 border-l-2 border-purple-300 dark:border-purple-700">
                <span>Central GST (CGST)</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {formatCurrency(summary.cgstAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-2 border-l-2 border-purple-300 dark:border-purple-700">
                <span>State GST (SGST)</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {formatCurrency(summary.sgstAmount)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-2 border-l-2 border-purple-300 dark:border-purple-700">
              <span>Integrated GST (IGST)</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatCurrency(summary.igstAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-800 dark:text-slate-200 font-bold border-t border-slate-200 dark:border-slate-800 pt-2">
            <span>Total GST Amount</span>
            <span className="text-purple-700 dark:text-purple-300">
              {formatCurrency(summary.totalGST)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-base font-extrabold text-[#5722AF] dark:text-[#9B6BE8]">
            <span>Grand Total</span>
            <span>{formatCurrency(summary.grandTotal)}</span>
          </div>
          <p className="text-xs text-right text-slate-500 dark:text-slate-400 italic">
            In Words: {numberToWordsINR(summary.grandTotal)}
          </p>
        </div>
      </div>
    </div>
  );
};
