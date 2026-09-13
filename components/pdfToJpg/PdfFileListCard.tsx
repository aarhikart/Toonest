'use client';

import React from 'react';
import {
  FileText,
  Trash2,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  AlertCircle,
  Clock,
  Eye,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { PdfFileItem } from '@/lib/pdfToJpgTypes';
import { formatFileSize } from '@/lib/pdfToJpgEngine';
import { PdfDropZone } from './PdfDropZone';

interface PdfFileListCardProps {
  files: PdfFileItem[];
  activePdfId: string | null;
  onSelectActivePdf: (id: string) => void;
  onRemovePdf: (id: string) => void;
  onClearAll: () => void;
  onAddFiles: (files: File[]) => void;
}

export function PdfFileListCard({
  files,
  activePdfId,
  onSelectActivePdf,
  onRemovePdf,
  onClearAll,
  onAddFiles,
}: PdfFileListCardProps) {
  const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0);

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
            PDF Queue ({files.length} {files.length === 1 ? 'file' : 'files'})
          </h3>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            • {totalPages} {totalPages === 1 ? 'page' : 'pages'} total
          </span>
        </div>

        <div className="flex items-center gap-2">
          <PdfDropZone onAddFiles={onAddFiles} compact={true} />
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold px-2.5 py-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* PDF List Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {files.map((pdf) => {
          const isActive = pdf.id === activePdfId;
          const firstPageThumb = pdf.pages[0]?.thumbnailUrl;

          return (
            <div
              key={pdf.id}
              onClick={() => onSelectActivePdf(pdf.id)}
              className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                isActive
                  ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/15 ring-2 ring-[#5722AF]/20 shadow-xs'
                  : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {/* Thumbnail or Icon */}
              <div className="w-12 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {firstPageThumb ? (
                  <img
                    src={firstPageThumb}
                    alt={pdf.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-5 h-5 text-zinc-400" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="font-bold text-xs text-zinc-900 dark:text-white truncate font-mono">
                  {pdf.name}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <span>{formatFileSize(pdf.size)}</span>
                  <span>•</span>
                  <span className="font-semibold text-[#5722AF] dark:text-[#9B6BE8]">
                    {pdf.pageCount} {pdf.pageCount === 1 ? 'page' : 'pages'}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="pt-0.5">
                  {pdf.status === 'loading' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Reading pages...</span>
                    </span>
                  )}
                  {pdf.status === 'ready' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready to convert</span>
                    </span>
                  )}
                  {pdf.status === 'error' && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 truncate">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{pdf.error || 'Failed to open'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePdf(pdf.id);
                }}
                className="opacity-60 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 rounded-md transition-opacity"
                title="Remove this PDF"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
