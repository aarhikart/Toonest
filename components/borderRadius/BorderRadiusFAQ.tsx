'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'What is CSS border-radius?',
    answer:
      'The CSS border-radius property rounds the corners of an element’s outer border edge. It allows you to specify a single uniform radius for all four corners, or distinct radii for each individual corner (Top-Left, Top-Right, Bottom-Right, and Bottom-Left).',
  },
  {
    question: 'Can I control each corner separately?',
    answer:
      'Yes! By disabling "Linked" mode, you can control each of the four corners independently using separate sliders, number inputs, or visual drag handles to create custom asymmetric shapes.',
  },
  {
    question: 'Can I use percentage values instead of pixels?',
    answer:
      'Yes. You can switch the unit selector to "%". In CSS, percentage border radii are calculated relative to the element’s own width and height, enabling fluid scaling on responsive containers.',
  },
  {
    question: 'What is an elliptical border radius?',
    answer:
      'Standard border radius forms a circular arc. When you enable Elliptical mode, CSS uses a forward slash (/) to define separate horizontal and vertical radii for each corner, creating elongated elliptical curves, pebble silhouettes, and fluid organic blobs.',
  },
  {
    question: 'How do I create a pill-shaped button?',
    answer:
      'To make a capsule or pill button, set the border-radius to a large pixel value like 9999px. The browser automatically caps the curve to half of the element’s height, creating smooth semicircular ends regardless of button length.',
  },
  {
    question: 'Can I create a circle with border-radius?',
    answer:
      'Yes. On an element with equal width and height (a square), setting the border radius to 50% forms a perfect circle. On a non-square rectangle, 50% produces an ellipse.',
  },
  {
    question: 'Can I create asymmetric rounded corners?',
    answer:
      'Absolutely. Asymmetric border radii are widely used for chat bubbles (e.g. sharp tail on the bottom-right corner), notebook tabs, folder cards, and natural leaf badges. Our generator supports independent corner adjustments and provides curated asymmetric presets.',
  },
  {
    question: 'How do I copy the generated CSS?',
    answer:
      'Click the "Copy CSS" button in the preview header, or visit the Ready-to-Use Code Generator panel to copy raw declarations, custom CSS classes, CSS custom properties (:root variables), Tailwind CSS classes, or SCSS snippets.',
  },
  {
    question: 'Can I generate Tailwind CSS classes with this tool?',
    answer:
      'Yes! The "Tailwind" tab generates valid Tailwind arbitrary utility classes such as rounded-[16px] or directional utilities like rounded-tl-[40px] rounded-br-[60px]. For complex elliptical values, it formats the arbitrary property [border-radius:...].',
  },
  {
    question: 'Can I save my custom border-radius presets?',
    answer:
      'Yes. Click "Save" in the top action bar to store your custom geometry in your browser’s localStorage. You can load, duplicate, rename, or delete saved presets anytime from the Library drawer.',
  },
  {
    question: 'How does sharing a border-radius configuration work?',
    answer:
      'Clicking "Share" encodes your corner values, units, elliptical flags, and preview dimensions into a compact URL parameter (?radius=...). Anyone opening your link will instantly load the exact same configuration.',
  },
  {
    question: 'Are my settings or data uploaded to an external server?',
    answer:
      'No. All calculations, slider interactions, visual dragging, and canvas image exports occur 100% locally inside your web browser. No design data is ever sent to an external server.',
  },
];

export function BorderRadiusFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="mt-16 bg-white dark:bg-[#1E1E2A] p-8 md:p-10 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-[#5722AF]/10 text-[#5722AF]">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Answers to common questions about CSS border radius, elliptical shapes, and Tailwind integration
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-[#2D2D3F] rounded-xl overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-white dark:bg-[#1E1E2A] hover:bg-gray-50 dark:hover:bg-[#252536] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 dark:text-gray-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-[#2D2D3F] bg-gray-50/50 dark:bg-[#181824]/50">
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
