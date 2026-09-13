'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is a percentage?',
    answer:
      'A percentage is a dimensionless ratio or number expressed as a fraction of 100. It is denoted using the percent sign "%". For example, 45% represents 45 parts out of 100, which is equivalent to the decimal 0.45 or the fraction 45/100.',
  },
  {
    question: 'How do I calculate a percentage?',
    answer:
      'To find what percentage a part (X) is of a total (Y), divide the part by the total and multiply by 100: Formula: (X ÷ Y) × 100. For instance, if you scored 40 marks out of 50, your percentage is (40 ÷ 50) × 100 = 80%.',
  },
  {
    question: 'How do I calculate percentage increase?',
    answer:
      'To calculate percentage increase from an original value to a new value: subtract the original value from the new value, divide the result by the original value, and multiply by 100: Formula: ((New - Original) ÷ Original) × 100. For example, growing from 100 to 125 is ((125 - 100) ÷ 100) × 100 = 25% increase.',
  },
  {
    question: 'How do I calculate percentage decrease?',
    answer:
      'To calculate percentage decrease: subtract the new value from the original value, divide by the original value, and multiply by 100: Formula: ((Original - New) ÷ Original) × 100. For example, falling from 500 to 400 is ((500 - 400) ÷ 500) × 100 = 20% decrease.',
  },
  {
    question: 'How do I calculate a discount?',
    answer:
      'To calculate a discount, multiply the original price by the discount percentage divided by 100 to determine the discount amount. Then subtract the discount amount from the original price to get the final sale price. For example, a 20% discount on ₹2,000 saves ₹400, leaving a final price of ₹1,600.',
  },
  {
    question: 'How do I calculate tax percentage?',
    answer:
      'To add tax to a pre-tax amount, multiply the pre-tax price by the tax percentage to find the tax amount, then add it to the base price. To extract tax from a tax-inclusive final price (reverse tax), divide the total price by (1 + Tax Rate / 100) to find the pre-tax base.',
  },
  {
    question: 'How do I calculate profit percentage?',
    answer:
      'Profit percentage is calculated with respect to the Cost Price (CP). First, calculate the profit amount by subtracting Cost Price from Selling Price (SP - CP). Then divide the profit amount by the Cost Price and multiply by 100: Formula: ((SP - CP) ÷ CP) × 100.',
  },
  {
    question: 'Can I calculate percentages with decimals?',
    answer:
      'Yes, absolutely. Our calculator supports arbitrarily precise decimal numbers, such as calculating 12.375% of 4,560.50, and automatically eliminates computer floating-point inaccuracies like 0.30000000000000004.',
  },
  {
    question: 'Does this percentage calculator store my data?',
    answer:
      'No. All calculations run strictly client-side in your web browser. No numbers, financial figures, or inputs are ever uploaded, transmitted to a server, or logged. Any calculation history you choose to retain is stored solely in your local browser localStorage and can be deleted at any time with a single click.',
  },
];

export const PercentageFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full max-w-5xl mx-auto py-10 px-4">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Percentage Calculation Guide
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Clear answers to common questions about percentages, formulas, and math principles.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
