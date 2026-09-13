'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Plus, AlertCircle } from 'lucide-react';

interface JpgDropZoneProps {
  onAddFiles: (files: File[]) => void;
  compact?: boolean;
}

export function JpgDropZone({ onAddFiles, compact = false }: JpgDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filterAndPassJpgs = (fileList: FileList | File[]) => {
    setErrorNotice(null);
    const validFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (
        ext === 'jpg' ||
        ext === 'jpeg' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg'
      ) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorNotice('Please select valid JPG or JPEG images.');
      return;
    }

    onAddFiles(validFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      filterAndPassJpgs(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/jpeg') || item.type.startsWith('image/jpg')) {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        onAddFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onAddFiles]);

  if (compact) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,image/jpeg"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) filterAndPassJpgs(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-700/80"
        >
          <Plus className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Add More Files</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,image/jpeg"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) filterAndPassJpgs(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer group ${
          isDragging
            ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/10 scale-[1.005]'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-[#9B6BE8] bg-white dark:bg-zinc-900/60 shadow-xs'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
          {/* Animated Upload Icon */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              isDragging
                ? 'bg-[#5722AF] text-white scale-110 shadow-lg shadow-[#5722AF]/30'
                : 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] group-hover:scale-105'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              Drop your JPG images here
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">or</div>
          </div>

          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#5722AF]/20 transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Choose JPG Files</span>
          </button>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium pt-1">
            JPG and JPEG supported • Supports paste (Ctrl+V)
          </p>
        </div>
      </div>

      {errorNotice && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}
    </div>
  );
}
