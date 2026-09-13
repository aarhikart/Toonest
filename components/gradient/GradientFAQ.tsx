'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is a CSS gradient?',
    answer:
      'A CSS gradient is a browser-calculated visual background that transitions smoothly between two or more colors. It is declared via CSS functions like linear-gradient(), radial-gradient(), or conic-gradient(), rendering crisp at any screen resolution without image file bandwidth.',
  },
  {
    question: 'Can I create a linear gradient?',
    answer:
      'Yes! Linear gradients are the default style. You can adjust the angle from 0° to 360° using the interactive circular direction visualizer, the slider, or standard direction presets (To Right, To Bottom, To Top Right, etc.).',
  },
  {
    question: 'Can I create radial gradients?',
    answer:
      'Yes. In the Gradient Style selector, click "Radial". You can configure the shape (Circle or Ellipse), extent size (Farthest Corner, Closest Side, etc.), and pinpoint the exact Center X and Y coordinates (0% to 100%).',
  },
  {
    question: 'Can I create conic gradients?',
    answer:
      'Yes. Selecting "Conic" lets you configure the starting rotation angle (0° to 360°) and the pivot center coordinates (X and Y percentage), perfect for color wheels and circular indicators.',
  },
  {
    question: 'Can I add more than two colors?',
    answer:
      'Yes. The tool supports between 2 and 10 color stops. Click "+ Add Stop" or click anywhere along the interactive gradient track to insert a new stop at that exact percentage.',
  },
  {
    question: 'Can I control the position of each color?',
    answer:
      'Yes. Each color stop has a draggable pin on the gradient bar. You can drag it with your mouse or touch screen, adjust the position slider, or type an exact percentage into the number input.',
  },
  {
    question: 'Can I copy the CSS?',
    answer:
      'Yes. You can copy the single background CSS property, the complete CSS class (.gradient-background), CSS variables (--gradient-primary), SCSS variables, or JSON with one click.',
  },
  {
    question: 'Can I download the gradient as an image?',
    answer:
      'Yes! Click "Download Image" to render the gradient onto an HTML5 Canvas and save it as a high-resolution PNG or JPG. You can choose custom dimensions or pick from social media presets for Instagram, YouTube, Facebook, LinkedIn, and X.',
  },
  {
    question: 'Are my gradients uploaded to a server?',
    answer:
      'No. The Gradient Generator operates 100% client-side in your browser. All CSS parsing, canvas rendering, and local favorites storage happen entirely on your computer.',
  },
  {
    question: 'Can I save gradients for later?',
    answer:
      'Yes. Click the Save button to store custom gradients into your browser’s localStorage. You can rename, duplicate, re-load, or delete saved gradients at any time from the drawer.',
  },
  {
    question: 'Can I share a gradient with someone?',
    answer:
      'Yes. Click the "Share" button to copy a URL containing the encoded gradient parameters. Anyone opening that link will see your exact gradient restored in their browser.',
  },
  {
    question: 'Can I use the generated CSS commercially?',
    answer:
      'Yes. All CSS code, tokens, and exported image files produced by ToolNest are 100% royalty-free and can be used in commercial websites, client apps, marketing assets, and branding.',
  },
];

export function GradientFAQ() {
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
              Common questions about creating, customizing, and exporting CSS gradients
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
