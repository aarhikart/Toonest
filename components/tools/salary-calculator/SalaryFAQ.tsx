'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is the fundamental difference between CTC and In-Hand Salary?',
    answer:
      'CTC (Cost to Company) is the gross cost your employer incurs to hire and retain you. In-Hand (Take-Home) salary is the actual amount credited to your bank account each month after deducting employer retirals (Employer PF, Gratuity) and employee payroll deductions (Employee PF, Professional Tax, and Income Tax TDS).',
  },
  {
    question: 'What is the Standard Deduction for FY 2026-27?',
    answer:
      'For salaried employees, the Standard Deduction under the New Tax Regime is ₹75,000 (allowing you to earn up to ₹7.75 Lakhs without paying any income tax after Section 87A rebate). Under the Old Tax Regime, the Standard Deduction is ₹50,000.',
  },
  {
    question: 'How is Provident Fund (EPF) calculated, and what is the ₹1,800 cap?',
    answer:
      'By default, EPF is calculated at 12% of your Basic Salary. However, under the EPFO statutory guidelines, an employer can choose to cap contributions at 12% of the statutory wage ceiling of ₹15,000/month, which equals ₹1,800/month (₹21,600/year). Capping PF contributions maximizes your monthly in-hand cash-flow.',
  },
  {
    question: 'When is the Old Tax Regime better than the New Tax Regime?',
    answer:
      'The Old Tax Regime is typically beneficial only if you have large deductions exceeding ₹3.75 - ₹4.0 Lakhs per year (combining ₹1.5L in 80C, ₹2.0L in home loan interest under Section 24b, ₹25k-₹50k in health insurance 80D, and significant HRA rent exemptions). For most individuals without heavy home loans or high rent, the New Tax Regime offers lower slab rates and higher take-home pay.',
  },
  {
    question: 'How is Gratuity calculated and am I guaranteed to receive it?',
    answer:
      'Under the Payment of Gratuity Act, 1972, gratuity is payable only if you complete at least 5 years of continuous service with an employer. The formula is: (15 × Last Drawn Basic Salary × Completed Years of Service) ÷ 26. Even though employers deduct ~4.81% of your basic monthly as a gratuity reserve in your CTC, you only receive it if you stay 5 years or upon retirement.',
  },
  {
    question: 'How is HRA tax exemption calculated in India?',
    answer:
      'Under Section 10(13A) of the Income Tax Act (Old Regime only), HRA exemption is the lowest of: (1) Actual HRA received from employer, (2) Rent paid minus 10% of Basic Salary, or (3) 50% of Basic Salary (for metro cities like Mumbai, Delhi, Kolkata, Chennai) or 40% of Basic Salary (for non-metro cities).',
  },
];

export const SalaryFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about CTC components, PF rules, and take-home pay
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full py-3.5 px-4 text-left flex items-center justify-between gap-3 font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#5722AF] dark:text-purple-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
