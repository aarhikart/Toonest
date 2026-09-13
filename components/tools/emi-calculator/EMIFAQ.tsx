'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is an Equated Monthly Installment (EMI)?',
    answer:
      'An EMI is a fixed monthly repayment amount made by a borrower to a lender on a specific date each calendar month. EMIs apply to both interest and principal each month, so that over a specified tenure, the loan is completely paid off.',
  },
  {
    question: 'How is reducing-balance EMI different from flat rate interest?',
    answer:
      'In a reducing balance loan, interest is calculated solely on the outstanding principal at the beginning of each monthly cycle. In a flat interest rate loan, interest is charged on the initial borrowed principal for the entire loan duration, making it far more expensive in real monetary terms.',
  },
  {
    question: 'Can banks charge prepayment penalties on loans in India?',
    answer:
      'According to RBI directives, commercial banks and Housing Finance Companies (HFCs) cannot levy any foreclosure charges or prepayment penalties on floating-rate home loans and personal loans sanctioned to individual borrowers. Fixed-rate loans and non-individual (business entity) loans may still attract prepayment charges.',
  },
  {
    question: 'How do Home Loan EMIs qualify for Indian Income Tax deductions?',
    answer:
      'Under the Old Tax Regime in India: (1) Section 24(b) permits a deduction of up to ₹2,00,000 per financial year for interest paid on a self-occupied property loan. (2) Section 80C allows a deduction of up to ₹1,50,000 per financial year on principal repayment, registration fees, and stamp duty. Note that under the New Tax Regime, Section 24(b) deductions for self-occupied properties and Section 80C are generally not available.',
  },
  {
    question: 'How does my CIBIL / credit score impact the loan interest rate?',
    answer:
      'Lenders use your credit score (typically from CIBIL, Experian, or CRIF High Mark) to determine creditworthiness. Borrowers with a score of 750 or above usually qualify for the best interest rates (e.g. 8.40% - 8.65%), while scores below 700 may incur risk premiums of 0.50% to 2.00% higher rates or stricter collateral demands.',
  },
  {
    question: 'What should I choose when prepaying: Reduce Tenure or Reduce EMI?',
    answer:
      'If your cash flow is stable, always choose "Reduce Tenure". Because loans compound monthly, shortening the loan tenure saves far more compound interest than keeping the tenure long and merely reducing the monthly payment.',
  },
];

export const EMIFAQ: React.FC = () => {
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
            Learn about loan interest calculations, prepayment rules, and tax deductions
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
