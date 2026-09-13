'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Sparkles,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Table,
  Layers,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import { WebExtractorView } from '@/components/web-extractor/WebExtractorView';

export default function WebsiteDataExtractorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Website Data Extractor"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="website-data-extractor"
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-400 dark:text-zinc-500">Web &amp; Video Tools</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-zinc-900 dark:text-white">Website Data Extractor</span>
        </nav>

        {/* Main Extractor Component */}
        <WebExtractorView />

        {/* Technical FAQ & Explanations */}
        <section aria-label="Technical Guide" className="rounded-3xl p-6 md:p-8 bg-white dark:bg-[#111624] border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                How In-Page Website Loading &amp; Data Extraction Works
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Understanding reverse proxy streams, iframe sandboxing, and web scraping architecture
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Why Standard Iframes Get Blocked
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Many modern websites set <code className="font-mono text-[11px] text-[#5722AF] dark:text-[#9B6BE8]">X-Frame-Options: SAMEORIGIN</code> or CSP headers that cause browsers to reject embedding them.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                How Our Server Proxy Solves It
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Our backend fetches the target website, injects <code className="font-mono text-[11px]">&lt;base href=&quot;...&quot;&gt;</code> so assets load seamlessly, and streams the HTML safely into an in-page frame.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Structured Table &amp; Media Extraction
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Our parser crawls all <code className="font-mono text-[11px]">&lt;table&gt;</code> and <code className="font-mono text-[11px]">&lt;img&gt;</code> nodes, converting relative paths to absolute links and enabling 1-click ZIP and CSV exports.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Zero External Redirects
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Everything happens right on your page. Test across Desktop, Laptop, Tablet, and Mobile viewports with live responsive scaling.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
