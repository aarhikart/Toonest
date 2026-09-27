'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Film, AlertCircle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

interface VideoUploaderProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  errorMessage?: string | null;
}

export function VideoUploader({ onFileSelected, isUploading, errorMessage }: VideoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndPassFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndPassFile(files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|webm|mkv)$/i)) {
      alert('Please upload a valid MP4, MOV, or WebM video file.');
      return;
    }
    onFileSelected(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all ${
          isDragOver
            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/20 scale-[1.01]'
            : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-indigo-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20'
        } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            {isUploading ? (
              <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-indigo-600" />
            ) : (
              <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {isUploading ? 'Uploading & Analyzing Video...' : 'Upload Video to Detect & Remove Text'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Drag and drop your video file here, or{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline underline-offset-2">
                browse files
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">MP4, MOV, WebM</span>
            <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">OCR Text Detection</span>
            <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">Delogo & Color Patch</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}
    </div>
  );
}
