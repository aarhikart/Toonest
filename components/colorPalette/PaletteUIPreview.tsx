'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Shuffle,
  X,
  Layers,
  CheckCircle,
  Bell,
} from 'lucide-react';
import { ColorItem } from '@/lib/colorTypes';

interface PaletteUIPreviewProps {
  palette: ColorItem[];
  onClose: () => void;
}

export function PaletteUIPreview({ palette, onClose }: PaletteUIPreviewProps) {
  const [roleOffset, setRoleOffset] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  if (palette.length === 0) return null;

  // Derive roles based on offset
  const getRoleColor = (index: number) => {
    const idx = (index + roleOffset) % palette.length;
    return palette[idx] || palette[0];
  };

  const primaryColor = getRoleColor(0);
  const secondaryColor = getRoleColor(1 % palette.length);
  const accentColor = getRoleColor(2 % palette.length);
  const neutralColor = getRoleColor(3 % palette.length);
  const surfaceColor = getRoleColor(palette.length - 1);

  const shuffleRoles = () => {
    setRoleOffset((prev) => (prev + 1) % palette.length);
  };

  const bgClass = isDarkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900';
  const cardBgClass = isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200/80';

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-md p-4 sm:p-6 mb-6 transition-colors">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Live Website UI Preview
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              See how your palette looks in realistic product components
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle Color Roles */}
          <button
            type="button"
            onClick={shuffleRoles}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Rotate color assignments"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle Roles</span>
          </button>

          {/* Toggle Light/Dark Mockup */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {isDarkMode ? 'Light Mockup' : 'Dark Mockup'}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title="Close UI Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Assignment Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 text-xs font-mono">
        <span className="text-zinc-400 text-[11px] font-sans">Role mapping:</span>
        <span
          className="px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1.5"
          style={{
            backgroundColor: primaryColor.hex,
            color: primaryColor.isDark ? '#FFF' : '#000',
          }}
        >
          Primary: {primaryColor.hex}
        </span>
        <span
          className="px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1.5"
          style={{
            backgroundColor: secondaryColor.hex,
            color: secondaryColor.isDark ? '#FFF' : '#000',
          }}
        >
          Secondary: {secondaryColor.hex}
        </span>
        <span
          className="px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1.5"
          style={{
            backgroundColor: accentColor.hex,
            color: accentColor.isDark ? '#FFF' : '#000',
          }}
        >
          Accent: {accentColor.hex}
        </span>
      </div>

      {/* Mockup Frame */}
      <div className={`rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden shadow-inner transition-colors ${bgClass}`}>
        {/* Mock Browser Topbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-200/70 dark:bg-zinc-800/70 border-b border-zinc-300/60 dark:border-zinc-700/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="px-3 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[11px] text-zinc-500 font-mono max-w-[200px] truncate">
            https://your-product.design
          </div>
          <div className="w-10" />
        </div>

        {/* Mock Navigation Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-2 font-bold text-sm">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs"
              style={{
                backgroundColor: primaryColor.hex,
                color: primaryColor.isDark ? '#FFF' : '#000',
              }}
            >
              P
            </div>
            <span>PaletteStudio</span>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-900 dark:text-white">Features</span>
            <span>Showcase</span>
            <span>Pricing</span>
          </div>

          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-opacity hover:opacity-90"
            style={{
              backgroundColor: primaryColor.hex,
              color: primaryColor.isDark ? '#FFF' : '#000',
            }}
          >
            Get Started
          </button>
        </div>

        {/* Mock Hero Section */}
        <div className="p-6 sm:p-10 text-center max-w-2xl mx-auto space-y-4">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${accentColor.hex}22`,
              color: accentColor.hex,
              border: `1px solid ${accentColor.hex}44`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen UI Experience</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Design with Harmonic Precision
          </h2>

          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
            Experience your cohesive color story applied across call-to-actions, badges, metric cards, and layout elements.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 hover:opacity-95"
              style={{
                backgroundColor: primaryColor.hex,
                color: primaryColor.isDark ? '#FFF' : '#000',
              }}
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              className="px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              style={{
                borderColor: secondaryColor.hex,
                color: isDarkMode ? '#FFF' : secondaryColor.hex,
              }}
            >
              View Documentation
            </button>
          </div>
        </div>

        {/* Mock Component Cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          {/* Card 1: Metric */}
          <div className={`p-4 rounded-xl border ${cardBgClass} space-y-2`}>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Conversion Rate</span>
              <div
                className="p-1 rounded-md"
                style={{
                  backgroundColor: `${accentColor.hex}20`,
                  color: accentColor.hex,
                }}
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black">+34.8%</div>
            <div className="text-[11px] text-zinc-400">vs. last calendar quarter</div>
          </div>

          {/* Card 2: Status */}
          <div className={`p-4 rounded-xl border ${cardBgClass} space-y-2`}>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>WCAG Verified</span>
              <div
                className="p-1 rounded-md"
                style={{
                  backgroundColor: `${primaryColor.hex}20`,
                  color: primaryColor.hex,
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black">Level AAA</div>
            <div className="text-[11px] text-emerald-500 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Fully compliant contrast
            </div>
          </div>

          {/* Card 3: Feature Callout */}
          <div
            className="p-4 rounded-xl space-y-2"
            style={{
              backgroundColor: secondaryColor.hex,
              color: secondaryColor.isDark ? '#FFF' : '#000',
            }}
          >
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">
              Accent Feature
            </div>
            <div className="text-base font-bold">Dynamic Surface</div>
            <div className="text-[11px] opacity-90">
              Harmonized with palette color {secondaryColor.hex}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
