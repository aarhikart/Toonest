'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function PdfToPngFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Why should I convert PDF to PNG instead of JPG?',
      answer:
        'PNG uses lossless compression, meaning no visual fidelity, text edge sharpness, or line detail is sacrificed during conversion. In addition, PNG supports transparency, enabling you to convert vector PDFs, logos, stamps, and diagrams with a transparent background rather than a forced solid white background.',
    },
    {
      question: 'Can I extract PDF pages with transparent backgrounds?',
      answer:
        'Yes. In the Conversion Settings panel, switch the "Transparent Background" toggle to ON. When enabled, any regions in your PDF that do not contain an opaque background will be saved with a fully transparent alpha channel in the resulting PNG files.',
    },
    {
      question: 'Are my PDF documents uploaded to a remote server?',
      answer:
        'Never. ToolNest executes all PDF parsing and rendering directly on your device using Mozilla PDF.js inside your web browser. Your PDF documents, invoices, confidential contracts, and converted images are 100% private and never transmit across any network connection.',
    },
    {
      question: 'Which resolution (DPI) setting should I choose for PNG output?',
      answer:
        'For digital viewing, web publishing, or slide presentations, 150 DPI provides an ideal balance of sharpness and file size. For high-resolution printing, publishing, or detailed technical architectural blueprints, select 300 DPI. For compact web drafts, 72 or 96 DPI is sufficient.',
    },
    {
      question: 'Can I convert only specific pages or page ranges from a PDF?',
      answer:
        'Yes. You can toggle individual page selection checkboxes directly on the thumbnail preview grid or enter a custom range expression such as "1-3, 5, 8-10". Only the selected pages will be rasterized and exported.',
    },
    {
      question: 'Can I convert multiple PDF files in batch mode?',
      answer:
        'Yes. You can upload multiple PDF documents simultaneously. The tool allows you to configure settings across all documents, monitor unified progress, and download all generated PNG images in an organized ZIP archive containing dedicated subfolders for each document.',
    },
    {
      question: 'Is there a limit on the number of pages or file size?',
      answer:
        'Because processing runs locally on your machine, there are no artificial tool limits or subscription paywalls. For multi-hundred-page documents, conversion speed depends primarily on your device processor and RAM.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="space-y-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3 max-w-4xl">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden transition-colors shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-zinc-900 dark:text-white hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-3 animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
