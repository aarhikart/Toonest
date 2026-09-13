'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { JpgToPdfHero } from '@/components/jpgToPdf/JpgToPdfHero';
import { JpgDropZone } from '@/components/jpgToPdf/JpgDropZone';
import { JpgImageList } from '@/components/jpgToPdf/JpgImageList';
import { JpgImagePreviewModal } from '@/components/jpgToPdf/JpgImagePreviewModal';
import { JpgSettingsPanel } from '@/components/jpgToPdf/JpgSettingsPanel';
import { JpgConversionSummaryBar } from '@/components/jpgToPdf/JpgConversionSummaryBar';
import { JpgProgressModal } from '@/components/jpgToPdf/JpgProgressModal';
import { JpgResultsView } from '@/components/jpgToPdf/JpgResultsView';
import { JpgToPdfSEO } from '@/components/jpgToPdf/JpgToPdfSEO';
import { JpgToPdfFAQ } from '@/components/jpgToPdf/JpgToPdfFAQ';

import {
  JpgImageItem,
  JpgToPdfConfig,
  ConversionProgress,
  GeneratedPdfResult,
} from '@/lib/jpgToPdfTypes';
import {
  getImageDimensions,
  createPdfFromImages,
  createSeparatePdfs,
  sanitizeFilename,
} from '@/lib/jpgToPdfEngine';
import { Shield, AlertCircle, X, HelpCircle, Sparkles } from 'lucide-react';

export default function JpgToPdfPage() {
  // Navigation & Modals
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Workflow State
  const [viewMode, setViewMode] = useState<'editor' | 'results'>('editor');
  const [images, setImages] = useState<JpgImageItem[]>([]);
  const [previewItem, setPreviewItem] = useState<JpgImageItem | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Configuration State
  const [config, setConfig] = useState<JpgToPdfConfig>({
    pageSize: 'a4',
    customWidthMm: 210,
    customHeightMm: 297,
    orientation: 'auto',
    imageFit: 'fit',
    customScalePercent: 100,
    marginPreset: 'medium',
    customMarginsMm: { top: 10, right: 10, bottom: 10, left: 10 },
    alignment: 'center',
    backgroundColor: '#ffffff',
    quality: 90,
    compression: 'balanced',
    filename: 'converted-images.pdf',
    separatePdfs: false,
    metadata: {
      title: '',
      author: '',
      subject: '',
      keywords: '',
    },
    removeMetadata: false,
  });

  // Conversion Progress & Cancellation State
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress>({
    percent: 0,
    currentImageName: '',
    completedCount: 0,
    totalCount: 0,
  });
  const abortRef = useRef(false);

  // Result State
  const [result, setResult] = useState<GeneratedPdfResult | null>(null);

  // Ingest files
  const handleAddFiles = async (newFiles: File[]) => {
    setErrorNotice(null);

    const loadedItems: JpgImageItem[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        const { width, height, previewUrl } = await getImageDimensions(file);
        loadedItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: file.size,
          width,
          height,
          rotation: 0,
          previewUrl,
          orderIndex: images.length + loadedItems.length,
          selected: false,
          status: 'ready',
        });
      } catch (err: any) {
        setErrorNotice(
          `Could not process "${file.name}". Please check that it is a valid JPG/JPEG file.`
        );
      }
    }

    if (loadedItems.length > 0) {
      setImages((prev) => [...prev, ...loadedItems]);
    }
  };

  // Reordering
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reindexed = updated.map((item, idx) => ({ ...item, orderIndex: idx }));
    setImages(reindexed);
  };

  // Rotate image 90 degrees clockwise
  const handleRotate = (id: string) => {
    setImages((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item
      )
    );

    // If active in preview modal, update preview item rotation too
    if (previewItem && previewItem.id === id) {
      setPreviewItem((prev) =>
        prev ? { ...prev, rotation: (prev.rotation + 90) % 360 } : null
      );
    }
  };

  // Remove single image
  const handleRemove = (id: string) => {
    const target = images.find((i) => i.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);

    setImages((prev) => {
      const remaining = prev.filter((i) => i.id !== id);
      return remaining.map((item, idx) => ({ ...item, orderIndex: idx }));
    });
  };

  // Selection toggling
  const handleToggleSelect = (id: string) => {
    setImages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSelectAll = () => {
    setImages((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const handleDeselectAll = () => {
    setImages((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const handleRemoveSelected = () => {
    const toRemove = images.filter((i) => i.selected);
    toRemove.forEach((i) => URL.revokeObjectURL(i.previewUrl));

    setImages((prev) => {
      const remaining = prev.filter((i) => !i.selected);
      return remaining.map((item, idx) => ({ ...item, orderIndex: idx }));
    });
  };

  const handleClearAll = () => {
    images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setImages([]);
    setResult(null);
    setViewMode('editor');
  };

  // Conversion Execution
  const handleCreatePdf = async () => {
    if (images.length === 0) return;

    setIsConverting(true);
    abortRef.current = false;
    setErrorNotice(null);

    try {
      if (config.separatePdfs) {
        const separateResult = await createSeparatePdfs(
          images,
          config,
          (p) => setProgress(p),
          abortRef
        );
        setResult(separateResult);
      } else {
        const singleBlob = await createPdfFromImages(
          images,
          config,
          (p) => setProgress(p),
          abortRef
        );
        const url = URL.createObjectURL(singleBlob);
        let baseName = config.filename.replace(/\.pdf$/i, '').trim() || 'converted-images';
        if (config.filenamePrefix?.trim()) {
          baseName = `${sanitizeFilename(config.filenamePrefix.trim())}-${baseName}`;
        }
        if (config.filenameSuffix?.trim()) {
          baseName = `${baseName}-${sanitizeFilename(config.filenameSuffix.trim())}`;
        }
        let finalFilename = sanitizeFilename(`${baseName}.pdf`);

        setResult({
          id: Math.random().toString(36).substring(2, 9),
          filename: finalFilename,
          blob: singleBlob,
          url,
          size: singleBlob.size,
          pageCount: images.length,
        });
      }

      setViewMode('results');
    } catch (err: any) {
      if (err.message?.includes('cancelled')) {
        // Cancelled by user
      } else {
        setErrorNotice(
          `Failed to create PDF document: ${err.message || 'An unexpected error occurred.'}`
        );
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleCancelConversion = () => {
    abortRef.current = true;
    setIsConverting(false);
  };

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setViewMode('editor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Platform Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        activeToolName="JPG to PDF Converter"
      />

      {/* Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => setShowHelpModal(true)}
        activeToolId="jpg-to-pdf"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-8">
        {/* Hero Section */}
        <JpgToPdfHero />

        {/* Error Notice Banner */}
        {errorNotice && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 flex items-start justify-between gap-3 text-sm animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{errorNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorNotice(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* WORKFLOW STATES */}

        {/* 1. Empty State: Large Drop Zone */}
        {images.length === 0 && (
          <div className="space-y-6 max-w-3xl mx-auto py-2">
            <JpgDropZone onAddFiles={handleAddFiles} />

            {/* Feature Highlights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">Batch Combination</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Merge tens or hundreds of JPG images into a single multi-page PDF document.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">Full Page Layouts</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Choose A4, Letter, auto orientation, custom margins, and clean image alignment.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">100% In-Browser</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Your private photos and confidential scans never get uploaded to any server.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Editor Workspace (2-column layout on desktop) */}
        {images.length > 0 && viewMode === 'editor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Columns: Image List with Reordering */}
              <div className="lg:col-span-2">
                <JpgImageList
                  items={images}
                  onReorder={handleReorder}
                  onRotate={handleRotate}
                  onRemove={handleRemove}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onRemoveSelected={handleRemoveSelected}
                  onClearAll={handleClearAll}
                  onPreview={(item) => setPreviewItem(item)}
                  onAddFiles={handleAddFiles}
                />
              </div>

              {/* Right Column: PDF Settings Panel */}
              <div className="lg:col-span-1">
                <JpgSettingsPanel
                  config={config}
                  onChangeConfig={(c) => setConfig(c)}
                  totalImages={images.length}
                />
              </div>
            </div>

            {/* Sticky Summary Bar & Primary CTA */}
            <JpgConversionSummaryBar
              totalImages={images.length}
              config={config}
              onCreatePdf={handleCreatePdf}
              disabled={images.length === 0 || isConverting}
            />
          </div>
        )}

        {/* 3. Results View */}
        {viewMode === 'results' && result && (
          <JpgResultsView
            result={result}
            config={config}
            totalImages={images.length}
            onReset={handleReset}
          />
        )}

        {/* Conversion Progress Modal */}
        {isConverting && (
          <JpgProgressModal progress={progress} onCancel={handleCancelConversion} />
        )}

        {/* Image Preview Lightbox Modal */}
        {previewItem && (
          <JpgImagePreviewModal
            item={previewItem}
            pageNumber={previewItem.orderIndex + 1}
            onClose={() => setPreviewItem(null)}
            onRotate={handleRotate}
          />
        )}

        {/* Privacy Section (Section 27) */}
        <section
          id="privacy-section"
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#5722AF]/5 to-transparent border border-[#5722AF]/15 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
              Your Images Stay Private
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your JPG images are processed directly in your browser whenever technically possible. Files are not permanently uploaded or stored. No account required.
            </p>
          </div>
        </section>

        {/* Detailed SEO Sections (Section 34) */}
        <JpgToPdfSEO />

        {/* FAQ Accordion (Section 35) */}
        <div id="faq-section">
          <JpgToPdfFAQ />
        </div>
      </main>

      {/* Platform Footer */}
      <Footer />

      {/* Help Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-base">
                <HelpCircle className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>JPG to PDF Converter Guide</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
              <div className="space-y-1">
                <div className="font-bold text-zinc-900 dark:text-white">Quick Instructions:</div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-500 dark:text-zinc-400">
                  <li>Drop or browse JPG / JPEG photos from your device.</li>
                  <li>Drag cards to rearrange the page order, or use the arrow buttons.</li>
                  <li>Click the rotate button on any sideways image to rotate it 90 degrees.</li>
                  <li>Select your target page size (A4, Letter, A3), margins, and orientation.</li>
                  <li>Click &quot;Create PDF&quot; to build your document and download it instantly.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-[#5722AF]/20 text-xs text-[#5722AF] dark:text-[#9B6BE8] space-y-1">
                <div className="font-bold">Pro Tip: Separate PDFs</div>
                <p>
                  If you want individual PDF files instead of one merged document, turn on &quot;Create separate PDF for each image&quot; in the settings panel.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#491c94] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
