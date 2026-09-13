'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Download,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  FileText,
  FileArchive,
  HardDrive,
} from 'lucide-react';
import { GeneratedPdfResult, JpgToPdfConfig } from '@/lib/jpgToPdfTypes';
import { formatFileSize, downloadFileBlob } from '@/lib/jpgToPdfEngine';
import { getPdfDocument } from '@/lib/pdfLoader';

interface JpgResultsViewProps {
  result: GeneratedPdfResult;
  config: JpgToPdfConfig;
  totalImages: number;
  onReset: () => void;
}

export function JpgResultsView({
  result,
  config,
  totalImages,
  onReset,
}: JpgResultsViewProps) {
  // In-Browser PDF Preview States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(result.pageCount || 1);
  const [previewZoom, setPreviewZoom] = useState(1.0);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Initialize PDF.js preview from generated Blob
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      // If separate files packaged in ZIP, we might not preview individual PDF directly,
      // or we can preview the first separate PDF if available!
      let targetBlob = result.blob;
      if (result.separateFiles && result.separateFiles.length > 0) {
        targetBlob = result.separateFiles[0].blob;
      }

      try {
        setIsLoadingPreview(true);
        setPreviewError(null);
        const arrayBuffer = await targetBlob.arrayBuffer();
        const doc = await getPdfDocument(arrayBuffer);
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        await renderPage(doc, 1, previewZoom);
      } catch (err: any) {
        if (!isCancelled) {
          setPreviewError('Preview unavailable, but your PDF file is ready to download.');
        }
      } finally {
        if (!isCancelled) setIsLoadingPreview(false);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [result]);

  // Render a specific page to canvas
  const renderPage = async (doc: any, pageNum: number, zoom: number) => {
    if (!doc || !canvasRef.current) return;

    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom * 1.25 });

      const canvas = canvasRef.current;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      if (typeof page.cleanup === 'function') page.cleanup();
    } catch {
      // Silently handle render cancel
    }
  };

  // Re-render when page or zoom changes
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage, previewZoom);
    }
  }, [currentPage, previewZoom]);

  const handleDownload = () => {
    downloadFileBlob(result.blob, result.filename);
  };

  const isZip = result.filename.toLowerCase().endsWith('.zip');

  return (
    <div className="space-y-6">
      {/* 1. Success Summary Card (Section 25) */}
      <div className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            PDF Created Successfully
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {totalImages} {totalImages === 1 ? 'image' : 'images'} converted • {result.pageCount}{' '}
            {result.pageCount === 1 ? 'page' : 'pages'} created
          </p>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">File Size</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatFileSize(result.size)}
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">Pages</div>
            <div className="text-lg font-bold text-[#5722AF] dark:text-[#9B6BE8] font-mono">
              {result.pageCount}
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">Page Size</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-white uppercase font-mono">
              {config.pageSize}
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">Status</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              Ready
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg transition-all cursor-pointer"
          >
            {isZip ? <FileArchive className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>
              {isZip ? 'Download All as ZIP' : 'Download PDF'} ({formatFileSize(result.size)})
            </span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-sm transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Create Another PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive In-Browser PDF Preview (Section 26) */}
      <div className="bg-white dark:bg-zinc-900/80 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs space-y-4">
        {/* Preview Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
              Document Preview
            </h3>
            {result.separateFiles && (
              <span className="text-[11px] text-zinc-400">
                (Previewing first document: {result.separateFiles[0]?.filename})
              </span>
            )}
          </div>

          {/* Navigation and Zoom Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* First Page */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next Page */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1 hidden sm:block" />

            {/* Zoom Controls */}
            <button
              type="button"
              disabled={previewZoom <= 0.5}
              onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors hidden sm:inline-flex"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              {Math.round(previewZoom * 100)}%
            </span>

            <button
              type="button"
              disabled={previewZoom >= 2.5}
              onClick={() => setPreviewZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors hidden sm:inline-flex"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Render Canvas Container */}
        <div className="p-4 sm:p-6 bg-zinc-100 dark:bg-zinc-950/70 rounded-2xl flex items-center justify-center min-h-[400px] overflow-auto border border-zinc-200/60 dark:border-zinc-800">
          {isLoadingPreview && (
            <div className="text-center space-y-2 text-zinc-400">
              <div className="w-8 h-8 border-2 border-[#5722AF] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Rendering PDF preview...</p>
            </div>
          )}

          {previewError && !isLoadingPreview && (
            <div className="text-center text-xs text-zinc-400">
              <p>{previewError}</p>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className={`max-w-full rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 bg-white transition-opacity duration-200 ${
              isLoadingPreview || previewError ? 'hidden' : 'block'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
