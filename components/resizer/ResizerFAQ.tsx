'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Will resizing reduce the quality of my images?',
    answer:
      'Downscaling (reducing dimensions) retains sharpness and fine visual detail while significantly lowering file size. Upscaling (enlarging dimensions beyond the original) uses high-quality bicubic canvas interpolation; however, software cannot invent new physical camera sensor data, so slight softness may occur if enlarged excessively. Enable "Do not upscale smaller images" to prevent accidental enlargement.',
  },
  {
    question: 'What does "Maintain Aspect Ratio" mean?',
    answer:
      'Maintaining aspect ratio keeps the proportional relationship between the width and height of your image constant (such as 16:9, 4:3, or 1:1 square). When enabled (🔗 icon locked), modifying the width automatically calculates the correct height (and vice versa) to prevent your image from looking squished or unnaturally stretched.',
  },
  {
    question: 'Can I upscale a small image to a larger resolution?',
    answer:
      'Yes. You can enter larger width/height values or choose a percentage above 100%. ToolNest applies smooth bilinear/bicubic resampling. A friendly notice will appear reminding you that the image is being upscaled.',
  },
  {
    question: 'What is the difference between "Exact", "Fit Within", and "Fill Dimensions"?',
    answer:
      '• Exact: Forces the exact width and height you specify (may distort if aspect ratio is unlocked).\n• Fit Within: Scales the image proportionally so that it completely fits inside the bounding box without cropping.\n• Fill Dimensions: Scales the image to completely cover the specified dimensions and cleanly crops excess edges using your selected anchor position (Center, Top, Bottom, Left, Right).',
  },
  {
    question: 'Are my images uploaded to any server or cloud?',
    answer:
      'Never. 100% of the image resizing, rotating, cropping, and format conversion happens right inside your web browser using HTML5 Canvas and Web APIs. Your images never leave your computer or phone, ensuring strict confidentiality and enterprise-grade privacy.',
  },
  {
    question: 'Can I convert the image format while resizing?',
    answer:
      'Yes! In the Resize Settings panel, you can choose to keep the Original format or convert directly to WebP, JPG, PNG, or AVIF. You can also adjust compression quality (default 85%) and customize the transparent background fill color when converting transparent PNGs to JPG.',
  },
  {
    question: 'What are the recommended sizes for social media?',
    answer:
      'ToolNest provides built-in quick presets for the most popular platforms: Instagram Square (1080×1080), Instagram Story/Reels (1080×1920), YouTube Thumbnail (1280×720), YouTube Banner (2560×1440), Facebook Cover (820×312), Twitter/X Post (1200×675), and LinkedIn Banner (1584×396). Simply click a preset to apply it instantly.',
  },
  {
    question: 'How many images can I resize at once in bulk?',
    answer:
      'You can drop dozens or hundreds of images at once. ToolNest processes images sequentially in browser memory to ensure smooth performance without freezing your browser tab. Once complete, you can download all resized files in a single organized ZIP archive.',
  },
  {
    question: 'Is there any file size or resolution limit?',
    answer:
      'ToolNest does not enforce artificial file size limits. Resizing limits are governed solely by your device’s available browser memory (RAM) and GPU hardware acceleration. It comfortably handles standard camera photos (24MP - 50MP+) and high-resolution RAW exports in common formats.',
  },
];

export function ResizerFAQ() {
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
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Everything you need to know about resizing images online with ToolNest
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
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3 whitespace-pre-line">
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
