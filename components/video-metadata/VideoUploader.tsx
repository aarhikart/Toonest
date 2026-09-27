'use client';

import React, { useRef, useState } from 'react';
import { Upload, Film, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface VideoUploaderProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  errorMessage: string | null;
}

export function VideoUploader({ onFileSelected, isUploading, errorMessage }: VideoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;

    // Client-side extension check
    const isMp4 =
      file.name.toLowerCase().endsWith('.mp4') ||
      file.type === 'video/mp4' ||
      file.type.includes('mp4');

    if (!isMp4) {
      alert('Please upload an MP4 (.mp4) video file.');
      return;
    }

    onFileSelected(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-[#5722AF] bg-purple-50/50 dark:bg-purple-950/20 scale-[1.01]'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-[#9B6BE8] bg-white dark:bg-zinc-900/60 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,video/mp4"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center mx-auto mb-5 shadow-xs">
          {isUploading ? (
            <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
          ) : (
            <Film className="w-8 h-8 sm:w-10 sm:h-10" />
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {isUploading ? 'Inspecting Video Metadata...' : 'Upload your MP4'}
        </h2>

        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
          {isUploading
            ? 'Running deep FFprobe inspection to parse format tags, stream streams, GPS coordinates, camera models, and creation timestamps...'
            : 'Drag & drop your video here, or click to choose an MP4 file. The original file is protected and never overwritten.'}
        </p>

        {!isUploading && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#682BC9] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#5722AF]/25 transition-all">
            <Upload className="w-4 h-4" />
            <span>Choose MP4 File</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
          <span>Accepts: .mp4 (H.264 / H.265 / MPEG-4)</span>
          <span>•</span>
          <span>Max File Size: 500 MB</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Original file strictly protected
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-200 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}
    </div>
  );
}
