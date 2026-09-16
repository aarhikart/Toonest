'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import { WebsiteViewer } from '@/components/website-viewer/WebsiteViewer';

export default function WebsiteViewerPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Website Viewer"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="website-viewer"
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-400 dark:text-zinc-500">Developer Tools</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-zinc-900 dark:text-white">Website Viewer</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#5722AF]/15 via-[#7B45D1]/10 to-[#9B6BE8]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] border border-[#5722AF]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>In-App Browser Interface</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Website Viewer
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Open and interact with websites inside a complete browser-like interface. Navigate pages, test responsive viewports across Desktop, Tablet, and Mobile, zoom in and out, and review security header embeddability with automatic X-Frame-Options and CSP detection.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sandboxed & Secure Execution</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Multi-Device Viewport Scaling</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>URL History & Back/Forward Controls</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Website Viewer Workspace */}
        <WebsiteViewer />

        {/* Feature Highlights & Guide */}
        <section aria-label="Viewer Guide" className="rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            Website Viewer Features & Navigation Guide
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
              <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Full Browser Controls</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Use standard Back, Forward, Reload, and Home buttons with a persistent URL history stack stored locally.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
              <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Responsive Viewports</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Toggle between Desktop (100%), Laptop (1024px), Tablet (768px), and Mobile (390px) to verify multi-device layouts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
              <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Security Header Detection</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Automatically detects X-Frame-Options (DENY/SAMEORIGIN) and CSP frame-ancestors to inform you when a site cannot be framed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
              <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-indigo-500" />
                <span>Direct Tab Fallback</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sites requiring top-level navigation can be launched directly in a separate browser tab with one click.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
