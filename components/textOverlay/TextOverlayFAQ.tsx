'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Can I add multiple text layers on a single image?',
    answer:
      'Yes! You can add unlimited independent text layers to any image. Each layer has its own typography, font size, weight, color, drop shadow, outline, semi-transparent background box, rotation angle, and canvas position. You can easily reorder layers forward or backward, toggle visibility, and duplicate layers with one click.',
  },
  {
    question: 'Can I add text overlays to hundreds of images in bulk?',
    answer:
      'Yes. ToolNest is architected for high-performance bulk batch processing. When you upload multiple images, your text configuration applies across all photos simultaneously. The local progressive queue renders each image in the browser and exports the entire collection into a single ZIP archive.',
  },
  {
    question: 'How do dynamic tokens like {name}, {number}, and {date} work in bulk mode?',
    answer:
      'In bulk mode, you can type special tokens directly into your text input: {name} is dynamically replaced by the base filename of each image (e.g. "product-01"), {number} is replaced with sequential numbers (01, 02, 03...), and {date} inserts the current date (YYYY-MM-DD). This is ideal for batch product catalogs, watermarks, and photo numbering.',
  },
  {
    question: 'Can I move and position text directly on the canvas preview?',
    answer:
      'Yes. In addition to the standard 3×3 anchor grid (Top-Left, Center, Bottom-Right, etc.), you can directly click or touch-drag any active text layer across the canvas preview for pixel-perfect positioning. The tool supports touch dragging on mobile devices as well.',
  },
  {
    question: 'Are my uploaded photos or text transmitted to any remote server?',
    answer:
      'No. 100% of the image rendering and export pipeline runs entirely inside your web browser using HTML5 Canvas API. No images, personal photographs, or text overlays are ever uploaded to an external server or third-party cloud service, ensuring complete confidentiality and privacy.',
  },
  {
    question: 'Will the exported image preserve font styling and high resolution?',
    answer:
      'Yes. The engine uses the browser Font Loading API to ensure your selected fonts are fully loaded before rendering to canvas. Text is rasterized directly at the native resolution of your original image, preventing blurriness, pixelation, or font fallback artifacts in the final download.',
  },
  {
    question: 'Can I customize text for one specific photo in a batch without changing others?',
    answer:
      'Yes. In bulk mode, click the "Customize" button on any image thumbnail in the queue to open the per-item override modal. You can modify its text, position, or font styling independently. That image will receive an amber "Custom Overrides" badge in the list.',
  },
  {
    question: 'What export formats and social media presets are supported?',
    answer:
      'You can export your edited images in their Original format, or convert them simultaneously to JPEG, PNG, WebP, or AVIF with adjustable quality (1–100%). You can also choose social media canvas aspect ratios such as Instagram Square (1:1), Instagram Story (9:16), Facebook Post, and YouTube Thumbnail (16:9).',
  },
  {
    question: 'Is ToolNest Image Text Overlay free to use with no hidden fees or watermarks?',
    answer:
      'Yes. The tool is 100% free with no account creation, no usage limits, no credit system, and zero forced ToolNest branding or watermarks added to your downloaded images.',
  },
];

export function TextOverlayFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-semibold mb-2.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Image Text Overlay FAQ
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Common questions regarding typography layers, bulk batch processing, font rendering, and client-side privacy.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#131620] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3 animate-in fade-in duration-150">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
