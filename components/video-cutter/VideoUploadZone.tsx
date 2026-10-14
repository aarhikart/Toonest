'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, Film, AlertCircle, RefreshCw, Clock, HardDrive, CheckCircle2, X } from 'lucide-react';
import { VideoCutterSession } from '@/lib/video-cutter/types';

interface VideoUploadZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  errorMessage: string | null;
  session: VideoCutterSession | null;
  onReset: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function VideoUploadZone({
  onFileSelected,
  isUploading,
  uploadProgress,
  errorMessage,
  session,
  onReset,
}: VideoUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;

    const isSupported =
      file.name.toLowerCase().endsWith('.mp4') ||
      file.name.toLowerCase().endsWith('.mkv') ||
      file.type === 'video/mp4' ||
      file.type === 'video/x-matroska' ||
      file.type.includes('mp4') ||
      file.type.includes('matroska');

    if (!isSupported) {
      alert('Please upload an MP4 (.mp4) or MKV (.mkv) video file.');
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setPreviewBlobUrl(url);
    } catch (_) {}

    onFileSelected(file);
  };

  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  // If a video is already loaded and ready
  if (session) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 shadow-xs space-y-5 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white truncate max-w-md">
                {session.originalFilename}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Uploaded & Ready for Slicing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer shadow-2xs"
          >
            <X className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            <span>Change Video</span>
          </button>
        </div>

        {/* Video Player & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Video Preview */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner relative group border border-zinc-200 dark:border-zinc-800">
            {previewBlobUrl ? (
              <video
                src={previewBlobUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-zinc-500 dark:text-zinc-400 text-xs flex flex-col items-center gap-2">
                <Film className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                <span>Video Preview</span>
              </div>
            )}
          </div>

          {/* Stats Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Source Video Specs
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>Duration</span>
                  </span>
                  <div className="font-extrabold text-sm font-mono text-zinc-900 dark:text-white">
                    {session.formattedDuration}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px] flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>File Size</span>
                  </span>
                  <div className="font-extrabold text-sm text-zinc-900 dark:text-white">
                    {formatBytes(session.fileSize)}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Resolution</span>
                  <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                    {session.width} × {session.height}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Frame Rate</span>
                  <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                    {session.fps} FPS
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Compatible video stream ready for instant lossless cutting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Upload Box
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
            : 'border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-[#9B6BE8] bg-white dark:bg-zinc-900 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,video/mp4,.mkv,video/x-matroska,video/mkv"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#5722AF]/10 dark:bg-purple-950/50 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center mx-auto transition-transform group-hover:scale-105 border border-purple-200/50 dark:border-purple-800/50">
            {isUploading ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
              {isUploading ? 'Uploading & Analyzing Video...' : 'Upload MP4 or MKV Video to Cut'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Drag and drop your MP4 or MKV file here, or{' '}
              <span className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">browse from your computer</span>
            </p>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="pt-2 space-y-2 max-w-xs mx-auto">
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#5722AF] to-[#9B6BE8] transition-all duration-200"
                  style={{ width: `${Math.max(15, uploadProgress)}%` }}
                />
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                {uploadProgress > 0 ? `${uploadProgress}% uploaded` : 'Processing video stream...'}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">Supports .MP4 &amp; .MKV</span>
            <span>&bull;</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">Supports Long Videos (3+ Hours)</span>
            <span>&bull;</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">100% Quality Preserved</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Upload Notice: </span>
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}
