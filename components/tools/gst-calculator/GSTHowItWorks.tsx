'use client';

import React from 'react';
import { BookOpen, FileCheck2, Split, HelpCircle } from 'lucide-react';

export const GSTHowItWorks: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-sm space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>GST Knowledge Hub</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How Indian GST Calculation Works
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
          Understanding the mathematics, statutory rules, and difference between Intra-state and Inter-state supplies.
        </p>
      </div>

      {/* Grid of Formulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add GST Formula */}
        <div className="p-5 rounded-xl border border-purple-100 dark:border-slate-700 bg-purple-50/30 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-[#5722AF] text-white">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              1. Adding GST (Exclusive Price)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
            Used when a quote or wholesale rate does not include tax, and you need to compute the invoice total payable by the buyer.
          </p>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs text-purple-900 dark:text-purple-300 space-y-1">
            <div>GST Amount = (Base Amount × GST Rate) ÷ 100</div>
            <div>Final Amount = Base Amount + GST Amount</div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            <strong>Example:</strong> For ₹10,000 base amount at 18% GST:
            <br />
            GST = (10,000 × 18) ÷ 100 = <strong>₹1,800</strong>
            <br />
            Total = 10,000 + 1,800 = <strong>₹11,800</strong>
          </div>
        </div>

        {/* Remove GST Formula */}
        <div className="p-5 rounded-xl border border-emerald-100 dark:border-slate-700 bg-emerald-50/30 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <Split className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              2. Removing GST (Reverse Calculation)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
            Used when a price is already MRP or GST-inclusive, and you need to determine the underlying net cost and tax component.
          </p>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
            <div>Taxable Base = (Gross Amount × 100) ÷ (100 + GST Rate)</div>
            <div>GST Amount = Gross Amount - Taxable Base</div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            <strong>Example:</strong> For ₹11,800 inclusive bill at 18% GST:
            <br />
            Base = (11,800 × 100) ÷ 118 = <strong>₹10,000</strong>
            <br />
            GST = 11,800 - 10,000 = <strong>₹1,800</strong>
          </div>
        </div>
      </div>

      {/* Tax Structure Details: CGST, SGST, IGST */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#5722AF]" />
          Intra-State (CGST + SGST) vs. Inter-State (IGST)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">
              Intra-State Supply (Within Same State)
            </div>
            <p>
              When the seller and buyer are in the same state (e.g. Maharashtra to Maharashtra), the tax is split equally:
            </p>
            <ul className="list-disc pl-4 mt-2 space-y-1 text-xs">
              <li><strong>CGST (Central GST):</strong> 50% of the total GST rate goes to the Central Government.</li>
              <li><strong>SGST (State GST):</strong> 50% goes to the State Government (or UTGST for Union Territories).</li>
            </ul>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">
              Inter-State Supply (Between Different States)
            </div>
            <p>
              When the supplier and the place of supply are in different states (e.g. Karnataka to Tamil Nadu):
            </p>
            <ul className="list-disc pl-4 mt-2 space-y-1 text-xs">
              <li><strong>IGST (Integrated GST):</strong> 100% of the GST rate is charged as IGST.</li>
              <li>Collected by the Central Government and subsequently apportioned to the destination consumer state.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* GST Slabs Table */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Overview of Indian GST Tax Slabs
        </h3>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Slab Rate</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Typical Goods & Services</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">0% (Nil)</td>
                <td className="py-2.5 px-4">Exempt Essentials</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Fresh milk, unbranded grains, fresh fruits, vegetables, educational services.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#5722AF] dark:text-purple-400">5%</td>
                <td className="py-2.5 px-4">Household Necessities</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Packaged food, tea, coffee, edible oil, domestic LPG, basic footwear, medicines.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#5722AF] dark:text-purple-400">12%</td>
                <td className="py-2.5 px-4">Standard Goods</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Computers, processed foods, fruit juice, diagnostic kits, business class air tickets.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#5722AF] dark:text-purple-400">18%</td>
                <td className="py-2.5 px-4">Most Goods & Services</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">IT services, telecom, financial services, hair oil, soap, electronics, capital goods.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold text-[#5722AF] dark:text-purple-400">28%</td>
                <td className="py-2.5 px-4">Luxury & Demerit</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">Automobiles, high-end motorbikes, tobacco, aerated drinks, betting/gambling.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
