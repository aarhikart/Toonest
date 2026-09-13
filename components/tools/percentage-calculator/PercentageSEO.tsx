'use client';

import React from 'react';
import { Percent, TrendingUp, Tag, Receipt } from 'lucide-react';

export const PercentageSEO: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Percentage Calculator - Calculate Percentages Online',
    url: 'https://toolnest.com/percentage-calculator',
    applicationCategory: 'CalculatorApplication',
    operatingSystem: 'All',
    description:
      'Free online percentage calculator for percentage increase, decrease, change, discounts, tax, tips, profit, loss and more. Calculate percentages quickly and accurately.',
    featureList: [
      'What is X% of Y calculator',
      'X is what % of Y calculator',
      'Percentage increase and decrease calculator',
      'Percentage change and difference calculator',
      'Retail discount calculator with savings breakdown',
      'Sales tax and reverse VAT/GST calculator',
      'Restaurant tip calculator with guest bill splitting',
      'Profit and loss percentage calculator',
      'Local calculation history and one-click copy',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <article className="w-full max-w-5xl mx-auto py-10 px-4 space-y-10 text-slate-700 dark:text-slate-300">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Comprehensive Online Percentage Calculation Suite
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Whether you are computing a store discount, calculating business profit margins,
          splitting a dinner check with friends, or solving academic mathematics problems,
          percentages are one of the most widely used mathematical concepts in daily life.
          ToolNest provides an all-in-one suite of percentage calculators designed for speed,
          flawless accuracy, and intuitive usability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Basic Percentages & Ratios
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Quickly determine what X% of any base value is, or find what percentage a given
            portion represents relative to a whole number. Formulas and step-by-step
            substitutions are displayed with each result.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Increases, Decreases & Relative Change
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Track growth metrics, revenue changes, price inflation, or weight variations.
            View the exact absolute difference alongside the directional percentage change.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Discounts & Consumer Savings
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Instantly calculate how much money you save during sales events. Support for
            multiple currencies (₹, $, €, £, ¥) ensures clear financial clarity for international
            shopping and eCommerce.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Sales Tax, VAT, Tips & Commercial Margin
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Calculate forward taxes or reverse-engineer pre-tax price points from inclusive
            receipts. Split restaurant tips evenly among dining companions or analyze profit
            margins against cost price.
          </p>
        </div>
      </div>
    </article>
  );
};
