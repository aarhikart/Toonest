'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CompressFileItem,
  CompressionSettings,
  CompressionBatchStats,
} from '@/lib/compressorTypes';
import {
  parseFileName,
  formatBytes,
  getImageDimensions,
} from '@/lib/renameEngine';
import {
  compressSingleImageItem,
  generateCompressedFilename,
  resolveOutputFormat,
} from '@/lib/compressorEngine';
import { downloadFilesAsZip } from '@/lib/zipUtils';
import { deduplicateFilenames, loadImage, detectTransparency } from '@/lib/conversionEngine';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { UploadZone } from '@/components/UploadZone';
import { ToastContainer } from '@/components/Toast';
import { ToastInfo } from '@/lib/types';
import { HelpModal } from '@/components/HelpModal';
import { PrivacySection } from '@/components/PrivacySection';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';

// Compressor specific components
import { CompressorHero } from '@/components/compressor/CompressorHero';
import { ModeSelector, ConverterMode } from '@/components/converter/ModeSelector';
import { CompressionSettingsPanel } from '@/components/compressor/CompressionSettingsPanel';
import { SingleCompressView } from '@/components/compressor/SingleCompressView';
import { BulkCompressView } from '@/components/compressor/BulkCompressView';
import { CompressorFAQ } from '@/components/compressor/CompressorFAQ';
import { CompressorSEO } from '@/components/compressor/CompressorSEO';
import { Plus, Images, Minimize2 } from 'lucide-react';

const DEFAULT_COMPRESSION_SETTINGS: CompressionSettings = {
  preset: 'balanced',
  quality: 80,
  targetSize: 'none',
  outputFormat: 'original',
  skipIfLarger: true,
  minSavingsPercent: 0,
  preventExcessiveLoss: true,
  backgroundColor: '#FFFFFF',
  removeMetadata: true,
  resize: {
    enabled: false,
    maintainAspectRatio: true,
    preventUpscale: true,
  },
  naming: {
    mode: 'suffix',
    prefix: '',
    suffix: '-compressed',
    customName: '',
    startNumber: 1,
    numberPadding: 3,
  },
};

export default function CompressorPage() {
  const [mode, setMode] = useState<ConverterMode>('single');
  const [items, setItems] = useState<CompressFileItem[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>(
    DEFAULT_COMPRESSION_SETTINGS
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Compression execution state
  const [isCompressing, setIsCompressing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [cancelRequested, setCancelRequested] = useState(false);

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

  // Clipboard Paste support
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
          message: `Loaded ${files.length} image from clipboard.`,
        });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [items]);

  // Handle uploaded/dropped files
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const newItems: CompressFileItem[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const { baseName, extension } = parseFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      const id = `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`;

      const item: CompressFileItem = {
        id,
        file,
        previewUrl,
        originalName: file.name,
        originalBaseName: baseName,
        originalExtension: extension,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        originalFormat: extension || file.type.replace('image/', ''),
        hasTransparency: false,
        targetName: `${baseName}-compressed.${extension}`,
        outputFormat: resolveOutputFormat(extension, settings.outputFormat),
        status: 'idle',
        selected: false,
      };

      newItems.push(item);

      // Async dimensions and transparency
      getImageDimensions(previewUrl).then(async (dims) => {
        let hasAlpha = false;
        try {
          const img = await loadImage(previewUrl);
          hasAlpha = detectTransparency(img);
        } catch (e) {}

        setItems((current) =>
          current.map((it) =>
            it.id === id
              ? {
                  ...it,
                  originalWidth: dims.width,
                  originalHeight: dims.height,
                  hasTransparency: hasAlpha,
                }
              : it
          )
        );
      });
    }

    if (mode === 'single' && (items.length > 0 || newFiles.length > 1)) {
      setMode('bulk');
    }

    setItems((prev) => [...prev, ...newItems]);
    showToast({
      type: 'success',
      title: 'Images Ready',
      message: `Loaded ${newFiles.length} image${newFiles.length > 1 ? 's' : ''} for compression.`,
    });
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
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
          if (it.compressedUrl) URL.revokeObjectURL(it.compressedUrl);
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
      if (it.compressedUrl) URL.revokeObjectURL(it.compressedUrl);
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
  const handleSort = (type: 'name' | 'size' | 'format') => {
    const sorted = [...items].sort((a, b) => {
      if (type === 'name') {
        return a.originalName.localeCompare(b.originalName, undefined, {
          numeric: true,
        });
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

  // Single Image Compression
  const handleCompressSingle = async () => {
    if (items.length === 0) return;
    const target = items[0];

    try {
      setIsCompressing(true);
      const res = await compressSingleImageItem(target, settings, 0);

      setItems((prev) =>
        prev.map((it) =>
          it.id === target.id
            ? {
                ...it,
                status: res.wasSkipped ? 'skipped' : 'completed',
                compressedBlob: res.blob,
                compressedUrl: res.url,
                compressedSize: res.size,
                compressedWidth: res.width,
                compressedHeight: res.height,
                spaceSavedBytes: res.spaceSaved,
                reductionPercent: res.reductionPercent,
                isLargerThanOriginal: res.isLarger,
                wasSkipped: res.wasSkipped,
                actualQualityUsed: res.actualQuality,
                targetName: res.targetName,
              }
            : it
        )
      );

      if (res.wasSkipped) {
        showToast({
          type: 'warning',
          title: 'Preserved Original',
          message: 'The original file was already smaller than the compressed version.',
        });
      } else {
        showToast({
          type: 'success',
          title: 'Compression Complete',
          message: `Saved ${formatBytes(res.spaceSaved)} (${res.reductionPercent}% reduction).`,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Compression Failed',
        message: err?.message || 'Unable to compress this image in browser.',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  // Download Single Image
  const handleDownloadSingle = (item: CompressFileItem) => {
    const url = item.compressedUrl || item.previewUrl;
    const name = item.targetName || item.originalName;
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Original Image
  const handleDownloadOriginal = (item: CompressFileItem) => {
    const link = document.createElement('a');
    link.href = item.previewUrl;
    link.download = item.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Compression Queue Pipeline
  const handleCompressAll = async () => {
    if (items.length === 0) return;
    setIsCompressing(true);
    setCancelRequested(false);
    setProgressPercent(0);
    setCompletedCount(0);
    setFailedCount(0);

    const updated = [...items];
    const rawNames = updated.map((it, idx) =>
      generateCompressedFilename(it, idx, settings)
    );
    const uniqueNames = deduplicateFilenames(rawNames);

    let localCompleted = 0;
    let localFailed = 0;

    for (let i = 0; i < updated.length; i++) {
      if (cancelRequested) {
        showToast({
          type: 'warning',
          title: 'Cancelled',
          message: 'Compression process halted by user.',
        });
        break;
      }

      const it = updated[i];
      it.status = 'compressing';
      setItems([...updated]);

      try {
        const res = await compressSingleImageItem(it, settings, i);
        it.status = res.wasSkipped ? 'skipped' : 'completed';
        it.compressedBlob = res.blob;
        it.compressedUrl = res.url;
        it.compressedSize = res.size;
        it.compressedWidth = res.width;
        it.compressedHeight = res.height;
        it.spaceSavedBytes = res.spaceSaved;
        it.reductionPercent = res.reductionPercent;
        it.isLargerThanOriginal = res.isLarger;
        it.wasSkipped = res.wasSkipped;
        it.actualQualityUsed = res.actualQuality;
        it.targetName = uniqueNames[i];
        localCompleted++;
      } catch (err: any) {
        it.status = 'error';
        it.errorMessage = err?.message || 'Failed';
        localFailed++;
      }

      setCompletedCount(localCompleted);
      setFailedCount(localFailed);
      setProgressPercent(Math.round(((i + 1) / updated.length) * 100));
      setItems([...updated]);
    }

    setIsCompressing(false);
    showToast({
      type: 'success',
      title: 'Batch Complete',
      message: `Processed ${localCompleted} images (${localFailed} failed).`,
    });
  };

  // Download All as ZIP
  const handleDownloadZip = async (zipName: string, selectedOnly = false) => {
    const pool = selectedOnly
      ? items.filter((it) => it.selected)
      : items;

    const available = pool.filter(
      (it) => it.status === 'completed' || it.status === 'skipped'
    );
    if (available.length === 0) return;

    const zipPayload = available.map((it) => ({
      id: it.id,
      file: it.compressedBlob
        ? new File([it.compressedBlob], it.targetName, {
            type: it.compressedBlob.type,
          })
        : it.file,
      previewUrl: it.compressedUrl || it.previewUrl,
      originalName: it.originalName,
      originalBaseName: it.originalBaseName,
      extension: it.originalExtension,
      size: it.compressedSize || it.originalSize,
      lastModified: Date.now(),
      newName: it.targetName || it.originalName,
      status: 'ready' as const,
      selected: false,
    }));

    try {
      await downloadFilesAsZip(zipPayload, `${zipName}.zip`);
      showToast({
        type: 'success',
        title: 'ZIP Downloaded',
        message: `Saved ${available.length} images inside ${zipName}.zip.`,
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'ZIP Error',
        message: 'Could not create ZIP package.',
      });
    }
  };

  // Batch Statistics
  const stats: CompressionBatchStats = useMemo(() => {
    const completed = items.filter(
      (it) => it.status === 'completed' || it.status === 'skipped'
    );
    const skipped = items.filter((it) => it.status === 'skipped');
    const failed = items.filter((it) => it.status === 'error');

    const origTotal = completed.reduce((acc, it) => acc + it.originalSize, 0);
    const compTotal = completed.reduce(
      (acc, it) => acc + (it.compressedSize || it.originalSize),
      0
    );
    const saved = origTotal - compTotal;
    const pct =
      origTotal > 0 ? Math.round(Math.max(0, (saved / origTotal) * 100)) : 0;

    return {
      totalFiles: items.length,
      completedFiles: completed.length,
      skippedFiles: skipped.length,
      failedFiles: failed.length,
      originalTotalBytes: origTotal,
      compressedTotalBytes: compTotal,
      spaceSavedBytes: Math.max(0, saved),
      totalReductionPercent: pct,
    };
  }, [items]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      items.forEach((it) => {
        URL.revokeObjectURL(it.previewUrl);
        if (it.compressedUrl) URL.revokeObjectURL(it.compressedUrl);
      });
    };
  }, [items]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#5722AF]/20 selection:text-[#5722AF]">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Shared Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolName="Image Compressor"
      />

      {/* Shared Sidebar (Default Closed) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="compressor"
      />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero Section */}
        <CompressorHero />

        {/* Central Tool Interface */}
        <section id="tool-section" className="space-y-6 pt-2">
          <div className="bg-white dark:bg-[#131722] rounded-3xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-8 shadow-sm space-y-6">
            {/* Mode Selector */}
            <ModeSelector
              mode={mode}
              onChange={(m) => setMode(m)}
              fileCount={items.length}
            />

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

            {/* Settings Panel */}
            <CompressionSettingsPanel
              settings={settings}
              onChange={setSettings}
              hasTransparency={items.some((it) => it.hasTransparency)}
            />

            {/* Single Image Mode View */}
            {mode === 'single' && items.length > 0 && (
              <SingleCompressView
                item={items[0]}
                settings={settings}
                onCompress={handleCompressSingle}
                onDownload={() => handleDownloadSingle(items[0])}
                onDownloadOriginal={() => handleDownloadOriginal(items[0])}
                isCompressing={isCompressing}
              />
            )}

            {/* Bulk Mode View */}
            {mode === 'bulk' && items.length > 0 && (
              <BulkCompressView
                items={items}
                settings={settings}
                onCompressAll={handleCompressAll}
                onCancelCompress={() => setCancelRequested(true)}
                onDownloadZip={(name) => handleDownloadZip(name, false)}
                onDownloadSingle={handleDownloadSingle}
                onDownloadSelected={(name) => handleDownloadZip(name, true)}
                onRemoveItem={handleRemoveItem}
                onRemoveSelected={handleRemoveSelected}
                onClearAll={handleClearAll}
                onToggleSelect={(id) =>
                  setItems((prev) =>
                    prev.map((it) =>
                      it.id === id ? { ...it, selected: !it.selected } : it
                    )
                  )
                }
                onToggleSelectAll={() => {
                  const all = items.every((it) => it.selected);
                  setItems((prev) =>
                    prev.map((it) => ({ ...it, selected: !all }))
                  );
                }}
                onReorder={handleReorder}
                onSort={handleSort}
                onPreviewItem={() => {}}
                isCompressing={isCompressing}
                progressPercent={progressPercent}
                completedCount={completedCount}
                failedCount={failedCount}
                stats={stats}
              />
            )}
          </div>
        </section>

        {/* Informational & SEO Trust Sections */}
        <HowItWorks />
        <PrivacySection />
        <CompressorFAQ />
        <CompressorSEO />
      </main>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
