'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ResizeConfig,
  ResizeFileItem,
  ResizeBatchStats,
} from '@/lib/resizerTypes';
import {
  parseFileName,
  formatBytes,
  getImageDimensions,
} from '@/lib/renameEngine';
import {
  computeTargetDimensions,
  formatAspectRatio,
  resizeSingleImageItem,
  generateResizedFilename,
  estimateResizedFileSize,
} from '@/lib/resizerEngine';
import { downloadFilesAsZip } from '@/lib/zipUtils';
import { loadImage, detectTransparency, deduplicateFilenames } from '@/lib/conversionEngine';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { UploadZone } from '@/components/UploadZone';
import { ToastContainer } from '@/components/Toast';
import { ToastInfo } from '@/lib/types';
import { HelpModal } from '@/components/HelpModal';
import { PrivacySection } from '@/components/PrivacySection';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';

// Resizer specific components
import { ResizerHero } from '@/components/resizer/ResizerHero';
import { ModeSelector, ConverterMode } from '@/components/converter/ModeSelector';
import { ResizeControls } from '@/components/resizer/ResizeControls';
import { SingleResizeView } from '@/components/resizer/SingleResizeView';
import { BulkResizeView } from '@/components/resizer/BulkResizeView';
import { ResizerFAQ } from '@/components/resizer/ResizerFAQ';
import { ResizerSEO } from '@/components/resizer/ResizerSEO';
import { Plus, Images, Maximize2, X } from 'lucide-react';

const DEFAULT_RESIZE_CONFIG: ResizeConfig = {
  mode: 'exact',
  unit: 'px',
  width: 1280,
  height: 720,
  maintainAspectRatio: true,
  percentage: 100,
  longestSide: 1920,
  shortestSide: 1080,
  doNotUpscale: false,
  orientation: 'original',
  cropPosition: 'center',
  rotate: 0,
  flipH: false,
  flipV: false,
  outputFormat: 'original',
  quality: 90,
  backgroundColor: '#FFFFFF',
  removeMetadata: true,
  naming: {
    mode: 'suffix',
    prefix: '',
    suffix: '-resized',
    customName: '',
    startNumber: 1,
    numberPadding: 3,
  },
};

export default function ResizerPage() {
  const [mode, setMode] = useState<ConverterMode>('single');
  const [items, setItems] = useState<ResizeFileItem[]>([]);
  const [config, setConfig] = useState<ResizeConfig>(DEFAULT_RESIZE_CONFIG);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Batch execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const cancelRequestedRef = useRef(false);

  // Modal preview for item in bulk table
  const [previewModalItem, setPreviewModalItem] = useState<ResizeFileItem | null>(null);

  // Toast helper
  const showToast = useCallback((toast: Omit<ToastInfo, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastInfo = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Clipboard Paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        handleFilesSelected(files);
        showToast({
          type: 'success',
          title: 'Pasted from Clipboard',
          message: `Loaded ${files.length} image${files.length > 1 ? 's' : ''} from clipboard.`,
        });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [items]);

  // Handle uploaded or dropped files
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const newItems: ResizeFileItem[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const { baseName, extension } = parseFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      const id = `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`;

      const item: ResizeFileItem = {
        id,
        file,
        previewUrl,
        originalName: file.name,
        originalBaseName: baseName,
        originalExtension: extension || 'png',
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        originalRatio: '16:9',
        originalFormat: extension || file.type.replace('image/', ''),
        hasTransparency: false,
        targetWidth: config.width,
        targetHeight: config.height,
        targetName: `${baseName}-resized.${extension || 'png'}`,
        status: 'idle',
        selected: false,
      };

      newItems.push(item);

      // Async fetch dimensions and alpha channel
      getImageDimensions(previewUrl).then(async (dims) => {
        let hasAlpha = false;
        try {
          const img = await loadImage(previewUrl);
          hasAlpha = detectTransparency(img);
        } catch (e) {}

        const ratioStr = formatAspectRatio(dims.width, dims.height);
        const { width: tw, height: th } = computeTargetDimensions(
          dims.width,
          dims.height,
          config
        );
        const estSize = estimateResizedFileSize(
          dims.width,
          dims.height,
          tw,
          th,
          file.size,
          config
        );

        setItems((current) =>
          current.map((it) =>
            it.id === id
              ? {
                  ...it,
                  originalWidth: dims.width,
                  originalHeight: dims.height,
                  originalRatio: ratioStr,
                  targetWidth: tw,
                  targetHeight: th,
                  estimatedSize: estSize,
                  hasTransparency: hasAlpha,
                }
              : it
          )
        );

        // If this is the first image in single mode, sync initial config width/height with original
        if (items.length === 0 && i === 0 && config.width === 1280 && config.height === 720) {
          setConfig((prev) => ({
            ...prev,
            width: dims.width,
            height: dims.height,
          }));
        }
      });
    }

    if (mode === 'single' && (items.length > 0 || newFiles.length > 1)) {
      setMode('bulk');
    }

    setItems((prev) => [...prev, ...newItems]);
    showToast({
      type: 'success',
      title: 'Images Ready',
      message: `Loaded ${newFiles.length} image${newFiles.length > 1 ? 's' : ''} for resizing.`,
    });
  };

  // Keep target dimensions and estimated size updated whenever config changes
  useEffect(() => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.originalWidth && it.originalHeight) {
          const { width: tw, height: th } = computeTargetDimensions(
            it.originalWidth,
            it.originalHeight,
            config
          );
          const estSize = estimateResizedFileSize(
            it.originalWidth,
            it.originalHeight,
            tw,
            th,
            it.originalSize,
            config
          );
          return {
            ...it,
            targetWidth: tw,
            targetHeight: th,
            estimatedSize: estSize,
          };
        }
        return it;
      })
    );
  }, [config]);

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.resizedUrl) URL.revokeObjectURL(target.resizedUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  // Remove selected items
  const handleRemoveSelected = () => {
    const count = items.filter((it) => it.selected).length;
    if (count === 0) return;

    setItems((prev) => {
      prev.forEach((it) => {
        if (it.selected) {
          URL.revokeObjectURL(it.previewUrl);
          if (it.resizedUrl) URL.revokeObjectURL(it.resizedUrl);
        }
      });
      return prev.filter((it) => !it.selected);
    });

    showToast({
      type: 'info',
      title: 'Removed',
      message: `Removed ${count} selected images.`,
    });
  };

  // Clear all items
  const handleClearAll = () => {
    items.forEach((it) => {
      URL.revokeObjectURL(it.previewUrl);
      if (it.resizedUrl) URL.revokeObjectURL(it.resizedUrl);
    });
    setItems([]);
    showToast({
      type: 'info',
      title: 'Cleared',
      message: 'Workspace cleared.',
    });
  };

  // Reorder items
  const handleReorder = (startIndex: number, endIndex: number) => {
    const updated = Array.from(items);
    const [moved] = updated.splice(startIndex, 1);
    updated.splice(endIndex, 0, moved);
    setItems(updated);
  };

  // Sort items
  const handleSort = (type: 'name' | 'size' | 'dimensions') => {
    const sorted = [...items].sort((a, b) => {
      if (type === 'name') {
        return a.originalName.localeCompare(b.originalName, undefined, {
          numeric: true,
        });
      }
      if (type === 'size') {
        return b.originalSize - a.originalSize;
      }
      if (type === 'dimensions') {
        return (
          b.originalWidth * b.originalHeight - a.originalWidth * a.originalHeight
        );
      }
      return 0;
    });
    setItems(sorted);
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = items.length > 0 && items.every((it) => it.selected);
    setItems((prev) => prev.map((it) => ({ ...it, selected: !allSelected })));
  };

  // Single Image Resize
  const handleResizeSingle = async () => {
    if (items.length === 0) return;
    const target = items[0];

    try {
      setIsProcessing(true);
      const res = await resizeSingleImageItem(target, config, 0);

      setItems((prev) =>
        prev.map((it) =>
          it.id === target.id
            ? {
                ...it,
                status: 'completed',
                resizedBlob: res.blob,
                resizedUrl: res.url,
                resizedSize: res.size,
                actualWidth: res.width,
                actualHeight: res.height,
                wasUpscaleSkipped: res.wasUpscaleSkipped,
                targetName: res.targetName,
              }
            : it
        )
      );

      showToast({
        type: 'success',
        title: 'Resize Complete',
        message: `Image resized to ${res.width} × ${res.height} px (${formatBytes(res.size)}).`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Resize Failed',
        message: err?.message || 'Failed to resize image in browser.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk Image Resize Queue
  const handleResizeAll = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    cancelRequestedRef.current = false;
    setProgressPercent(0);
    setCompletedCount(0);
    setFailedCount(0);

    const updated = [...items];
    const rawNames = updated.map((it, idx) =>
      generateResizedFilename(it, idx, config)
    );
    const uniqueNames = deduplicateFilenames(rawNames);

    let localCompleted = 0;
    let localFailed = 0;

    for (let i = 0; i < updated.length; i++) {
      if (cancelRequestedRef.current) {
        showToast({
          type: 'warning',
          title: 'Cancelled',
          message: 'Resize batch stopped by user.',
        });
        break;
      }

      const it = updated[i];
      it.status = 'processing';
      setItems([...updated]);

      try {
        const res = await resizeSingleImageItem(it, config, i);
        it.status = 'completed';
        it.resizedBlob = res.blob;
        it.resizedUrl = res.url;
        it.resizedSize = res.size;
        it.actualWidth = res.width;
        it.actualHeight = res.height;
        it.wasUpscaleSkipped = res.wasUpscaleSkipped;
        it.targetName = uniqueNames[i];
        localCompleted++;
      } catch (err: any) {
        it.status = 'error';
        it.errorMessage = err?.message || 'Resize failed';
        localFailed++;
      }

      setCompletedCount(localCompleted);
      setFailedCount(localFailed);
      setProgressPercent(Math.round(((i + 1) / updated.length) * 100));
      setItems([...updated]);
    }

    setIsProcessing(false);

    if (localCompleted > 0) {
      showToast({
        type: 'success',
        title: 'Batch Complete',
        message: `Successfully resized ${localCompleted} of ${updated.length} images.`,
      });
    }
  };

  const handleCancelResize = () => {
    cancelRequestedRef.current = true;
  };

  // Download single image
  const handleDownloadSingle = (item: ResizeFileItem) => {
    const url = item.resizedUrl || item.previewUrl;
    const name = item.targetName || item.originalName;
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all completed as ZIP
  const handleDownloadZip = async (zipFilename: string) => {
    const completed = items.filter((it) => it.status === 'completed' && it.resizedBlob);
    if (completed.length === 0) {
      showToast({
        type: 'warning',
        title: 'Nothing to Download',
        message: 'Please resize images before downloading.',
      });
      return;
    }

    try {
      showToast({
        type: 'info',
        title: 'Creating ZIP Archive',
        message: `Packaging ${completed.length} resized images...`,
      });

      const zipItems = completed.map((it) => ({
        file: it.resizedBlob || it.file,
        newName: it.targetName,
      }));

      await downloadFilesAsZip(zipItems as any, `${zipFilename}.zip`);

      showToast({
        type: 'success',
        title: 'Download Complete',
        message: `ZIP archive saved successfully.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'ZIP Failed',
        message: err?.message || 'Could not package ZIP archive.',
      });
    }
  };

  // Download selected completed as ZIP
  const handleDownloadSelected = async (zipFilename: string) => {
    const selectedCompleted = items.filter(
      (it) => it.selected && it.status === 'completed' && it.resizedBlob
    );

    if (selectedCompleted.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Completed Selection',
        message: 'Please select resized images to download.',
      });
      return;
    }

    try {
      const zipItems = selectedCompleted.map((it) => ({
        file: it.resizedBlob || it.file,
        newName: it.targetName,
      }));

      await downloadFilesAsZip(zipItems as any, `${zipFilename}.zip`);

      showToast({
        type: 'success',
        title: 'Download Complete',
        message: `Saved ${selectedCompleted.length} selected images in ZIP.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: err?.message || 'Failed to download selected items.',
      });
    }
  };

  // Batch stats
  const stats: ResizeBatchStats = useMemo(() => {
    const completed = items.filter((it) => it.status === 'completed');
    const originalTotalBytes = items.reduce((acc, it) => acc + it.originalSize, 0);
    const outputTotalBytes = completed.reduce(
      (acc, it) => acc + (it.resizedSize || it.originalSize),
      0
    );
    const spaceSavedBytes = originalTotalBytes - outputTotalBytes;
    const totalReductionPercent =
      originalTotalBytes > 0
        ? Math.round((spaceSavedBytes / originalTotalBytes) * 100)
        : 0;

    const avgOrigW =
      items.length > 0
        ? Math.round(items.reduce((acc, it) => acc + (it.originalWidth || 0), 0) / items.length)
        : 0;
    const avgOrigH =
      items.length > 0
        ? Math.round(items.reduce((acc, it) => acc + (it.originalHeight || 0), 0) / items.length)
        : 0;
    const avgOutW =
      completed.length > 0
        ? Math.round(completed.reduce((acc, it) => acc + (it.actualWidth || 0), 0) / completed.length)
        : 0;
    const avgOutH =
      completed.length > 0
        ? Math.round(completed.reduce((acc, it) => acc + (it.actualHeight || 0), 0) / completed.length)
        : 0;

    return {
      totalFiles: items.length,
      completedFiles: completed.length,
      failedFiles: items.filter((it) => it.status === 'error').length,
      avgOriginalWidth: avgOrigW,
      avgOriginalHeight: avgOrigH,
      avgOutputWidth: avgOutW,
      avgOutputHeight: avgOutH,
      originalTotalBytes,
      outputTotalBytes,
      spaceSavedBytes,
      totalReductionPercent,
    };
  }, [items]);

  // Primary active item for single mode preview
  const singleItem = items[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Header
        activeToolName="Image Resize"
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="resizer"
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ResizerHero />

        {/* Mode Selector */}
        <div className="flex justify-center">
          <ModeSelector
            mode={mode}
            onChange={(m) => {
              setMode(m);
              if (m === 'single' && items.length > 1) {
                showToast({
                  type: 'info',
                  title: 'Single Mode',
                  message: 'Editing the primary image. Switch to Bulk to view all images.',
                });
              }
            }}
            fileCount={items.length}
          />
        </div>

        {/* Upload Zone (or Add More bar when files exist) */}
        {items.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
                <Images className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900 dark:text-white">
                  {items.length} Image{items.length > 1 ? 's' : ''} Loaded
                </div>
                <div className="text-xs text-zinc-400">
                  Total: {formatBytes(items.reduce((acc, it) => acc + it.originalSize, 0))}
                </div>
              </div>
            </div>

            <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#131722] border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Plus className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Add More Files</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFilesSelected(Array.from(e.target.files));
                    e.target.value = '';
                  }
                }}
                className="sr-only"
              />
            </label>
          </div>
        )}

        {/* Workspace Layout when images exist */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Main Workspace Column */}
            <div className="lg:col-span-8 space-y-6">
              {mode === 'single' && singleItem ? (
                <SingleResizeView
                  item={singleItem}
                  config={config}
                  onResize={handleResizeSingle}
                  onDownload={() => handleDownloadSingle(singleItem)}
                  onRemove={() => handleRemoveItem(singleItem.id)}
                  onUpdateConfig={(k, v) => setConfig((prev) => ({ ...prev, [k]: v }))}
                  isProcessing={isProcessing}
                />
              ) : (
                <BulkResizeView
                  items={items}
                  config={config}
                  onResizeAll={handleResizeAll}
                  onCancelResize={handleCancelResize}
                  onDownloadZip={handleDownloadZip}
                  onDownloadSingle={handleDownloadSingle}
                  onDownloadSelected={handleDownloadSelected}
                  onRemoveItem={handleRemoveItem}
                  onRemoveSelected={handleRemoveSelected}
                  onClearAll={handleClearAll}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onReorder={handleReorder}
                  onSort={handleSort}
                  onPreviewItem={(it) => setPreviewModalItem(it)}
                  isProcessing={isProcessing}
                  progressPercent={progressPercent}
                  completedCount={completedCount}
                  failedCount={failedCount}
                  stats={stats}
                />
              )}
            </div>

            {/* Right Controls Sidebar */}
            <div className="lg:col-span-4 sticky top-24">
              <ResizeControls
                config={config}
                onChange={(c) => setConfig(c)}
                originalWidth={singleItem?.originalWidth || 1920}
                originalHeight={singleItem?.originalHeight || 1080}
                originalRatioStr={singleItem?.originalRatio || '16:9'}
                hasTransparency={items.some((it) => it.hasTransparency)}
              />
            </div>
          </div>
        )}

        {/* Informational Sections */}
        <HowItWorks />
        <PrivacySection />
        <ResizerFAQ />
        <ResizerSEO />
      </main>

      <Footer />

      {/* Modal for previewing an image from bulk table */}
      {previewModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131722] rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-zinc-900 dark:text-white truncate max-w-md">
                  {previewModalItem.originalName}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Original: {previewModalItem.originalWidth} × {previewModalItem.originalHeight} px &bull;{' '}
                  {formatBytes(previewModalItem.originalSize)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-80 rounded-2xl bg-zinc-100 dark:bg-[#0c0e14] overflow-hidden flex items-center justify-center p-2 border border-zinc-200 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalItem.resizedUrl || previewModalItem.previewUrl}
                alt={previewModalItem.originalName}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-zinc-500">
                Target: {previewModalItem.actualWidth || previewModalItem.targetWidth} ×{' '}
                {previewModalItem.actualHeight || previewModalItem.targetHeight} px
              </span>
              <button
                type="button"
                onClick={() => {
                  handleDownloadSingle(previewModalItem);
                  setPreviewModalItem(null);
                }}
                className="px-4 py-2 rounded-xl font-bold text-white bg-[#5722AF] hover:bg-[#7B45D1] transition-all cursor-pointer"
              >
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
