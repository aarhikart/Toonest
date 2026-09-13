'use client';

import React from 'react';
import { Type, ShieldCheck, Zap, Lock, Layers, CheckCircle2, Sparkles } from 'lucide-react';

export function TextOverlaySEO() {
  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 text-xs sm:text-sm leading-relaxed">
        {/* Intro */}
        <div className="space-y-3 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Add Text to Images Online — Fast, Professional & In-Browser
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Adding text overlays to images is an essential daily requirement for content creators, digital marketers, e-commerce store managers, educators, and social media influencers. Whether you need to stamp promotional sale announcements, create motivational quote graphics, label batch product photos, or add copyright attributions, ToolNest provides a complete, studio-quality typography suite directly in your browser.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              Multiple Layer Architecture
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Stack headlines, subheadings, call-to-action badges, and price tags as independent layers. Reorder, duplicate, style, and toggle visibility on each text block individually.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              Bulk Batching with Tokens
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Apply typography overlays across hundreds of photos simultaneously. Dynamically populate photo filenames with <code className="text-[#5722AF]">{'{name}'}</code> and auto-numbering with <code className="text-[#5722AF]">{'{number}'}</code>.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              100% Client-Side Privacy
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Zero cloud transmission. Your images are parsed, rasterized, and compiled locally on your device via HTML5 Canvas API and WebAssembly, keeping confidential graphics private.
            </p>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            How to Add Text to an Image in 5 Simple Steps
          </h3>
          <ol className="space-y-3 list-decimal list-inside text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Upload Your Images:</strong> Drag and drop your JPG, PNG, WebP, or AVIF files into the upload area or paste directly from clipboard with <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">Ctrl+V</kbd>.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Add Text Layers:</strong> Click &ldquo;+ Add Text&rdquo; to create your primary headline. Add secondary layers for subtitles, prices, or branding.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Customize Font & Styling:</strong> Choose from clean web-safe fonts, adjust font sizes, select colors, set opacity, and enable drop shadows, outlines, or background boxes.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Position with Canvas Dragging:</strong> Use the 3×3 grid anchor or click and drag directly across the photo preview to place text precisely where you want it.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Export & Download:</strong> Choose your preferred output format (JPEG, PNG, WebP, AVIF) and download your edited photo or save the entire bulk collection as an organized ZIP archive.
            </li>
          </ol>
        </div>

        {/* Why Use Our Tool */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            Why Use ToolNest Image Text Overlay?
          </h3>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>No Heavy Software Required:</strong> No need to install bulky desktop photo editors like Photoshop or Illustrator for simple, repetitive text tasks.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>Legibility Guaranteed:</strong> Contrast controls including adjustable drop shadows, border strokes, and background pill badges ensure your text is easy to read over any busy photographic background.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>Social Media Crop Dimensions:</strong> Rapidly align your photo composition for Instagram, Facebook, LinkedIn, and YouTube thumbnails without manual math.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
