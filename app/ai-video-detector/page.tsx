'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { AIVideoDetectorHero } from '@/components/tools/ai-video-detector/AIVideoDetectorHero';
import { AIVideoDetector } from '@/components/tools/ai-video-detector/AIVideoDetector';
import { ToolFAQ } from '@/components/tools/ai-video-detector/ToolFAQ';
import { AIVideoSEO } from '@/components/tools/ai-video-detector/AIVideoSEO';

export default function AIVideoDetectorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Global Header */}
      <Header
        activeToolName="AI Video Detector"
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
        activeToolId="ai-video-detector"
        onOpenHelp={() => {
          setIsSidebarOpen(false);
          const faqEl = document.getElementById('faq');
          faqEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* Hero Section */}
        <AIVideoDetectorHero />

        {/* Master Tool Container */}
        <AIVideoDetector />

        {/* Comprehensive FAQ Section */}
        <div id="faq">
          <ToolFAQ />
        </div>

        {/* Structured SEO Guide & Technical Context */}
        <AIVideoSEO />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
