'use client';

import React from 'react';
import {
  FileText,
  Layers,
  Sparkles,
  ShieldCheck,
  Share2,
  Sliders,
  Download,
  Image as ImageIcon,
} from 'lucide-react';

export function PdfToJpgSEO() {
  return (
    <section className="py-10 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800 space-y-12">
      {/* 1. Overview */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          Convert PDF to JPG Online — Crisp, Fast & Private
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          ToolNest <strong>PDF to JPG Converter</strong> transforms multi-page PDF documents into
          crisp, high-definition JPEG images directly inside your browser. Whether you need to
          extract visual charts from business reports, share slides on social media, or embed document
          pages into presentations, our tool provides full control over resolution (DPI), image
          quality, background fill, and custom page selections without uploading sensitive files to
          remote servers.
        </p>
      </div>

      {/* 2. Step-by-Step Guide */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>How to Convert PDF to JPG in 5 Easy Steps</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Upload Your PDF</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Drag and drop one or multiple PDF documents into the upload area or click &quot;Choose PDF Files&quot;.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Select Pages</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Choose &quot;All Pages&quot;, select specific page checkboxes from the preview grid, or type a custom range.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Configure Quality & DPI</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Pick your preferred DPI (72, 150, 300) and JPG compression quality (65–95%) for ideal clarity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>Convert the PDF</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Click &quot;Convert to JPG&quot; and watch the live conversion progress as pages are rendered sequentially.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/15 border border-[#5722AF]/20 dark:border-[#5722AF]/30 space-y-1.5 sm:col-span-2">
            <div className="flex items-center gap-2 font-bold text-[#5722AF] dark:text-[#9B6BE8]">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                5
              </span>
              <span>Download Your JPG Images</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Preview images full-size, download individual page files, or download all converted images as an organized ZIP.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Practical Use Cases */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Popular Use Cases</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-white">Social Media Sharing</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              PDF files cannot be posted directly on platforms like Instagram or Twitter. Converting
              pages to JPG lets you publish document highlights instantly.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-white">Scanned Document Archiving</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Convert scanned receipts, contracts, and certificates into universally compatible image
              files for photo libraries and mobile viewing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-white">Presentations & Slides</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Export PDF lecture notes, keynote presentations, and PDF slide decks into clean JPEG
              slides for web insertion or projection.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-white">Website & Blog Previews</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Generate attractive cover images and page previews for downloadable whitepapers, ebooks,
              and PDF brochures on your website.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-white">Selective Page Extraction</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Extract only a specific diagram or form page from a 100-page manual without converting
              the entire document.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-white">Strict Privacy Guarantees</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Unlike cloud services that retain copies of uploaded PDFs, ToolNest processes your data
              inside local browser RAM for absolute confidentiality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
