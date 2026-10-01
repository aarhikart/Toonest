'use client';

import React, { useState, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { GoogleReviewTool } from '@/components/google-review/GoogleReviewTool';

export default function GoogleReviewAutomatorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Global Header */}
      <Header
        activeToolName="Google Review Automator"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeToolId="google-review-automator"
        onOpenHelp={() => {
          setIsSidebarOpen(false);
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <Suspense
          fallback={
            <div className="w-full max-w-5xl mx-auto h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800" />
          }
        >
          <GoogleReviewTool />
        </Suspense>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
