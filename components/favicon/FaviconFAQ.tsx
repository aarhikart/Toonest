'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is a favicon?',
    answer:
      'A favicon (short for "favorite icon") is the small graphical icon associated with a website, commonly displayed in browser tabs, address bars, history entries, bookmarks, and mobile home screen web clips.',
  },
  {
    question: 'Can I convert PNG to ICO?',
    answer:
      'Yes! ToolNest generates real, standards-compliant multi-resolution Microsoft .ico files (containing 16×16, 32×32, and 48×48 dimensions with 32-bit ARGB alpha transparency) directly in your browser. We never simply rename a .png to .ico.',
  },
  {
    question: 'Can I generate multiple favicon sizes?',
    answer:
      'Yes. You can select and generate all standard web sizes simultaneously, including 16×16, 32×32, 48×48, 64×64, 128×128, Apple Touch Icon (180×180), Android Chrome PWA icons (192×192 & 512×512), and custom user dimensions.',
  },
  {
    question: 'Can I create a favicon from a logo?',
    answer:
      'Absolutely. Upload your company or personal logo (PNG, JPG, WebP, or SVG). You can adjust padding, zoom, background colors, gradients, and shape masks (circle, rounded square, squircle) to ensure your logo looks crisp and recognizable at small sizes.',
  },
  {
    question: 'Can I make a transparent favicon?',
    answer:
      'Yes, by selecting "Transparent" background fill. If your source logo has transparency, it will be perfectly preserved across all generated PNG icons, ICO containers, and SVG assets without ugly white backgrounds.',
  },
  {
    question: 'Can I create an Apple Touch Icon?',
    answer:
      'Yes. ToolNest automatically generates apple-touch-icon.png at 180×180 px with optional shape clipping and backgrounds, ready for iOS Safari and iPhone/iPad home screen bookmarks.',
  },
  {
    question: 'Can I create PWA icons?',
    answer:
      'Yes. Progressive Web Apps require 192×192 px and 512×512 px icons. ToolNest generates both high-resolution assets along with a configured site.webmanifest file.',
  },
  {
    question: 'Can I generate a manifest.json file?',
    answer:
      'Yes. ToolNest automatically creates a valid site.webmanifest (PWA manifest JSON) referencing your generated icons, your website title, short name, theme color, and background color.',
  },
  {
    question: 'Can I download everything together?',
    answer:
      'Yes! You can download the complete favicon package as a single ZIP archive (favicon-package.zip) containing all ICO, PNG, SVG, manifest.json, and HTML snippet files with one click.',
  },
  {
    question: 'Are my images uploaded to a server?',
    answer:
      'No. All image processing, canvas rendering, ICO binary encoding, SVG sanitization, and ZIP archiving take place 100% locally inside your web browser. Your uploaded images and logos never leave your computer or touch remote servers.',
  },
];

export function FaviconFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 dark:bg-[#5722AF]/20 flex items-center justify-center text-[#5722AF] dark:text-[#9B6BE8]">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Answers to common questions about favicon generation, ICO formats, and PWA setup.
          </p>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={idx} className="py-3.5">
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between text-left gap-4 group focus:outline-none"
              >
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-[#5722AF] dark:group-hover:text-[#9B6BE8] transition-colors">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pr-6 animate-in fade-in-50">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
