'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileArchive, AlertCircle, FilePlus } from 'lucide-react';

interface ZipExtractorDropZoneProps {
  onSelectZip: (file: File) => void;
  isLoading?: boolean;
}

export function ZipExtractorDropZone({ onSelectZip, isLoading = false }: ZipExtractorDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndPass = (file: File) => {
    setErrorNotice(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'zip' && file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      setErrorNotice('Please select a valid .zip archive.');
      return;
    }
    onSelectZip(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPass(e.dataTransfer.files[0]);
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

  return (
    <div className="w-full space-y-3">
      {/* Hidden file input strictly accepting .zip */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            validateAndPass(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Main Drag & Drop Card */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && fileInputRef.current?.click()}
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
            <FileArchive className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {isDragging ? 'Drop your ZIP file here' : 'Drag & drop your ZIP file here'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              or choose a ZIP file from your device
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#491c94] text-white font-semibold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg hover:shadow-[#5722AF]/35 transition-all cursor-pointer disabled:opacity-60"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isLoading ? 'Reading Archive...' : 'Choose ZIP File'}</span>
            </button>
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-1">
            Supports standard .zip archives • Processed 100% locally in browser memory
          </p>
        </div>
      </div>

      {/* Error notice if non-zip file was selected */}
      {errorNotice && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}
    </div>
  );
}
