'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is image compression?',
    answer:
      'Image compression reduces the file size of an image while trying to maintain good visual quality, allowing faster page load times and smaller storage footprints.',
  },
  {
    question: 'Can I compress multiple images?',
    answer:
      'Yes. Toggle to Bulk Images mode to compress dozens or hundreds of images simultaneously with unified presets or per-file overrides.',
  },
  {
    question: 'Will compression reduce image quality?',
    answer:
      'It can, depending on the format and quality level selected. Our default "Balanced" preset (80% quality) produces major byte reductions without perceptible visual loss.',
  },
  {
    question: 'Can I compress JPG images?',
    answer:
      'Yes. JPG compression optimizes DCT coefficients and strips unnecessary metadata for dramatic file size reductions.',
  },
  {
    question: 'Can I compress PNG images?',
    answer:
      'Yes. PNG files can be optimized by removing metadata, reducing dimensions, or converting to modern formats like WebP.',
  },
  {
    question: 'Can I compress WebP images?',
    answer:
      'Yes. WebP supports both lossy and lossless compression routines with quality tuning.',
  },
  {
    question: 'Can I resize images while compressing?',
    answer:
      'Yes. Resizing is optional. Expand the Advanced Settings to scale images by percentage or custom dimensions with aspect ratio lock.',
  },
  {
    question: 'Can I convert and compress at the same time?',
    answer:
      'Yes. You can select another output format such as WebP or AVIF to simultaneously convert and compress in one workflow.',
  },
  {
    question: 'Can I target a specific file size?',
    answer:
      'Yes. The tool features a Target File Size solver that automatically searches for the optimal quality level to reach sizes like 1 MB, 500 KB, or custom targets.',
  },
  {
    question: 'Are my images uploaded to a server?',
    answer:
      'No. All compression algorithms execute locally in your browser using modern Web APIs. Your original files are never altered or transmitted over the internet.',
  },
];

export function CompressorFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider mb-2">
            Common Questions
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Everything you need to know about high-efficiency browser image compression.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-zinc-900 dark:text-white hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 animate-in fade-in duration-150">
                    {faq.answer}
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
