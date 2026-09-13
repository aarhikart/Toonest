'use client';

import React from 'react';
import { RefreshCw, Zap, Shield, FileCheck } from 'lucide-react';

export function ConverterSEO() {
  return (
    <section className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider">
            Format Knowledge & Capabilities
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Convert Images to Any Format
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            High-performance browser-based conversion tailored for modern web workflows, photography, and graphic design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <div className="bg-white dark:bg-[#131722] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Modern Web Compression & Next-Gen Formats</span>
            </h4>
            <p>
              Switching from traditional raster graphics to next-generation formats has never been easier. With our <strong>PNG to WebP converter</strong> and <strong>JPG to WebP converter</strong>, you can instantly shrink image payloads without sacrificing visual clarity. For web developers seeking maximum bandwidth savings, our <strong>PNG to AVIF converter</strong> and <strong>JPG to AVIF converter</strong> deliver next-generation AV1 compression straight from your desktop or phone browser.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Universal Compatibility & Transparency</span>
            </h4>
            <p>
              Need to convert legacy or mobile snapshots for older software? Use our <strong>WebP to JPG converter</strong> or <strong>WebP to PNG converter</strong> in seconds. When converting transparent graphics with our <strong>PNG to JPG converter</strong>, you have full control over background fill colors so transparent logos and product shots remain crisp without dark borders.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>High-Volume Bulk Image Converter</span>
            </h4>
            <p>
              Managing large photo albums, e-commerce inventories, or social media assets requires speed. As a dedicated <strong>bulk image converter</strong>, ToolNest lets you queue hundreds of files at once, fine-tune compression levels, scale resolutions uniformly, and download everything as an organized ZIP archive with zero cloud latency.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Safe & Private In-Browser Conversion</span>
            </h4>
            <p>
              Unlike conventional online conversion websites that upload your photos to remote cloud servers, our <strong>image format conversion</strong> engine runs locally in your device&apos;s memory. Your private documents, screenshots, and artwork remain completely confidential and safe from data collection.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
