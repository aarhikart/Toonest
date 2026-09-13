'use client';

import React from 'react';
import { ShieldCheck, Zap, Lock, Layers, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react';

export function WatermarkSEO() {
  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 text-xs sm:text-sm leading-relaxed">
        {/* Intro */}
        <div className="space-y-3 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Protecting Your Digital Visual Assets with Online Watermarking
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            In today’s fast-paced digital ecosystem, unauthorized image reuse, hotlinking, and content theft are widespread issues facing photographers, e-commerce stores, graphic designers, real estate agencies, and social media creators. Watermarking remains the most recognized and legally binding visual deterrence against content piracy.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              100% Client-Side Privacy
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Unlike cloud services that require uploading your private unreleased photos to third-party servers, ToolNest processes all pixels strictly in your local web browser. Your confidential artwork never leaves your computer.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              Instant Bulk Batching
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Stamp dozens or hundreds of images in seconds. The progressive processing engine optimizes CPU and GPU canvas memory, letting you download the entire watermarked batch in one organized ZIP file.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              Precision Control & Tiling
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Full control over typography, drop shadows, border outlines, semi-transparent background pills, direct canvas click-and-drag coordinates, 360-degree rotation, and diagonal repeating tiles.
            </p>
          </div>
        </div>

        {/* Best practices guide */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            Best Practices for Professional Image Watermarking
          </h3>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>Opacity Balance:</strong> An effective watermark should be legible without overpowering the primary subject. Keep branding watermarks between 40% to 75% opacity, and client sample proofs between 30% to 55% with a diagonal tilt.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>Transparent PNGs for Logos:</strong> Always export your company logo as a PNG with alpha transparency or use clean vector SVGs to eliminate rectangular white background boxes around your brand icon.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>Tiled Pattern Protection:</strong> If you are sending unpurchased proofs or catalog previews to external clients, activate the &ldquo;Repeat / Tile Across Image&rdquo; toggle. This places diagonal repeated watermarks across all corners, preventing cropping or AI-based object removal.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>Shadow & Outline Legibility:</strong> When placing white text over high-contrast photos with alternating light and dark areas, enable a subtle drop shadow or a 2px outline to ensure readability regardless of the underlying color palette.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
