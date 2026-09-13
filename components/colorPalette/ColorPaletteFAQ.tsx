'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How does color locking work in the generator?',
    answer:
      'Clicking the Lock icon on any color card locks that specific hue. When you press the Spacebar or click "Generate", all locked colors remain completely unchanged while only the unlocked slots are regenerated. This allows you to iteratively curate the exact color harmony you want around one or more anchor shades.',
  },
  {
    question: 'What keyboard shortcuts can I use?',
    answer:
      'The primary keyboard shortcut is the Spacebar. Pressing Spacebar immediately generates a fresh palette of unlocked colors. If your cursor is active inside a text input or textarea, the spacebar behaves normally so you can type hex codes and names without accidental triggers.',
  },
  {
    question: 'How are the WCAG accessibility contrast ratios calculated?',
    answer:
      'We compute the exact relative luminance of each color in sRGB space according to the W3C WCAG 2.1 specification. The contrast ratio is evaluated against pure white (#FFFFFF) and pure black (#000000). A ratio of 4.5:1 or higher passes WCAG Level AA for normal body text, while 7.0:1 or higher achieves Level AAA compliance.',
  },
  {
    question: 'Can I export my palette directly to Tailwind CSS?',
    answer:
      'Yes! Open the "Export" modal and click the Tailwind tab. You will receive a clean configuration object with custom color keys (e.g. palette-100 to palette-500) ready to paste into your tailwind.config.js theme.extend.colors block.',
  },
  {
    question: 'How do I share a palette with someone else?',
    answer:
      'In the "Export" modal, select the "Share Link" tab. The tool creates a shareable URL containing the hex codes (e.g. /color-palette-generator?colors=5722af-7b45d1-9b6be8). Anyone who opens that link will instantly see and be able to edit your exact palette.',
  },
  {
    question: 'Are my generated palettes saved or sent to any server?',
    answer:
      'No. The Color Palette Generator operates 100% locally in your browser. All calculations, PNG image rendering via HTML5 Canvas, and saved favorite palettes (in localStorage) never leave your device.',
  },
  {
    question: 'Can I adjust the number of colors in my palette?',
    answer:
      'Yes. You can have anywhere from 2 to 8 colors. Use the quick count buttons (2 through 8) in the toolbar, or use the "+" button to add colors and the trash icon on individual cards to remove colors.',
  },
];

export function ColorPaletteFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full max-w-5xl mx-auto mt-12 mb-16 px-4">
      <div className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Everything you need to know about generating and exporting color palettes
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${
                      isOpen ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-800/20">
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
