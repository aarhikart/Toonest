'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What image size should I use for Instagram posts and stories?',
    answer:
      'For feed posts, Instagram Portrait (1080 × 1350 px, 4:5 aspect ratio) delivers the highest engagement and screen real estate on mobile devices. For profile feeds and carousel grids, Instagram Square (1080 × 1080 px, 1:1) is standard. For Stories and Reels, use full-screen vertical dimensions (1080 × 1920 px, 9:16).',
  },
  {
    question: 'Will this tool stretch or distort my original images?',
    answer:
      'No. The default mode is "Crop to Fill", which scales your image proportionally and crops excess edges to fit the target aspect ratio without any warping. If you prefer to keep 100% of your image visible, select "Fit Inside" to preserve the full photo and add a clean blurred or solid background.',
  },
  {
    question: 'Can I resize multiple images simultaneously in bulk?',
    answer:
      'Yes. You can upload dozens or hundreds of images at once, choose a social media preset (such as Instagram Portrait or YouTube Thumbnail), and click "Resize All Images". ToolNest processes the entire queue locally and packages the results into a single ZIP file.',
  },
  {
    question: 'Can I fine-tune the crop position for individual photos in a batch?',
    answer:
      'Yes. In bulk mode, every photo in the queue has an "Adjust Crop" button. You can click any thumbnail to open the dedicated crop editor, pan the image to focus on a specific subject or face, and save the custom crop without affecting the other images in the batch.',
  },
  {
    question: 'What are Safe Area guides for Stories, Reels, TikTok, and Shorts?',
    answer:
      'Vertical formats have user interface elements (profile headers, comment bubbles, like buttons, and caption text) that overlap the top and bottom of the screen. When you enable "Show Safe Areas", ToolNest displays non-destructive boundary guides so you can keep key visual elements out of the danger zones. These guides are never included in the downloaded photo.',
  },
  {
    question: 'How does the Blur Background option work?',
    answer:
      'When using "Fit Inside" mode, your image is centered without cropping. Selecting "Blur Photo" background generates an artistic, softened backdrop using a scaled and blurred copy of your own photo. You can customize the blur radius and brightness to create professional vertical graphics.',
  },
  {
    question: 'Can I resize images for YouTube thumbnails, banners, and Shorts?',
    answer:
      'Yes. ToolNest includes official YouTube dimensions: Video Thumbnail (1280 × 720 px, 16:9), Channel Banner (2560 × 1440 px), Channel Icon (800 × 800 px), and YouTube Shorts (1080 × 1920 px, 9:16).',
  },
  {
    question: 'What dimensions work best for Facebook and LinkedIn?',
    answer:
      'For Facebook, use Shared Post (1200 × 630 px) or Square (1080 × 1080 px), Cover Photo (1640 × 856 px), and Event Cover (1920 × 1005 px). For LinkedIn, use Post (1200 × 627 px), Square (1200 × 1200 px), and Personal Banner (1584 × 396 px).',
  },
  {
    question: 'Are my photos uploaded to any remote server or cloud service?',
    answer:
      'No. 100% of the image cropping, resizing, and canvas processing occurs strictly inside your local web browser using HTML5 Canvas API and WebAssembly. Your photos never leave your device, ensuring maximum privacy and security.',
  },
  {
    question: 'Can I download all resized images together as a ZIP file?',
    answer:
      'Yes. Once bulk processing completes, you can download all resized files in one click as an organized ZIP archive (social-media-images.zip) or download individual photos directly.',
  },
];

export function SocialResizerFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-semibold mb-2.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Social Media Image Resizer FAQ
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Answers to common questions regarding social image aspect ratios, safe areas, cropping, and bulk processing.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#131620] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3 animate-in fade-in duration-150">
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
