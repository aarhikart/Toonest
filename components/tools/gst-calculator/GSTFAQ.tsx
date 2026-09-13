'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is GST and what are its components in India?',
    answer:
      'GST (Goods and Services Tax) is a single, destination-based indirect tax levied on the supply of goods and services in India. It replaced multiple legacy taxes like VAT, Service Tax, and Excise Duty. It consists of CGST (Central GST) and SGST (State GST) for transactions within the same state, and IGST (Integrated GST) for transactions between different states.',
  },
  {
    question: 'How do I add GST to a base price?',
    answer:
      'To add GST, multiply the base price by the applicable GST percentage (e.g. 18%) and divide by 100 to get the GST amount. Then add this GST amount to your base price. For example, for ₹1,000 at 18% GST: GST = (1000 × 18) / 100 = ₹180, giving a total of ₹1,180.',
  },
  {
    question: 'How do I remove GST from an inclusive (MRP) price?',
    answer:
      'To remove GST from a total inclusive price, use the formula: Base Amount = (Total Amount × 100) ÷ (100 + GST Rate). For example, if an item costs ₹1,180 including 18% GST: Base = (1,180 × 100) ÷ 118 = ₹1,000. The GST amount removed is ₹1,180 - ₹1,000 = ₹180.',
  },
  {
    question: 'When should I choose Intra-State vs Inter-State GST?',
    answer:
      'Choose Intra-State if both the seller and buyer are located in the same Indian State or Union Territory. The tax is evenly divided into CGST (50%) and SGST (50%). Choose Inter-State if the supplier and buyer are in different states; the entire tax is levied as IGST.',
  },
  {
    question: 'Is discount deducted before or after calculating GST?',
    answer:
      'Under Section 15(3) of the Central Goods and Services Tax (CGST) Act, trade discounts provided before or at the time of supply and shown on the tax invoice are deducted from the transaction value before applying GST. Our Discount + GST calculator supports this standard statutory order as well as coupon-based post-tax discounts.',
  },
  {
    question: 'What are the current GST tax slabs in India?',
    answer:
      'India currently has 5 primary GST tax slabs: 0% (Nil / Essential unprocessed foods), 5% (Household necessities, spices, sugar), 12% (Processed foods, computers), 18% (Most goods, electronics, IT & telecom services), and 28% (Luxury goods, cars, tobacco). Special rates like 0.25% (rough diamonds) and 3% (gold & silver jewellery) also exist.',
  },
  {
    question: 'Does this calculator store or transmit my financial data?',
    answer:
      'No. All calculations are executed 100% in your browser using local JavaScript. ToolNest never records, uploads, or transmits your invoices, bill items, or pricing information to any server.',
  },
];

export const GSTFAQ: React.FC = () => {
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
            Common questions about GST rates, formulas, invoices, and statutory rules
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
