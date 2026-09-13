'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Heart, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0e14] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#5722AF] text-white flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-white">
                ToolNest
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Professional, privacy-first image and file utilities in your browser.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center items-center gap-5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Bulk Rename.
            </Link>
            <Link href="/convert" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Converter
            </Link>
            <Link href="/compress" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Compressor
            </Link>
            <Link href="/resize" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Resizer
            </Link>
            <Link href="/pixel-size" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Pixel Size
            </Link>
            <Link href="/metadata" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Metadata
            </Link>
            <Link href="/watermark" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Watermark
            </Link>
            <Link href="/image-text-overlay" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Text Overlay
            </Link>
            <Link href="/social-media-image-resizer" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Social Resizer
            </Link>
            <Link href="/favicon-generator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Favicon Generator
            </Link>
            <Link href="/zip-creator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              ZIP Creator
            </Link>
            <Link href="/zip-extractor" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              ZIP Extractor
            </Link>
            <Link href="/pdf-to-jpg" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              PDF to JPG
            </Link>
            <Link href="/pdf-to-png" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              PDF to PNG
            </Link>
            <Link href="/jpg-to-pdf" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              JPG to PDF
            </Link>
            <Link href="/color-palette-generator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Color Palette
            </Link>
            <Link href="/gradient-generator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Gradient Generator
            </Link>
            <Link href="/box-shadow-generator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Box Shadow
            </Link>
            <Link href="/border-radius-generator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Border Radius
            </Link>
            <Link href="/instagram-reel-downloader" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Instagram Reels
            </Link>
            <Link href="/instagram-dm-assistant" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Instagram DM Assistant
            </Link>
            <Link href="/instagram-auto-commenter" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Instagram Auto Commenter
            </Link>
            <Link href="/movie-stream-embed" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Movie Stream &amp; Embed
            </Link>
            <Link href="/text-case-converter" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Text Case Converter
            </Link>
            <Link href="/word-counter" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Word Counter
            </Link>
            <Link href="/ai-video-detector" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              AI Video Detector
            </Link>
            <Link href="/percentage-calculator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Percentage Calculator
            </Link>
            <Link href="/gst-calculator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              GST Calculator
            </Link>
            <Link href="/emi-calculator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              EMI Calculator
            </Link>
            <Link href="/salary-calculator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Salary Calculator
            </Link>
            <Link href="/age-calculator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Age Calculator
            </Link>
            <Link href="/date-time-difference-calculator" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
              Date & Time Difference
            </Link>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          <div>
            © 2026 ToolNest. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Files processed 100% locally in your browser</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
