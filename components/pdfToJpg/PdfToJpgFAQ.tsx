'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'Can I convert multiple PDF files?',
    answer:
      'Yes. You can upload multiple PDF documents at once and batch convert them using unified settings or individual page selections.',
  },
  {
    question: 'Can I convert only selected pages?',
    answer:
      'Yes. You can click individual page checkboxes in the preview grid or use the Custom Range option to specify exact page numbers and intervals like "1-3, 5, 8-10".',
  },
  {
    question: 'What JPG quality should I use?',
    answer:
      'A quality setting of 90 (High Quality) is recommended for most uses as it preserves sharp text and vivid graphics while keeping file sizes reasonable. For maximum clarity, choose 95 (Maximum Quality).',
  },
  {
    question: 'Can I download all pages together?',
    answer:
      'Yes. You can download all converted JPG pages bundled into a single organized ZIP archive with custom folder structures, or download individual pages one by one.',
  },
  {
    question: 'Does converting PDF to JPG reduce quality?',
    answer:
      'The output quality depends on the selected DPI (resolution) and JPG compression quality. Rendering at 150 or 300 DPI ensures crisp, printable, and high-resolution images.',
  },
  {
    question: 'Are my PDF files uploaded?',
    answer:
      'No. All PDF decoding, page rendering, and JPG conversion occur directly in your browser using HTML5 Canvas and client-side processing. Your documents never leave your computer.',
  },
  {
    question: 'Can I convert large PDFs?',
    answer:
      'Yes. The converter renders pages sequentially one at a time and frees memory after each page. For extremely large PDFs (over 100 pages), converting in smaller ranges or using 150 DPI is recommended for optimal performance.',
  },
];

export function PdfToJpgFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-8 sm:py-12 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            Answers to Common PDF to JPG Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Learn more about resolution, quality settings, page ranges, and privacy.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
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
