'use client';

import React from 'react';
import { ProcessResult } from '@/lib/video-text/types';
import { Download, RefreshCw, CheckCircle2, Film, ShieldCheck } from 'lucide-react';

interface ProcessedResultCardProps {
  result: ProcessResult;
  onReset: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function ProcessedResultCard({ result, onReset }: ProcessedResultCardProps) {
  return (
    <div className="bg-gradient-to-br from-white via-indigo-50/20 to-white dark:from-zinc-900 dark:via-indigo-950/10 dark:to-zinc-900 border border-indigo-200/80 dark:border-indigo-900/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Step 3: Preview & Download
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            Your Video is Cleaned & Ready
          </h3>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clean Another Video</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details & Download Button */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">Cleaned Filename</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block font-mono" title={result.processedFilename}>
                {result.processedFilename}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">File Size</span>
              <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                {formatBytes(result.processedSize)}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">Method Applied</span>
              <span className="font-bold capitalize text-indigo-600 dark:text-indigo-400 block">
                {result.method.replace('_', ' ')}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">Regions Erased</span>
              <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                {result.boxesCount} region(s)
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 col-span-2">
              <span className="text-zinc-400 block text-[11px] mb-1">Audio & Codec Quality</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                100% Original Audio Copied Losslessly
              </span>
            </div>
          </div>

          {/* Download Button */}
          <div>
            <a
              href={result.downloadUrl}
              download={result.processedFilename}
              className="w-full py-4 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span>Download Cleaned Video</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safety Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              The original video was not modified. Text was removed across every frame of the video while maintaining original framerate and audio synchronicity.
            </p>
          </div>
        </div>

        {/* Right Column: HTML5 Video Preview */}
        <div className="lg:col-span-5 bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-md">
          <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cleaned Video Preview</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">HTML5 Player</span>
          </div>

          <video
            src={result.previewUrl}
            controls
            className="w-full max-h-72 object-contain bg-black"
          >
            Your browser does not support HTML5 video preview.
          </video>
        </div>
      </div>
    </div>
  );
}
