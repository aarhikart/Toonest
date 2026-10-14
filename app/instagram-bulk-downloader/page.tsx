'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { BulkUploadZone } from '@/components/instagram-bulk/BulkUploadZone';
import { BulkProgressCard } from '@/components/instagram-bulk/BulkProgressCard';
import { BulkReelsTable } from '@/components/instagram-bulk/BulkReelsTable';
import { VideoPreviewModal } from '@/components/instagram-bulk/VideoPreviewModal';
import {
  InstagramBulkItem,
  BulkParseResult,
} from '@/lib/instagram/bulkHtmlParser';
import {
  executeBulkDownloadAndZip,
  downloadSingleReel,
  BatchProgressUpdate,
} from '@/lib/instagram/bulkZipManager';
import {
  Sparkles,
  FolderArchive,
  Download,
  Film,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowRight,
  FileCode,
  Check,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function InstagramBulkDownloaderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<InstagramBulkItem[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<BatchProgressUpdate | null>(null);
  const [previewItem, setPreviewItem] = useState<InstagramBulkItem | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // 1. Handle file parsed
  const handleParsed = (result: BulkParseResult, uploadedName: string) => {
    setItems(result.items);
    setFileName(uploadedName);
    setProgress(null);
    showToast(`Loaded ${result.items.length} reels from ${uploadedName}`);
  };

  // 2. Selection handlers
  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  // 3. Rename handler
  const handleUpdateFilename = (id: string, newFilename: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, filename: newFilename } : item))
    );
  };

  // 4. Batch ZIP download execution
  const handleStartZipDownload = async () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return;

    setIsDownloading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Reels';
    const zipName = `${baseName}_${selectedItems.length}_Clips.zip`;

    const result = await executeBulkDownloadAndZip(selectedItems, {
      zipFilename: zipName,
      concurrency: 2,
      delayMs: 600,
      signal: controller.signal,
      onProgress: (p) => {
        setProgress(p);
      },
      onItemUpdate: (itemId, updates) => {
        setItems((prev) =>
          prev.map((it) => (it.id === itemId ? { ...it, ...updates } : it))
        );
      },
    });

    setIsDownloading(false);
    abortControllerRef.current = null;

    if (result.success) {
      showToast(`ZIP downloaded: ${zipName}`);
    } else if (result.error && result.error !== 'Download cancelled by user.') {
      showToast(`Error: ${result.error}`);
    }
  };

  // 5. Cancel download
  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDownloading(false);
    showToast('Download cancelled.');
  };

  // 6. Retry failed items
  const handleRetryFailed = () => {
    setItems((prev) =>
      prev.map((it) => (it.status === 'failed' ? { ...it, status: 'pending', selected: true } : it))
    );
    setTimeout(() => {
      handleStartZipDownload();
    }, 100);
  };

  // 7. Download single reel
  const handleDownloadSingle = async (item: InstagramBulkItem) => {
    showToast(`Downloading ${item.filename}...`);
    await downloadSingleReel(
      item,
      () => {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'downloading' } : it))
        );
      },
      () => {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'completed' } : it))
        );
        showToast(`Saved ${item.filename}!`);
      },
      (err) => {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'failed', error: err } : it))
        );
        showToast(`Failed: ${err}`);
      }
    );
  };

  // 8. Reset
  const handleReset = () => {
    if (isDownloading) return;
    setItems([]);
    setFileName(null);
    setProgress(null);
  };

  // Stats
  const selectedCount = useMemo(() => items.filter((i) => i.selected).length, [items]);
  const completedCount = useMemo(
    () => items.filter((i) => i.status === 'completed').length,
    [items]
  );
  const failedCount = useMemo(() => items.filter((i) => i.status === 'failed').length, [items]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Sidebar */}
      <Header
        onToggleSidebar={() => setSidebarOpen(true)}
        onOpenHelp={() => setOpenFaqIndex(0)}
        activeToolName="Instagram Bulk Downloader"
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => setOpenFaqIndex(0)}
        activeToolId="instagram-bulk-downloader"
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-100/80 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bulk Instagram Reels Downloader & ZIP Packager</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Bulk Download Instagram Reels to{' '}
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              ZIP with Caption Titles
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Upload your HTML reels list file. We extract every reel link, caption, and index to format each video automatically as{' '}
            <strong className="text-zinc-800 dark:text-zinc-200 font-mono text-xs px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
              #2 - Dont be a baddy.mp4
            </strong>{' '}
            and package them into a single high-speed ZIP archive.
          </p>

          {/* Quick link to single downloader */}
          <div className="pt-2 flex items-center justify-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span>Need single video download?</span>
            <Link
              href="/instagram-downloader"
              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Single URL Downloader <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Upload Zone (Always visible if empty; collapsible or top if loaded) */}
        {items.length === 0 ? (
          <BulkUploadZone onParsed={handleParsed} isLoading={isDownloading} />
        ) : (
          <div className="space-y-6">
            {/* Progress and Download Actions */}
            <BulkProgressCard
              totalItems={items.length}
              selectedCount={selectedCount}
              completedCount={completedCount}
              failedCount={failedCount}
              progress={progress}
              isDownloading={isDownloading}
              onStartZipDownload={handleStartZipDownload}
              onCancelDownload={handleCancelDownload}
              onRetryFailed={handleRetryFailed}
              onReset={handleReset}
              fileName={fileName}
            />

            {/* Interactive Reels Table */}
            <BulkReelsTable
              items={items}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onUpdateFilename={handleUpdateFilename}
              onPreviewItem={(item) => setPreviewItem(item)}
              onDownloadSingle={handleDownloadSingle}
              isDownloading={isDownloading}
            />
          </div>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Automatic Caption Filenames
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Detects index prefixes like <code className="font-mono">#1</code>, <code className="font-mono">#2</code> and primary caption headlines, producing clean, illegal-character-free <code className="font-mono">.mp4</code> filenames.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Single Click ZIP Packaging
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Downloads and packages multiple reels directly into a single uncorrupted ZIP file in the browser without server strain.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Smart Concurrency & Previews
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Gentle concurrent queue avoids rate limits, while built-in video previews let you watch any reel before exporting.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'What HTML format is supported for bulk reel downloads?',
                a: 'ToolNest supports standard HTML documents containing <div class="reel-item"> with <div class="title"> captions and <a class="link" href="..."> links, as well as raw lists of Instagram reel links and tables.',
              },
              {
                q: 'How are file names determined inside the ZIP file?',
                a: 'Each file is formatted as "#{index} - {headline}.mp4", for example "#2 - Dont be a baddy.mp4". Emojis and Windows-illegal characters (like : * ? " < > | /) are automatically sanitized. You can also click the filename in the table to edit it before downloading.',
              },
              {
                q: 'Can I download individual videos instead of the entire ZIP?',
                a: 'Yes! Every reel row has an individual "Download MP4" button and a "Preview" play button so you can download single clips on demand.',
              },
              {
                q: 'Is there a limit on how many reels I can download at once?',
                a: 'You can upload lists with 20, 50, or more reels. Our smart client queue downloads them sequentially with gentle delays so you do not get rate-limited.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      openFaqIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Video Preview Modal */}
      {previewItem && (
        <VideoPreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onDownloadItem={(it) => {
            handleDownloadSingle(it);
            setPreviewItem(null);
          }}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
