'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const dateTimeFAQs: FAQItem[] = [
  {
    question: 'How do I calculate the difference between two dates?',
    answer:
      'Enter your starting date and ending date in the Date Difference tab. Our calculator will immediately compute the exact calendar difference in years, months, and days, alongside total days, completed weeks, hours, minutes, and seconds.',
  },
  {
    question: 'Does the calculator account for leap years?',
    answer:
      'Yes, absolutely. The calendar engine fully incorporates Gregorian leap-year rules, including leap days on February 29 (such as 2024 and 2028), ensuring that multi-year durations and month-boundary calculations are mathematically exact.',
  },
  {
    question: 'Can I calculate business days?',
    answer:
      'Yes. The calculator separates total days into working business days and weekend days. You can choose standard Saturday/Sunday weekends, Friday/Saturday weekends, or single-day weekends, as well as add custom public or company holidays to exclude.',
  },
  {
    question: 'Does inclusive counting include both dates?',
    answer:
      'Yes. By default, Exclusive mode measures elapsed duration between dates (e.g. 1 January to 2 January = 1 elapsed day). When you toggle Inclusive mode on, both the start date and the end date are counted as whole calendar days (e.g. 1 January to 2 January = 2 calendar days).',
  },
  {
    question: 'Can I calculate the difference between two times?',
    answer:
      'Yes. Switch to the Time Difference tab and input your start and end times. The tool computes elapsed hours, minutes, and seconds, along with decimal representations for payroll or logging.',
  },
  {
    question: 'Can the calculator handle times crossing midnight?',
    answer:
      'Yes. If your shift or event starts late at night and ends early the next morning (for example, starting at 10:00 PM and ending at 2:00 AM), select "Next Day" or leave it on "Auto Detect". The calculator will correctly compute 4 hours elapsed instead of returning a negative number.',
  },
  {
    question: 'Can I calculate hours and minutes?',
    answer:
      'Yes. Both the Date Difference and Time Difference calculators provide a comprehensive breakdown in hours, minutes, seconds, and milliseconds.',
  },
  {
    question: 'Can I calculate the difference between two time zones?',
    answer:
      'Yes. The Time Zones tab allows you to compare two international time zones (e.g., New York vs. Mumbai or London vs. Tokyo). It computes the current local time in each region and reports the exact hour and minute offset, accounting for Daylight Saving Time (DST).',
  },
  {
    question: 'Does it work with 12-hour and 24-hour time?',
    answer:
      'Yes. You can toggle seamlessly between 12-hour clock format (with AM/PM selectors) and 24-hour military/standard format with a single click.',
  },
  {
    question: 'Are my dates and times uploaded to a server?',
    answer:
      'No. ToolNest operates with strict zero-knowledge privacy. All date, time, holiday, and timezone calculations are processed 100% locally within your browser using JavaScript. No personal dates, schedules, or results are ever sent across the network.',
  },
];

export const DateTimeFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Date & Time Calculation Answers
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Clear explanations regarding calendar arithmetic, midnight handling, business days, and timezones.
        </p>
      </div>

      <div className="space-y-3">
        {dateTimeFAQs.map((faq, index) => {
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
