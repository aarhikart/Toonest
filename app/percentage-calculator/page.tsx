'use client';

import React, { useState, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { PercentageCalculatorHero } from '@/components/tools/percentage-calculator/PercentageCalculatorHero';
import { PercentageCalculator } from '@/components/tools/percentage-calculator/PercentageCalculator';
import { PercentageFAQ } from '@/components/tools/percentage-calculator/PercentageFAQ';
import { PercentageSEO } from '@/components/tools/percentage-calculator/PercentageSEO';

export default function PercentageCalculatorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Global Header */}
      <Header
        activeToolName="Percentage Calculator"
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
        activeToolId="percentage-calculator"
        onOpenHelp={() => {
          setIsSidebarOpen(false);
          const faqEl = document.getElementById('faq');
          faqEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* Compact Hero */}
        <PercentageCalculatorHero />

        {/* Master Calculator Container with Suspense for URL searchParams */}
        <Suspense
          fallback={
            <div className="w-full max-w-5xl mx-auto h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800" />
          }
        >
          <PercentageCalculator />
        </Suspense>

        {/* Frequently Asked Questions */}
        <div id="faq">
          <PercentageFAQ />
        </div>

        {/* Structured SEO Guide & Technical Context */}
        <PercentageSEO />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
