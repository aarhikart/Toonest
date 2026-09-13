'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'What is a ZIP file?',
    answer:
      'A ZIP file is a widely-used standard archive format that packages one or more files and complete folder hierarchies into a single compact container file with DEFLATE compression.',
  },
  {
    question: 'Can I create a ZIP from multiple files?',
    answer:
      'Yes. You can select or drag-and-drop dozens or hundreds of files at once, including images, documents, PDFs, videos, and code.',
  },
  {
    question: 'Can I add an entire folder?',
    answer:
      'Yes, where the browser supports folder selection (via the "Add Folder" button or by dragging a folder directory directly into the drop zone). The tool automatically maps and preserves nested folder structures.',
  },
  {
    question: 'Can I organize files into folders?',
    answer:
      'Yes. You can create custom subfolders, move files between folders using the file table or by dragging items onto folder tree nodes, and configure whether empty folders should be included.',
  },
  {
    question: 'Can I rename files before creating the ZIP?',
    answer:
      'Yes. You can click the rename icon or file name in the list to change individual filenames while preserving original extensions.',
  },
  {
    question: 'Can I bulk rename files?',
    answer:
      'Yes. The built-in Bulk Rename tool lets you use dynamic patterns like project-{number}, {name}-{date}, or custom prefixes with configurable start numbers and zero-padding (e.g. 001, 002).',
  },
  {
    question: 'Can I choose the compression level?',
    answer:
      'Yes. You can choose between Store (no compression, fastest), Fast (level 1 DEFLATE), Balanced (level 6, recommended balance of speed and size), or Maximum (level 9 DEFLATE).',
  },
  {
    question: 'Will JPG and MP4 files become much smaller?',
    answer:
      'Usually not significantly because formats like JPG, WebP, PNG, MP4, and existing ZIP files are already heavily compressed. ZIP archives bundle them together conveniently rather than re-compressing already packed binary streams.',
  },
  {
    question: 'Can I create a ZIP without uploading my files?',
    answer:
      'Yes! ToolNest ZIP Creator operates 100% locally in your browser using client-side JavaScript (JSZip). Your files never leave your computer and are never transmitted to any remote server.',
  },
  {
    question: 'Can I download the ZIP immediately?',
    answer:
      'Yes. As soon as your browser completes building the archive in memory, you can download the .zip file directly to your downloads folder with a single click.',
  },
];

export function ZipCreatorFAQ() {
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
            Everything You Need to Know About ZIP Creator
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Answers to common questions about in-browser ZIP creation, compression, and folder hierarchies.
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
