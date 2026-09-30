'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { parseVideosFromHtml, ExtractedVideo } from '@/lib/batch-video/htmlParser';
import { BatchQuickJump, BatchItemInfo } from '@/components/batch-video/BatchQuickJump';
import { VideoListTable } from '@/components/batch-video/VideoListTable';
import {
  Upload,
  FileCode,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  Film,
  Zap,
  ShieldCheck,
  FileCheck,
  FolderArchive,
  Info,
  Square,
} from 'lucide-react';
import {
  downloadBatchWithJSZip,
  BatchDownloadProgress,
} from '@/lib/batch-video/clientBatchDownloader';

export default function BatchVideoDownloaderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [htmlFileName, setHtmlFileName] = useState<string | null>(null);
  const [htmlFileSize, setHtmlFileSize] = useState<number | null>(null);
  const [videos, setVideos] = useState<ExtractedVideo[]>([]);
  const [batchSize, setBatchSize] = useState<number>(100);
  const [activeBatchIndex, setActiveBatchIndex] = useState<number>(1);
  const [completedBatches, setCompletedBatches] = useState<Set<number>>(new Set());
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [downloadingBatchIndex, setDownloadingBatchIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState<boolean>(true);
  const [namingMode, setNamingMode] = useState<'title' | 'pinId'>('title');
  const [downloadSpeed, setDownloadSpeed] = useState<number>(16);
  const [downloadProgress, setDownloadProgress] = useState<BatchDownloadProgress | null>(null);
  const [multiPartStatus, setMultiPartStatus] = useState<{ currentPart: number; totalParts: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Compute total batches
  const totalVideos = videos.length;
  const totalBatches = useMemo(() => {
    if (totalVideos === 0) return 0;
    return Math.ceil(totalVideos / batchSize);
  }, [totalVideos, batchSize]);

  // Dynamically formatted videos based on user's naming preference (Title vs Pin ID)
  const displayVideos = useMemo(() => {
    return videos.map((v) => ({
      ...v,
      filename: namingMode === 'title' ? v.filename : (v.originalFilename || v.filename),
    }));
  }, [videos, namingMode]);

  // Compute batch ranges and list for quick-jump
  const batchList: BatchItemInfo[] = useMemo(() => {
    if (totalVideos === 0) return [];
    const list: BatchItemInfo[] = [];

    for (let i = 1; i <= totalBatches; i++) {
      const startIdx = (i - 1) * batchSize + 1;
      const endIdx = Math.min(i * batchSize, totalVideos);
      list.push({
        index: i,
        startIdx,
        endIdx,
        count: endIdx - startIdx + 1,
        isCompleted: completedBatches.has(i),
        isDownloading: downloadingBatchIndex === i,
      });
    }

    return list;
  }, [totalVideos, totalBatches, batchSize, completedBatches, downloadingBatchIndex]);

  // Active batch range calculation
  const currentBatchInfo = useMemo(() => {
    if (totalVideos === 0 || activeBatchIndex <= 0) return null;
    const startIdx = (activeBatchIndex - 1) * batchSize + 1;
    const endIdx = Math.min(activeBatchIndex * batchSize, totalVideos);
    return {
      index: activeBatchIndex,
      startIdx,
      endIdx,
      count: endIdx - startIdx + 1,
      videos: displayVideos.slice(startIdx - 1, endIdx),
    };
  }, [displayVideos, activeBatchIndex, batchSize, totalVideos]);

  // Handle uploaded HTML file
  const handleFileUpload = (file: File) => {
    if (!file) return;

    setErrorMessage(null);
    setSuccessToast(null);

    const isHtml =
      file.type.includes('html') ||
      file.name.toLowerCase().endsWith('.html') ||
      file.name.toLowerCase().endsWith('.htm');

    if (!isHtml) {
      setErrorMessage('Please upload a valid .html or .htm file.');
      return;
    }

    setHtmlFileName(file.name);
    setHtmlFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setErrorMessage('Uploaded HTML file is empty.');
          return;
        }

        const parseResult = parseVideosFromHtml(text);
        if (parseResult.total === 0) {
          setErrorMessage(
            'No video cards found in this HTML file. Ensure it contains Pinterest video links (e.g. <a class="btn btn-red" href="..." download="...">).'
          );
          setVideos([]);
          return;
        }

        setVideos(parseResult.videos);
        setActiveBatchIndex(1);
        setCompletedBatches(new Set());
        setSuccessToast(`Extracted all ${parseResult.total} videos successfully (all preserved, zero skips)!`);
      } catch (err: any) {
        console.error('Error parsing HTML file:', err);
        setErrorMessage(`Failed to parse HTML file: ${err.message || 'Unknown error'}`);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read uploaded file.');
    };
    reader.readAsText(file);
  };

  // Stop / Cancel active download
  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDownloading(false);
    setIsDownloadingAll(false);
    setDownloadingBatchIndex(null);
    setDownloadProgress(null);
    setMultiPartStatus(null);
    setErrorMessage('Download was stopped by user.');
  };

  // Download a single batch by index using client-side JSZip
  const downloadBatch = async (batchIdxToDownload: number) => {
    if (isDownloading) return;
    if (batchIdxToDownload < 1 || batchIdxToDownload > totalBatches) return;

    const start = (batchIdxToDownload - 1) * batchSize;
    const end = Math.min(batchIdxToDownload * batchSize, totalVideos);
    const targetVideos = displayVideos.slice(start, end);

    if (targetVideos.length === 0) return;

    setIsDownloading(true);
    setDownloadingBatchIndex(batchIdxToDownload);
    setErrorMessage(null);
    setSuccessToast(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const safeName = htmlFileName
      ? htmlFileName.replace(/\.html?$/i, '').replace(/[^a-zA-Z0-9._-]/g, '_')
      : 'pinterest_videos';
    const zipFilename = `${safeName}_batch_${batchIdxToDownload}_(${start + 1}-${end}).zip`;

    try {
      const result = await downloadBatchWithJSZip({
        videos: targetVideos.map((v) => ({
          url: v.url,
          filename: v.filename,
        })),
        zipFilename,
        concurrency: downloadSpeed,
        signal: controller.signal,
        onProgress: (p) => setDownloadProgress(p),
      });

      if (!result.success) {
        if (controller.signal.aborted) return;
        throw new Error(result.error || 'Failed to package ZIP file.');
      }

      // Record batch completion
      setCompletedBatches((prev) => {
        const updated = new Set(prev);
        updated.add(batchIdxToDownload);
        return updated;
      });

      const nextBatchIndex = batchIdxToDownload + 1;
      const isLastBatch = batchIdxToDownload >= totalBatches;

      if (!isLastBatch && autoAdvanceEnabled) {
        setActiveBatchIndex(nextBatchIndex);
        setSuccessToast(
          `Batch #${batchIdxToDownload} saved! Automatically advanced to Batch #${nextBatchIndex}.`
        );
      } else if (isLastBatch) {
        setSuccessToast(`Batch #${batchIdxToDownload} saved! All batches are now complete! 🎉`);
      } else {
        setSuccessToast(`Batch #${batchIdxToDownload} downloaded successfully!`);
      }
    } catch (err: any) {
      if (controller.signal.aborted) return;
      console.error('Batch download error:', err);
      setErrorMessage(`Batch #${batchIdxToDownload} failed: ${err.message || 'Unknown network error'}`);
    } finally {
      setIsDownloading(false);
      setDownloadingBatchIndex(null);
      setDownloadProgress(null);
      abortControllerRef.current = null;
    }
  };

  // Download all videos: 1 ZIP if single batch, or sequential multi-part ZIPs if large collection
  const downloadAllVideos = async () => {
    if (isDownloading || totalVideos === 0) return;

    setIsDownloading(true);
    setIsDownloadingAll(true);
    setErrorMessage(null);
    setSuccessToast(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const safeName = htmlFileName
      ? htmlFileName.replace(/\.html?$/i, '').replace(/[^a-zA-Z0-9._-]/g, '_')
      : 'pinterest_videos';

    try {
      if (totalBatches <= 1) {
        // Fits into a single ZIP archive
        setMultiPartStatus(null);
        const zipFilename = `${safeName}_all_${totalVideos}_videos.zip`;
        const result = await downloadBatchWithJSZip({
          videos: displayVideos.map((v) => ({
            url: v.url,
            filename: v.filename,
          })),
          zipFilename,
          concurrency: downloadSpeed,
          signal: controller.signal,
          onProgress: (p) => setDownloadProgress(p),
        });

        if (!result.success) {
          if (controller.signal.aborted) return;
          throw new Error(result.error || 'Failed to package ZIP archive.');
        }

        const allDone = new Set<number>();
        allDone.add(1);
        setCompletedBatches(allDone);
        setSuccessToast(`All ${totalVideos} videos downloaded successfully in a single verified ZIP! 🎉`);
      } else {
        // Multi-Part sequential downloader for large video collections (e.g. 200 - 1,380+ videos)
        // Downloads Part 1, Part 2, ... automatically without hitting Vercel timeouts or browser memory limits
        const allDone = new Set<number>(completedBatches);

        for (let batchIdx = 1; batchIdx <= totalBatches; batchIdx++) {
          if (controller.signal.aborted) break;

          setMultiPartStatus({ currentPart: batchIdx, totalParts: totalBatches });
          setActiveBatchIndex(batchIdx);

          const start = (batchIdx - 1) * batchSize;
          const end = Math.min(batchIdx * batchSize, totalVideos);
          const targetVideos = displayVideos.slice(start, end);

          const partFilename = `${safeName}_part_${batchIdx}_of_${totalBatches}_(${start + 1}-${end}).zip`;

          const result = await downloadBatchWithJSZip({
            videos: targetVideos.map((v) => ({
              url: v.url,
              filename: v.filename,
            })),
            zipFilename: partFilename,
            concurrency: downloadSpeed,
            signal: controller.signal,
            onProgress: (p) => setDownloadProgress(p),
          });

          if (!result.success) {
            if (controller.signal.aborted) break;
            throw new Error(`Part #${batchIdx} failed: ${result.error || 'Unknown error'}`);
          }

          allDone.add(batchIdx);
          setCompletedBatches(new Set(allDone));

          // Instant progression between parts
          await new Promise((r) => setTimeout(r, 100));
        }

        if (!controller.signal.aborted) {
          setSuccessToast(
            `All ${totalVideos} videos saved successfully across ${totalBatches} verified ZIP files! 🎉`
          );
        }
      }
    } catch (err: any) {
      if (controller.signal.aborted) return;
      console.error('Download all error:', err);
      setErrorMessage(`Download all failed: ${err.message || 'Unknown network error'}`);
    } finally {
      setIsDownloading(false);
      setIsDownloadingAll(false);
      setDownloadProgress(null);
      setMultiPartStatus(null);
      abortControllerRef.current = null;
    }
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDownloading(false);
    setIsDownloadingAll(false);
    setDownloadingBatchIndex(null);
    setDownloadProgress(null);
    setMultiPartStatus(null);
    setVideos([]);
    setHtmlFileName(null);
    setHtmlFileSize(null);
    setActiveBatchIndex(1);
    setCompletedBatches(new Set());
    setErrorMessage(null);
    setSuccessToast(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Batch Video Downloader"
        onOpenHelp={() => {}}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="batch-video-downloader"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 text-xs font-bold ring-1 ring-[#5722AF]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HTML & Pinterest Video Extraction Tool</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Batch Video Downloader
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Upload an HTML file with Pinterest video cards to parse hundreds of video links at once.
            Download in clean sequential ZIP archives with server-side CORS bypass.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Server-Side CORS Bypass</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 text-[#5722AF]" />
              <span>Auto-Advancing Batches</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
              <FolderArchive className="w-3.5 h-3.5 text-blue-500" />
              <span>Direct ZIP Streaming</span>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-200 flex items-start gap-3 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-600 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {successToast && (
          <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-200 flex items-start gap-3 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            <div className="flex-1">{successToast}</div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-400 hover:text-emerald-600 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Card */}
        {videos.length === 0 ? (
          <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm text-center">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-[#9B6BE8] rounded-2xl p-8 sm:p-12 cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-900/30 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <Upload className="w-8 h-8" />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Upload Saved HTML File
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-4">
                Drag and drop your saved HTML file containing Pinterest video download cards, or click to browse.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5722AF] hover:bg-[#682BC9] text-white text-xs font-semibold shadow-sm transition-colors">
                <FileCode className="w-4 h-4" />
                <span>Select HTML File</span>
              </div>
            </div>

            {/* Target Element Specification Notice */}
            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-left bg-zinc-50/70 dark:bg-zinc-800/40 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#5722AF] mt-0.5 shrink-0" />
                <div className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-300">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Supported Pinterest Element Structure:
                  </div>
                  <code className="block bg-zinc-900 text-zinc-200 dark:bg-black p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                    {`<a class="btn btn-red" href="https://v1.pinimg.com/videos/..." download="video_123.mp4">`}
                  </code>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    The parser also supports generic video download anchors, direct .mp4 links, and &lt;video&gt; source tags.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Processing Workspace */
          <div className="space-y-6">
            {/* Top Telemetry & File Status Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
                      {htmlFileName || 'Uploaded HTML'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 border border-[#5722AF]/20">
                      {totalVideos} Videos Found
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      All Videos Included (No Skips)
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3 mt-1">
                    <span>Size: {htmlFileSize ? (htmlFileSize / 1024).toFixed(1) + ' KB' : 'N/A'}</span>
                    <span>•</span>
                    <span>Total Batches: {totalBatches}</span>
                    <span>•</span>
                    <span>
                      Completed: {completedBatches.size} of {totalBatches}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Upload Different File</span>
                </button>
              </div>
            </div>

            {/* Main Action & Batch Configuration Card */}
            <div className="bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-zinc-900 dark:via-purple-950/10 dark:to-zinc-900 border border-purple-200/80 dark:border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-6">
                <div>
                  <span className="text-xs font-bold text-[#5722AF] dark:text-[#B68BFF] uppercase tracking-wider">
                    Sequential Batch Processor
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    Batch #{activeBatchIndex} of {totalBatches}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {currentBatchInfo ? (
                      <>
                        Covers videos <strong>#{currentBatchInfo.startIdx}</strong> to{' '}
                        <strong>#{currentBatchInfo.endIdx}</strong> ({currentBatchInfo.count} videos)
                      </>
                    ) : null}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                  {/* File Naming Mode Selector */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                    <span className="text-[11px] font-bold text-zinc-500 pl-2">Name By:</span>
                    <button
                      type="button"
                      onClick={() => setNamingMode('title')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        namingMode === 'title'
                          ? 'bg-[#5722AF] text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                      title="Name MP4 video file from pin's title text"
                    >
                      Title Text (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNamingMode('pinId')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        namingMode === 'pinId'
                          ? 'bg-[#5722AF] text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                      title="Name MP4 video file using numeric Pin ID"
                    >
                      Pin ID
                    </button>
                  </div>

                  {/* Batch Size Selector */}
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                    <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-zinc-500">
                      <Sliders className="w-3.5 h-3.5 text-[#5722AF]" />
                      <span>Batch:</span>
                    </div>
                    {[25, 50, 100, 200].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        disabled={isDownloading}
                        onClick={() => {
                          setBatchSize(sz);
                          setActiveBatchIndex(1);
                          setCompletedBatches(new Set());
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          batchSize === sz && batchSize < totalVideos
                            ? 'bg-[#5722AF] text-white shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => {
                        setBatchSize(totalVideos || 10000);
                        setActiveBatchIndex(1);
                        setCompletedBatches(new Set());
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        batchSize >= totalVideos && totalVideos > 0
                          ? 'bg-[#5722AF] text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                      title="Show all videos in one single batch"
                    >
                      All ({totalVideos})
                    </button>
                  </div>

                  {/* Turbo Speed Selector */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                    <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-zinc-500">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Speed:</span>
                    </div>
                    {[
                      { label: 'Turbo (16x)', value: 16 },
                      { label: 'Fast (10x)', value: 10 },
                    ].map((sp) => (
                      <button
                        key={sp.value}
                        type="button"
                        disabled={isDownloading}
                        onClick={() => setDownloadSpeed(sp.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          downloadSpeed === sp.value
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                        title={`${sp.value} parallel connections`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Overall Download Progress ({completedBatches.size} / {totalBatches} Batches Saved)
                  </span>
                  <span className="text-[#5722AF] dark:text-[#B68BFF]">
                    {totalBatches > 0
                      ? Math.round((completedBatches.size / totalBatches) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5722AF] to-[#8C52FF] transition-all duration-300 rounded-full"
                    style={{
                      width: `${
                        totalBatches > 0
                          ? (completedBatches.size / totalBatches) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={autoAdvanceEnabled}
                      onChange={(e) => setAutoAdvanceEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
                    />
                    <span>Auto-advance to next batch when download completes</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Download All Videos in 1 ZIP or Sequential Parts */}
                  <button
                    type="button"
                    disabled={isDownloading || totalVideos === 0}
                    onClick={downloadAllVideos}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                    title={
                      totalBatches > 1
                        ? `Download all ${totalVideos} videos sequentially in ${totalBatches} verified ZIP files`
                        : 'Download all videos in one single verified ZIP file'
                    }
                  >
                    {isDownloadingAll ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>
                          {multiPartStatus
                            ? `Part ${multiPartStatus.currentPart} of ${multiPartStatus.totalParts} (${downloadProgress?.percent || 0}%)...`
                            : `Downloading (${downloadProgress?.percent || 0}%)...`}
                        </span>
                      </>
                    ) : (
                      <>
                        <FolderArchive className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>
                          {totalBatches > 1
                            ? `Download All (${totalVideos} Videos in ${totalBatches} Parts)`
                            : `Download All (${totalVideos} Videos)`}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Download Active Batch Button */}
                  {currentBatchInfo && totalBatches > 1 && (
                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => downloadBatch(activeBatchIndex)}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#5722AF] hover:bg-[#682BC9] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                    >
                      {isDownloading && downloadingBatchIndex === activeBatchIndex ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>
                            Batch #{activeBatchIndex} ({downloadProgress?.percent || 0}%)...
                          </span>
                        </>
                      ) : completedBatches.has(activeBatchIndex) ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Re-download Batch #{activeBatchIndex} ({currentBatchInfo.startIdx}–{currentBatchInfo.endIdx})</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                          <span>
                            Download Batch #{activeBatchIndex} ({currentBatchInfo.startIdx}–{currentBatchInfo.endIdx})
                          </span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Advance to next batch manually */}
                  {activeBatchIndex < totalBatches && (
                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => setActiveBatchIndex((prev) => Math.min(prev + 1, totalBatches))}
                      className="px-4 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                      title="Skip / Jump to next batch"
                    >
                      <span>Next Batch</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Live Progress & Cancellation Card */}
              {isDownloading && (
                <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-3 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#5722AF] dark:text-purple-300">
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-[#5722AF]" />
                      <span>
                        {multiPartStatus
                          ? `Downloading Part ${multiPartStatus.currentPart} of ${multiPartStatus.totalParts} (Batch #${multiPartStatus.currentPart})...`
                          : isDownloadingAll
                          ? `Downloading all ${totalVideos} videos...`
                          : `Downloading Batch #${downloadingBatchIndex || activeBatchIndex}...`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {downloadProgress && (
                        <div className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                          {downloadProgress.completedVideos} / {downloadProgress.totalVideos} videos{' '}
                          {downloadProgress.totalBytesDownloaded > 0 &&
                            `(${(downloadProgress.totalBytesDownloaded / (1024 * 1024)).toFixed(1)} MB)`}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleCancelDownload}
                        className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Cancel active download"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-time Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-purple-200/50 dark:bg-purple-900/50 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5722AF] to-emerald-500 transition-all duration-200 rounded-full"
                      style={{
                        width: `${Math.max(5, downloadProgress ? downloadProgress.percent : 10)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    <span className="truncate pr-2">
                      {downloadProgress?.status === 'zipping'
                        ? 'Packaging verified ZIP archive (0 CPU, 100% integrity)...'
                        : downloadProgress?.currentVideoName
                        ? `Fetching: ${downloadProgress.currentVideoName}`
                        : 'Contacting video server...'}
                    </span>
                    <span className="font-bold text-[#5722AF] dark:text-purple-300 shrink-0">
                      {downloadProgress?.percent || 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Batch Quick Jump Navigator */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
              <BatchQuickJump
                batches={batchList}
                activeBatchIndex={activeBatchIndex}
                onSelectBatch={(idx) => setActiveBatchIndex(idx)}
                onDownloadBatch={(idx) => downloadBatch(idx)}
                isAnyDownloading={isDownloading}
              />
            </div>

            {/* Video List Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Video Items Preview
                  </h3>
                </div>
                <span className="text-xs text-zinc-400">
                  Total {videos.length} videos extracted from HTML
                </span>
              </div>

              <VideoListTable
                videos={displayVideos}
                batchSize={batchSize}
                activeBatchIndex={activeBatchIndex}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
