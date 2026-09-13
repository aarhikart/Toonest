'use client';

import React from 'react';
import {
  Layout,
  Search,
  ArrowRight,
  Bell,
  Star,
  CheckCircle2,
  Bookmark,
  Share2,
} from 'lucide-react';
import { generateBorderRadiusCss } from '@/lib/borderRadius/borderRadiusEngine';
import { BorderRadiusConfig } from '@/lib/borderRadius/borderRadiusTypes';

interface RealUIPreviewsProps {
  config: BorderRadiusConfig;
}

export function RealUIPreviews({ config }: RealUIPreviewsProps) {
  const radiusCss = generateBorderRadiusCss(config);

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Preview in Real UI Components</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            See how your active border radius behaves on realistic web and app interface elements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Realistic UI Card */}
        <div
          style={{ borderRadius: radiusCss }}
          className="bg-white dark:bg-[#1A1A28] border border-zinc-200/90 dark:border-zinc-700/80 p-5 shadow-md flex flex-col justify-between space-y-4 transition-all"
        >
          <div className="space-y-3">
            <div
              style={{ borderRadius: radiusCss }}
              className="w-full h-28 bg-gradient-to-tr from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] flex items-center justify-center text-white"
            >
              <Star className="w-8 h-8 opacity-80" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-[#5722AF] dark:text-[#9B6BE8] font-bold uppercase tracking-wider">
                <span>Featured UI</span>
                <span className="text-[10px] text-zinc-400">2 min read</span>
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-1">
                Design System Elevation
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                Curved geometries provide high visual comfort and enhance clickability.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-zinc-400 font-medium">Free Access</span>
            <button
              type="button"
              style={{ borderRadius: radiusCss }}
              className="px-3 py-1.5 bg-[#5722AF] text-white font-semibold text-xs flex items-center gap-1 hover:bg-[#491B93] transition-colors"
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2. Button, Badge & Form Input */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Primary Action Button */}
          <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Interactive Buttons
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                style={{ borderRadius: radiusCss }}
                className="px-4 py-2 bg-[#5722AF] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 hover:bg-[#491B93] transition-all"
              >
                <span>Primary Action</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                style={{ borderRadius: radiusCss }}
                className="px-3.5 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#12121A] text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Secondary
              </button>
            </div>
          </div>

          {/* Form Input Field */}
          <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Search Input
            </span>
            <div
              style={{ borderRadius: radiusCss }}
              className="flex items-center px-3 py-2 bg-white dark:bg-[#12121A] border border-zinc-300 dark:border-zinc-700 shadow-2xs gap-2"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                readOnly
                placeholder="Search resources..."
                className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Status Badges */}
          <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              UI Badges & Tags
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{ borderRadius: radiusCss }}
                className="px-2.5 py-1 bg-[#5722AF]/15 text-[#5722AF] dark:text-[#9B6BE8] text-[11px] font-bold flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
              <span
                style={{ borderRadius: radiusCss }}
                className="px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold"
              >
                Active Status
              </span>
              <span
                style={{ borderRadius: radiusCss }}
                className="px-2.5 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-bold"
              >
                Pro Feature
              </span>
            </div>
          </div>
        </div>

        {/* 3. Mobile Notification Card */}
        <div
          style={{ borderRadius: radiusCss }}
          className="bg-white dark:bg-[#1A1A28] border border-zinc-200/90 dark:border-zinc-700/80 p-4 shadow-md flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start gap-3">
            <div
              style={{ borderRadius: radiusCss }}
              className="w-9 h-9 bg-[#5722AF] text-white flex items-center justify-center shrink-0 shadow-xs"
            >
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  System Notification
                </span>
                <span className="text-[10px] text-zinc-400 shrink-0">Just now</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                New border radius tokens synced across your stylesheet.
              </p>
            </div>
          </div>

          <div
            style={{ borderRadius: radiusCss }}
            className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs"
          >
            <span className="font-mono text-[11px] text-[#5722AF] dark:text-[#9B6BE8] font-bold truncate">
              {radiusCss}
            </span>
            <div className="flex items-center gap-1 text-zinc-400">
              <Bookmark className="w-3.5 h-3.5 hover:text-zinc-600 cursor-pointer" />
              <Share2 className="w-3.5 h-3.5 hover:text-zinc-600 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
