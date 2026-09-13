import React from 'react';
import { Square, Sparkles, Layers, ShieldCheck, Cpu, Code2 } from 'lucide-react';

export function BorderRadiusSEO() {
  return (
    <section className="mt-16 space-y-12">
      {/* 3 Core Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E1E2A] p-6 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] flex items-center justify-center mb-4">
            <Square className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            Independent 4-Corner Engine
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Configure Top-Left, Top-Right, Bottom-Right, and Bottom-Left corners with precision. Link them for uniform curvature or unlink for custom asymmetry.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1E2A] p-6 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] flex items-center justify-center mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            Dual-Axis Elliptical Curvature
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Unlock the power of CSS slash syntax (<code className="text-[#5722AF] font-mono">H / V</code>) to generate organic fluid blobs, smooth pebble curves, and natural rounded containers.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1E2A] p-6 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] flex items-center justify-center mb-4">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            Multi-Format Code Generation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Export ready-to-paste code for raw CSS, custom CSS classes, reusable <code className="text-[#5722AF] font-mono">:root</code> variables, Tailwind CSS utilities, and SCSS stylesheets.
          </p>
        </div>
      </div>

      {/* Educational Article Body */}
      <div className="bg-white dark:bg-[#1E1E2A] p-8 md:p-10 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Comprehensive Guide to CSS Border Radius
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            The CSS <code className="px-1.5 py-0.5 rounded-sm bg-gray-100 dark:bg-[#12121A] text-xs font-mono text-[#5722AF]">border-radius</code> property rounds the corners of an element&apos;s outer border edge. Far beyond simple aesthetic rounding, border radius directs the eye, conveys friendliness, establishes brand character, and creates tactile UI boundaries.
          </p>
        </div>

        {/* Syntax breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            1. CSS Border Radius Syntax &amp; Value Order
          </h3>
          <div className="p-4 rounded-xl bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto border border-gray-800">
            <code>
              border-radius: [top-left] [top-right] [bottom-right] [bottom-left];
            </code>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            When multiple values are supplied, CSS reads corners clockwise starting from the <strong>Top-Left</strong> corner:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">1 Value</span>
              <code className="text-[#5722AF] font-mono">16px</code>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Applies equally to all four corners.</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">2 Values</span>
              <code className="text-[#5722AF] font-mono">16px 8px</code>
              <p className="text-gray-500 dark:text-gray-400 mt-1">First value: top-left &amp; bottom-right. Second value: top-right &amp; bottom-left.</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">3 Values</span>
              <code className="text-[#5722AF] font-mono">16px 8px 4px</code>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Top-left, then top-right &amp; bottom-left, then bottom-right.</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">4 Values</span>
              <code className="text-[#5722AF] font-mono">40px 20px 60px 10px</code>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Clockwise: Top-Left, Top-Right, Bottom-Right, Bottom-Left.</p>
            </div>
          </div>
        </div>

        {/* Pixels vs Percentages vs Pill */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            2. Pixels vs. Percentages vs. Pill Shapes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-[#2D2D3F] bg-gray-50 dark:bg-[#151520]">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1.5 text-sm">Fixed Pixels (px)</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Retains exact curvature dimensions regardless of element scaling. Ideal for standard UI components such as cards (12px–24px), inputs (8px–12px), and badges (4px–6px).
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-[#2D2D3F] bg-gray-50 dark:bg-[#151520]">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1.5 text-sm">Percentage (%)</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Calculates curvature relative to the element&apos;s own width and height. Setting <code className="text-[#5722AF] font-mono">50%</code> on a square yields a circle; on a rectangle it forms an ellipse.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-[#2D2D3F] bg-gray-50 dark:bg-[#151520]">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1.5 text-sm">Pill / Capsule (9999px)</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                When the pixel radius exceeds half the element&apos;s shortest side, the browser clamps the curvature into a semicircular end, creating a robust capsule button regardless of width.
              </p>
            </div>
          </div>
        </div>

        {/* Elliptical Border Radius */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            3. Mastering Elliptical Border Radius (Slash Syntax)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Standard border radius uses quarter-circles. By adding a forward slash (<code className="text-[#5722AF] font-mono">/</code>), you can define quarter-ellipses with distinct horizontal and vertical radii:
          </p>
          <div className="p-4 rounded-xl bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto border border-gray-800">
            <code>
              border-radius: [horizontal-radii] / [vertical-radii];<br />
              border-radius: 60% 40% 30% 70% / 50% 30% 70% 50%;
            </code>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            The values before the slash dictate the horizontal radii along the top and bottom borders, while the values after the slash define the vertical radii along the left and right sides. This produces organic fluid &ldquo;blobs&rdquo;, egg silhouettes, and natural river pebble surfaces popular in modern creative web layouts.
          </p>
        </div>

        {/* Tailwind CSS and Performance */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            4. Tailwind CSS Utility Integration &amp; Browser Performance
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            In Tailwind CSS, uniform pixel values map to utilities like <code className="text-[#5722AF] font-mono">rounded-[16px]</code>, while individual corners use <code className="text-[#5722AF] font-mono">rounded-tl-[40px] rounded-br-[60px]</code>. For complex elliptical shapes that cannot be represented by directional corners, Tailwind supports arbitrary CSS declarations via <code className="text-[#5722AF] font-mono">[border-radius:60%_40%_30%_70%_/_50%_30%_70%_50%]</code>.
          </p>
        </div>
      </div>
    </section>
  );
}
