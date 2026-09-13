'use client';

import React from 'react';
import { Minimize2, Zap, Shield, FileCheck } from 'lucide-react';

export function CompressorSEO() {
  return (
    <section className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider">
            Smart Compression Principles
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Compress Images Without Losing Unnecessary Quality
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Practical techniques to dramatically reduce image payloads while keeping visual details razor-sharp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <div className="bg-white dark:bg-[#131722] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <Minimize2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Optimize JPG, PNG, and Next-Gen WebP</span>
            </h4>
            <p>
              Whether you need an <strong>image compressor</strong> for portfolio photographs or daily design assets, finding the balance between compression ratio and fidelity is key. When you <strong>compress JPG</strong> files, high-frequency noise and redundant metadata are removed to <strong>reduce JPG file size</strong> by up to 80%. When you <strong>compress PNG</strong> graphics, stripping color profiles or converting to WebP helps <strong>reduce PNG file size</strong> without blurring crisp interface elements.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>High-Capacity Bulk Image Compression</span>
            </h4>
            <p>
              Optimizing thousands of product pictures or vacation galleries one by one is exhausting. As a high-performance <strong>bulk image compressor</strong>, ToolNest allows you to queue hundreds of photos simultaneously. Run <strong>bulk image compression</strong> to automatically standardize maximum resolutions and bundle your outputs into clean ZIP archives in seconds.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Target File Size & Intelligent Safeguards</span>
            </h4>
            <p>
              Many email platforms and portal forms enforce strict upload thresholds (such as 1 MB or 500 KB limits). Our built-in <strong>image size reducer</strong> solves for your chosen target file size automatically. Plus, our &quot;Skip if larger&quot; safeguard guarantees that already-optimized photos are never degraded into bloated files.
            </p>
          </div>

          <div className="bg-white dark:bg-[#131722] p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Zero-Cloud Confidentiality</span>
            </h4>
            <p>
              When you <strong>compress images online</strong> using ToolNest, your files never touch external hosting servers or artificial intelligence training databases. All image calculations run directly inside your browser memory, ensuring complete privacy for sensitive personal documents and proprietary artwork.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
