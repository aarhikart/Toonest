'use client';

import React from 'react';
import {
  Palette,
  ShieldCheck,
  Code2,
  Sparkles,
  Sliders,
  CheckCircle2,
  Workflow,
  Eye,
} from 'lucide-react';

export function ColorPaletteSEO() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-16 space-y-12 text-zinc-700 dark:text-zinc-300">
      {/* 1. What is the Color Palette Generator */}
      <section className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              Professional Color Palette Generator for Digital Products & Branding
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Harmonic color relationships, mathematical contrast, and developer-ready tokens
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          The <strong>ToolNest Color Palette Generator</strong> is a client-side design utility crafted for UI/UX designers, frontend engineers, brand strategists, and digital creators. Color is one of the most critical elements of user experience, influencing brand perception, readability, conversion rates, and emotional engagement. Rather than picking random hues that clash or fail readability standards, our generator pairs color wheel harmony formulas with W3C WCAG 2.1 relative luminance algorithms.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
            <Sparkles className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8] mb-2" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
              Harmonic Algorithms
            </h3>
            <p className="text-xs text-zinc-500">
              Generate complementary, analogous, triadic, tetradic, and split-complementary color schemes mathematically aligned to color theory.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
              WCAG Accessibility Checks
            </h3>
            <p className="text-xs text-zinc-500">
              Live contrast ratio computations ensure every color card meets WCAG 2.1 AA (4.5:1) and AAA (7:1) readability benchmarks against black and white.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
            <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
              One-Click Code Exports
            </h3>
            <p className="text-xs text-zinc-500">
              Directly export clean CSS Custom Properties, Tailwind CSS 50–900 scale configurations, structured JSON, PNG visual swatches, and shareable URLs.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Color Harmony Theories Explained */}
      <section className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
          Understanding Color Harmonies & When to Use Them
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5722AF]" />
              Complementary (180° Opposite)
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Uses two colors directly opposite each other on the 360° color circle (e.g. purple and yellow-green, or cyan and coral). Highly impactful for call-to-action buttons, hero banners, and bold contrasts that demand instant attention.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Analogous (Adjacent ±30°)
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Colors positioned next to each other on the wheel. They create tranquil, serene, and organic compositions frequently found in nature, corporate branding, and modern software dashboards.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Monochromatic (Single Hue, Varied Lightness)
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Maintains the exact same base hue while stepping lightness and saturation up and down. Ideal for clean, minimalist interfaces, elegant editorial designs, and uniform brand identities.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Triadic & Split-Complementary
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Triadic spaces three colors equidistant (120° apart), delivering vibrant energy even at soft saturations. Split-complementary pairs a base color with two adjacent shades of its complement, maintaining contrast with less tension.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The 60-30-10 Rule in UI Design */}
      <section className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
          How to Apply Your Palette: The 60-30-10 Rule
        </h2>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
          A timeless principle in interior design and digital UI is the <strong>60-30-10 rule</strong>, which prevents visual clutter and guides user focus effortlessly:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/70">
            <div className="text-2xl font-black text-[#5722AF] dark:text-[#9B6BE8] mb-1">60%</div>
            <div className="font-bold text-zinc-900 dark:text-white mb-1">Dominant Foundation</div>
            <p className="text-zinc-500">
              The primary background and layout surface (usually clean whites, soft creams, or dark slate) setting the visual tone.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/70">
            <div className="text-2xl font-black text-zinc-700 dark:text-zinc-300 mb-1">30%</div>
            <div className="font-bold text-zinc-900 dark:text-white mb-1">Structural Secondary</div>
            <p className="text-zinc-500">
              Navigation sidebars, cards, headers, borders, and secondary buttons that give the layout definition and hierarchy.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/70">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mb-1">10%</div>
            <div className="font-bold text-zinc-900 dark:text-white mb-1">Vibrant Accent</div>
            <p className="text-zinc-500">
              High-impact call-to-action buttons, notification badges, active states, and links that direct the user’s next action.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
