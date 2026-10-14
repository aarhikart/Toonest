'use client';

import React, { useState } from 'react';
import {
  FileArchive,
  Download,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Clock,
  Film,
  HardDrive,
  X
} from 'lucide-react';
import { ProcessResult, ClipMetadata } from '@/lib/video-cutter/types';

interface ResultsDownloadCardProps {
  result: ProcessResult;
  onReset: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function ResultsDownloadCard({ result, onReset }: ResultsDownloadCardProps) {
  const [activePreviewClip, setActivePreviewClip] = useState<ClipMetadata | null>(null);
  const [videoErrors, setVideoErrors] = useState<Record<number, boolean>>({});

  const handleDownloadAllZip = () => {
    const link = document.createElement('a');
    link.href = result.zipDownloadUrl;
    link.download = result.zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSingleClip = (clip: ClipMetadata) => {
    const link = document.createElement('a');
    link.href = clip.downloadUrl;
    link.download = clip.displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Completion Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-md shadow-emerald-500/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-emerald-200 dark:border-emerald-800/60">
                <Sparkles className="w-3 h-3" />
                <span>Cutting Complete</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                {result.totalClips} Video Clips Ready!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Successfully cut into {Math.round(result.clipDurationSeconds / 60) >= 1 ? `${Math.round(result.clipDurationSeconds / 60)} min` : `${result.clipDurationSeconds}s`} clips and bundled into 1 ZIP file{result.hasEndingVideo ? ' (with ending video attached to every clip)' : ''}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            <span>Cut Another Video</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Video Duration</span>
            <div className="font-mono font-bold text-sm text-zinc-900 dark:text-white mt-0.5">
              {result.formattedDuration}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Clip Interval</span>
            <div className="font-mono font-bold text-sm text-zinc-900 dark:text-white mt-0.5">
              {Math.round(result.clipDurationSeconds / 60) >= 1
                ? `${Math.round(result.clipDurationSeconds / 60)} Minutes`
                : `${result.clipDurationSeconds} Seconds`}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Clips Cut</span>
            <div className="font-mono font-black text-sm text-[#5722AF] dark:text-[#9B6BE8] mt-0.5">
              {result.totalClips} Clips
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Total ZIP Archive Size</span>
            <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatBytes(result.zipSizeBytes)}
            </div>
          </div>
        </div>

        {/* PROMINENT PRIMARY DOWNLOAD BUTTON (ZIP) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDownloadAllZip}
            className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-[#5722AF] via-[#6d30d1] to-[#7B45D1] hover:from-[#471a93] hover:to-[#5722AF] text-white font-black text-base sm:text-lg shadow-xl shadow-[#5722AF]/25 transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <FileArchive className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            <span>Download All {result.totalClips} Clips as One ZIP File</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 font-mono font-semibold">
              {formatBytes(result.zipSizeBytes)}
            </span>
          </button>
          <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
            Archive filename: <span className="text-zinc-700 dark:text-zinc-300 font-bold">{result.zipFilename}</span> (contains video1, video2, etc.)
          </p>
        </div>
      </div>

      {/* Generated Clips Grid with Top-Left Part Badges */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
              Generated Video Clips ({result.totalClips})
            </h3>
            {result.hasEndingVideo && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800/80">
                + Ending Video Included
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            Part #1, Part #2, Part #3 &bull; video1, video2, video3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[640px] overflow-y-auto pr-1">
          {result.clips.map((clip) => (
            <div
              key={clip.index}
              className="p-3.5 sm:p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-800 flex flex-col justify-between gap-3 hover:border-purple-300 dark:hover:border-purple-800/80 transition shadow-2xs"
            >
              {/* Video Player Box with Part # in TOP-LEFT CORNER */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner group">
                {/* Top-Left Corner Badge: Part #1, Part #2, Part #3 */}
                <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-white font-black text-xs shadow-lg border border-white/20 flex items-center gap-1.5 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-[#9B6BE8] animate-pulse" />
                  <span>Part #{clip.index}</span>
                </div>

                {videoErrors[clip.index] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 gap-2 bg-zinc-900 text-zinc-300">
                    <Film className="w-8 h-8 text-[#9B6BE8]" />
                    <span className="text-[11px] font-bold text-white">Clip Ready for Download</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{clip.displayName}</span>
                  </div>
                ) : (
                  <video
                    src={clip.previewUrl}
                    preload="metadata"
                    controls
                    playsInline
                    onError={() => setVideoErrors((prev) => ({ ...prev, [clip.index]: true }))}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Clip Metadata Row */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-mono text-[11px] font-black border border-purple-200/80 dark:border-purple-800/60">
                      Part #{clip.index}
                    </span>
                    <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white truncate" title={clip.displayName}>
                      {clip.displayName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                    {formatBytes(clip.sizeBytes)}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>{clip.startTimeFormatted} &rarr; {clip.endTimeFormatted}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {result.hasEndingVideo && (
                      <span className="px-1.5 py-0.2 rounded-sm bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 text-[10px] font-semibold border border-purple-200/60 dark:border-purple-800/60">
                        + Outro
                      </span>
                    )}
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {clip.durationFormatted}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/70 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActivePreviewClip(clip)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Play className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <span>Play</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSingleClip(clip)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800/80 text-[#5722AF] dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3 h-3" />
                  <span>{clip.displayName}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* In-Browser Preview Modal with Part # in Top-Left Corner */}
      {activePreviewClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 w-full max-w-2xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-black text-xs border border-purple-200/80 dark:border-purple-800/60">
                    Part #{activePreviewClip.index}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                    {activePreviewClip.displayName}
                  </h4>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                  {activePreviewClip.startTimeFormatted} to {activePreviewClip.endTimeFormatted} ({activePreviewClip.durationFormatted})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewClip(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-inner">
              {/* Top-Left Corner Badge in Preview Player */}
              <div className="absolute top-3.5 left-3.5 z-20 px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-white font-black text-xs sm:text-sm shadow-xl border border-white/20 flex items-center gap-2 pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9B6BE8] animate-pulse" />
                <span>Part #{activePreviewClip.index}</span>
              </div>

              <video
                src={activePreviewClip.previewUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadSingleClip(activePreviewClip)}
                className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {activePreviewClip.displayName}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
