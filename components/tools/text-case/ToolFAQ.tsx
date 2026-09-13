'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function ToolFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is a text case converter?',
      a: 'A text case converter is a utility that transforms the capitalization style of letters in your text. It allows you to switch between all capital letters (UPPERCASE), all small letters (lowercase), or title capitalization (Title Case) without needing to retype anything.',
    },
    {
      q: 'What does uppercase mean?',
      a: 'Uppercase means all alphabetic letters are converted to capital letters (e.g. "hello world" becomes "HELLO WORLD"). Numbers, punctuation, symbols, and formatting remain unchanged.',
    },
    {
      q: 'What does lowercase mean?',
      a: 'Lowercase converts all capital letters into small letters (e.g. "HELLO WORLD" becomes "hello world"). Numbers, symbols, and line breaks are fully preserved.',
    },
    {
      q: 'What is title case?',
      a: 'Title case capitalizes the first letter of major words while keeping minor words (like "a", "an", "the", "of", "in", and "to") in lowercase (e.g. "the lord of the rings" becomes "The Lord of the Rings"). You can also choose the "Every Word" style if you want every single word capitalized.',
    },
    {
      q: 'Does this tool change my original text?',
      a: 'No. Your original input remains intact in the left input box, while the newly converted text appears separately in the right output box. You can modify or clear either at any time.',
    },
    {
      q: 'Is my text uploaded to your servers?',
      a: 'No, absolutely not. All text processing is performed 100% locally in your web browser using client-side JavaScript. Your text is never transmitted over the internet or logged on any server.',
    },
    {
      q: 'Can I download the converted text?',
      a: 'Yes! Simply click the ".TXT" button in the converted text area to download an offline text document directly to your device downloads folder.',
    },
    {
      q: 'Can I use this tool on my mobile phone or tablet?',
      a: 'Yes. The converter features a fully responsive layout with touch-friendly buttons, stacking the input and output neatly on smaller screens.',
    },
  ];

  return (
    <section id="faq" className="py-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#12151e] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-zinc-900 dark:text-white hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : 'text-zinc-400'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3 animate-in fade-in duration-150">
                    {faq.a}
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
