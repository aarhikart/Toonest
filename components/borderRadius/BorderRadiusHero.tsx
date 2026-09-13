'use client';

import React from 'react';
import { Square, Sparkles, Shield, Cpu, Layers } from 'lucide-react';

export function BorderRadiusHero() {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 pb-1">
      {/* Feature Badges */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Professional CSS Geometry Studio</span>
      </div>

      {/* Main H1 */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
        CSS Border Radius Generator
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
        Create custom CSS border-radius values visually and copy ready-to-use CSS instantly.
      </p>

      {/* Supporting text */}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        Adjust every corner independently, create smooth rounded shapes or fluid organic blobs, preview your design live, and generate production-ready CSS.
      </p>

      {/* Capabilities Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1 bg-white dark:bg-[#181824] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
          <Square className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
          4 Independent Corners
        </span>
        <span className="flex items-center gap-1 bg-white dark:bg-[#181824] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
          <Layers className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
          Elliptical & Organic Shapes
        </span>
        <span className="flex items-center gap-1 bg-white dark:bg-[#181824] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
          <Cpu className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
          Visual Drag Handles
        </span>
        <span className="flex items-center gap-1 bg-white dark:bg-[#181824] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs">
          <Shield className="w-3 h-3 text-emerald-500" />
          100% Client-Side Privacy
        </span>
      </div>
    </div>
  );
}
