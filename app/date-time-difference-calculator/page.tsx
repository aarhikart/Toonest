'use client';

import React, { useState, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { DateTimeHero } from '@/components/tools/date-time-difference/DateTimeHero';
import { DateTimeDifferenceCalculator } from '@/components/tools/date-time-difference/DateTimeDifferenceCalculator';
import { DateTimeHowItWorks } from '@/components/tools/date-time-difference/DateTimeHowItWorks';
import { DateTimeUseCases } from '@/components/tools/date-time-difference/DateTimeUseCases';
import { DateTimeFAQ } from '@/components/tools/date-time-difference/DateTimeFAQ';
import { DateTimeSEO } from '@/components/tools/date-time-difference/DateTimeSEO';

export default function DateTimeDifferenceCalculatorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Global Header */}
      <Header
        activeToolName="Date & Time Difference"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => {
          const faqEl = document.getElementById('faq');
          faqEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeToolId="date-time-difference-calculator"
        onOpenHelp={() => {
          setIsSidebarOpen(false);
          const faqEl = document.getElementById('faq');
          faqEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* Hero Section */}
        <DateTimeHero />

        {/* Master Calculator Container inside Suspense */}
        <Suspense
          fallback={
            <div className="w-full max-w-5xl mx-auto h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800" />
          }
        >
          <DateTimeDifferenceCalculator />
        </Suspense>

        {/* How It Works Steps */}
        <DateTimeHowItWorks />

        {/* Practical Everyday Use Cases */}
        <DateTimeUseCases />

        {/* Frequently Asked Questions */}
        <div id="faq">
          <DateTimeFAQ />
        </div>

        {/* Structured SEO Guide & JSON-LD Structured Data */}
        <DateTimeSEO />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
