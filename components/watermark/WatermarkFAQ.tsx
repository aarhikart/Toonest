'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Are my photos or watermark logos uploaded to any remote server?',
    answer:
      'No. 100% of the watermarking process occurs entirely within your browser using HTML5 Canvas API and WebAssembly. Your images, personal photos, text, and logo files never touch any external server or cloud database, guaranteeing complete privacy and enterprise-grade confidentiality.',
  },
  {
    question: 'Can I watermark 100+ images simultaneously in bulk?',
    answer:
      'Yes. ToolNest is optimized for high-volume bulk watermarking. You can drag and drop dozens or hundreds of images at once. The engine queues and renders each image progressively directly on your computer hardware, preventing browser crashes, and offers a one-click ZIP download upon completion.',
  },
  {
    question: 'What image formats can I upload and use as watermark logos?',
    answer:
      'You can upload JPG, JPEG, PNG, WebP, AVIF, BMP, and GIF files as your base photos. For logo watermarks, PNG files with alpha transparency and SVG graphics produce the cleanest, most professional results. You can also upload JPG logos with custom background blending.',
  },
  {
    question: 'Will watermarking reduce the resolution or degrade the sharpness of my original images?',
    answer:
      'No. The watermarking engine respects the exact natural pixel dimensions (width and height) of your original images. Text and vector logo marks are rasterized at the image’s native resolution, preventing blurriness or pixelation. If you choose PNG or high-quality JPEG (90%+), visual fidelity is fully preserved.',
  },
  {
    question: 'How does the tiled / repeated watermark pattern protect my photos?',
    answer:
      'Single corner watermarks can often be cropped out by unauthorized downloaders. The "Repeat / Tile Across Image" mode stamps a repeated diagonal grid of your watermark across the entirety of each photo with customizable spacing and rotation, making unauthorized re-use or cropping virtually impossible without destroying the image content.',
  },
  {
    question: 'Can I customize the watermark for a single photo in a batch without changing the others?',
    answer:
      'Yes! ToolNest provides a per-item customization modal. While the global bulk settings apply to all images by default, you can click "Customize" on any individual thumbnail in the queue to override its position, text, scale, or opacity. An amber "Custom" badge will appear to show that image has unique settings.',
  },
  {
    question: 'Can I drag and drop the watermark directly on the image preview?',
    answer:
      'Yes. In addition to the standard 9-point anchor grid (top-left, center, bottom-right, etc.), you can directly click or touch-drag the watermark anywhere across the live canvas preview to position it with pixel-level precision.',
  },
  {
    question: 'What output formats and naming patterns can I choose?',
    answer:
      'You can export your watermarked photos in their original format, or convert them simultaneously to JPEG, PNG, WebP, or AVIF. You can also customize output file naming by prepending prefixes (e.g. `watermarked-`) or appending suffixes (e.g. `-watermarked`).',
  },
  {
    question: 'Is ToolNest Image Watermark Tool completely free to use?',
    answer:
      'Yes, it is 100% free with no account creation, no subscriptions, no daily quotas, and no forced ToolNest promotional watermarks. Your exports contain solely your own custom text and logo designs.',
  },
];

export function WatermarkFAQ() {
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
            Image Watermark Tool FAQ
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Everything you need to know about batch image watermarking, client-side security, and photo protection.
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
