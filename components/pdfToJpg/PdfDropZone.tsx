'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, FileText, FilePlus, AlertCircle } from 'lucide-react';

interface PdfDropZoneProps {
  onAddFiles: (files: File[]) => void;
  compact?: boolean;
}

export function PdfDropZone({ onAddFiles, compact = false }: PdfDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filterAndPassPdfs = (fileList: FileList | File[]) => {
    setErrorNotice(null);
    const validFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf' || file.type === 'application/pdf') {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorNotice('Please select valid .pdf documents.');
      return;
    }

    onAddFiles(validFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      filterAndPassPdfs(e.dataTransfer.files);
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
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        filterAndPassPdfs(e.clipboardData.files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  if (compact) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              filterAndPassPdfs(e.target.files);
              e.target.value = '';
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Add More Files</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            filterAndPassPdfs(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Main Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/10 scale-[1.008]'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF]/60 dark:hover:border-[#9B6BE8]/60 bg-white dark:bg-zinc-900/60'
        } shadow-xs`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              isDragging
                ? 'bg-[#5722AF] text-white shadow-lg shadow-[#5722AF]/30 scale-110'
                : 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8]'
            }`}
          >
            <FileText className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {isDragging ? 'Drop your PDF files here' : 'Drop your PDF files here'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              or choose PDF files from your device
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#491c94] text-white font-semibold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg hover:shadow-[#5722AF]/35 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choose PDF Files</span>
            </button>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-1">
            PDF files only • Supports multiple documents • 100% in-browser processing
          </p>
        </div>
      </div>

      {errorNotice && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}
    </div>
  );
}
