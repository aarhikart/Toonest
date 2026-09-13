'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function WordCounterFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is a word counter?',
      a: 'A word counter is an online utility that analyzes your text to calculate the exact number of words, characters, sentences, paragraphs, and lines. It also provides estimated reading and speaking durations.',
    },
    {
      q: 'How are words counted?',
      a: 'Words are identified as meaningful sequences of letters or numbers separated by whitespace and punctuation. Hyphenated compound words, decimal numbers (like 25.50), and web URLs are handled intelligently so that punctuation does not artificially inflate your word count.',
    },
    {
      q: 'How are characters counted?',
      a: 'The total character counter counts every single character you enter, including letters, digits, punctuation marks, emojis, and whitespace characters (spaces, tabs, and newlines).',
    },
    {
      q: 'What is the difference between characters and characters without spaces?',
      a: 'Total characters include every space and line break. "Characters without spaces" strips all whitespace before counting, showing only the actual letters, numbers, and symbols—which is often the metric required by academic essays, social media platforms, or publishing limits.',
    },
    {
      q: 'How are sentences counted?',
      a: 'Sentences are detected by terminal punctuation marks (. ! ?). Our engine includes smart protections to prevent false splits from decimal numbers (e.g., 25.50), web domains, email addresses, ellipses (...), and common abbreviations such as "Mr.", "Dr.", or "etc."',
    },
    {
      q: 'Does the tool count paragraphs?',
      a: 'Yes. Paragraphs are calculated based on meaningful text blocks separated by one or more blank lines. Empty lines do not count as separate paragraphs.',
    },
    {
      q: 'Does this tool store my text?',
      a: 'No. All text processing and statistics calculations happen 100% locally in your web browser. Your text is never sent across the internet, never logged, and never stored on any server.',
    },
    {
      q: 'Can I download my text?',
      a: 'Yes. You can click the "Download .TXT" button at any time to save a copy of your text directly onto your computer or phone as word-counter-text.txt.',
    },
    {
      q: 'Can I use this word counter on mobile?',
      a: 'Yes. ToolNest is fully responsive and optimized for smartphones and tablets, with comfortable touch controls and stacked statistics cards.',
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
