'use client';

import React from 'react';
import { Calendar, Clock, Briefcase, Globe, ShieldCheck, Zap } from 'lucide-react';
import { dateTimeFAQs } from './DateTimeFAQ';

export const DateTimeSEO: React.FC = () => {
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://toolnest.app/date-time-difference-calculator#app',
        name: 'Date Difference Calculator - Calculate Date & Time Difference',
        url: 'https://toolnest.app/date-time-difference-calculator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Free online Date and Time Difference Calculator. Calculate the exact difference between two dates or times in years, months, weeks, days, hours, minutes, and seconds. Includes business days and midnight crossing.',
        featureList: [
          'Exact calendar difference in years, months, and days',
          'Total days, total weeks, total hours, minutes, and seconds',
          'Business days and weekend calculations with custom weekend rules',
          'Custom public and corporate holiday exclusion',
          'Inclusive and exclusive date counting options',
          'Time difference calculator with 12-hour and 24-hour support',
          'Midnight crossing and overnight shift handling',
          'Combined Date and Time multi-day difference calculator',
          'Add and subtract duration from dates and times',
          'International time zone difference and conversion',
          '100% private client-side browser calculations',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://toolnest.app/date-time-difference-calculator#faq',
        mainEntity: dateTimeFAQs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <section className="w-full max-w-4xl mx-auto py-12 px-4 space-y-12 border-t border-slate-200/80 dark:border-slate-800/80">
        {/* Intro */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Chronological & Elapsed Time Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Understanding Date and Time Differences
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Measuring duration between dates and times is central to legal contracts, work scheduling, payroll processing, sprint planning, and travel itineraries. While human calendars seem intuitive, calculating accurate durations requires accounting for uneven month lengths, leap-year cycles, weekend rules, and midnight clock rollovers.
          </p>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Calendar Arithmetic
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We apply authentic Gregorian calendar borrowing rather than rough approximations. Turning a month or year older always aligns with the calendar anniversary.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Workdays & Holidays
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Differentiate billable working days from weekend days. Exclude custom company or local public holidays to determine true productive project timelines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Overnight & Midnight
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Shifts extending past midnight (e.g. 10:00 PM to 2:00 AM) are handled automatically, returning positive 4 hours rather than negative durations.
            </p>
          </div>
        </div>

        {/* Detailed Explanations */}
        <div className="space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Date Difference: Elapsed Days vs. Calendar Span
            </h3>
            <p>
              When evaluating the distance between two dates, two metrics are commonly sought: total elapsed days and broken-down calendar years, months, and days. Dividing total days by 365 or 30.4 produces artificial decimals that drift from real milestones. For example, from 15 August to 15 September is exactly 1 completed calendar month (31 days), whereas from 15 February to 15 March is also 1 completed calendar month, but only 28 (or 29 in a leap year) days. Our algorithm isolates completed years and months first, then derives remaining calendar days.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Difference Between Inclusive and Exclusive Counting
            </h3>
            <p>
              The difference between inclusive and exclusive counting often creates confusion in contracts and event planning:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Exclusive Counting (Elapsed Duration):</strong> Measures the amount of time that passes between start and end. If a sprint begins on Monday and finishes on Tuesday, 1 day has elapsed.
              </li>
              <li>
                <strong>Inclusive Counting (Calendar Days):</strong> Counts both the start date and the end date as whole active days. A conference running from Monday through Tuesday spans 2 calendar days.
              </li>
            </ul>
            <p>
              ToolNest allows you to toggle between both modes instantly, with all total days, business days, and weekend counts adapting automatically.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Time Differences Across Time Zones & Daylight Saving Time
            </h3>
            <p>
              Standardizing clocks across international offices is challenging due to varying Daylight Saving Time (DST) shifts. For example, when London transitions between Greenwich Mean Time (GMT) and British Summer Time (BST), its offset relative to New York or Mumbai changes by an hour. ToolNest utilizes the browser's native IANA timezone database to ensure that local clocks and offset calculations stay aligned with real astronomical rules.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
