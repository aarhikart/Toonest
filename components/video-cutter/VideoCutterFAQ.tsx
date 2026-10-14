'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Zap, Scissors, FileArchive, Shield } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does the automatic 10-minute video cutting work?',
    answer:
      'When you upload an MP4 or MKV video, the cutter reads its total duration. For example, if you upload a 3-hour video and select 10-minute clips, it automatically calculates that 18 clips are needed and uses high-speed FFmpeg segmentation to slice the file into sequential clips (Part 1: 00:00:00 to 00:10:00, Part 2: 00:10:00 to 00:20:00, etc.). All clips are then bundled into one ZIP file for instant download.',
  },
  {
    question: 'Is there any video or audio quality loss during cutting?',
    answer:
      'No! The tool uses lossless stream copy (-c copy). It directly cuts the video data stream at keyframe boundaries without re-encoding the video frames. This means cutting takes only a few seconds, CPU usage is minimal, and 100% of the original video and audio quality is preserved.',
  },
  {
    question: 'Can I upload very long videos (e.g. 3, 4, or 5+ hours)?',
    answer:
      'Yes, long-form videos like webinars, live streams, movies, and class recordings are fully supported. The tool is optimized to process multi-gigabyte files efficiently.',
  },
  {
    question: 'Can I customize the clip duration instead of 10 minutes?',
    answer:
      'Yes! While 10 minutes is the default preset, you can select any preset (1 min, 2 min, 5 min, 10 min, 15 min, 30 min, 60 min) or enter your own custom duration in minutes and seconds.',
  },
  {
    question: 'How are the clips named inside the ZIP file?',
    answer:
      'Clips inside the ZIP are simply named (video1, video2, video3, etc.) with Part #1, Part #2 badges in the top-left corner. This makes it effortless to organize, upload, or archive them in sequence.',
  },
  {
    question: 'Can I add my logo / watermark to all clips?',
    answer:
      'Yes! You can upload an image of your brand logo (PNG, JPG, or WebP). The tool automatically scales the logo to a balanced, professional size (not too big and not too small) and places it in the top-right corner of every generated clip with resolution-aware padding.',
  },
  {
    question: 'Are my videos kept private and secure?',
    answer:
      'Yes. Processing is performed locally on the server. Your files are temporary, never shared with third parties, and automatically cleaned up after processing.',
  },
];

export function VideoCutterFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq-section" className="w-full max-w-4xl mx-auto space-y-4 pt-6">
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <HelpCircle className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h3>
      </div>

      <div className="space-y-2">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition cursor-pointer"
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
