'use client';

import React from 'react';
import {
  PackageOpen,
  Layers,
  FolderSearch,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Download,
  Zap,
} from 'lucide-react';

export function ZipExtractorSEO() {
  return (
    <section className="py-10 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800 space-y-12">
      {/* 1. Overview */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          Extract ZIP Files Online — Inspect, Preview & Download Selectively
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          ToolNest <strong>ZIP Extractor</strong> is a high-performance, privacy-focused online archive
          viewer that runs entirely in your web browser. Instead of extracting massive ZIP files to
          your hard drive just to view a single photo or text document, you can inspect the archive
          structure, browse nested folders, preview contents safely, and download only what you need.
        </p>
      </div>

      {/* 2. Step-by-Step Guide */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>How to Extract a ZIP File in 5 Simple Steps</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Upload Your ZIP</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Drag and drop any standard <code>.zip</code> archive or click &quot;Choose ZIP File&quot; from your device.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Browse Contents</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Explore folders with clickable breadcrumbs, filter by file type, or search for filenames in real time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Preview Files Safely</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Click any file to preview images, inspect documents, or view code in a secure sandboxed environment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>Select Files or Folders</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Select specific items using checkboxes, download individual files, or pick an entire directory.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/15 border border-[#5722AF]/20 dark:border-[#5722AF]/30 space-y-1.5 sm:col-span-2">
            <div className="flex items-center gap-2 font-bold text-[#5722AF] dark:text-[#9B6BE8]">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                5
              </span>
              <span>Extract & Download</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Download individual files directly or package selections into a clean, custom ZIP archive with one click.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Why Use Our Extractor? */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <PackageOpen className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Why Use ToolNest ZIP Extractor?</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">100% In-Browser Privacy</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Files are never sent to a server. Everything is decoded locally in browser RAM, ensuring
              complete confidentiality.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">Selective Extraction</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Don&apos;t waste disk space. Extract only the specific images, PDFs, or files you actually need
              from large archives.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">Secure Previews</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Inspect photos, read text notes, and review source code inside safe read-only viewers
              without executing scripts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FolderSearch className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">Interactive Folder Navigation</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Navigate nested directories with a folder tree sidebar and clickable breadcrumbs just like
              a native desktop file manager.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">Zero Installation</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Works directly on Chrome, Safari, Firefox, Edge, Android, and iOS without downloading
              heavy decompression software.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">ZIP Bomb Safeguards</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Built-in protection detects abnormal compression ratios before extraction to keep your
              browser running smoothly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
