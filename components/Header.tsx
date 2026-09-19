'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  HelpCircle,
  Menu,
  X,
  Layers,
  PanelLeft,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenHelp: () => void;
  activeToolName?: string;
  hideBrowseTools?: boolean;
}

export function Header({
  onToggleSidebar,
  onOpenHelp,
  activeToolName = 'Image Bulk Rename',
  hideBrowseTools = false,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial theme state on mount
    const hasDarkClass = document.documentElement.classList.contains('dark');
    setIsDark(hasDarkClass);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('toolnest_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('toolnest_theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Sidebar Toggle + ToolNest Brand + Current Tool Indicator */}
        <div className="flex items-center gap-3">
          {/* Dedicated Sidebar Toggle Button */}
          {!hideBrowseTools && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              title="Open ToolNest Suite Sidebar"
              aria-label="Toggle ToolNest sidebar"
            >
              <PanelLeft className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span className="hidden sm:inline text-xs font-semibold">Tools</span>
            </button>
          )}

          {/* ToolNest Brand Logo & Tool Badge */}
          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5722AF] rounded-lg"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5722AF] to-[#7B45D1] flex items-center justify-center text-white shadow-xs shadow-[#5722AF]/25 group-hover:scale-[1.02] transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                ToolNest
              </span>
            </a>

            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>

            {/* Current Active Tool Breadcrumb Badge */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border border-[#5722AF]/20 dark:border-[#5722AF]/30">
              <span>{activeToolName}</span>
            </div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          {!hideBrowseTools && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors"
            >
              All Tools
            </button>
          )}
          <a
            href="#how-it-works"
            className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors"
          >
            How It Works
          </a>
          <a
            href="#privacy-section"
            className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors"
          >
            Privacy
          </a>
          <a
            href="#faq-section"
            className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Guide / Help Button */}
          <button
            onClick={onOpenHelp}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
            title="Help & Shortcuts"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Guide</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0e14] px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          {!hideBrowseTools && (
            <div className="pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                Current: {activeToolName}
              </span>
              {onToggleSidebar && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onToggleSidebar();
                  }}
                  className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] flex items-center gap-1"
                >
                  <PanelLeft className="w-3.5 h-3.5" />
                  <span>Browse All Tools</span>
                </button>
              )}
            </div>
          )}

          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            How It Works
          </a>
          <a
            href="#privacy-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Privacy
          </a>
          <a
            href="#faq-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            FAQ
          </a>
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenHelp();
              }}
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 py-1"
            >
              <HelpCircle className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>User Guide & Tips</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
