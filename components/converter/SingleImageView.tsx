'use client';

import React from 'react';
import { ConvertFileItem, ConversionSettings } from '@/lib/converterTypes';
import { formatBytes } from '@/lib/renameEngine';
import {
  Download,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileImage,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface SingleImageViewProps {
  item: ConvertFileItem;
  settings: ConversionSettings;
  onConvert: () => Promise<void>;
  onDownload: () => void;
  isConverting: boolean;
}

export function SingleImageView({
  item,
  settings,
  onConvert,
  onDownload,
  isConverting,
}: SingleImageViewProps) {
  const isConverted = item.status === 'completed' && item.convertedUrl;

  // Space savings calculation
  let sizeDiffText = '';
  let isSaved = false;
  let percentDiff = 0;

  if (isConverted && item.convertedSize) {
    const diff = item.originalSize - item.convertedSize;
    percentDiff = Math.round(
      Math.abs(diff / item.originalSize) * 100
    );

    if (diff > 0) {
      isSaved = true;
      sizeDiffText = `Saved ${percentDiff}% (${formatBytes(diff)})`;
    } else if (diff < 0) {
      isSaved = false;
      sizeDiffText = `Size increased by ${percentDiff}% (+${formatBytes(Math.abs(diff))})`;
    } else {
      sizeDiffText = 'Identical file size';
    }
  }

  return (
    <div className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 space-y-6 shadow-xs">
      {/* Before / After Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <span>Original Image</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
              {item.originalFormat.toUpperCase()}
            </span>
          </div>

          <div className="w-full h-64 sm:h-72 rounded-2xl bg-zinc-100/80 dark:bg-[#0c0e14] border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex items-center justify-center p-2 relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={item.originalName}
              className="max-h-full max-w-full object-contain rounded-xl"
            />
          </div>

          {/* Original Metadata */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-1">
            <div className="font-semibold text-zinc-900 dark:text-white truncate">
              {item.originalName}
            </div>
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <span>{formatBytes(item.originalSize)}</span>
              <span>•</span>
              <span>
                {item.originalWidth} × {item.originalHeight} px
              </span>
            </div>
          </div>
        </div>

        {/* Converted Output Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <span>Converted Output</span>
            <span className="px-2 py-0.5 rounded-md bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] font-mono font-bold">
              {settings.targetFormat.toUpperCase()}
            </span>
          </div>

          <div className="w-full h-64 sm:h-72 rounded-2xl bg-zinc-100/80 dark:bg-[#0c0e14] border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex items-center justify-center p-2 relative">
            {isConverting ? (
              <div className="flex flex-col items-center gap-2 text-[#5722AF] dark:text-[#9B6BE8]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-semibold">Converting image...</span>
              </div>
            ) : isConverted && item.convertedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.convertedUrl}
                alt={item.targetName}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-center p-6 space-y-2 text-zinc-400 dark:text-zinc-500">
                <FileImage className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs">
                  Click &quot;Convert Image&quot; below to process and preview
                </p>
              </div>
            )}
          </div>

          {/* Converted Metadata */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-1">
            {isConverted ? (
              <>
                <div className="font-semibold text-zinc-900 dark:text-white truncate">
                  {item.targetName}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {formatBytes(item.convertedSize || 0)}
                  </span>
                  <span>•</span>
                  <span>
                    {item.convertedWidth} × {item.convertedHeight} px
                  </span>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      isSaved
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isSaved ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5" />
                    )}
                    {sizeDiffText}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-zinc-400 text-xs italic py-1">
                Awaiting conversion...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Target format: <strong className="uppercase text-zinc-800 dark:text-zinc-200">{settings.targetFormat}</strong> • Quality: <strong>{settings.quality}%</strong>
        </div>

        <div className="flex items-center gap-3">
          {/* Convert Button */}
          <button
            type="button"
            disabled={isConverting}
            onClick={onConvert}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#4C1D9B] hover:to-[#6C3BC4] disabled:opacity-40 transition-all shadow-sm shadow-[#5722AF]/25 flex items-center justify-center gap-2"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>{isConverted ? 'Re-Convert' : 'Convert Image'}</span>
              </>
            )}
          </button>

          {/* Download Button (Active after conversion) */}
          {isConverted && (
            <button
              type="button"
              onClick={onDownload}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2 animate-in fade-in"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
