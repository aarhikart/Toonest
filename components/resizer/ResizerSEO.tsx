'use client';

import React from 'react';
import { Maximize2, Ratio, ShieldCheck, Share2, Crop, Sparkles } from 'lucide-react';

export function ResizerSEO() {
  return (
    <section className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Image Resizing Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Resize Images to Any Dimension — Fast, Accurate, and 100% Private
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Everything you need to know about changing image resolutions, preserving aspect ratios, and bulk resizing for web, social media, and print.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <Ratio className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Understanding Aspect Ratio and Distortion</span>
            </h3>
            <p>
              An image&apos;s <strong>aspect ratio</strong> is the proportional relationship between its width and height (e.g. 16:9 widescreen, 4:3 standard, or 1:1 square). When you <strong>resize images online</strong>, locking the aspect ratio ensures your subjects never look squished or unnaturally stretched. ToolNest automatically updates the opposite dimension whenever you change either width or height, preserving true-to-life perspective.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <Crop className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Exact vs. Fit Within vs. Fill (Crop)</span>
            </h3>
            <p>
              Different projects require different scaling logic:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-zinc-600 dark:text-zinc-400">
              <li><strong>Exact Dimensions:</strong> Forces exact output pixel dimensions. Ideal when exact constraints are strictly mandated.</li>
              <li><strong>Fit Within (Contain):</strong> Scales the photo proportionally so it fits completely within a bounding box with zero cropping.</li>
              <li><strong>Fill Dimensions (Cover):</strong> Scales the image to completely fill dimensions and cleanly crops excess edges based on your chosen anchor point (Center, Top, Bottom, Left, Right).</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Bulk Resizing for Social Media & Web</span>
            </h3>
            <p>
              Managing multiple social platforms means constantly changing dimensions for banners, profile pictures, stories, and feed posts. With ToolNest&apos;s <strong>bulk image resizer</strong>, you can drop 50, 100, or 200 photos at once, apply presets like Instagram Square (1080×1080) or YouTube Thumbnails (1280×720), and download all files bundled in an organized ZIP file in seconds.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Client-Side Processing & Total Privacy</span>
            </h3>
            <p>
              Unlike traditional web tools that upload your personal or confidential photos to remote cloud servers, ToolNest executes 100% of the resizing algorithms inside your browser using HTML5 Canvas and Web APIs. Your images are never transmitted over the internet, stored on third-party servers, or shared with artificial intelligence models.
            </p>
          </div>
        </div>

        {/* Popular Image Dimensions Cheat Sheet Table */}
        <div className="bg-white dark:bg-[#131722] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Popular Social Media & Web Dimensions Cheat Sheet
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Recommended resolutions for optimal display and zero compression blur
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] w-fit">
              Updated for 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3">Asset Type</th>
                  <th className="py-2.5 px-3">Ideal Dimensions</th>
                  <th className="py-2.5 px-3">Aspect Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Instagram</td>
                  <td className="py-2.5 px-3">Square Post</td>
                  <td className="py-2.5 px-3 font-mono">1080 × 1080 px</td>
                  <td className="py-2.5 px-3">1:1</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Instagram</td>
                  <td className="py-2.5 px-3">Story / Reel</td>
                  <td className="py-2.5 px-3 font-mono">1080 × 1920 px</td>
                  <td className="py-2.5 px-3">9:16</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">YouTube</td>
                  <td className="py-2.5 px-3">Video Thumbnail</td>
                  <td className="py-2.5 px-3 font-mono">1280 × 720 px</td>
                  <td className="py-2.5 px-3">16:9</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">YouTube</td>
                  <td className="py-2.5 px-3">Channel Banner</td>
                  <td className="py-2.5 px-3 font-mono">2560 × 1440 px</td>
                  <td className="py-2.5 px-3">16:9</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Facebook</td>
                  <td className="py-2.5 px-3">Cover Photo</td>
                  <td className="py-2.5 px-3 font-mono">820 × 312 px</td>
                  <td className="py-2.5 px-3">205:78</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Twitter / X</td>
                  <td className="py-2.5 px-3">Feed Post</td>
                  <td className="py-2.5 px-3 font-mono">1200 × 675 px</td>
                  <td className="py-2.5 px-3">16:9</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">LinkedIn</td>
                  <td className="py-2.5 px-3">Company Cover Banner</td>
                  <td className="py-2.5 px-3 font-mono">1584 × 396 px</td>
                  <td className="py-2.5 px-3">4:1</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">Website / Web</td>
                  <td className="py-2.5 px-3">Full HD Hero Banner</td>
                  <td className="py-2.5 px-3 font-mono">1920 × 1080 px</td>
                  <td className="py-2.5 px-3">16:9</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
