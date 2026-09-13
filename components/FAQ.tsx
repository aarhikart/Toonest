'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Can I rename multiple images at once?',
    answer:
      'Yes. Upload multiple images and apply one naming pattern to all of them. You can upload dozens or hundreds of images simultaneously and rename them in one batch.',
  },
  {
    question: 'Are my images uploaded to a server?',
    answer:
      'No. The tool processes files locally in your browser using modern Web APIs. Your images are never sent over the internet or saved on remote servers, guaranteeing total data confidentiality.',
  },
  {
    question: 'Can I preserve the file extension?',
    answer:
      'Yes. Original file extensions (.jpg, .png, .webp, etc.) remain unchanged by default. If desired, you can also override extensions in the Advanced Options menu.',
  },
  {
    question: 'Can I add numbers to filenames?',
    answer:
      'Yes. You can choose any starting number (e.g. 1, 10, 100) and zero-padding format (e.g. 1, 01, 001, 0001) to keep your files organized sequentially.',
  },
  {
    question: 'Can I replace existing filename text?',
    answer:
      'Yes. Open the Advanced Options section and use the "Replace Text" feature to find specific substrings (like "IMG_" or "DSC_") and replace them with your custom text.',
  },
  {
    question: 'Can I download all renamed images together?',
    answer:
      'Yes. Multiple renamed images can be downloaded together as a single ZIP file created directly on your device. Single images can also be downloaded individually.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider mb-2">
            Got Questions?
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Everything you need to know about browser-based bulk image renaming.
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
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-zinc-900 dark:text-white hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors focus:outline-none focus:bg-zinc-50 dark:focus:bg-[#181d2a]"
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
