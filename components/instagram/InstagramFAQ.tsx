'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How do I download an Instagram Reel?',
    answer:
      'Copy the link of the public Reel from Instagram, paste it into the URL input above, and click "Get Reel". Once the preview appears, tap the "Download Reel" button to save the MP4 video file directly to your device.',
  },
  {
    question: 'Can I download any Instagram Reel?',
    answer:
      'You can download public Reels where the creator allows public sharing and access. Content hosted on private profiles, age-restricted accounts, or deleted posts cannot be accessed.',
  },
  {
    question: 'Can I download private Reels or Stories?',
    answer:
      'No. In strict adherence to privacy and security standards, this tool does not bypass authentication or access restricted content from private accounts or temporary 24-hour stories.',
  },
  {
    question: 'Does this tool work on mobile devices?',
    answer:
      'Yes. The interface is optimized for smartphones (both iOS Safari and Android Chrome). On iPhone, downloaded files are saved into your Files or Downloads app and can be shared to your Photos library with one tap.',
  },
  {
    question: 'Do I need an Instagram account to use this downloader?',
    answer:
      'No. You do not need to register, log in, or link any social media accounts. The tool works anonymously and client-first for authorized public links.',
  },
  {
    question: 'Where is my downloaded Reel saved on my device?',
    answer:
      'On Android and desktop computers, the file is saved automatically into your standard "Downloads" folder. On iPhone and iPad, it downloads into Safari’s Downloads manager inside the Files app.',
  },
  {
    question: 'Is my Instagram password or login ever required?',
    answer:
      'Never. ToolNest will never ask for your Instagram password, username, two-factor code, or private credentials. Any third-party tool asking for your Instagram password should be avoided.',
  },
  {
    question: 'Can I download copyrighted content?',
    answer:
      'You should only download Reels that you own, have created, or have received explicit authorization from the original copyright holder to save. We encourage all users to respect creator copyrights and intellectual property rights.',
  },
];

export function InstagramFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full max-w-4xl mx-auto space-y-4 pt-6">
      <div className="bg-white dark:bg-[#1E1E2A] p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Clear answers regarding Instagram Reel downloads, formats, and safety
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
                  className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 bg-white dark:bg-[#1E1E2A] hover:bg-gray-50 dark:hover:bg-[#252536] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-[#2D2D3F] bg-gray-50/50 dark:bg-[#181824]/50">
                    {faq.answer}
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
