'use client';

import React from 'react';
import { BookOpen, Calendar, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
import { ageFAQs } from './AgeFAQ';

export const AgeSEO: React.FC = () => {
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://toolnest.app/age-calculator#app',
        name: 'Age Calculator - Calculate Your Exact Age in Years, Months, and Days',
        url: 'https://toolnest.app/age-calculator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Free, private, and precise online Age Calculator. Calculate your exact chronological age in years, months, days, total hours, minutes, and seconds. Includes birthday countdowns, zodiac signs, and age difference comparisons.',
        featureList: [
          'Exact chronological age in years, months, and days',
          'Total lifetime statistics in months, weeks, days, hours, minutes, seconds',
          'Upcoming birthday countdown and turning age',
          'Configurable February 29 leap-day rules',
          'Calculate age on any custom past or future date',
          'Age difference comparison between two individuals',
          'Multi-person age comparison table for up to 5 people',
          'Western Zodiac sign, element, and astrological symbol',
          'Birth weekday, leap year status, and generational cohort',
          '100% client-side privacy with no server tracking',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://toolnest.app/age-calculator#faq',
        mainEntity: ageFAQs.map((faq) => ({
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Chronological Age Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Everything You Need to Know About Calculating Exact Age
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Age is one of the most fundamental personal metrics used across legal contracts, insurance policies, medical records, educational admissions, and milestones. While answering "how old are you?" in full years is simple, computing your <strong>exact chronological age</strong>—down to completed months, calendar days, total elapsed hours, and upcoming birthday countdowns—demands rigorous calendar mathematics.
          </p>
        </div>

        {/* 3 Column Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Gregorian Arithmetic
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We never approximate months as 30 or 30.4 days. Every calculation respects variable month lengths (28, 29, 30, and 31 days) and Gregorian leap-year cycles.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Zero Server Transmission
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your birth date and personal details remain strictly on your device. All calculations run in your browser's client-side memory with zero tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Complete Life Breakdown
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Instantly view total elapsed days, hours, minutes, seconds, upcoming birthday countdowns, birth weekday, generational cohort, and zodiac profiles.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Why Simple Division (Days ÷ 365) Fails
            </h3>
            <p>
              A common misconception is that age can simply be calculated by converting two dates into Unix timestamps, dividing the difference by 86,400,000 to get total days, and then dividing by 365 or 365.25. While this yields an approximate decimal number, it frequently produces incorrect calendar results.
            </p>
            <p>
              In human calendar conventions, a year is not merely a fixed block of 31,536,000 seconds; it is an astronomical and cultural anniversary. Someone born on March 15, 2000, turns 25 on March 15, 2025, regardless of whether 6 leap years occurred in between. If one were to divide by 365.25, the calculated anniversary would drift by hours or days. ToolNest's algorithm isolates completed Gregorian years and months first, ensuring exact alignment with calendar reality.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              The Leap Year and February 29 Rule
            </h3>
            <p>
              In the Gregorian calendar, a year is a leap year if it is divisible by 4, except for century years (ending in 00), which must also be divisible by 400. Thus, 2000 was a leap year, but 1900 and 2100 are not.
            </p>
            <p>
              For individuals born on February 29, non-leap years pose a unique legal question: when is their birthday legally observed? In English common law (and many Commonwealth nations), legal adulthood for a leapling born on February 29 is reached on March 1. In other jurisdictions (such as Taiwan and parts of the United States), February 28 is commonly used. Our calculator empowers users by providing a dedicated setting to evaluate non-leap birthdays on either <strong>February 28</strong> or <strong>March 1</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Cultural Differences in Age Calculation
            </h3>
            <p>
              In the Western international standard, age begins at zero at birth and increases by one year on each anniversary of that birth date. However, several traditional systems exist:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Traditional East Asian Age:</strong> Historically in Korea, China, and Vietnam, a newborn was counted as 1 year old at birth, and everyone gained an additional year together on New Year's Day (either Lunar New Year or January 1). In June 2023, South Korea officially adopted the Western international standard for administrative and legal purposes to eliminate confusion.
              </li>
              <li>
                <strong>Inclusive vs. Elapsed Day Counting:</strong> In some legal contexts, both the starting day and ending day are counted as whole days. ToolNest follows standard chronological elapsed time, where elapsed duration begins at zero at birth.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Generational Cohorts at a Glance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-slate-900 dark:text-white text-xs block">Generation Alpha (2013 - Present)</span>
                <span className="text-[11px] text-slate-500">The first generation born entirely in the 21st century and AI era.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-slate-900 dark:text-white text-xs block">Generation Z (1997 - 2012)</span>
                <span className="text-[11px] text-slate-500">True digital natives shaped by social media, smartphones, and mobile connectivity.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-slate-900 dark:text-white text-xs block">Millennials / Gen Y (1981 - 1996)</span>
                <span className="text-[11px] text-slate-500">Experienced the transition from analog to broadband internet and digital devices.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-slate-900 dark:text-white text-xs block">Generation X (1965 - 1980)</span>
                <span className="text-[11px] text-slate-500">Known as the bridge generation between early computing and modern technology.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
