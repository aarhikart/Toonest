'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Clock,
  HardDrive,
  Folder,
  Tag,
  Eye,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ZipFileItem } from '@/lib/zipCreatorTypes';
import { formatFileSize } from '@/lib/zipCreatorEngine';

interface FileDetailsModalProps {
  fileItem: ZipFileItem | null;
  onClose: () => void;
}

export function FileDetailsModal({ fileItem, onClose }: FileDetailsModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textSnippet, setTextSnippet] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(
    null
  );

  useEffect(() => {
    if (!fileItem) {
      setPreviewUrl(null);
      setTextSnippet(null);
      setImgDimensions(null);
      return;
    }

    const file = fileItem.file;
    const category = fileItem.category;

    if (category === 'image' || file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (category === 'code' || category === 'document' || file.type.startsWith('text/')) {
      // Read first 2KB safely
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setTextSnippet(text ? text.slice(0, 1500) : '');
      };
      reader.readAsText(file.slice(0, 2048));
    } else if (category === 'audio' || category === 'video') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [fileItem]);

  if (!fileItem) return null;

  const fullZipPath = fileItem.folderPath
    ? `${fileItem.folderPath}/${fileItem.name}`
    : fileItem.name;
  const ext = fileItem.name.includes('.') ? fileItem.name.split('.').pop()?.toUpperCase() : 'NONE';
  const lastModifiedFormatted = fileItem.lastModified
    ? new Date(fileItem.lastModified).toLocaleString()
    : 'Unknown';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="File Details and Preview"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                {fileItem.name}
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                File Details & Safe Preview
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Safe Preview Canvas/Box */}
          <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-xl p-3 flex flex-col items-center justify-center min-h-[160px] max-h-[240px] overflow-hidden border border-zinc-200 dark:border-zinc-700/60">
            {previewUrl && fileItem.category === 'image' && (
              <div className="relative max-h-[220px] max-w-full flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt={fileItem.name}
                  className="max-h-[200px] w-auto object-contain rounded-lg shadow-xs"
                />
              </div>
            )}

            {previewUrl && fileItem.category === 'video' && (
              <video
                src={previewUrl}
                controls
                className="max-h-[200px] w-full rounded-lg outline-none"
              />
            )}

            {previewUrl && fileItem.category === 'audio' && (
              <audio src={previewUrl} controls className="w-full mt-2 outline-none" />
            )}

            {textSnippet !== null && (
              <div className="w-full text-left">
                <div className="text-[11px] font-semibold text-zinc-400 mb-1">
                  Text Preview (first 1.5 KB):
                </div>
                <pre className="text-xs font-mono bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto max-h-[160px] text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                  {textSnippet || '(Empty file)'}
                </pre>
              </div>
            )}

            {!previewUrl && textSnippet === null && (
              <div className="text-center space-y-1.5 py-4">
                <FileText className="w-8 h-8 text-zinc-400 mx-auto opacity-70" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Preview unavailable for this file format
                </p>
                <p className="text-[11px] text-zinc-400">
                  Binary files are safely preserved as-is inside the archive
                </p>
              </div>
            )}
          </div>

          {/* Image Dimensions Badge if available */}
          {imgDimensions && (
            <div className="text-center text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8]">
              Dimensions: {imgDimensions.width} × {imgDimensions.height} px
            </div>
          )}

          {/* Metadata Table */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            <div className="py-2 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Original Name
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                {fileItem.originalName}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" /> Path in ZIP
              </span>
              <span className="font-semibold text-[#5722AF] dark:text-[#9B6BE8] font-mono text-[11px]">
                {fullZipPath}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> File Size
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {formatFileSize(fileItem.size)} ({fileItem.size.toLocaleString()} bytes)
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Extension / MIME
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                .{ext} ({fileItem.type || 'unknown'})
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Last Modified
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {lastModifiedFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-800/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
