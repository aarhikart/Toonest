'use client';

import React from 'react';
import { Maximize2, Ratio, ShieldCheck, Sparkles, Sliders, Eye } from 'lucide-react';

export function PixelSEO() {
  return (
    <section className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mastering Image Pixel Dimensions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Change Image Size in Pixels — Online, Instant, and Private
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            A comprehensive guide to understanding pixel widths, heights, aspect ratios, and safe browser-based scaling techniques.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <Ratio className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Pixel Width, Height, and Megapixels</span>
            </h3>
            <p>
              Digital raster images (like JPG, PNG, and WebP) consist of tiny color squares called <strong>pixels</strong>. The total pixel count determines both image sharpness and file size. Multiplying width by height yields total megapixels (MP). For instance, an image measuring <strong>4032 × 3024 pixels</strong> contains 12.1 megapixels. Resizing to standard HD (1920 × 1080 px) reduces pixel payload by ~83%, ensuring rapid web page loading without perceptible visual degradation.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Proportional Scaling vs. Custom Ratios</span>
            </h3>
            <p>
              When <strong>Maintain Aspect Ratio</strong> is enabled, the tool locks the proportional relationship between width and height. Modifying either dimension instantly adjusts the other to prevent unwanted horizontal compression or vertical stretching. If you require non-proportional dimensions, our <strong>Fill Dimensions</strong> mode lets you crop edges cleanly from your chosen anchor position (Center, Top, Bottom, Left, or Right).
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Bulk Pixel Resizing with Custom Overrides</span>
            </h3>
            <p>
              When optimizing image galleries or social campaigns, batch efficiency is vital. ToolNest empowers you to drop dozens or hundreds of photos, establish global default pixel targets, and selectively override specific photos that require unique dimensions or formats. Every item retains its original metadata until you trigger processing.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Browser-Only Canvas &amp; Zero Cloud Leaks</span>
            </h3>
            <p>
              Traditional online converters upload your personal or proprietary assets to remote cloud servers, posing privacy risks and slow round-trip delays. ToolNest harnesses HTML5 Canvas and browser hardware acceleration to process all pixels locally on your machine. Your photos never leave your device.
            </p>
          </div>
        </div>

        {/* Standard Pixel Sizes Table */}
        <div className="bg-white dark:bg-[#131722] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Standard Pixel Dimensions Reference
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Common pixel resolutions for responsive web, screens, and social networks
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-2.5 px-3">Standard Name</th>
                  <th className="py-2.5 px-3">Pixel Width × Height</th>
                  <th className="py-2.5 px-3">Aspect Ratio</th>
                  <th className="py-2.5 px-3">Primary Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Full HD (1080p)</td>
                  <td className="py-2.5 px-3 font-mono font-medium">1920 × 1080 px</td>
                  <td className="py-2.5 px-3 font-mono">16:9</td>
                  <td className="py-2.5 px-3">Website Hero Banners, Video Thumbnails</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">HD Standard (720p)</td>
                  <td className="py-2.5 px-3 font-mono font-medium">1280 × 720 px</td>
                  <td className="py-2.5 px-3 font-mono">16:9</td>
                  <td className="py-2.5 px-3">YouTube Thumbnails, Fast Web Graphics</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Instagram Square</td>
                  <td className="py-2.5 px-3 font-mono font-medium">1080 × 1080 px</td>
                  <td className="py-2.5 px-3 font-mono">1:1</td>
                  <td className="py-2.5 px-3">Instagram Feed, E-Commerce Product Images</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Instagram Story / Reel</td>
                  <td className="py-2.5 px-3 font-mono font-medium">1080 × 1920 px</td>
                  <td className="py-2.5 px-3 font-mono">9:16</td>
                  <td className="py-2.5 px-3">Stories, Reels, TikTok, Shorts</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Facebook Feed Post</td>
                  <td className="py-2.5 px-3 font-mono font-medium">1200 × 630 px</td>
                  <td className="py-2.5 px-3 font-mono">1.91:1</td>
                  <td className="py-2.5 px-3">Social Link Previews, Facebook Timeline</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Profile Avatar (Large)</td>
                  <td className="py-2.5 px-3 font-mono font-medium">800 × 800 px</td>
                  <td className="py-2.5 px-3 font-mono">1:1</td>
                  <td className="py-2.5 px-3">High-Resolution User Profiles &amp; Logos</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Profile Avatar (Medium)</td>
                  <td className="py-2.5 px-3 font-mono font-medium">500 × 500 px</td>
                  <td className="py-2.5 px-3 font-mono">1:1</td>
                  <td className="py-2.5 px-3">Standard Forums, Discord, Slack</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
