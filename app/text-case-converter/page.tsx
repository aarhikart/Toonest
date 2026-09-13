'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { TextCaseHero } from '@/components/tools/text-case/TextCaseHero';
import { TextCaseConverter } from '@/components/tools/text-case/TextCaseConverter';
import { TextHowItWorks } from '@/components/tools/text-case/TextHowItWorks';
import { TextFeatures } from '@/components/tools/text-case/TextFeatures';
import { ToolFAQ } from '@/components/tools/text-case/ToolFAQ';
import { TextSEO } from '@/components/tools/text-case/TextSEO';

export default function TextCaseConverterPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      <TextSEO />

      {/* Global Header */}
      <Header
        activeToolName="Text Case Converter"
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
        activeToolId="text-case-converter"
        onOpenHelp={() => {
          setIsSidebarOpen(false);
          const faqEl = document.getElementById('faq');
          faqEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-10">
        {/* Compact Hero */}
        <TextCaseHero />

        {/* Main Interactive Converter Card */}
        <TextCaseConverter />

        {/* 3-Step How It Works */}
        <TextHowItWorks />

        {/* Key Features */}
        <TextFeatures />

        {/* Frequently Asked Questions */}
        <ToolFAQ />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
