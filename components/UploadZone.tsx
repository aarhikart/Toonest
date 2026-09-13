'use client';

import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Shield, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { isSupportedImageFile, SUPPORTED_EXTENSIONS } from '@/lib/renameEngine';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export function UploadZone({
  onFilesSelected,
  disabled = false,
  title = 'Drag & drop your images here',
  subtitle = 'or choose images from your device',
  buttonText = 'Upload Images',
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
    // Reset file input value so user can re-select same files if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(isSupportedImageFile);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const triggerBrowse = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerBrowse}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerBrowse();
        }
      }}
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer p-8 sm:p-12 text-center group flex flex-col items-center justify-center ${
        isDragOver
          ? 'border-[#5722AF] bg-[#5722AF]/5 dark:border-[#9B6BE8] dark:bg-[#5722AF]/10 scale-[1.005]'
          : 'border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-[#131722] hover:border-[#5722AF]/60 dark:hover:border-[#9B6BE8]/60 hover:bg-zinc-50/50 dark:hover:bg-[#161b28]'
      } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp,image/tiff,image/avif"
        onChange={handleFileInputChange}
        className="sr-only"
        aria-label="Upload image files"
        disabled={disabled}
      />

      {/* Upload icon */}
      <div className="w-16 h-16 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
        <UploadCloud className="w-8 h-8" />
      </div>

      {/* Clear heading */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Small supporting text */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-sm">
        {subtitle}
      </p>

      {/* Select button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerBrowse();
        }}
        className="px-6 py-2.5 rounded-xl font-medium text-sm text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-600 hover:border-[#5722AF] dark:hover:border-[#9B6BE8] hover:bg-zinc-50 dark:hover:bg-[#202738] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
      >
        {buttonText}
      </button>

      {/* Supported formats label */}
      <div className="mt-5 flex flex-wrap justify-center items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">
        <span>JPG</span>
        <span>•</span>
        <span>PNG</span>
        <span>•</span>
        <span>WEBP</span>
        <span>•</span>
        <span>GIF</span>
        <span>•</span>
        <span>SVG</span>
        <span>•</span>
        <span>BMP</span>
        <span>•</span>
        <span>TIFF</span>
        <span>•</span>
        <span>AVIF</span>
      </div>

      {/* Privacy note */}
      <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        <span>Your files stay on your device. Images are processed locally in your browser.</span>
      </div>
    </div>
  );
}
