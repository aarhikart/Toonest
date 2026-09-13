'use client';

import React, { useState, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { AgeCalculatorHero } from '@/components/tools/age-calculator/AgeCalculatorHero';
import { AgeCalculator } from '@/components/tools/age-calculator/AgeCalculator';
import { AgeHowItWorks } from '@/components/tools/age-calculator/AgeHowItWorks';
import { AgeFAQ } from '@/components/tools/age-calculator/AgeFAQ';
import { AgeSEO } from '@/components/tools/age-calculator/AgeSEO';

export default function AgeCalculatorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Global Header */}
      <Header
        activeToolName="Age Calculator"
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
        activeToolId="age-calculator"
        onOpenHelp={() => {
          setIsSidebarOpen(false);
          const faqEl = document.getElementById('faq');
          faqEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* Hero Section */}
        <AgeCalculatorHero />

        {/* Master Age Calculator inside Suspense boundary */}
        <Suspense
          fallback={
            <div className="w-full max-w-5xl mx-auto h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800" />
          }
        >
          <AgeCalculator />
        </Suspense>

        {/* How It Works Steps */}
        <AgeHowItWorks />

        {/* Frequently Asked Questions */}
        <div id="faq">
          <AgeFAQ />
        </div>

        {/* SEO Educational Guide & JSON-LD Structured Data */}
        <AgeSEO />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
