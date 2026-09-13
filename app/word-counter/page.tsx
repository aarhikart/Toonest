'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { WordCounterHero } from '@/components/tools/word-counter/WordCounterHero';
import { WordCounter } from '@/components/tools/word-counter/WordCounter';
import { WordCounterHowItWorks } from '@/components/tools/word-counter/WordCounterHowItWorks';
import { WordCounterFeatures } from '@/components/tools/word-counter/WordCounterFeatures';
import { WordCounterFAQ } from '@/components/tools/word-counter/WordCounterFAQ';
import { WordCounterSEO } from '@/components/tools/word-counter/WordCounterSEO';

export default function WordCounterPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      <WordCounterSEO />

      {/* Global Header */}
      <Header
        activeToolName="Word Counter"
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
        activeToolId="word-counter"
        onOpenHelp={() => {
          setIsSidebarOpen(false);
          const faqEl = document.getElementById('faq');
          faqEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-10">
        {/* Compact Hero */}
        <WordCounterHero />

        {/* Main Word Counter Container */}
        <WordCounter />

        {/* 3-Step How It Works */}
        <WordCounterHowItWorks />

        {/* Key Features */}
        <WordCounterFeatures />

        {/* Frequently Asked Questions */}
        <WordCounterFAQ />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
