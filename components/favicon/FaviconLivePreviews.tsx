'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Globe,
  Lock,
  X,
  Bookmark,
  Smartphone,
  AlertTriangle,
  Info,
  Maximize2,
  Check,
  Sparkles,
  Split,
} from 'lucide-react';
import { FaviconConfig, FaviconSourceItem } from '@/lib/faviconTypes';
import { renderFaviconToCanvas } from '@/lib/faviconEngine';

interface FaviconLivePreviewsProps {
  sourceItem: FaviconSourceItem;
  baseImg: HTMLImageElement | null;
  config: FaviconConfig;
}

export function FaviconLivePreviews({
  sourceItem,
  baseImg,
  config,
}: FaviconLivePreviewsProps) {
  const masterCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'browser' | 'address' | 'bookmark' | 'mobile' | 'sizes' | 'comparison'>('browser');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  // Render master preview canvas
  useEffect(() => {
    if (!masterCanvasRef.current || !baseImg) return;
    const canvas = masterCanvasRef.current;
    renderFaviconToCanvas(canvas, baseImg, config, 512, 512);
    setPreviewDataUrl(canvas.toDataURL('image/png'));
  }, [baseImg, config]);

  const websiteTitle = config.websiteName.trim() || 'My Website';
  const urlDisplay = `https://${config.websiteName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mywebsite'}.com`;

  const standardSizes = [16, 32, 48, 64, 128, 180, 192, 512];

  return (
    <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Hidden Master Canvas for High-Res Generation */}
      <canvas ref={masterCanvasRef} className="hidden" />

      {/* Top Preview Header & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Favicon Live Previews</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time simulation across browser tabs, URL bar, bookmarks, and mobile home screen.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/70 dark:border-zinc-800 overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('browser')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'browser'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Browser Tab
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'address'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Address Bar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookmark')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'bookmark'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Bookmark
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'mobile'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Mobile App
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sizes')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'sizes'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Sizes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'comparison'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Before / After
          </button>
        </div>
      </div>

      {/* Main Preview Screen */}
      <div className="min-h-[260px] sm:min-h-[300px] flex items-center justify-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800">
        {/* 1. BROWSER TAB SIMULATION */}
        {activeTab === 'browser' && (
          <div className="w-full max-w-lg space-y-3">
            <div className="bg-zinc-200 dark:bg-zinc-800 rounded-t-xl pt-2 px-3 border border-zinc-300/80 dark:border-zinc-700 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              {/* Simulated Browser Tab */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-t-lg border-t border-x border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 max-w-xs shadow-xs">
                {previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDataUrl}
                    alt="Favicon"
                    className="w-4 h-4 shrink-0 object-contain"
                  />
                ) : (
                  <Globe className="w-4 h-4 text-zinc-400" />
                )}
                <span className="truncate font-medium">{websiteTitle}</span>
                <X className="w-3 h-3 text-zinc-400 ml-1.5 shrink-0" />
              </div>
            </div>

            {/* Browser Content Placeholder */}
            <div className="bg-white dark:bg-zinc-900 rounded-b-xl p-6 border-x border-b border-zinc-300/80 dark:border-zinc-700 text-center text-xs text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">Website Tab Preview</p>
              <p>Your favicon is scaled to 16×16 px alongside the website title in browser tabs.</p>
            </div>
          </div>
        )}

        {/* 2. ADDRESS BAR SIMULATION */}
        {activeTab === 'address' && (
          <div className="w-full max-w-lg space-y-4">
            <div className="bg-zinc-100 dark:bg-zinc-800/90 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Simulated URL Bar
              </span>
              <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDataUrl}
                    alt="Favicon"
                    className="w-4 h-4 shrink-0 object-contain"
                  />
                ) : (
                  <Globe className="w-4 h-4 text-zinc-400" />
                )}
                <span className="text-xs font-mono text-zinc-700 dark:text-zinc-200 truncate">
                  {urlDisplay}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. BOOKMARK BAR SIMULATION */}
        {activeTab === 'bookmark' && (
          <div className="w-full max-w-lg space-y-3">
            <div className="bg-zinc-100 dark:bg-zinc-800/90 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Simulated Bookmarks Bar</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 shadow-2xs">
                  {previewDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewDataUrl}
                      alt="Favicon"
                      className="w-4 h-4 shrink-0 object-contain"
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-zinc-400" />
                  )}
                  <span className="font-medium truncate max-w-[140px]">{websiteTitle}</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/60 dark:border-zinc-700 text-xs text-zinc-400 opacity-60">
                  <div className="w-3.5 h-3.5 rounded bg-zinc-300 dark:bg-zinc-700" />
                  <span>Other Bookmark</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. MOBILE HOME SCREEN / APP SIMULATION */}
        {activeTab === 'mobile' && (
          <div className="flex flex-col items-center justify-center p-6 space-y-3">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-3 bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-2xl border-4 border-zinc-700 flex items-center justify-center">
              {/* Phone Speaker & Notch bar */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-600 rounded-full" />

              <div className="flex flex-col items-center space-y-1.5 mt-2">
                {previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDataUrl}
                    alt="App Icon"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-2xl shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 bg-zinc-700 rounded-2xl animate-pulse" />
                )}
                <span className="text-[10px] sm:text-xs font-semibold text-white truncate max-w-[80px]">
                  {config.shortName.trim() || websiteTitle.slice(0, 10)}
                </span>
              </div>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Apple Touch Icon (180×180) & Android PWA Icon (192×192)
            </span>
          </div>
        )}

        {/* 5. ALL COMMON SIZES ON TRANSPARENCY CHECKERBOARD */}
        {activeTab === 'sizes' && (
          <div className="w-full space-y-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              Rendered on neutral checkerboard pattern to verify alpha transparency:
            </p>

            <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
              {standardSizes.map((size) => (
                <div key={size} className="flex flex-col items-center space-y-1.5">
                  <div
                    className="p-1 rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-2xs flex items-center justify-center"
                    style={{
                      backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                      backgroundSize: '12px 12px',
                      backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                    }}
                  >
                    {previewDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewDataUrl}
                        alt={`${size}x${size}`}
                        style={{ width: `${Math.min(size, 80)}px`, height: `${Math.min(size, 80)}px` }}
                        className="object-contain"
                      />
                    ) : (
                      <div style={{ width: `${Math.min(size, 80)}px`, height: `${Math.min(size, 80)}px` }} />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-semibold">
                    {size}×{size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. BEFORE / AFTER COMPARISON */}
        {activeTab === 'comparison' && (
          <div className="w-full max-w-md grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Original Logo
              </span>
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sourceItem.previewUrl}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {sourceItem.width} × {sourceItem.height} px
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider block">
                Processed Favicon
              </span>
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center">
                {previewDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDataUrl}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                Shape: {config.shape}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Advisory Warnings */}
      <div className="space-y-2">
        {/* Transparency note */}
        {config.backgroundType === 'transparent' && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Transparent background active:</strong> The icon will blend with user browser themes and operating system dark/light modes.
            </span>
          </div>
        )}

        {/* Small icon quality tip */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Tip:</strong> Keep your favicon simple and high-contrast for optimal recognition at 16×16 px in browser tabs.
          </span>
        </div>
      </div>
    </div>
  );
}
