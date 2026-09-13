'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Film,
  Volume2,
  VolumeX,
  Clock,
  Maximize2,
  FileText,
} from 'lucide-react';
import { VideoMetadata } from '@/lib/ai-video/types';

interface VideoPreviewCardProps {
  videoSrc: string;
  filename: string;
  fileSize?: number;
  onAnalyze: (metadata: VideoMetadata) => void;
  onRemove: () => void;
  isLoading: boolean;
}

export function VideoPreviewCard({
  videoSrc,
  filename,
  fileSize,
  onAnalyze,
  onRemove,
  isLoading,
}: VideoPreviewCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [metadata, setMetadata] = useState<VideoMetadata>({
    filename,
    format: filename.split('.').pop()?.toUpperCase() || 'MP4',
    sizeBytes: fileSize,
    duration: 0,
    width: 0,
    height: 0,
    hasAudio: true,
  });

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;

    // Detect audio presence if API supports it
    const hasAudioTrack =
      (v as any).mozHasAudio ||
      Boolean((v as any).webkitAudioDecodedByteCount) ||
      Boolean((v as any).audioTracks && (v as any).audioTracks.length > 0);

    const updated: VideoMetadata = {
      filename,
      format: filename.split('.').pop()?.toUpperCase() || 'MP4',
      sizeBytes: fileSize,
      duration: Math.round(v.duration || 0),
      width: v.videoWidth || 1920,
      height: v.videoHeight || 1080,
      hasAudio: hasAudioTrack ?? true,
      fps: 30, // standard baseline estimation
      codec: 'H.264 / AVC',
    };
    setMetadata(updated);
  };

  const formatDuration = (sec?: number) => {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Unknown Size';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="w-full bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">
            {filename}
          </h2>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={isLoading}
          className="text-xs font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          Remove / Change
        </button>
      </div>

      {/* Video Player Box */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-md">
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Metadata Badges Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Resolution</span>
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
            {metadata.width && metadata.height ? `${metadata.width} × ${metadata.height}` : 'Calculating...'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Duration</span>
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
            {formatDuration(metadata.duration)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">File Size</span>
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
            {formatBytes(metadata.sizeBytes)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Format</span>
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
            {metadata.format}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onAnalyze(metadata)}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#491B93] hover:to-[#6A3ABF] text-white font-bold text-base shadow-lg shadow-[#5722AF]/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
        >
          <Sparkles className="w-5 h-5" />
          <span>Analyze Video for AI Manipulation</span>
        </button>
      </div>
    </div>
  );
}
