'use client';

import React from 'react';
import { Layers, Sparkles, Code2, Compass, ShieldCheck, Download } from 'lucide-react';

export function GradientSEO() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-16 space-y-12 text-zinc-700 dark:text-zinc-300">
      {/* 1. What is a CSS Gradient */}
      <section className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              Professional Online CSS Gradient Generator
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create smooth, responsive linear, radial, and conic color transitions in your browser
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          A <strong>CSS gradient</strong> is a synthetic image created dynamically by the browser engine that displays a smooth visual transition between two or more colors. Because CSS gradients are calculated vector math rather than raster pixel files, they scale infinitely with zero pixelation, consume no network bandwidth, and render instantly across mobile phones, tablets, and high-DPI desktop displays.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
            <Compass className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8] mb-2" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
              Linear, Radial & Conic
            </h3>
            <p className="text-xs text-zinc-500">
              Complete support for directional linear gradients, radial focal points, and angular conic rotations with repeating options.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
              WCAG Contrast Tested
            </h3>
            <p className="text-xs text-zinc-500">
              Sample contrast ratios across 5 points of your gradient to ensure text readability passes Level AA and AAA standards.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
              PNG, JPG & Code Export
            </h3>
            <p className="text-xs text-zinc-500">
              Export production-ready CSS, SCSS, Tailwind tokens, or download high-resolution images sized for social media cards.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Gradient Types Explained */}
      <section className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
          CSS Gradient Types and Syntax
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5722AF]" />
              Linear Gradients
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Colors flow along a straight line defined by an angle (e.g. <code>135deg</code>) or direction keyword (e.g. <code>to bottom right</code>). Ideal for buttons, header banners, and full-screen backgrounds.
            </p>
            <pre className="p-2 rounded bg-zinc-900 text-zinc-200 font-mono text-[11px] overflow-x-auto">
              linear-gradient(135deg, #5722AF, #9B6BE8)
            </pre>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Radial Gradients
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Colors radiate outward from a central focal point in circular or elliptical patterns. Perfect for spotlight effects, glow spheres, and localized vignette lighting.
            </p>
            <pre className="p-2 rounded bg-zinc-900 text-zinc-200 font-mono text-[11px] overflow-x-auto">
              radial-gradient(circle at 50% 50%, #5722AF, #9B6BE8)
            </pre>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Conic Gradients
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Colors rotate around a center pivot point like hands on a clock. Widely used for pie charts, circular progress rings, radar scanners, and iridescent highlights.
            </p>
            <pre className="p-2 rounded bg-zinc-900 text-zinc-200 font-mono text-[11px] overflow-x-auto">
              conic-gradient(from 0deg at 50% 50%, #5722AF, #9B6BE8)
            </pre>
          </div>
        </div>
      </section>

      {/* 3. How to Use in Modern CSS and Tailwind */}
      <section className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-3">
          How to Apply Gradients in Web Applications
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            <strong>1. CSS Custom Properties:</strong> Define your gradient in <code>:root</code> as a design token so you can reuse and update it across multiple UI components without duplicating hex values.
          </p>
          <p>
            <strong>2. Gradient Text Clipping:</strong> Use <code>background-clip: text; -webkit-background-clip: text; color: transparent;</code> to apply eye-catching gradient fills to hero titles and callout phrases.
          </p>
          <p>
            <strong>3. Transparency & Fallbacks:</strong> Always supply a solid background color fallback right before the <code>background: linear-gradient(...)</code> declaration for backward compatibility with legacy rendering engines.
          </p>
        </div>
      </section>
    </div>
  );
}
