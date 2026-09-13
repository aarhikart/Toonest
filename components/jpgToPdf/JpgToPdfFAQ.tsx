'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function JpgToPdfFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Can I convert multiple JPG images into one PDF?',
      answer:
        'Yes. Upload multiple JPG or JPEG images simultaneously and arrange them into whichever sequence you prefer. ToolNest will automatically merge them into a single, seamless multi-page PDF document.',
    },
    {
      question: 'Can I reorder the images before creating the PDF?',
      answer:
        'Yes. Simply drag and drop the image cards in the upload queue or click the Up and Down arrow buttons to adjust the page sequence. The resulting PDF pages will follow your exact order.',
    },
    {
      question: 'Can I choose A4 size or other standard paper dimensions?',
      answer:
        'Yes. A4 is the default standard page size. You can also select Letter, A3, A5, Legal, Original Image Size, or configure Custom Width and Height dimensions in millimeters.',
    },
    {
      question: 'Can I create a separate PDF for every image?',
      answer:
        'Yes. Toggle the "Create separate PDF for each image" option in the settings panel. ToolNest will generate individual PDF files for every uploaded photo and package them into an organized ZIP archive for one-click download.',
    },
    {
      question: 'Can I reduce the PDF file size?',
      answer:
        'Yes. In the Advanced Settings panel, you can adjust the Image Quality slider (1–100%) or select compression presets like Balanced or Small File. Lowering quality slightly can dramatically decrease output file size without noticeable visual loss on screens.',
    },
    {
      question: 'Are my JPG files uploaded to a remote server?',
      answer:
        'No. ToolNest processes all images directly inside your web browser using HTML5 Canvas and client-side PDF generation. Your private photos, confidential documents, and personal images are never transmitted or stored on any remote cloud server.',
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
