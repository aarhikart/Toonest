'use client';

import React from 'react';
import { Share2, ShieldCheck, Zap, Lock, Crop, CheckCircle2, Sparkles } from 'lucide-react';

export function SocialResizerSEO() {
  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 text-xs sm:text-sm leading-relaxed">
        {/* Intro */}
        <div className="space-y-3 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Resize & Crop Images for Social Media Platforms
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Every major social network—Instagram, Facebook, YouTube, LinkedIn, X (Twitter), Pinterest, TikTok, and Snapchat—enforces distinct image dimension requirements, aspect ratios, and safe-zone boundaries. Uploading an incorrect size often results in automatic, unflattering cropping, blurry compression, or hidden text. ToolNest eliminates the guesswork by providing verified, official platform dimensions and smart cropping directly in your web browser.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              Official Platform Presets
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Instant access to standard dimensions for feed posts, reels, stories, headers, banners, channel art, and profile pictures across 8+ social networks.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              Smart Subject Centering
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive drag-and-drop crop frame with local visual contrast analysis keeps your main subject or face centered and avoids awkward automatic cuts.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              100% In-Browser Privacy
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Zero cloud transmission. All image transformations, blur background rendering, and ZIP compression run entirely on your computer hardware.
            </p>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            How to Resize an Image for Social Media in 5 Easy Steps
          </h3>
          <ol className="space-y-3 list-decimal list-inside text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Upload Your Images:</strong> Drop single or bulk photos into the uploader or paste directly with <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">Ctrl+V</kbd>.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Choose a Social Platform:</strong> Select from Instagram, Facebook, YouTube, LinkedIn, X, Pinterest, TikTok, Snapchat, or enter custom dimensions.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Select Format & Aspect Ratio:</strong> Pick between Square, Portrait, Stories, Reels, Channel Banner, or Thumbnails.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Adjust the Crop & Orientation:</strong> Pan and zoom inside the crop frame or switch to &ldquo;Fit Inside&rdquo; with a blurred photo background to keep the entire image visible.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Download Resized Image:</strong> Export your photo at the exact official dimensions or download the entire batch as an organized ZIP archive.
            </li>
          </ol>
        </div>

        {/* Why Use Our Tool */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            Why Use ToolNest Social Media Image Resizer?
          </h3>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Distortion:</strong> Unlike basic tools that warp images, ToolNest uses proportional scaling and intelligent crop-to-fill geometry to prevent stretched pictures.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>Non-Destructive Safe Area Overlays:</strong> Preview how buttons, profile headers, and caption overlays will interact with your visual composition before posting.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span>
                <strong>Bulk Batch Productivity:</strong> Format dozens of photos for social media campaigns in seconds, with individual crop overrides when needed.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
