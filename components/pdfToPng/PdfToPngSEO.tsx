'use client';

import React from 'react';
import {
  Sparkles,
  Layers,
  Shield,
  Zap,
  CheckCircle2,
  FileText,
  Sliders,
  Maximize2,
  Eye,
} from 'lucide-react';

export function PdfToPngSEO() {
  return (
    <div className="space-y-12 text-zinc-700 dark:text-zinc-300 py-6 border-t border-zinc-200/80 dark:border-zinc-800">
      {/* 1. What is PDF to PNG Conversion */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
          Why Convert PDF Pages to PNG?
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Portable Document Format (PDF) is standard for document sharing and printing, but integrating PDF pages into web applications, design systems, slide presentations, and graphics editors often requires an image format. While JPEG is great for photographs, <strong>PNG (Portable Network Graphics)</strong> is the superior format for documents containing diagrams, screenshots, typography, infographics, and transparent elements.
        </p>
        <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          PNG uses <strong>lossless DEFLATE compression</strong>, meaning no pixels, fine serif strokes, or color gradations are discarded during conversion. You achieve razor-sharp rendering with zero compression artifacts or halos around text.
        </p>
      </section>

      {/* 2. Key Advantages Grid */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
          Key Benefits of ToolNest PDF to PNG Converter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              Lossless Pixel Fidelity
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Every font contour, hair-thin vector stroke, and data visualization retains perfect clarity with zero blur or compression distortion.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              Alpha Channel Transparency
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Toggle transparent canvas background on or off. Perfect for vector logos, transparent charts, stamps, and graphics extracted from PDF artboards.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              100% Client-Side Privacy
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Processing executes completely inside your browser via WebAssembly and HTML5 Canvas. Your sensitive legal, financial, and personal PDFs never touch a cloud server.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Step-by-Step Guide */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
          How to Convert PDF to PNG Online in 4 Simple Steps
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
            <div className="text-base font-bold text-[#5722AF] dark:text-[#9B6BE8]">1. Upload PDF</div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Drag and drop your PDF documents into the drop zone or paste directly from clipboard.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
            <div className="text-base font-bold text-[#5722AF] dark:text-[#9B6BE8]">2. Select Pages</div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Pick all pages, click individual checkboxes, or specify custom spans (e.g. 1-3, 5).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
            <div className="text-base font-bold text-[#5722AF] dark:text-[#9B6BE8]">3. Set DPI & Mode</div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Choose resolution (72 to 300 DPI) and decide whether to enable transparent background.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
            <div className="text-base font-bold text-[#5722AF] dark:text-[#9B6BE8]">4. Download PNGs</div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Save individual PNG pages instantly or download the entire batch as an organized ZIP archive.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PNG vs JPG Comparison Table */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
          PDF to PNG vs PDF to JPG: Which Format Should You Choose?
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-bold border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="p-3">Feature</th>
                <th className="p-3">PNG (Portable Network Graphics)</th>
                <th className="p-3">JPG / JPEG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <tr>
                <td className="p-3 font-semibold text-zinc-900 dark:text-white">Compression Type</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Lossless (Zero quality degradation)</td>
                <td className="p-3 text-zinc-600 dark:text-zinc-400">Lossy (Adjustable compression)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-900 dark:text-white">Transparency Support</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Yes (Full 8-bit alpha channel)</td>
                <td className="p-3 text-red-500 font-medium">No (Solid background color required)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-900 dark:text-white">Text & Linework Sharpness</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Razor-sharp edges with no artifacts</td>
                <td className="p-3 text-zinc-600 dark:text-zinc-400">Can produce minor edge halos at lower quality</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-900 dark:text-white">File Size</td>
                <td className="p-3 text-zinc-600 dark:text-zinc-400">Larger for rich gradients / photos</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Much smaller for photographic scans</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-900 dark:text-white">Recommended Use Case</td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300 font-medium">Diagrams, blueprints, logos, charts, slides, OCR text</td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300 font-medium">Magazine pages, scanned color books, photo documents</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
