'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Download,
  Eye,
  Info,
  Clock,
  HardDrive,
  Folder,
  Tag,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import JSZip from 'jszip';
import { ZipEntryItem } from '@/lib/zipExtractorTypes';
import { extractSingleFile, formatFileSize, downloadBlob } from '@/lib/zipExtractorEngine';

interface FilePreviewModalProps {
  entry: ZipEntryItem | null;
  zip: JSZip | null;
  onClose: () => void;
}

export function FilePreviewModal({ entry, zip, onClose }: FilePreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textSnippet, setTextSnippet] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!entry || !zip || entry.isDirectory) {
      setPreviewUrl(null);
      setTextSnippet(null);
      setImgDimensions(null);
      setCachedBlob(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadPreview = async () => {
      try {
        const blob = await extractSingleFile(zip, entry.path);
        if (!isMounted) return;

        setCachedBlob(blob);

        if (entry.category === 'image') {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);

          const img = new Image();
          img.onload = () => {
            if (isMounted) setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          };
          img.src = url;
        } else if (
          entry.category === 'code' ||
          entry.category === 'document' ||
          entry.name.endsWith('.txt') ||
          entry.name.endsWith('.json') ||
          entry.name.endsWith('.csv') ||
          entry.name.endsWith('.md') ||
          entry.name.endsWith('.html') ||
          entry.name.endsWith('.xml')
        ) {
          // Read first 50KB safely as plain text
          const reader = new FileReader();
          reader.onload = (e) => {
            if (isMounted) {
              const text = e.target?.result as string;
              setTextSnippet(text ? text.slice(0, 50000) : '');
            }
          };
          reader.readAsText(blob.slice(0, 51200));
        } else if (entry.category === 'audio' || entry.category === 'video') {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to extract file for preview.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [entry, zip]);

  if (!entry) return null;

  const ext = entry.name.includes('.') ? entry.name.split('.').pop()?.toUpperCase() : 'FILE';
  const lastModifiedFormatted = entry.date ? entry.date.toLocaleString() : 'Unknown';

  const handleDownloadThisFile = () => {
    if (cachedBlob) {
      downloadBlob(cachedBlob, entry.name);
    } else if (zip) {
      extractSingleFile(zip, entry.path).then((blob) => {
        downloadBlob(blob, entry.name);
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="File Preview and Details"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate font-mono">
                {entry.name}
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                {entry.folderPath ? `/${entry.folderPath}` : '/ (Root)'}
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
          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#5722AF]" />
              <span className="text-xs text-zinc-400">Extracting file for preview...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Safe Preview Canvas/Box */}
          {!loading && !error && (
            <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-xl p-3 flex flex-col items-center justify-center min-h-[160px] max-h-[300px] overflow-hidden border border-zinc-200 dark:border-zinc-700/60">
              {previewUrl && entry.category === 'image' && (
                <div className="relative max-h-[280px] max-w-full flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt={entry.name}
                    className="max-h-[260px] w-auto object-contain rounded-lg shadow-xs"
                  />
                </div>
              )}

              {previewUrl && entry.category === 'video' && (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-[260px] w-full rounded-lg outline-none"
                />
              )}

              {previewUrl && entry.category === 'audio' && (
                <audio src={previewUrl} controls className="w-full mt-2 outline-none" />
              )}

              {textSnippet !== null && (
                <div className="w-full text-left">
                  <div className="text-[11px] font-semibold text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Safe Text Preview:</span>
                    <span className="text-[10px] text-zinc-400">Read-only plain text</span>
                  </div>
                  <pre className="text-xs font-mono bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto max-h-[220px] text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap select-text">
                    {textSnippet || '(Empty file)'}
                  </pre>
                </div>
              )}

              {!previewUrl && textSnippet === null && (
                <div className="text-center space-y-1.5 py-6">
                  <FileText className="w-8 h-8 text-zinc-400 mx-auto opacity-70" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Preview unavailable for this format ({ext})
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Binary documents and executables are preserved securely without execution
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Image Dimensions if available */}
          {imgDimensions && (
            <div className="text-center text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8]">
              Dimensions: {imgDimensions.width} × {imgDimensions.height} px
            </div>
          )}

          {/* Metadata Table */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            <div className="py-2 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" /> Full Archive Path
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">
                {entry.path}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> Uncompressed Size
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300 font-mono">
                {formatFileSize(entry.uncompressedSize)} ({entry.uncompressedSize.toLocaleString()} bytes)
              </span>
            </div>

            {entry.compressedSize && (
              <div className="py-2 flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Compressed Size
                </span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300 font-mono">
                  {formatFileSize(entry.compressedSize)}
                </span>
              </div>
            )}

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

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sandboxed preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadThisFile}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#5722AF] hover:bg-[#491c94] text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
