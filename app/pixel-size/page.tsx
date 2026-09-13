'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  PixelConfig,
  PixelFileItem,
  PixelBatchStats,
  PixelCustomOverride,
} from '@/lib/pixelTypes';
import {
  parseFileName,
  formatBytes,
  getImageDimensions,
} from '@/lib/renameEngine';
import {
  computePixelDimensions,
  formatAspectRatio,
  checkImageSafety,
  resizePixelItem,
  generatePixelFilename,
  estimateOutputSize,
} from '@/lib/pixelEngine';
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

// Pixel Resizer specific components
import { PixelHero } from '@/components/pixel/PixelHero';
import { ModeSelector, ConverterMode } from '@/components/converter/ModeSelector';
import { PixelControls } from '@/components/pixel/PixelControls';
import { SinglePixelView } from '@/components/pixel/SinglePixelView';
import { BulkPixelView } from '@/components/pixel/BulkPixelView';
import { PixelPerItemModal } from '@/components/pixel/PixelPerItemModal';
import { PixelFAQ } from '@/components/pixel/PixelFAQ';
import { PixelSEO } from '@/components/pixel/PixelSEO';
import { Plus, Images, X } from 'lucide-react';

const DEFAULT_PIXEL_CONFIG: PixelConfig = {
  width: 1920,
  height: 1080,
  maintainAspectRatio: true,
  mode: 'exact',
  percentage: 100,
  longestSide: 1920,
  shortestSide: 1080,
  doNotUpscale: true,
  orientation: 'original',
  cropPosition: 'center',
  rotate: 0,
  flipH: false,
  flipV: false,
  quality: 90,
  qualityPreset: 'high',
  outputFormat: 'original',
  backgroundColor: '#FFFFFF',
  removeMetadata: true,
  namingMode: 'dimensions',
  namingSuffix: '-resized',
  namingPrefix: 'resized-',
  customName: '',
};

export default function PixelSizePage() {
  const [mode, setMode] = useState<ConverterMode>('single');
  const [items, setItems] = useState<PixelFileItem[]>([]);
  const [config, setConfig] = useState<PixelConfig>(DEFAULT_PIXEL_CONFIG);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const cancelRequestedRef = useRef(false);

  // Modals state
  const [customModalItem, setCustomModalItem] = useState<PixelFileItem | null>(null);
  const [previewModalItem, setPreviewModalItem] = useState<PixelFileItem | null>(null);

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

  // Handle uploaded/dropped files
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const newItems: PixelFileItem[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const { baseName, extension } = parseFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      const id = `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`;

      const item: PixelFileItem = {
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
        targetName: `${baseName}-${config.width}x${config.height}.${extension || 'png'}`,
        status: 'idle',
        selected: false,
      };

      newItems.push(item);

      // Async fetch dimensions, ratio, transparency, and safety limits
      getImageDimensions(previewUrl).then(async (dims) => {
        let hasAlpha = false;
        try {
          const img = await loadImage(previewUrl);
          hasAlpha = detectTransparency(img);
        } catch (e) {}

        const ratioStr = formatAspectRatio(dims.width, dims.height);
        const safety = checkImageSafety(dims.width, dims.height, file.size);
        const { width: tw, height: th } = computePixelDimensions(
          dims.width,
          dims.height,
          config
        );
        const estSize = estimateOutputSize(
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
                  isExcessiveSize: safety.isExcessive,
                  safetyWarning: safety.warning,
                }
              : it
          )
        );

        // If this is the very first image loaded, synchronize default config with original dims
        if (items.length === 0 && i === 0 && config.width === 1920 && config.height === 1080) {
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
      message: `Loaded ${newFiles.length} image${newFiles.length > 1 ? 's' : ''} for pixel size changes.`,
    });
  };

  // Recompute target dimensions when global config changes
  useEffect(() => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.originalWidth && it.originalHeight) {
          const { width: tw, height: th } = computePixelDimensions(
            it.originalWidth,
            it.originalHeight,
            config,
            it.customOverride
          );
          const estSize = estimateOutputSize(
            it.originalWidth,
            it.originalHeight,
            tw,
            th,
            it.originalSize,
            config,
            it.customOverride
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
  const handleSort = (type: 'name' | 'width' | 'height' | 'size' | 'format') => {
    const sorted = [...items].sort((a, b) => {
      if (type === 'name') {
        return a.originalName.localeCompare(b.originalName, undefined, { numeric: true });
      }
      if (type === 'width') {
        return b.originalWidth - a.originalWidth;
      }
      if (type === 'height') {
        return b.originalHeight - a.originalHeight;
      }
      if (type === 'size') {
        return b.originalSize - a.originalSize;
      }
      if (type === 'format') {
        return a.originalFormat.localeCompare(b.originalFormat);
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

  // Save per-item custom override
  const handleSaveCustomOverride = (
    itemId: string,
    override: PixelCustomOverride | undefined
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const { width: tw, height: th } = computePixelDimensions(
            it.originalWidth,
            it.originalHeight,
            config,
            override
          );
          const estSize = estimateOutputSize(
            it.originalWidth,
            it.originalHeight,
            tw,
            th,
            it.originalSize,
            config,
            override
          );
          return {
            ...it,
            customOverride: override,
            targetWidth: tw,
            targetHeight: th,
            estimatedSize: estSize,
          };
        }
        return it;
      })
    );

    showToast({
      type: 'info',
      title: override ? 'Custom Settings Saved' : 'Reverted to Global',
      message: override ? 'Applied custom dimensions to this image.' : 'Reset to global settings.',
    });
  };

  // Single Image Resize
  const handleResizeSingle = async () => {
    if (items.length === 0) return;
    const target = items[0];

    try {
      setIsProcessing(true);
      const res = await resizePixelItem(target, config, 0);

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
        title: 'Pixel Resize Complete',
        message: `Image set to ${res.width} × ${res.height} px (${formatBytes(res.size)}).`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Resize Failed',
        message: err?.message || 'Could not resize image in browser.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk Image Resize Queue Pipeline
  const handleResizeAll = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    cancelRequestedRef.current = false;
    setProgressPercent(0);
    setCompletedCount(0);
    setFailedCount(0);

    const updated = [...items];
    const rawNames = updated.map((it, idx) =>
      generatePixelFilename(it, idx, config, it.targetWidth, it.targetHeight)
    );
    const uniqueNames = deduplicateFilenames(rawNames);

    let localCompleted = 0;
    let localFailed = 0;

    for (let i = 0; i < updated.length; i++) {
      if (cancelRequestedRef.current) {
        showToast({
          type: 'warning',
          title: 'Cancelled',
          message: 'Process halted by user.',
        });
        break;
      }

      const it = updated[i];
      it.status = 'processing';
      setItems([...updated]);

      try {
        const res = await resizePixelItem(it, config, i);
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

  // Single download
  const handleDownloadSingle = (item: PixelFileItem) => {
    const url = item.resizedUrl || item.previewUrl;
    const name = item.targetName || item.originalName;
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download All as ZIP
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
        message: `Packaging ${completed.length} images...`,
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

  // Download Selected as ZIP
  const handleDownloadSelected = async (zipFilename: string) => {
    const selectedCompleted = items.filter(
      (it) => it.selected && it.status === 'completed' && it.resizedBlob
    );

    if (selectedCompleted.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Selection',
        message: 'Please select completed images to download.',
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
  const stats: PixelBatchStats = useMemo(() => {
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

    return {
      totalFiles: items.length,
      completedFiles: completed.length,
      failedFiles: items.filter((it) => it.status === 'error').length,
      originalTotalBytes,
      outputTotalBytes,
      spaceSavedBytes,
      totalReductionPercent,
    };
  }, [items]);

  const singleItem = items[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Header
        activeToolName="Image Pixel Size Changer"
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="pixel-size"
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero */}
        <PixelHero />

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

        {/* Upload Zone */}
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

        {/* Main Workspace Layout when images exist */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Workspace (Single or Bulk View) */}
            <div className="lg:col-span-8 space-y-6">
              {mode === 'single' && singleItem ? (
                <SinglePixelView
                  item={singleItem}
                  config={config}
                  onResize={handleResizeSingle}
                  onDownload={() => handleDownloadSingle(singleItem)}
                  onRemove={() => handleRemoveItem(singleItem.id)}
                  onUpdateConfig={(k, v) => setConfig((prev) => ({ ...prev, [k]: v }))}
                  isProcessing={isProcessing}
                />
              ) : (
                <BulkPixelView
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
                  onOpenCustomSettings={(it) => setCustomModalItem(it)}
                  isProcessing={isProcessing}
                  progressPercent={progressPercent}
                  completedCount={completedCount}
                  failedCount={failedCount}
                  stats={stats}
                />
              )}
            </div>

            {/* Right Controls Panel */}
            <div className="lg:col-span-4 sticky top-24">
              <PixelControls
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

        {/* Informational & SEO sections */}
        <HowItWorks />
        <PrivacySection />
        <PixelFAQ />
        <PixelSEO />
      </main>

      <Footer />

      {/* Per-Item Custom Override Modal */}
      {customModalItem && (
        <PixelPerItemModal
          item={customModalItem}
          globalConfig={config}
          isOpen={Boolean(customModalItem)}
          onClose={() => setCustomModalItem(null)}
          onSave={(override) => handleSaveCustomOverride(customModalItem.id, override)}
        />
      )}

      {/* Thumbnail Preview Modal */}
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
