'use client';

import React from 'react';
import { GSTMode, GSTType } from '@/lib/gst/types';
import { Lightbulb, Utensils, Smartphone, Laptop, Gem, Car } from 'lucide-react';

interface ExampleScenario {
  title: string;
  category: string;
  amount: number;
  rate: number;
  mode: GSTMode;
  type: GSTType;
  icon: React.ElementType;
  description: string;
}

interface GSTExamplesProps {
  onApplyExample: (amount: number, rate: number, mode: GSTMode, type: GSTType) => void;
}

export const GSTExamples: React.FC<GSTExamplesProps> = ({ onApplyExample }) => {
  const examples: ExampleScenario[] = [
    {
      title: 'Restaurant Food Order',
      category: 'Hospitality',
      amount: 1850,
      rate: 5,
      mode: 'add',
      type: 'cgst_sgst',
      icon: Utensils,
      description: 'Standard 5% GST on standalone dining (2.5% CGST + 2.5% SGST).',
    },
    {
      title: 'Smartphone Purchase',
      category: 'Electronics',
      amount: 29999,
      rate: 18,
      mode: 'add',
      type: 'cgst_sgst',
      icon: Smartphone,
      description: 'Standard 18% consumer tech bracket on mobile devices.',
    },
    {
      title: 'Software / IT Consulting',
      category: 'Services',
      amount: 75000,
      rate: 18,
      mode: 'add',
      type: 'igst',
      icon: Laptop,
      description: '18% IGST on inter-state software development billing.',
    },
    {
      title: 'Gold Jewellery Purchase',
      category: 'Precious Metals',
      amount: 120000,
      rate: 3,
      mode: 'add',
      type: 'cgst_sgst',
      icon: Gem,
      description: 'Special 3% GST rate applied on gold ornaments and bullion.',
    },
    {
      title: 'MRP Reverse Calculation',
      category: 'Consumer Goods',
      amount: 1499,
      rate: 18,
      mode: 'remove',
      type: 'cgst_sgst',
      icon: Lightbulb,
      description: 'Find original base cost and tax paid on an inclusive retail tag.',
    },
    {
      title: 'Automobile / Luxury Item',
      category: 'Luxury',
      amount: 850000,
      rate: 28,
      mode: 'add',
      type: 'cgst_sgst',
      icon: Car,
      description: 'Peak 28% slab applicable to luxury personal vehicles.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Real-World GST Calculation Scenarios
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Click any practical scenario to load values into the calculator
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {examples.map((ex, idx) => {
          const Icon = ex.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onApplyExample(ex.amount, ex.rate, ex.mode, ex.type)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#5722AF] dark:hover:border-purple-500 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded">
                    {ex.category}
                  </span>
                  <div className="p-1 rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:text-[#5722AF] transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#5722AF] dark:group-hover:text-purple-400 transition-colors">
                  {ex.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {ex.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">
                  ₹{ex.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[#5722AF] dark:text-purple-400">
                  {ex.mode === 'add' ? `+${ex.rate}% GST` : `-${ex.rate}% Reverse`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
