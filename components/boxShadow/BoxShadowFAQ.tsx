'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    question: 'What is CSS box-shadow and how does it work?',
    answer:
      'The CSS box-shadow property attaches one or more drop-shadow effects around an element’s border frame. It takes parameters for horizontal offset (X), vertical offset (Y), blur radius, spread radius, and color. By toggling the inset keyword, you can also render shadows inside the element rather than outside.',
  },
  {
    question: 'What do horizontal offset (X) and vertical offset (Y) control?',
    answer:
      'The horizontal offset determines how many pixels the shadow shifts to the right (positive value) or left (negative value). The vertical offset shifts the shadow down (positive value) or up (negative value). Because natural lighting typically shines from above, vertical offsets are usually larger than horizontal offsets in modern UI design.',
  },
  {
    question: 'What is the exact difference between blur radius and spread radius?',
    answer:
      'Blur radius specifies the fuzziness or softness of the shadow boundary. At 0px, edges are razor sharp; at higher values, the shadow feathers smoothly outwards. Spread radius, on the other hand, expands or shrinks the actual footprint of the shadow before blur is calculated. Negative spread shrinks the shadow, which is essential for creating tight, clean card shadows without muddy edge bleeding.',
  },
  {
    question: 'How do inset shadows work?',
    answer:
      'Adding the inset keyword tells the browser to draw the shadow inside the perimeter of the box rather than casting outward. Inset shadows create concave, recessed, or pressed-button illusions, making them ideal for form input focus states, toggles, well cards, and neumorphic design treatments.',
  },
  {
    question: 'Why should I use multiple shadow layers instead of just one?',
    answer:
      'Real-world ambient light consists of multiple bounces and diffuse reflections. A single CSS shadow layer often feels fake and blocky. Modern design systems like Tailwind, Stripe, and Apple use 2 to 4 layered shadows: a sharp, high-opacity contact shadow close to the element to ground it, combined with one or two wide, low-opacity ambient layers to convey smooth elevation depth.',
  },
  {
    question: 'How do I copy the generated shadow into my project?',
    answer:
      'Under the Code Generator panel, click the Copy button next to any format. We provide raw CSS declarations (box-shadow: ...), reusable CSS class declarations, CSS custom properties (:root variables), Tailwind CSS arbitrary classes (shadow-[...]), and SCSS snippets. You can also download a ready-to-import .css file.',
  },
  {
    question: 'Can I use these shadows directly in Tailwind CSS?',
    answer:
      'Yes! Switch to the "Tailwind" tab in the Code Generator. It automatically formats the multi-layer shadow string using Tailwind’s arbitrary class syntax (e.g., shadow-[0px_4px_12px_rgba(0,0,0,0.1)]). You can paste this class directly onto any HTML or JSX element without needing to configure tailwind.config.js.',
  },
  {
    question: 'How do CSS Variables work with box shadows?',
    answer:
      'The "CSS Variable" tab generates a standard CSS custom property defined inside :root (e.g., --my-elevation-2: 0 8px 24px rgba(0,0,0,0.12)). This allows you to centralize your design tokens in your global stylesheet and apply them across multiple components using box-shadow: var(--my-elevation-2);.',
  },
  {
    question: 'Are my custom shadows saved if I close or refresh the page?',
    answer:
      'Yes. When you click the "Save Shadow" button, your configuration is saved to your browser’s localStorage under your personal favorites. Additionally, every preset or random shadow you preview is automatically recorded in your temporary session history for easy one-click retrieval.',
  },
  {
    question: 'Can I export the shadow preview as a high-resolution image?',
    answer:
      'Yes! Click the "Export Image" button to launch the export dialog. You can render your custom shadow configuration onto an HTML5 Canvas and download it as either a crisp lossless PNG (with optional transparent background) or a lightweight JPG at custom dimensions (up to 4K resolution) for Dribbble, social cards, or design presentations.',
  },
  {
    question: 'Is my data private and secure when using this tool?',
    answer:
      '100% private. All calculations, color conversions, real-time DOM updates, and image rendering are executed entirely client-side inside your web browser. No design data, parameters, or uploaded assets are ever sent to external servers or recorded remotely.',
  },
];

export function BoxShadowFAQ() {
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
            Everything you need to know about CSS box shadows, layering, and code integration
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
