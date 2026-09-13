'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import JSZip from 'jszip';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { ZipExtractorHero } from '@/components/zipExtractor/ZipExtractorHero';
import { ZipExtractorDropZone } from '@/components/zipExtractor/ZipExtractorDropZone';
import { ArchiveSummaryCard } from '@/components/zipExtractor/ArchiveSummaryCard';
import { FolderTreeNav } from '@/components/zipExtractor/FolderTreeNav';
import { FileExplorerTable } from '@/components/zipExtractor/FileExplorerTable';
import { ExtractionProgressModal } from '@/components/zipExtractor/ExtractionProgressModal';
import { ZipBombWarningModal } from '@/components/zipExtractor/ZipBombWarningModal';
import { ZipExtractorSEO } from '@/components/zipExtractor/ZipExtractorSEO';
import { ZipExtractorFAQ } from '@/components/zipExtractor/ZipExtractorFAQ';
import {
  ZipEntryItem,
  ArchiveMetadata,
  ExtractionProgress,
} from '@/lib/zipExtractorTypes';
import {
  loadAndValidateZip,
  buildFolderHierarchy,
  extractMultipleAsZip,
  downloadBlob,
  sanitizeFilename,
} from '@/lib/zipExtractorEngine';
import { Shield, AlertCircle } from 'lucide-react';

export default function ZipExtractorPage() {
  // Navigation & Help modal
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Loaded Archive State
  const [isLoadingZip, setIsLoadingZip] = useState(false);
  const [zipInstance, setZipInstance] = useState<JSZip | null>(null);
  const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
  const [entries, setEntries] = useState<ZipEntryItem[]>([]);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extraction Progress State
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress>({
    percent: 0,
    currentFile: '',
    completedCount: 0,
    totalCount: 0,
  });

  // Safety Warning State (ZIP Bomb protection)
  const [showBombWarning, setShowBombWarning] = useState(false);
  const pendingExtractionRef = useRef<(() => void) | null>(null);
  const abortControllerRef = useRef<{ aborted: boolean }>({ aborted: false });

  // Compute folder hierarchy tree
  const folderTree = useMemo(() => {
    return buildFolderHierarchy(entries);
  }, [entries]);

  // Handle Archive Ingestion
  const handleSelectZip = async (file: File) => {
    setIsLoadingZip(true);
    setErrorMessage(null);

    try {
      const { zip, metadata: meta, entries: entryList } = await loadAndValidateZip(file);
      setZipInstance(zip);
      setMetadata(meta);
      setEntries(entryList);
      setSelectedFolderPath(null);

      // If suspicious bomb, notify user
      if (meta.isSuspiciousBomb) {
        setShowBombWarning(true);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'This file does not appear to be a valid or supported ZIP archive.'
      );
      setZipInstance(null);
      setMetadata(null);
      setEntries([]);
    } finally {
      setIsLoadingZip(false);
    }
  };

  // Reset workspace to upload another ZIP
  const handleResetArchive = () => {
    setZipInstance(null);
    setMetadata(null);
    setEntries([]);
    setSelectedFolderPath(null);
    setErrorMessage(null);
    setIsExtracting(false);
  };

  // Extract selected files as a new ZIP
  const handleExtractSelection = async (selectedItems: ZipEntryItem[]) => {
    if (!zipInstance || !metadata) return;

    abortControllerRef.current = { aborted: false };
    setIsExtracting(true);
    setProgress({
      percent: 0,
      currentFile: 'Preparing selection...',
      completedCount: 0,
      totalCount: selectedItems.length,
    });

    try {
      const baseName = metadata.filename.replace(/\.zip$/i, '');
      const zipBlob = await extractMultipleAsZip(
        zipInstance,
        selectedItems,
        `${baseName}-selected.zip`,
        '',
        (p) => setProgress(p),
        abortControllerRef.current
      );
      downloadBlob(zipBlob, `${baseName}-selected.zip`);
    } catch (err: any) {
      if (err.message !== 'Extraction was cancelled') {
        console.error('Extraction error:', err);
        setErrorMessage(err.message || 'Failed to extract selected items.');
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // Extract an entire folder as a new ZIP
  const handleDownloadFolderAsZip = async (folderPath: string, folderName: string) => {
    if (!zipInstance) return;

    const folderFiles = entries.filter(
      (e) => !e.isDirectory && (e.folderPath === folderPath || e.folderPath.startsWith(`${folderPath}/`))
    );

    if (folderFiles.length === 0) {
      alert(`The folder "${folderName}" contains no files.`);
      return;
    }

    abortControllerRef.current = { aborted: false };
    setIsExtracting(true);
    setProgress({
      percent: 0,
      currentFile: `Packing ${folderName}...`,
      completedCount: 0,
      totalCount: folderFiles.length,
    });

    try {
      const cleanFolderName = sanitizeFilename(folderName || 'folder');
      const zipBlob = await extractMultipleAsZip(
        zipInstance,
        folderFiles,
        `${cleanFolderName}.zip`,
        folderPath,
        (p) => setProgress(p),
        abortControllerRef.current
      );
      downloadBlob(zipBlob, `${cleanFolderName}.zip`);
    } catch (err: any) {
      if (err.message !== 'Extraction was cancelled') {
        console.error('Folder download error:', err);
        setErrorMessage(err.message || 'Failed to extract folder.');
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // Extract all files in the archive
  const handleExtractAll = async () => {
    if (!zipInstance || !metadata) return;

    const allFiles = entries.filter((e) => !e.isDirectory);
    abortControllerRef.current = { aborted: false };
    setIsExtracting(true);
    setProgress({
      percent: 0,
      currentFile: 'Preparing full archive...',
      completedCount: 0,
      totalCount: allFiles.length,
    });

    try {
      const baseName = metadata.filename.replace(/\.zip$/i, '');
      const zipBlob = await extractMultipleAsZip(
        zipInstance,
        allFiles,
        `${baseName}-extracted.zip`,
        '',
        (p) => setProgress(p),
        abortControllerRef.current
      );
      downloadBlob(zipBlob, `${baseName}-extracted.zip`);
    } catch (err: any) {
      if (err.message !== 'Extraction was cancelled') {
        console.error('Extract All error:', err);
        setErrorMessage(err.message || 'Failed to extract all files.');
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // Cancel in-progress extraction
  const handleCancelExtraction = () => {
    abortControllerRef.current.aborted = true;
    setIsExtracting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Universal Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setShowHelpModal(true)}
        activeToolName="ZIP Extractor"
      />

      {/* Slide-out Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => setShowHelpModal(true)}
        activeToolId="zip-extractor"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Hero Section */}
        <ZipExtractorHero />

        {/* Global Error Notice if any */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/50 hover:bg-red-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* WORKFLOW STATES */}

        {/* 1. Empty State: Upload ZIP Drop Zone */}
        {!metadata && (
          <div className="space-y-6 max-w-3xl mx-auto py-2">
            <ZipExtractorDropZone onSelectZip={handleSelectZip} isLoading={isLoadingZip} />

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">Folder Browsing</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Navigate nested directory structures with interactive breadcrumbs.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">Lazy Extraction</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Files stay in compressed state until you preview or extract them.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">100% Client-Side</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Your archive is never uploaded to any cloud server.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Active Archive Workspace */}
        {metadata && (
          <div className="space-y-6">
            {/* Archive Summary Card */}
            <ArchiveSummaryCard
              metadata={metadata}
              onChangeArchive={handleResetArchive}
              onExtractAll={handleExtractAll}
            />

            {/* Main File Explorer Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
              {/* Left Column: Folder Tree */}
              <div className="lg:col-span-1">
                <FolderTreeNav
                  tree={folderTree}
                  selectedFolderPath={selectedFolderPath}
                  onSelectFolder={(path) => setSelectedFolderPath(path)}
                  onDownloadFolderAsZip={handleDownloadFolderAsZip}
                />
              </div>

              {/* Right Column: File Explorer Table / List */}
              <div className="lg:col-span-3">
                <FileExplorerTable
                  entries={entries}
                  zip={zipInstance}
                  selectedFolderPath={selectedFolderPath}
                  onSelectFolder={(path) => setSelectedFolderPath(path)}
                  onExtractSelected={handleExtractSelection}
                  onDownloadFolderAsZip={handleDownloadFolderAsZip}
                />
              </div>
            </div>
          </div>
        )}

        {/* Extraction Progress Modal */}
        {isExtracting && (
          <ExtractionProgressModal progress={progress} onCancel={handleCancelExtraction} />
        )}

        {/* ZIP Bomb Warning Modal */}
        {showBombWarning && metadata && (
          <ZipBombWarningModal
            compressedSize={metadata.archiveSize}
            uncompressedSize={metadata.totalUncompressedSize}
            onProceed={() => setShowBombWarning(false)}
            onCancel={() => {
              setShowBombWarning(false);
              handleResetArchive();
            }}
          />
        )}

        {/* Privacy Reassurance Section */}
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#5722AF]/5 to-transparent border border-[#5722AF]/15 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
              Your files stay private
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              ZIP files are processed locally in your browser whenever possible. Your archive does
              not need to be uploaded to a server for extraction.
            </p>
          </div>
        </section>

        {/* SEO Content Section */}
        <ZipExtractorSEO />

        {/* FAQ Section */}
        <ZipExtractorFAQ />
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
