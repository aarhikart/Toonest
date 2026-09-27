'use client';

import React from 'react';
import { CleaningSessionResult } from '@/lib/video-metadata/types';
import { Download, RefreshCw, ShieldCheck, Film, Layers } from 'lucide-react';

interface DownloadCardProps {
  result: CleaningSessionResult;
  onReset: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function DownloadCard({ result, onReset }: DownloadCardProps) {
  const downloadUrl = `/api/video-metadata/download/${result.sessionId}`;
  const videoStream = result.cleanedMetadata.videoStream;
  const audioStream = result.cleanedMetadata.audioStream;
  const isTransparent = result.verification.isTransparentLayer;

  return (
    <div className="bg-gradient-to-br from-white via-indigo-50/20 to-white dark:from-zinc-900 dark:via-indigo-950/10 dark:to-zinc-900 border border-indigo-200/80 dark:border-indigo-900/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Step 4: Download & Preview
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            {isTransparent ? 'Your Layer-Shielded MP4 is Ready' : 'Your Cleaned MP4 is Ready'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Process Another Video</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Summary & Download Action */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">Cleaned Filename</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block font-mono" title={result.cleanedFilename}>
                {result.cleanedFilename}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">File Size</span>
              <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                {formatBytes(result.cleanedSize)}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">Duration</span>
              <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                {result.cleanedMetadata.fileInfo.formattedDuration}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">Resolution</span>
              <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 block">
                {videoStream?.resolution || 'Unknown'}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">Video Stream</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                {videoStream?.codec || 'H.264'}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[11px] mb-1">Audio Track</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                {audioStream?.codec || 'None'}
              </span>
            </div>
          </div>

          {/* Download Button */}
          <div>
            <a
              href={downloadUrl}
              download={result.cleanedFilename}
              className={`w-full py-4 px-8 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group ${
                isTransparent
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 hover:shadow-xl'
                  : 'bg-[#5722AF] hover:bg-[#682BC9] shadow-[#5722AF]/30 hover:shadow-xl'
              }`}
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span>{isTransparent ? 'Download Shielded MP4' : 'Download Cleaned MP4'}</span>
            </a>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>File Safety & Integrity Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your original video was never modified or overwritten. The output video was generated independently with audio stream-copied without loss.
            </p>
          </div>
        </div>

        {/* Right Column: HTML5 Video Preview */}
        <div className="lg:col-span-5 bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-md">
          <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
            <span className="font-semibold flex items-center gap-1.5">
              {isTransparent ? (
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Film className="w-3.5 h-3.5 text-[#5722AF]" />
              )}
              <span>{isTransparent ? 'Shielded Video Preview' : 'Cleaned Video Preview'}</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">HTML5 Player</span>
          </div>

          <video
            src={downloadUrl}
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
