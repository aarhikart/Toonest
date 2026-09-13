'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does AI video detection work?',
    answer:
      'AI video detection evaluates both spatial features (visual frames) and temporal dynamics (how pixels move and change across consecutive frames). Modern detectors analyze subtle inconsistencies in optical flow, lighting continuity, anatomical micro-movements, generative grid patterns, and audio-visual synchronization that generative AI models struggle to synthesize seamlessly.',
  },
  {
    question: 'Can AI-generated videos always be detected?',
    answer:
      'No. AI video detection is probabilistic and cannot guarantee 100% accuracy. Advanced diffusion models and neural rendering architectures continuously evolve. High-quality synthetic clips that avoid common artifact pitfalls, or videos recorded with physical cameras and re-encoded, can challenge automated classifiers. Detection should be treated as an investigative aid rather than absolute legal proof.',
  },
  {
    question: 'Why is video detection harder than image detection?',
    answer:
      'Video detection introduces the temporal dimension (time, motion, and inter-frame coherence) alongside severe lossy compression (such as H.264/HEVC encoding). While a single static frame may look convincing or blurry, temporal anomalies—such as morphing textures, warping limbs, or flickering eyes—only reveal themselves when analyzing sequences of 10 to 60+ consecutive frames.',
  },
  {
    question: 'What are temporal artifacts?',
    answer:
      'Temporal artifacts are inconsistencies that occur over time across frames. Examples include "temporal jitter" (unnatural vibrating or swimming textures), "flicker" (lighting or skin tones varying unnaturally between frames), "phantom blending" (fingers or background objects morphing in and out of existence), and inconsistent motion vectors that violate physical inertia.',
  },
  {
    question: 'Can compression hide AI artifacts?',
    answer:
      'Yes. When videos are uploaded to social media platforms (like TikTok, Instagram, or X/Twitter), aggressive lossy transcoding eliminates high-frequency noise and spatial details. This compression smoothing often obscures subtle generative synthesis traces, which is why raw or uncompressed source files yield substantially more reliable detection results.',
  },
  {
    question: 'What does the confidence score mean?',
    answer:
      'The confidence score reflects the statistical certainty of the detection pipeline based on weighted spatial, temporal, audio, and container signals. It does NOT represent the percentage of the video that is synthetic. For example, a 92% confidence score means the model detected strong, coherent signals typical of synthetic media, whereas a 50% score indicates ambiguous or contradictory signals (inconclusive).',
  },
  {
    question: 'Why might real videos be flagged?',
    answer:
      'Authentic camera footage can occasionally be flagged as potentially manipulated due to aggressive smartphone post-processing (HDR tone-mapping, electronic image stabilization, portrait mode neural blur), digital camera sensor noise, heavy spatial compression, or CGI visual effects added during professional editing.',
  },
  {
    question: 'Does this tool store uploaded videos?',
    answer:
      'No. Your media privacy is paramount. Videos uploaded or analyzed are processed strictly in temporary volatile memory to inspect container structures and neural signals. No user media is permanently archived, sold, or used for model training. Analysis runs in your local session and can be cleared at any time.',
  },
  {
    question: 'Can this detect deepfake faces and lipsync?',
    answer:
      'Yes. Facial manipulation pipelines inspect localized boundary blending around the jawline and forehead, frequency anomalies around eye blinks, and phoneme-to-viseme correspondence (whether the speaker\'s mouth movements match the audio waveform frequencies). Misalignment between acoustic audio energy and lip geometry is a primary signal of AI dubbing and lipsync manipulation.',
  },
];

export const ToolFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full max-w-5xl mx-auto py-12 px-4">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          Frequently Asked Questions
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          AI Video Detection & Analysis Insights
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
          Understand the science, temporal dynamics, and practical boundaries of synthetic
          media classification.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden transition-all shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
