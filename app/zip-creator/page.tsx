'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { ZipCreatorHero } from '@/components/zipCreator/ZipCreatorHero';
import { ZipDropZone } from '@/components/zipCreator/ZipDropZone';
import { FolderTreeSidebar } from '@/components/zipCreator/FolderTreeSidebar';
import { FileTableList } from '@/components/zipCreator/FileTableList';
import { ZipSettingsCard } from '@/components/zipCreator/ZipSettingsCard';
import { ZipProgressBar } from '@/components/zipCreator/ZipProgressBar';
import { ZipCompletionCard } from '@/components/zipCreator/ZipCompletionCard';
import { ZipCreatorFAQ } from '@/components/zipCreator/ZipCreatorFAQ';
import { ZipCreatorSEO } from '@/components/zipCreator/ZipCreatorSEO';
import {
  ZipFileItem,
  ZipFolderItem,
  ZipCreatorConfig,
  ZipProgressInfo,
  ZipResult,
  HistorySnapshot,
} from '@/lib/zipCreatorTypes';
import {
  buildFolderTree,
  createZipArchive,
  formatFileSize,
  sanitizePath,
} from '@/lib/zipCreatorEngine';
import {
  Undo,
  Redo,
  RotateCcw,
  Sparkles,
  FileArchive,
  ArrowRight,
  Shield,
  Layers,
  AlertCircle,
} from 'lucide-react';

const DEFAULT_CONFIG: ZipCreatorConfig = {
  zipName: 'my-files.zip',
  compressionLevel: 'BALANCED',
  includeEmptyFolders: true,
  comment: '',
  duplicateStrategy: 'auto-rename',
};

export default function ZipCreatorPage() {
  // Navigation & Modal State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // File & Folder Workspace State
  const [files, setFiles] = useState<ZipFileItem[]>([]);
  const [folders, setFolders] = useState<ZipFolderItem[]>([]);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null);

  // Configuration State
  const [config, setConfig] = useState<ZipCreatorConfig>(DEFAULT_CONFIG);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Compression Execution State
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<ZipProgressInfo>({
    percent: 0,
    currentFile: '',
    processedCount: 0,
    totalCount: 0,
  });
  const [zipResult, setZipResult] = useState<ZipResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Abort controller reference for cancellation
  const abortRef = useRef<{ aborted: boolean }>({ aborted: false });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedLevel = localStorage.getItem('toolnest_zip_compression');
      const savedName = localStorage.getItem('toolnest_zip_name');
      if (savedLevel || savedName) {
        setConfig((prev) => ({
          ...prev,
          compressionLevel: (savedLevel as any) || prev.compressionLevel,
          zipName: savedName || prev.zipName,
        }));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Save preferences to localStorage on change
  useEffect(() => {
    try {
      if (config.compressionLevel) {
        localStorage.setItem('toolnest_zip_compression', config.compressionLevel);
      }
      if (config.zipName) {
        localStorage.setItem('toolnest_zip_name', config.zipName);
      }
    } catch (e) {
      // Ignore
    }
  }, [config.compressionLevel, config.zipName]);

  // Clean up Blob URLs on unmount or new zip
  useEffect(() => {
    return () => {
      if (zipResult?.downloadUrl) {
        URL.revokeObjectURL(zipResult.downloadUrl);
      }
    };
  }, [zipResult]);

  // Push to history helper
  const pushHistory = useCallback(
    (newFiles: ZipFileItem[], newFolders: ZipFolderItem[], desc: string) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, { files: newFiles, folders: newFolders, description: desc }];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetState = history[targetIndex];
      setFiles(targetState.files);
      setFolders(targetState.folders);
      setHistoryIndex(targetIndex);
    }
  }, [historyIndex, history]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetState = history[targetIndex];
      setFiles(targetState.files);
      setFolders(targetState.folders);
      setHistoryIndex(targetIndex);
    }
  }, [historyIndex, history]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when typing in an input
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Compute folder tree structure
  const folderTree = useMemo(() => {
    return buildFolderTree(folders, files);
  }, [folders, files]);

  // Compute total bytes
  const totalBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + f.size, 0);
  }, [files]);

  // 1. Add Files & Folders
  const handleAddFiles = useCallback(
    (newFiles: ZipFileItem[], newFolders?: ZipFolderItem[]) => {
      setFiles((prev) => {
        const combinedFiles = [...prev, ...newFiles];
        setFolders((fPrev) => {
          const combinedFolders = [...fPrev, ...(newFolders || [])];
          // deduplicate folders
          const map = new Map<string, ZipFolderItem>();
          combinedFolders.forEach((f) => map.set(f.path, f));
          const finalFolders = Array.from(map.values());

          pushHistory(combinedFiles, finalFolders, `Added ${newFiles.length} files`);
          return finalFolders;
        });
        return combinedFiles;
      });
      setZipResult(null);
      setErrorMessage(null);
    },
    [pushHistory]
  );

  // 2. Remove Single File
  const handleRemoveFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const next = prev.filter((f) => f.id !== id);
        pushHistory(next, folders, 'Removed file');
        return next;
      });
      setZipResult(null);
    },
    [folders, pushHistory]
  );

  // 3. Remove Multiple Files
  const handleRemoveMultiple = useCallback(
    (ids: string[]) => {
      const set = new Set(ids);
      setFiles((prev) => {
        const next = prev.filter((f) => !set.has(f.id));
        pushHistory(next, folders, `Removed ${ids.length} files`);
        return next;
      });
      setZipResult(null);
    },
    [folders, pushHistory]
  );

  // 4. Rename Single File
  const handleRenameFile = useCallback(
    (id: string, newName: string) => {
      setFiles((prev) => {
        const next = prev.map((f) => (f.id === id ? { ...f, name: newName } : f));
        pushHistory(next, folders, `Renamed file to ${newName}`);
        return next;
      });
      setZipResult(null);
    },
    [folders, pushHistory]
  );

  // 5. Bulk Rename Files
  const handleBulkRename = useCallback(
    (renamedMap: Map<string, string>) => {
      setFiles((prev) => {
        const next = prev.map((f) => {
          if (renamedMap.has(f.id)) {
            return { ...f, name: renamedMap.get(f.id)! };
          }
          return f;
        });
        pushHistory(next, folders, `Bulk renamed ${renamedMap.size} files`);
        return next;
      });
      setZipResult(null);
    },
    [folders, pushHistory]
  );

  // 6. Move Files to a Folder
  const handleMoveFiles = useCallback(
    (fileIds: string[], targetFolderPath: string) => {
      const cleanTarget = sanitizePath(targetFolderPath);
      const idSet = new Set(fileIds);

      setFiles((prev) => {
        const nextFiles = prev.map((f) =>
          idSet.has(f.id) ? { ...f, folderPath: cleanTarget } : f
        );

        setFolders((fPrev) => {
          let nextFolders = [...fPrev];
          if (cleanTarget && !nextFolders.some((fo) => fo.path === cleanTarget)) {
            nextFolders.push({
              path: cleanTarget,
              name: cleanTarget.split('/').pop() || cleanTarget,
              isExplicit: true,
            });
          }
          pushHistory(
            nextFiles,
            nextFolders,
            `Moved ${fileIds.length} files to /${cleanTarget || 'Root'}`
          );
          return nextFolders;
        });

        return nextFiles;
      });
      setZipResult(null);
    },
    [pushHistory]
  );

  // 7. Create Folder
  const handleCreateFolder = useCallback(
    (parentPath: string, folderName: string) => {
      const fullPath = sanitizePath(parentPath ? `${parentPath}/${folderName}` : folderName);
      if (!fullPath) return;

      setFolders((prev) => {
        if (prev.some((f) => f.path === fullPath)) return prev;
        const next = [
          ...prev,
          {
            path: fullPath,
            name: folderName,
            isExplicit: true,
          },
        ];
        pushHistory(files, next, `Created folder /${fullPath}`);
        return next;
      });
    },
    [files, pushHistory]
  );

  // 8. Rename Folder
  const handleRenameFolder = useCallback(
    (oldPath: string, newName: string) => {
      const parent = oldPath.includes('/') ? oldPath.slice(0, oldPath.lastIndexOf('/')) : '';
      const newPath = sanitizePath(parent ? `${parent}/${newName}` : newName);
      if (!newPath || newPath === oldPath) return;

      setFolders((prev) => {
        const nextFolders = prev.map((f) => {
          if (f.path === oldPath) {
            return { ...f, path: newPath, name: newName };
          }
          if (f.path.startsWith(`${oldPath}/`)) {
            return { ...f, path: f.path.replace(`${oldPath}/`, `${newPath}/`) };
          }
          return f;
        });

        setFiles((filesPrev) => {
          const nextFiles = filesPrev.map((file) => {
            if (file.folderPath === oldPath) {
              return { ...file, folderPath: newPath };
            }
            if (file.folderPath.startsWith(`${oldPath}/`)) {
              return {
                ...file,
                folderPath: file.folderPath.replace(`${oldPath}/`, `${newPath}/`),
              };
            }
            return file;
          });
          pushHistory(nextFiles, nextFolders, `Renamed folder to /${newPath}`);
          return nextFiles;
        });

        return nextFolders;
      });
    },
    [pushHistory]
  );

  // 9. Delete Folder
  const handleDeleteFolder = useCallback(
    (folderPath: string, deleteFiles: boolean) => {
      setFolders((prev) => {
        const nextFolders = prev.filter(
          (f) => f.path !== folderPath && !f.path.startsWith(`${folderPath}/`)
        );

        setFiles((filesPrev) => {
          let nextFiles: ZipFileItem[];
          if (deleteFiles) {
            nextFiles = filesPrev.filter(
              (f) => f.folderPath !== folderPath && !f.folderPath.startsWith(`${folderPath}/`)
            );
          } else {
            // Move contents to root
            nextFiles = filesPrev.map((f) => {
              if (f.folderPath === folderPath || f.folderPath.startsWith(`${folderPath}/`)) {
                return { ...f, folderPath: '' };
              }
              return f;
            });
          }
          pushHistory(
            nextFiles,
            nextFolders,
            deleteFiles ? `Deleted folder /${folderPath} and files` : `Moved files from /${folderPath} to Root`
          );
          return nextFiles;
        });

        return nextFolders;
      });

      if (selectedFolderPath === folderPath) {
        setSelectedFolderPath(null);
      }
    },
    [selectedFolderPath, pushHistory]
  );

  // 10. Start ZIP Compression Pipeline
  const handleCreateZip = async () => {
    if (files.length === 0) return;

    abortRef.current = { aborted: false };
    setIsCompressing(true);
    setErrorMessage(null);
    setProgress({
      percent: 0,
      currentFile: 'Starting compression...',
      processedCount: 0,
      totalCount: files.length,
    });

    try {
      const result = await createZipArchive(
        files,
        folders,
        config,
        (p) => setProgress(p),
        abortRef.current
      );
      setZipResult(result);
    } catch (err: any) {
      if (err.message === 'ZIP creation was cancelled') {
        // Cancelled gracefully
      } else {
        console.error('Error creating ZIP archive:', err);
        setErrorMessage(
          err.message || 'An unexpected error occurred while creating the ZIP archive.'
        );
      }
    } finally {
      setIsCompressing(false);
    }
  };

  // 11. Cancel Compression
  const handleCancelCompress = () => {
    abortRef.current.aborted = true;
    setIsCompressing(false);
  };

  // 12. Download ZIP
  const handleDownloadZip = () => {
    if (!zipResult) return;
    const a = document.createElement('a');
    a.href = zipResult.downloadUrl;
    a.download = zipResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 13. Create New ZIP (Reset Workspace)
  const handleNewZip = () => {
    if (confirm('Start a new ZIP? This will clear your current queue of files.')) {
      if (zipResult?.downloadUrl) {
        URL.revokeObjectURL(zipResult.downloadUrl);
      }
      setFiles([]);
      setFolders([]);
      setZipResult(null);
      setHistory([]);
      setHistoryIndex(-1);
      setSelectedFolderPath(null);
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Universal Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setShowHelpModal(true)}
        activeToolName="ZIP Creator"
      />

      {/* Slide-out Suite Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => setShowHelpModal(true)}
        activeToolId="zip-creator"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Hero Section */}
        <ZipCreatorHero />

        {/* Global Error Notice if any */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold px-2 py-1 rounded bg-red-100 dark:bg-red-900/50 hover:bg-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* PROGRESSIVE WORKFLOW STATES */}

        {/* 1. Empty State: Large Upload Area */}
        {files.length === 0 && !zipResult && (
          <div className="space-y-6 max-w-3xl mx-auto py-2">
            <ZipDropZone onAddFiles={handleAddFiles} />

            {/* Quick feature callouts below drop zone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">Folder Uploads</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Preserve deep nested directories and file hierarchies seamlessly.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">100% Client-Side</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Archives are generated inside browser memory. Zero cloud data storage.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-1 shadow-xs">
                <div className="font-bold text-zinc-900 dark:text-white">Pattern Bulk Rename</div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Batch rename hundreds of files with numbers, dates, and zero-padding.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Completion State: Success Card & Results */}
        {zipResult && (
          <div className="max-w-3xl mx-auto py-2">
            <ZipCompletionCard
              result={zipResult}
              folderTree={folderTree}
              onDownload={handleDownloadZip}
              onEditFiles={() => setZipResult(null)}
              onNewZip={handleNewZip}
            />
          </div>
        )}

        {/* 3. Active Workspace State (Files Loaded, Not Completed) */}
        {files.length > 0 && !zipResult && (
          <div className="space-y-6">
            {/* Top Workspace Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2">
                <ZipDropZone onAddFiles={handleAddFiles} compact={true} />
              </div>

              {/* Undo / Redo & Clear Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Undo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Redo</span>
                </button>
                <button
                  type="button"
                  onClick={handleNewZip}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Clear all files"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* Main Manager Layout: Sidebar Folder Tree + File Table */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
              {/* Left Column: Folder Tree */}
              <div className="lg:col-span-1">
                <FolderTreeSidebar
                  tree={folderTree}
                  selectedFolderPath={selectedFolderPath}
                  onSelectFolder={(path) => setSelectedFolderPath(path)}
                  onCreateFolder={handleCreateFolder}
                  onRenameFolder={handleRenameFolder}
                  onDeleteFolder={handleDeleteFolder}
                  onDropFileToFolder={(folderPath, fileId) =>
                    handleMoveFiles([fileId], folderPath)
                  }
                />
              </div>

              {/* Right Column: File Manager Table / List */}
              <div className="lg:col-span-3">
                <FileTableList
                  files={files}
                  folders={folders}
                  selectedFolderPath={selectedFolderPath}
                  onRemoveFile={handleRemoveFile}
                  onRemoveMultiple={handleRemoveMultiple}
                  onRenameFile={handleRenameFile}
                  onBulkRename={handleBulkRename}
                  onMoveFiles={handleMoveFiles}
                  onClearFiles={() => setFiles([])}
                />
              </div>
            </div>

            {/* ZIP Configuration Card */}
            <div className="max-w-4xl mx-auto">
              <ZipSettingsCard
                config={config}
                onChangeConfig={setConfig}
                totalFiles={files.length}
                totalBytes={totalBytes}
              />
            </div>

            {/* Sticky / Floating Create ZIP CTA Bar (Section 34) */}
            <div className="sticky bottom-4 z-30 max-w-2xl mx-auto">
              <div className="p-3 sm:p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-center sm:text-left">
                  <div className="font-bold text-zinc-900 dark:text-white">Ready to pack</div>
                  <div className="text-zinc-500 dark:text-zinc-400">
                    {files.length} files • {formatFileSize(totalBytes)} • {config.compressionLevel} compression
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateZip}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg hover:shadow-[#5722AF]/35 transition-all cursor-pointer"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>
                    Create ZIP • {files.length} {files.length === 1 ? 'file' : 'files'} •{' '}
                    {formatFileSize(totalBytes)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compression Active Modal Overlay (Section 35 & 36) */}
        {isCompressing && (
          <ZipProgressBar progress={progress} onCancel={handleCancelCompress} />
        )}

        {/* Privacy Assurance Banner (Section 43) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#5722AF]/5 to-transparent border border-[#5722AF]/15 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
              Your files stay private
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Files are processed locally in your browser whenever possible. Your files do not need
              to be uploaded to a server to create the ZIP.
            </p>
          </div>
        </section>

        {/* SEO Information Section (Section 70) */}
        <ZipCreatorSEO />

        {/* Comprehensive FAQ Accordion (Section 71) */}
        <ZipCreatorFAQ />
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
