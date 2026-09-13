'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is image metadata?',
    answer:
      'Image metadata is information embedded directly inside an image file that describes its technical creation and context. This includes file attributes (dimensions, format, color space), camera hardware details (make, model, serial number), photography capture parameters (shutter speed, aperture, ISO), and optional geographical coordinates.',
  },
  {
    question: 'What is EXIF data?',
    answer:
      'EXIF (Exchangeable Image File Format) is an international standard used by digital cameras and smartphones to record camera settings, timestamps, and shooting conditions at the exact moment a photograph is captured.',
  },
  {
    question: 'Can I see camera and lens information?',
    answer:
      'Yes. If your image was taken with a digital camera, DSLR, mirrorless body, or smartphone that saved EXIF data, ToolNest will display the manufacturer, camera model, lens model, and hardware firmware information.',
  },
  {
    question: 'Can I see where a photo was taken?',
    answer:
      'Only when GPS location metadata is present. If location services were enabled on the camera or phone during capture, ToolNest extracts the latitude, longitude, altitude, and direction, providing both decimal and DMS coordinates.',
  },
  {
    question: 'Can metadata reveal my personal location?',
    answer:
      'Yes. Precise GPS coordinates stored inside an image can reveal the exact location (down to street level) where a photo was taken. Our tool highlights detected GPS coordinates with a privacy advisory so you know what information exists before sharing files publicly.',
  },
  {
    question: 'Does every image contain metadata?',
    answer:
      'No. Many messaging apps and social media platforms (such as WhatsApp, Instagram, and Twitter/X) automatically strip all EXIF and location data to protect user privacy and minimize file transfer sizes. Downloaded web graphics or screenshots often contain only basic dimensions without camera data.',
  },
  {
    question: 'Does this tool modify or alter my original image?',
    answer:
      'Never. ToolNest Image Metadata Viewer is strictly a read-only inspector. It analyzes file bytes in browser memory without writing back to or altering your original files in any way.',
  },
  {
    question: 'Are my images uploaded to any remote server?',
    answer:
      'No. All metadata parsing runs 100% locally inside your browser using modern Web APIs and client-side JavaScript. Your photos are never sent over the internet or uploaded to any third-party cloud.',
  },
];

export function MetadataFAQ() {
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
            Learn more about EXIF metadata, camera specifications, and location privacy
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
