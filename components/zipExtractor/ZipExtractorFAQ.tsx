'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'What is a ZIP extractor?',
    answer:
      'A ZIP extractor opens a compressed ZIP archive container and allows you to inspect, preview, and extract individual files or folders without needing desktop extraction software.',
  },
  {
    question: 'Can I extract ZIP files online?',
    answer:
      'Yes. This tool runs directly in your browser using modern client-side JavaScript, extracting archives entirely on your device without server latency.',
  },
  {
    question: 'Can I extract only one file?',
    answer:
      'Yes. You can click the download icon next to any file in the list to extract and download just that specific document or image without unzipping the entire archive.',
  },
  {
    question: 'Can I extract an entire folder?',
    answer:
      'Yes. Clicking "Download Folder" packages the selected directory into a new, smaller ZIP file containing only that folder and its contents.',
  },
  {
    question: 'Can I download only selected files?',
    answer:
      'Yes. Use the checkboxes to select multiple files across any folders, then click "Download Selection as ZIP" to bundle only your chosen files.',
  },
  {
    question: 'Can I download a folder as a ZIP?',
    answer:
      'Yes. Browsers cannot directly create physical directory trees on your local filesystem without user prompts, so downloading a folder as a ZIP guarantees full directory structure preservation.',
  },
  {
    question: 'Can I preview files inside a ZIP?',
    answer:
      'Yes. Supported images (PNG, JPG, WebP, GIF), text documents (TXT, MD, CSV), code (JSON, JS, CSS, HTML), and audio/video files can be viewed in a secure sandboxed preview before extracting.',
  },
  {
    question: 'Can I extract password-protected ZIP files?',
    answer:
      'Standard browser implementations support unencrypted archives. If an encrypted or password-protected archive is detected, the tool alerts you transparently.',
  },
  {
    question: 'Are my files uploaded?',
    answer:
      'No. Your ZIP file is parsed and extracted 100% locally inside your web browser. Neither your archive nor its extracted contents are ever sent to any remote server.',
  },
  {
    question: 'Can I extract a very large ZIP?',
    answer:
      'Yes. The tool utilizes lazy extraction: it only reads archive metadata initially, extracting individual file bytes on-demand when you preview or download, minimizing memory usage.',
  },
];

export function ZipExtractorFAQ() {
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
            Common Questions About In-Browser ZIP Extraction
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Learn more about selective extraction, privacy, and preview capabilities.
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
