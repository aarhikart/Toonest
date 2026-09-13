'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Film, AlertCircle } from 'lucide-react';
import { validateUploadedFile } from '@/lib/ai-video/validator';

interface VideoUploaderProps {
  onVideoSelected: (file: File) => void;
  isLoading: boolean;
}

export function VideoUploader({ onVideoSelected, isLoading }: VideoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    const validation = validateUploadedFile(file.size, file.type, file.name);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid video file.');
      return;
    }
    onVideoSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLoading) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isDragOver
            ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/10 scale-[1.005]'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12151e] hover:border-[#5722AF]/60 dark:hover:border-[#5722AF]/60'
        } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
          aria-label="Upload video file"
        />

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shadow-xs">
          <UploadCloud className="w-7 h-7" />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            Drop your video here
          </p>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            or <span className="text-[#5722AF] dark:text-[#9B6BE8] font-semibold underline">click to browse</span> from your device
          </p>
        </div>

        {/* Format / Limits Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono">MP4</span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono">WebM</span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono">MOV</span>
          <span>•</span>
          <span>Max size: 500 MB</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
