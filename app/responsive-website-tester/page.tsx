'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Info,
  Lock,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import { ResponsiveTester } from '@/components/responsive/ResponsiveTester';

export default function ResponsiveWebsiteTesterPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Website Responsive Tester"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="responsive-website-tester"
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-400 dark:text-zinc-500">Developer Tools</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-zinc-900 dark:text-white">Website Responsive Tester</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5722AF]/10 dark:bg-[#5722AF]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] border border-[#5722AF]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Device Viewport QA Suite</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Responsive Website Tester
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Test how your website looks on phones, tablets, laptops and desktop screens. Check responsive layouts, viewport sizes, orientations, breakpoint continuity, and common device resolutions.
            </p>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />
              <span>Enter a public website URL to preview it at different viewport sizes.</span>
            </p>
          </div>
        </div>

        {/* Main Interactive Responsive Tester Workspace */}
        <ResponsiveTester />

        {/* Privacy First Section */}
        <section aria-label="Privacy First" className="p-5 rounded-3xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-zinc-900 dark:text-white">Privacy First Architecture</h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Website URLs, test sessions, and developer notes are stored strictly inside your local browser storage (<code className="font-mono text-[11px]">localStorage</code>).
              This tool does not collect or upload website login credentials. Never enter passwords, API keys, session cookies, or sensitive authentication tokens.
            </p>
          </div>
        </section>

        {/* Technical Educational SEO Content */}
        <section aria-label="Educational Guide" className="rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-8">
          {/* 1. What is Responsive Testing */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              What is Responsive Testing?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Responsive testing is the process of verifying that a website&apos;s UI, typography, imagery, and interactive controls render smoothly across an infinite variety of screen widths, heights, aspect ratios, and device orientations. Rather than building separate desktop and mobile websites, modern web standards rely on CSS Media Queries and fluid grid systems (such as CSS Grid and Flexbox) to seamlessly adapt content.
            </p>
          </div>

          {/* 2. Why Test Mobile Responsiveness */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Why Test Mobile Responsiveness?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                <h3 className="font-bold text-zinc-900 dark:text-white">Mobile Web Traffic Share</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Over 55% of global internet traffic originates on mobile devices. A layout that breaks on smaller screens directly degrades user retention and conversion rates.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                <h3 className="font-bold text-zinc-900 dark:text-white">Touch Interaction &amp; Sizing</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Touch inputs require minimum clickable target areas (at least 44×44px or 48×48px) to prevent accidental taps and ensure smooth thumb accessibility.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                <h3 className="font-bold text-zinc-900 dark:text-white">Typography &amp; Overflow Prevention</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Fixed-width divs or oversized pre tags often cause accidental horizontal scrollbars. Testing catches layout shifts before production deployment.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Common Responsive Breakpoints */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Common Responsive Breakpoints
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              While there is no single mandatory breakpoint standard, popular frameworks like Tailwind CSS and Bootstrap categorize viewport widths into standard ranges:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-center font-mono">
                <p className="font-bold text-zinc-900 dark:text-white">&lt; 640px</p>
                <p className="text-[11px] text-zinc-500 font-sans">Mobile Phones</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-center font-mono">
                <p className="font-bold text-zinc-900 dark:text-white">640px (sm)</p>
                <p className="text-[11px] text-zinc-500 font-sans">Large Phones</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-center font-mono">
                <p className="font-bold text-zinc-900 dark:text-white">768px (md)</p>
                <p className="text-[11px] text-zinc-500 font-sans">Tablets</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-center font-mono">
                <p className="font-bold text-zinc-900 dark:text-white">1024px (lg)</p>
                <p className="text-[11px] text-zinc-500 font-sans">Laptops</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-center font-mono">
                <p className="font-bold text-zinc-900 dark:text-white">1280px (xl)</p>
                <p className="text-[11px] text-zinc-500 font-sans">Desktops</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-center font-mono">
                <p className="font-bold text-zinc-900 dark:text-white">1536px+ (2xl)</p>
                <p className="text-[11px] text-zinc-500 font-sans">Widescreen 4K</p>
              </div>
            </div>
          </div>

          {/* 4. Mobile vs Desktop Testing */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Viewport Simulation vs. Real Physical Device Testing
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This tool provides **viewport simulation** (changing pixel dimensions, orientation, scale, and safe area overlays). It allows developers to quickly inspect CSS media query triggers, fluid layouts, and component wrapping.
              However, real hardware testing remains essential for verifying touch latency, native iOS WebKit vs Android Chrome rendering engines, device thermal throttling, and GPU rendering differences.
            </p>
          </div>

          {/* 5. FAQ Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Frequently Asked Questions</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                <h3 className="font-bold text-zinc-900 dark:text-white">Can I test my website on Android?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Yes. The tool includes standard Android-style viewport presets (360×640, 412×915, 412×892). However, real Android hardware testing may still be required for device-specific performance.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                <h3 className="font-bold text-zinc-900 dark:text-white">Can I test iPhone sizes?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Yes. Choose between Small iPhone (375×667), Standard iPhone (390×844), and Large iPhone (430×932), and toggle the Safe Area visualizer to preview notch and home bar clearances.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                <h3 className="font-bold text-zinc-900 dark:text-white">Can I test tablets and laptops?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Yes. Standard tablet presets (768×1024, 1024×1366, 800×1280) and laptop viewports (1280×800, 1366×768, 1536×864) are immediately selectable with one click.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                <h3 className="font-bold text-zinc-900 dark:text-white">Does this test Safari rendering?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  The tool includes a Safari QA checklist for tracking testing progress. Note that true WebKit engine evaluation requires running Safari directly on an iOS or macOS device.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                <h3 className="font-bold text-zinc-900 dark:text-white">Why can&apos;t some websites load inside the preview?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Certain websites send <code className="font-mono text-[10px]">X-Frame-Options: SAMEORIGIN</code> or CSP frame-ancestors security headers that prohibit embedding in iframes. The tool automatically detects this and offers buttons to open the site directly or in a resized popup window.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                <h3 className="font-bold text-zinc-900 dark:text-white">Can I test a local website (localhost)?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Yes. Enter <code className="font-mono text-[10px]">http://localhost:3000</code> or your local development server IP. Local sites generally allow iframe embedding without restrictions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
