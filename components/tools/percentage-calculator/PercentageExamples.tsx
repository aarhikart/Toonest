'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CalculatorTab } from '@/lib/percentage/types';

export interface PercentageExampleItem {
  id: string;
  title: string;
  tab: CalculatorTab;
  inputs: Record<string, any>;
  description: string;
}

interface PercentageExamplesProps {
  onSelectExample: (example: PercentageExampleItem) => void;
}

const EXAMPLES: PercentageExampleItem[] = [
  {
    id: 'ex1',
    title: 'What is 10% of 500?',
    tab: 'percentage',
    inputs: { mode: 'what_is_x_of_y', valX: '10', valY: '500' },
    description: 'Basic percentage computation = 50',
  },
  {
    id: 'ex2',
    title: 'What is 25% of 800?',
    tab: 'percentage',
    inputs: { mode: 'what_is_x_of_y', valX: '25', valY: '800' },
    description: 'Quarter calculation = 200',
  },
  {
    id: 'ex3',
    title: '50 is what percentage of 200?',
    tab: 'percentage',
    inputs: { mode: 'x_is_what_percent_of_y', valX: '50', valY: '200' },
    description: 'Part to whole ratio = 25%',
  },
  {
    id: 'ex4',
    title: '20% discount on ₹2,000',
    tab: 'discount',
    inputs: { originalPrice: '2000', discountPercent: '20', currency: '₹' },
    description: 'Saves ₹400 → Final price ₹1,600',
  },
  {
    id: 'ex5',
    title: '18% tax on ₹1,000',
    tab: 'tax',
    inputs: { price: '1000', taxPercent: '18', mode: 'add_tax', currency: '₹' },
    description: 'Tax ₹180 → Final price ₹1,180',
  },
  {
    id: 'ex6',
    title: '15% tip on ₹2,500 bill (2 people)',
    tab: 'tip',
    inputs: { billAmount: '2500', tipPercent: '15', numPeople: '2', currency: '₹' },
    description: 'Tip ₹375 → ₹1,437.50 per person',
  },
  {
    id: 'ex7',
    title: 'Percentage increase from 100 to 150',
    tab: 'increase',
    inputs: { original: '100', newValue: '150' },
    description: '+50% increase (+50 amount)',
  },
  {
    id: 'ex8',
    title: 'Percentage decrease from 500 to 400',
    tab: 'decrease',
    inputs: { original: '500', newValue: '400' },
    description: '-20% decrease (-100 amount)',
  },
];

export const PercentageExamples: React.FC<PercentageExamplesProps> = ({
  onSelectExample,
}) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Common Percentage Examples
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any calculation below to load it directly into the calculator
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => onSelectExample(ex)}
            className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-700 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                {ex.title}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {ex.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
