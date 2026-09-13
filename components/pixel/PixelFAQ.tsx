'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is an image pixel size?',
    answer:
      'An image’s pixel size represents its physical resolution expressed as width × height in pixels (px). For example, a 1920 × 1080 px image contains 1,920 individual color pixels along its width and 1,080 pixels down its height, totaling approximately 2.07 megapixels.',
  },
  {
    question: 'Can I resize multiple images at once?',
    answer:
      'Yes! ToolNest allows you to upload and change pixel dimensions for dozens or hundreds of images in bulk. You can apply unified global dimensions to the whole batch or configure custom width/height overrides for specific individual images.',
  },
  {
    question: 'Can I enter exact width and height?',
    answer:
      'Yes. In "Exact Dimensions" mode, you can type precise pixel numbers into the Width and Height inputs. If you unlock "Maintain aspect ratio", both dimensions can be set independently.',
  },
  {
    question: 'Can I maintain the original aspect ratio?',
    answer:
      'Yes. When "Maintain aspect ratio" is toggled ON (🔗 icon locked), modifying the width automatically calculates the proportionate height (and vice versa) so your image never looks distorted or squished.',
  },
  {
    question: 'Can I resize without cropping?',
    answer:
      'Yes. Choose the "Fit Within" resize mode. It proportionally scales your image so it fits completely within your designated bounding box without cropping any edges or altering the original composition.',
  },
  {
    question: 'Can I resize an image to a specific pixel size?',
    answer:
      'Yes. You can either type custom pixel numbers or click any of our built-in Quick Presets designed for Instagram, Facebook, YouTube, LinkedIn, avatars, and responsive web layouts.',
  },
  {
    question: 'Does resizing reduce image quality?',
    answer:
      'Downscaling (reducing dimensions) retains sharp visual clarity and detail while significantly reducing file size. Upscaling (enlarging beyond the original pixel count) applies smooth bicubic canvas interpolation, though software cannot fabricate new optical lens details. Enable "Do not upscale smaller images" to prevent accidental enlargement.',
  },
  {
    question: 'Are my images uploaded to any server or cloud?',
    answer:
      'Never. All pixel recalculations, transformations, and ZIP file packaging run 100% locally inside your web browser. Your images are never sent over the internet or stored on external servers.',
  },
];

export function PixelFAQ() {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleFAQ = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className="mt-12 bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xs">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Pixel Resizing Questions &amp; Answers
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Clear explanations for changing image pixel sizes accurately and safely
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div
                key={index}
                className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-800 dark:text-zinc-200 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#5722AF]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
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
