'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What image formats can I convert?',
    answer:
      'The tool fully supports converting between PNG, JPG/JPEG, WebP, and AVIF images. You can convert from any of these formats into any other.',
  },
  {
    question: 'Can I convert multiple images at once?',
    answer:
      'Yes. Toggle to Bulk Images mode to convert dozens or hundreds of images simultaneously with unified settings or per-image overrides.',
  },
  {
    question: 'Can I convert PNG to JPG?',
    answer:
      'Yes. Because JPG does not support transparent alpha channels, our converter allows you to pick a custom background fill color (white by default) so your image never turns black.',
  },
  {
    question: 'Can I convert JPG to WebP?',
    answer:
      'Yes. WebP offers substantial file size savings (typically 25% to 35% smaller than JPEG) at comparable visual fidelity.',
  },
  {
    question: 'Can I convert WebP to JPG?',
    answer:
      'Yes. Converting WebP to JPG is instantaneous and ideal when preparing images for older platforms or print services.',
  },
  {
    question: 'Can I convert PNG to AVIF?',
    answer:
      'Yes, on modern browsers that support AVIF canvas encoding (such as recent versions of Chrome, Edge, and Firefox).',
  },
  {
    question: 'Does conversion reduce image quality?',
    answer:
      'It depends on the chosen output format and compression settings. Converting to lossless PNG preserves original pixel values, while WebP and JPG allow fine-tuning the quality slider.',
  },
  {
    question: 'Can I resize images while converting?',
    answer:
      'Yes. Expand the "Resize, Crop, Rotate & Flip" panel to scale dimensions by percentage, exact width/height, or maximum bounding box constraints.',
  },
  {
    question: 'Can I download all converted images together?',
    answer:
      'Yes. In Bulk mode, all converted files can be bundled and downloaded as a single ZIP archive created directly in your browser.',
  },
  {
    question: 'Are my images uploaded to a server?',
    answer:
      'No. Image processing and conversions execute 100% locally within your browser using HTML5 Canvas and Web APIs. Your files never touch external servers.',
  },
];

export function ConverterFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider mb-2">
            Frequently Asked Questions
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Common Questions About Image Conversion
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Everything you need to know about converting PNG, JPG, WebP, and AVIF formats.
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
