'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const ageFAQs: FAQItem[] = [
  {
    question: 'How is exact age calculated?',
    answer:
      'Age is calculated using chronological calendar arithmetic by comparing your birth date (year, month, day) against the target date. First, we calculate completed full years. Next, we determine completed months in the remaining span. If the target day is less than the birth day, we borrow the actual number of days from the preceding month. This produces exact calendar years, months, and days rather than fractional estimates.',
  },
  {
    question: 'Why is age calculated differently than simply dividing days by 365?',
    answer:
      'Dividing total elapsed days by 365 or 365.25 produces an inaccurate decimal result because calendar months vary in length (28, 29, 30, or 31 days) and leap years occur every four years. For instance, a person born on February 1 has lived fewer days by March 1 than someone born on July 1 by August 1, yet both have aged exactly one calendar month. True calendar math guarantees that turning a year older synchronizes with your calendar birth anniversary.',
  },
  {
    question: 'How do leap years affect age calculation?',
    answer:
      'A leap year contains 366 days instead of 365 due to the intercalary day on February 29. When computing total elapsed days, hours, and seconds, our calculator includes every February 29 you have lived through. When computing calendar age (years, months, and days), the engine assigns 29 days to February during leap years when borrowing days or tallying completed months.',
  },
  {
    question: 'How does the calculator handle birthdays on February 29?',
    answer:
      'Individuals born on leap day (February 29) celebrate their exact calendar birthday once every 4 years. In common 365-day years, legal and personal traditions vary between February 28 and March 1. Our calculator provides a dedicated leap-day setting: by default, non-leap birthdays are celebrated on February 28, but you can toggle it to March 1 (the standard legal convention in the UK and several other jurisdictions).',
  },
  {
    question: 'Can I calculate my age on a past or future date?',
    answer:
      'Yes. You can toggle between "Today" (your current local system date) and "Custom Date" mode. This allows you to verify your age at significant life events (e.g., college graduation, marriage, passport issuance) or project your exact age on future dates (e.g., retirement or milestone anniversaries).',
  },
  {
    question: 'How is the age difference between two people calculated?',
    answer:
      'The age difference is computed by chronologically ordering the two dates of birth, determining who is older, and calculating the exact calendar delta (years, months, days) along with the total elapsed days separating the two individuals. You can also utilize our Multi-Person Comparison feature to compare up to 5 people in a unified view.',
  },
  {
    question: 'Is my date of birth stored or sent to a server?',
    answer:
      'No. ToolNest functions with strict client-side privacy. All date calculations run 100% locally in your browser using JavaScript. No personal dates of birth, names, or calculated statistics are transmitted over the internet or recorded on our servers. If you choose to keep calculation history, it is saved exclusively in your own browser localStorage.',
  },
  {
    question: 'Why might two age calculators give different day counts for the same dates?',
    answer:
      'Differences between online calculators usually stem from inclusive versus exclusive day counting or simplified month assumptions. Some tools count both the start day and the end day (adding +1 day), while standard chronological age measures elapsed time (0 days completed on day of birth). Other tools divide by 30.44 days per month. ToolNest follows authentic Gregorian elapsed calendar standards.',
  },
  {
    question: 'How is the day of the week for a birth date determined?',
    answer:
      'The birth weekday is determined mathematically through the Gregorian calendar cycle. Because the Gregorian 400-year cycle consists of exactly 146,097 days—which divides evenly into 20,871 weeks—every historical and future calendar date maps deterministically to a specific day of the week (Monday through Sunday).',
  },
];

export const AgeFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Age Calculation Questions & Answers
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Comprehensive explanations covering calendar mathematics, leap year rules, privacy, and date formulas.
        </p>
      </div>

      <div className="space-y-3">
        {ageFAQs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
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
