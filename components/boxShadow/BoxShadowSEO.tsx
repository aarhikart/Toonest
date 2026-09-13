import React from 'react';
import { Layers, Sparkles, Sliders, Palette, Zap, ShieldCheck } from 'lucide-react';

export function BoxShadowSEO() {
  return (
    <section className="mt-16 space-y-12">
      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E1E2A] p-6 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] flex items-center justify-center mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            Multi-Layer Depth Engine
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Stack up to 10 independent shadow layers to emulate realistic ambient occlusion, contact shadows, and soft atmospheric light diffusion like modern design systems.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1E2A] p-6 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] flex items-center justify-center mb-4">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            Direction Dial & Macros
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Quickly adjust overall light angle with an intuitive circular compass dial, then scale shadow distance and softness proportionally across layers with macro sliders.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1E2A] p-6 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            Multi-Format Code Export
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Get instant production code formatted for pure CSS, CSS classes, reusable CSS custom properties (:root variables), Tailwind arbitrary classes (`shadow-[...]`), and SCSS mixins.
          </p>
        </div>
      </div>

      {/* Educational Article Section */}
      <div className="bg-white dark:bg-[#1E1E2A] p-8 md:p-10 rounded-2xl border border-gray-200 dark:border-[#2D2D3F] shadow-xs space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Mastering CSS Box Shadows: The Definitive Visual Guide
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            The CSS <code className="px-1.5 py-0.5 rounded-sm bg-gray-100 dark:bg-[#12121A] text-xs font-mono text-[#5722AF]">box-shadow</code> property attaches one or more drop-shadow effects around an element&apos;s frame. Rather than creating flat, artificial borders, modern web design utilizes layered shadows to convey visual hierarchy, tactile depth, elevation, and direct user feedback.
          </p>
        </div>

        {/* Syntax breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            1. Understanding the CSS Box Shadow Syntax
          </h3>
          <div className="p-4 rounded-xl bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto border border-gray-800">
            <code>
              box-shadow: [offset-x] [offset-y] [blur-radius] [spread-radius] [color] [inset];
            </code>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">offset-x (Horizontal)</span>
              Positive values push the shadow to the right; negative values cast it to the left. A zero offset centers the shadow horizontally under the element.
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">offset-y (Vertical)</span>
              Positive values push the shadow downwards (emulating overhead sunlight); negative values cast the shadow upwards.
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">blur-radius</span>
              Controls the sharpness of the shadow perimeter. At 0px, the shadow has hard edges like a solid duplicate. High values create a soft, diffused gradient.
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">spread-radius</span>
              Expands (positive value) or shrinks (negative value) the shadow shape before blur is applied. Negative spread creates subtle, compact &ldquo;floating&rdquo; card shadows.
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">color & opacity</span>
              Defined using HEX, RGB, or RGBA. Realistic shadows avoid pure pitch black (`#000000`) and instead use slight tints with 5% to 25% opacity.
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#151520] border border-gray-200 dark:border-[#2D2D3F]">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">inset keyword</span>
              Switches the shadow from casting outside the box to falling inside the border, creating sunken, engraved, or pressed button effects.
            </div>
          </div>
        </div>

        {/* Why Layered Shadows Look Better */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            2. The Secret to Realistic Shadows: Multi-Layering
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            In physical reality, light comes from multiple ambient sources and bounces off surrounding surfaces. A single shadow layer creates an unnatural, harsh silhouette. Professional digital products achieve photographic realism by stacking multiple shadows:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-[#2D2D3F] bg-gray-50 dark:bg-[#151520]">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5722AF]"></span>
                Layer 1: Contact Shadow (Occlusion)
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Very tight offset (1px–3px), low blur (1px–4px), and slightly higher opacity. This layer anchors the element to the surface right beneath it, preventing it from looking disconnected or detached.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-[#2D2D3F] bg-gray-50 dark:bg-[#151520]">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7B45D1]"></span>
                Layer 2: Ambient Diffusion (Elevation)
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Large offset (10px–30px), high blur (20px–60px), negative spread (-4px to -10px), and subtle opacity (5%–12%). This layer conveys the height of elevation and casts a natural penumbra.
              </p>
            </div>
          </div>
        </div>

        {/* Tinted Shadows */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            3. Tinted Shadows vs. Pure Grays
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            A common amateur mistake is rendering shadows as pure gray `rgba(0,0,0,0.2)`. On colored backdrops or branded interfaces, this washes out colors and appears muddy. By infusing the shadow color with a hint of the background or primary brand hue (e.g., deep navy for blue surfaces, deep violet for purple accents), shadows look luminous, rich, and cohesive.
          </p>
        </div>

        {/* Performance */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            4. Web Performance & GPU Acceleration
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            The browser calculates box-shadows using rasterization algorithms on the CPU or GPU. While static shadows on cards have zero runtime overhead, animating `box-shadow` directly during hover or transitions forces continuous repaints on every frame. For silky 60fps animations, consider placing the shadow on a pseudo-element (`::after`) and animating its `opacity` instead.
          </p>
        </div>
      </div>
    </section>
  );
}
