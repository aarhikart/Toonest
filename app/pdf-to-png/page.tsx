'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { PdfToPngHero } from '@/components/pdfToPng/PdfToPngHero';
import { PdfToPngSEO } from '@/components/pdfToPng/PdfToPngSEO';
import { PdfToPngFAQ } from '@/components/pdfToPng/PdfToPngFAQ';
import { PdfDropZone } from '@/components/pdfToJpg/PdfDropZone';
import { PdfFileListCard } from '@/components/pdfToJpg/PdfFileListCard';
import { PdfPagePreviewGrid } from '@/components/pdfToJpg/PdfPagePreviewGrid';
import { PdfSettingsPanel } from '@/components/pdfToJpg/PdfSettingsPanel';
import { PdfConversionSummaryBar } from '@/components/pdfToJpg/PdfConversionSummaryBar';
import { PdfConversionProgressModal } from '@/components/pdfToJpg/PdfConversionProgressModal';
import { PdfConversionResultsView } from '@/components/pdfToJpg/PdfConversionResultsView';

import {
  PdfFileItem,
  PdfPageItem,
  PdfConversionConfig,
  ConvertedJpgItem,
  ConversionProgress,
  PageRangeMode,
} from '@/lib/pdfToJpgTypes';
import { getPdfDocument } from '@/lib/pdfLoader';
import {
  renderPageThumbnail,
  renderPageToJpgBlob,
  generateOutputFilename,
  packageConvertedJpgsToZip,
  parsePageRange,
} from '@/lib/pdfToJpgEngine';
import {
  Shield,
  AlertCircle,
  X,
  HelpCircle,
  FileText,
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function PdfToPngPage() {
  // Navigation & Modals
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Workflow State
  const [viewMode, setViewMode] = useState<'editor' | 'results'>('editor');
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [activePdfId, setActivePdfId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Range and Selection State for Active PDF
  const [rangeMode, setRangeMode] = useState<PageRangeMode>('all');
  const [customRangeText, setCustomRangeText] = useState('');

  // PDF.js Document references cache
  const pdfDocsRef = useRef<Map<string, any>>(new Map());

  // Conversion Config: Default to PNG format with transparency option
  const [config, setConfig] = useState<PdfConversionConfig>({
    outputFormat: 'png',
    transparentBackground: true,
    dpi: 150,
    quality: 90,
    backgroundColor: '#ffffff',
    namingPattern: 'pdf-name',
    customPrefix: '',
    numberPadding: 2,
    resizeMode: 'original',
    resizePercent: 100,
    resizeWidth: undefined,
    resizeHeight: undefined,
    maintainAspectRatio: true,
    rangeMode: 'all',
    customRangeText: '',
  });

  // Conversion Progress & Cancellation State
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress>({
    percent: 0,
    currentPdfIndex: 0,
    totalPdfs: 0,
    currentPdfName: '',
    currentPageNumber: 0,
    totalPagesForPdf: 0,
    totalConvertedPages: 0,
    totalTargetPages: 0,
  });
  const abortRef = useRef(false);

  // Results State
  const [convertedItems, setConvertedItems] = useState<ConvertedJpgItem[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Active PDF item
  const activePdf = useMemo(() => {
    if (!activePdfId) return files[0] || null;
    return files.find((f) => f.id === activePdfId) || files[0] || null;
  }, [files, activePdfId]);

  // Total pages across all PDFs
  const totalPagesCount = useMemo(() => {
    return files.reduce((acc, f) => acc + f.pageCount, 0);
  }, [files]);

  // Total selected pages across all PDFs
  const totalSelectedPagesCount = useMemo(() => {
    return files.reduce((acc, f) => {
      return acc + f.pages.filter((p) => p.selected).length;
    }, 0);
  }, [files]);

  // Ingest PDF files
  const handleAddFiles = async (newFiles: File[]) => {
    setErrorNotice(null);

    for (const file of newFiles) {
      const fileId = Math.random().toString(36).substring(2, 9);

      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await getPdfDocument(buffer);
        const pageCount = pdfDoc.numPages;

        pdfDocsRef.current.set(fileId, pdfDoc);

        // Build initial page list
        const initialPages: PdfPageItem[] = Array.from({ length: pageCount }, (_, i) => ({
          pageNumber: i + 1,
          orderIndex: i,
          width: 595,
          height: 842,
          orientation: 'portrait',
          selected: true,
          thumbnailLoading: true,
        }));

        const newPdfItem: PdfFileItem = {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          pageCount,
          pages: initialPages,
          status: 'ready',
        };

        setFiles((prev) => [...prev, newPdfItem]);
        if (!activePdfId) {
          setActivePdfId(fileId);
        }

        // Progressively render thumbnails for this document in the background
        (async () => {
          for (let pNum = 1; pNum <= pageCount; pNum++) {
            try {
              const thumb = await renderPageThumbnail(pdfDoc, pNum);
              setFiles((prevFiles) =>
                prevFiles.map((item) => {
                  if (item.id !== fileId) return item;
                  const updatedPages = item.pages.map((p) =>
                    p.pageNumber === pNum
                      ? {
                          ...p,
                          thumbnailUrl: thumb.url,
                          thumbnailLoading: false,
                          width: thumb.width,
                          height: thumb.height,
                          orientation: thumb.orientation,
                        }
                      : p
                  );
                  return {
                    ...item,
                    pages: updatedPages,
                  };
                })
              );
            } catch {
              // Ignore single thumbnail failure
            }
          }
        })();
      } catch (err: any) {
        if (err?.name === 'PasswordException' || err?.message?.includes('password')) {
          setErrorNotice(`"${file.name}" is password protected. Please unlock it before uploading.`);
        } else {
          setErrorNotice(`Failed to load "${file.name}": ${err.message || 'Invalid PDF file.'}`);
        }
      }
    }
  };

  // Remove a PDF from queue
  const handleRemovePdf = (id: string) => {
    pdfDocsRef.current.delete(id);
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      if (activePdfId === id) {
        setActivePdfId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  // Clear all PDFs
  const handleClearAll = () => {
    pdfDocsRef.current.clear();
    setFiles([]);
    setActivePdfId(null);
    setErrorNotice(null);
    setConvertedItems([]);
    setViewMode('editor');
  };

  // Toggle single page selection
  const handleTogglePageSelected = (pageNumber: number) => {
    if (!activePdf) return;
    setRangeMode('selected');
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== activePdf.id) return f;
        return {
          ...f,
          pages: f.pages.map((p) =>
            p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
          ),
        };
      })
    );
  };

  // Select all pages in active PDF
  const handleSelectAllPages = () => {
    if (!activePdf) return;
    setRangeMode('all');
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== activePdf.id) return f;
        return {
          ...f,
          pages: f.pages.map((p) => ({ ...p, selected: true })),
        };
      })
    );
  };

  // Deselect all pages in active PDF
  const handleDeselectAllPages = () => {
    if (!activePdf) return;
    setRangeMode('selected');
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== activePdf.id) return f;
        return {
          ...f,
          pages: f.pages.map((p) => ({ ...p, selected: false })),
        };
      })
    );
  };

  // Change range mode
  const handleChangeRangeMode = (mode: PageRangeMode) => {
    setRangeMode(mode);
    if (!activePdf) return;

    if (mode === 'all') {
      handleSelectAllPages();
    } else if (mode === 'custom' && customRangeText.trim()) {
      applyCustomRange(customRangeText);
    }
  };

  // Change and apply custom range
  const applyCustomRange = (text: string) => {
    if (!activePdf) return;
    const parsed = parsePageRange(text, activePdf.pageCount);
    if (!parsed.valid) return;

    const pageSet = new Set(parsed.pages);
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== activePdf.id) return f;
        return {
          ...f,
          pages: f.pages.map((p) => ({
            ...p,
            selected: pageSet.has(p.pageNumber),
          })),
        };
      })
    );
  };

  const handleChangeCustomRangeText = (text: string) => {
    setCustomRangeText(text);
    if (rangeMode === 'custom') {
      applyCustomRange(text);
    }
  };

  // Reorder pages in active PDF
  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (!activePdf) return;
    const newPages = [...activePdf.pages];
    const [moved] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, moved);

    // Re-index orderIndex
    const reordered = newPages.map((p, idx) => ({
      ...p,
      orderIndex: idx,
    }));

    setFiles((prev) =>
      prev.map((f) => (f.id === activePdf.id ? { ...f, pages: reordered } : f))
    );
  };

  // Perform PDF to Image conversion
  const handleConvert = async () => {
    if (totalSelectedPagesCount === 0) return;

    // Collect all selected pages across all PDFs in order
    const tasks: { pdfItem: PdfFileItem; page: PdfPageItem }[] = [];
    for (const pdf of files) {
      for (const page of pdf.pages) {
        if (page.selected) {
          tasks.push({ pdfItem: pdf, page });
        }
      }
    }

    if (tasks.length === 0) return;

    setIsConverting(true);
    abortRef.current = false;
    const results: ConvertedJpgItem[] = [];
    const startTime = Date.now();

    try {
      for (let i = 0; i < tasks.length; i++) {
        if (abortRef.current) break;

        const task = tasks[i];
        const pdfDoc = pdfDocsRef.current.get(task.pdfItem.id);
        if (!pdfDoc) continue;

        const currentPdfIdx = files.findIndex((f) => f.id === task.pdfItem.id);

        setProgress({
          percent: Math.round(((i + 1) / tasks.length) * 100),
          currentPdfIndex: currentPdfIdx >= 0 ? currentPdfIdx + 1 : 1,
          totalPdfs: files.length,
          currentPdfName: task.pdfItem.name,
          currentPageNumber: task.page.pageNumber,
          totalPagesForPdf: task.pdfItem.pageCount,
          totalConvertedPages: i + 1,
          totalTargetPages: tasks.length,
        });

        const { blob, width, height } = await renderPageToJpgBlob(
          pdfDoc,
          task.page.pageNumber,
          config
        );

        const filename = generateOutputFilename(
          task.pdfItem.name,
          task.page.pageNumber,
          config
        );
        const url = URL.createObjectURL(blob);

        results.push({
          id: Math.random().toString(36).substring(2, 9),
          pdfId: task.pdfItem.id,
          pdfName: task.pdfItem.name,
          pageNumber: task.page.pageNumber,
          filename,
          blob,
          url,
          width,
          height,
          size: blob.size,
          quality: config.quality,
          format: config.outputFormat,
        });

        // Let the event loop breathe for UI responsiveness
        await new Promise((r) => setTimeout(r, 20));
      }

      if (!abortRef.current) {
        setConvertedItems(results);
        setElapsedSeconds(Math.max(1, Math.round((Date.now() - startTime) / 1000)));
        setViewMode('results');
      }
    } catch (err: any) {
      setErrorNotice(`Conversion error: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Cancel ongoing conversion
  const handleCancelConversion = () => {
    abortRef.current = true;
    setIsConverting(false);
  };

  // Download all as ZIP
  const handleDownloadAllAsZip = async (zipFilename: string) => {
    try {
      const zipBlob = await packageConvertedJpgsToZip(convertedItems, zipFilename);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      setErrorNotice(`Failed to build ZIP archive: ${err.message || 'Unknown error'}`);
    }
  };

  // Reset conversion to editor mode
  const handleReset = () => {
    convertedItems.forEach((i) => URL.revokeObjectURL(i.url));
    setConvertedItems([]);
    setViewMode('editor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Platform Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        activeToolName="PDF to PNG Converter"
      />

      {/* Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => setShowHelpModal(true)}
        activeToolId="pdf-to-png"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-8">
        {/* Hero Section */}
        <PdfToPngHero />

        {/* Error Notice */}
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

        {/* WORKFLOW VIEWS */}

        {/* 1. Empty State: Large Drop Zone */}
        {files.length === 0 && (
          <div className="space-y-6 max-w-3xl mx-auto py-2">
            <PdfDropZone onAddFiles={handleAddFiles} />

            {/* Feature Highlights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">Lossless PNG</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Zero compression artifacts with pixel-perfect typography and vector linework.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">Alpha Transparency</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Preserve transparent backgrounds for graphics, diagrams, and logos.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">100% Client-Side</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Your PDF documents are never sent across the internet to any server.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Editor Workspace */}
        {files.length > 0 && viewMode === 'editor' && (
          <div className="space-y-6">
            {/* Queue Card (Document Selector) */}
            <PdfFileListCard
              files={files}
              activePdfId={activePdfId}
              onSelectActivePdf={(id) => setActivePdfId(id)}
              onRemovePdf={handleRemovePdf}
              onClearAll={handleClearAll}
              onAddFiles={handleAddFiles}
            />

            {/* Grid + Settings Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Columns: Active Document Page Grid */}
              <div className="lg:col-span-2">
                <PdfPagePreviewGrid
                  activePdf={activePdf}
                  rangeMode={rangeMode}
                  customRangeText={customRangeText}
                  onChangeRangeMode={handleChangeRangeMode}
                  onChangeCustomRangeText={handleChangeCustomRangeText}
                  onTogglePageSelected={handleTogglePageSelected}
                  onSelectAllPages={handleSelectAllPages}
                  onDeselectAllPages={handleDeselectAllPages}
                  onMovePage={handleMovePage}
                />
              </div>

              {/* Right Column: Settings Panel */}
              <div className="lg:col-span-1">
                <PdfSettingsPanel
                  config={config}
                  onChangeConfig={(c) => setConfig(c)}
                  samplePageWidth={activePdf?.pages[0]?.width || 595}
                  samplePageHeight={activePdf?.pages[0]?.height || 842}
                />
              </div>
            </div>

            {/* Sticky Summary Bar & Primary CTA */}
            <PdfConversionSummaryBar
              totalPdfs={files.length}
              totalPages={totalPagesCount}
              totalSelectedPages={totalSelectedPagesCount}
              config={config}
              onConvert={handleConvert}
              disabled={totalSelectedPagesCount === 0 || isConverting}
            />
          </div>
        )}

        {/* 3. Results View */}
        {viewMode === 'results' && (
          <PdfConversionResultsView
            convertedItems={convertedItems}
            totalPdfsProcessed={files.length}
            elapsedSeconds={elapsedSeconds}
            onDownloadAllAsZip={handleDownloadAllAsZip}
            onReset={handleReset}
          />
        )}

        {/* Conversion Progress Modal */}
        {isConverting && (
          <PdfConversionProgressModal
            progress={progress}
            onCancel={handleCancelConversion}
            targetFormat={config.outputFormat.toUpperCase()}
          />
        )}

        {/* Privacy Reassurance Banner */}
        <section
          id="privacy-section"
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#5722AF]/5 to-transparent border border-[#5722AF]/15 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
              Private and Secure Conversion
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every PDF document is rendered directly inside your browser using Mozilla PDF.js and HTML5 Canvas. Your confidential contracts, blueprints, and sensitive documents never touch a third-party server.
            </p>
          </div>
        </section>

        {/* Detailed SEO Sections */}
        <PdfToPngSEO />

        {/* Comprehensive FAQ Section */}
        <div id="faq-section">
          <PdfToPngFAQ />
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
                <span>PDF to PNG Converter Guide</span>
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
                <div className="font-bold text-zinc-900 dark:text-white">How to Convert:</div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-500 dark:text-zinc-400">
                  <li>Drop or select one or multiple PDF documents.</li>
                  <li>Review page thumbnails and toggle individual checkboxes or enter custom ranges (e.g. 1-3, 5).</li>
                  <li>Reorder pages using the Up / Down arrows if you wish to adjust the output sequence.</li>
                  <li>Choose your desired DPI resolution and toggle Transparent Background if needed.</li>
                  <li>Click &quot;Convert to PNG&quot; and download single images or the full ZIP package.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-[#5722AF]/20 text-xs text-[#5722AF] dark:text-[#9B6BE8] space-y-1">
                <div className="font-bold">Pro Tip: Transparent Backgrounds</div>
                <p>
                  Enable &quot;Transparent Background&quot; to keep transparent canvas areas for logos, icons, and diagrams extracted from PDF artboards.
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
