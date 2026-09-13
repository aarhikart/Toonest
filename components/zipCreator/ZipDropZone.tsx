'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { UploadCloud, FolderPlus, FilePlus, AlertCircle, Sparkles } from 'lucide-react';
import { sanitizePath, sanitizeFilename, detectFileCategory } from '@/lib/zipCreatorEngine';
import { ZipFileItem, ZipFolderItem } from '@/lib/zipCreatorTypes';

interface ZipDropZoneProps {
  onAddFiles: (newFiles: ZipFileItem[], newFolders?: ZipFolderItem[]) => void;
  compact?: boolean;
}

export function ZipDropZone({ onAddFiles, compact = false }: ZipDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [supportsFolderInput, setSupportsFolderInput] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Check webkitdirectory support on mount
  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    setSupportsFolderInput('webkitdirectory' in input || 'directory' in input);
  }, []);

  // Process standard File list (from file input or clipboard)
  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const newItems: ZipFileItem[] = [];
      const discoveredFolders = new Set<string>();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = (file as any).webkitRelativePath || '';
        let folderPath = '';
        let fileName = file.name;

        if (relativePath) {
          const parts = relativePath.split('/');
          fileName = parts.pop() || file.name;
          folderPath = sanitizePath(parts.join('/'));
        }

        if (folderPath) {
          discoveredFolders.add(folderPath);
          // Also add parent folders
          const segments = folderPath.split('/');
          let acc = '';
          for (const seg of segments) {
            acc = acc ? `${acc}/${seg}` : seg;
            discoveredFolders.add(acc);
          }
        }

        const cleanName = sanitizeFilename(fileName);
        newItems.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${i}`,
          file,
          name: cleanName,
          originalName: file.name,
          folderPath,
          size: file.size,
          type: file.type || 'application/octet-stream',
          category: detectFileCategory(cleanName, file.type),
          lastModified: file.lastModified || Date.now(),
          status: 'ready',
        });
      }

      const newFolderItems: ZipFolderItem[] = Array.from(discoveredFolders).map((f) => ({
        path: f,
        name: f.split('/').pop() || f,
        isExplicit: false,
      }));

      if (newItems.length > 0) {
        onAddFiles(newItems, newFolderItems);
      }
    },
    [onAddFiles]
  );

  // Recursive directory reader for drag-and-drop
  const readEntryRecursive = async (
    entry: any,
    currentPath: string,
    fileList: ZipFileItem[],
    folderList: Set<string>
  ) => {
    if (entry.isFile) {
      const file: File = await new Promise((resolve, reject) => {
        entry.file(resolve, reject);
      });
      const cleanName = sanitizeFilename(file.name);
      fileList.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${fileList.length}`,
        file,
        name: cleanName,
        originalName: file.name,
        folderPath: currentPath,
        size: file.size,
        type: file.type || 'application/octet-stream',
        category: detectFileCategory(cleanName, file.type),
        lastModified: file.lastModified || Date.now(),
        status: 'ready',
      });
    } else if (entry.isDirectory) {
      const newPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      const cleanPath = sanitizePath(newPath);
      folderList.add(cleanPath);

      const dirReader = entry.createReader();
      const readAllEntries = async (): Promise<any[]> => {
        let allEntries: any[] = [];
        let batch: any[] = await new Promise((resolve, reject) => {
          dirReader.readEntries(resolve, reject);
        });
        while (batch.length > 0) {
          allEntries = allEntries.concat(batch);
          batch = await new Promise((resolve, reject) => {
            dirReader.readEntries(resolve, reject);
          });
        }
        return allEntries;
      };

      try {
        const entries = await readAllEntries();
        for (const childEntry of entries) {
          await readEntryRecursive(childEntry, cleanPath, fileList, folderList);
        }
      } catch (err) {
        console.error('Failed reading directory entry:', err);
      }
    }
  };

  // Handle Drag & Drop with folder entry inspection
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (items && items.length > 0 && typeof items[0].webkitGetAsEntry === 'function') {
      const fileList: ZipFileItem[] = [];
      const folderList = new Set<string>();

      const entryPromises: Promise<void>[] = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
          entryPromises.push(readEntryRecursive(entry, '', fileList, folderList));
        }
      }

      await Promise.all(entryPromises);

      const newFolderItems: ZipFolderItem[] = Array.from(folderList).map((f) => ({
        path: f,
        name: f.split('/').pop() || f,
        isExplicit: true,
      }));

      if (fileList.length > 0 || newFolderItems.length > 0) {
        onAddFiles(fileList, newFolderItems);
        return;
      }
    }

    // Fallback to regular dataTransfer.files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept paste if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        processFiles(e.clipboardData.files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Add Files</span>
        </button>
        {supportsFolderInput && (
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Add Folder</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Hidden file & folder inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Main Drag and Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/10 scale-[1.008]'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF]/60 dark:hover:border-[#9B6BE8]/60 bg-white dark:bg-zinc-900/60'
        } shadow-sm`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              isDragging
                ? 'bg-[#5722AF] text-white shadow-lg shadow-[#5722AF]/30 scale-110'
                : 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8]'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {isDragging ? 'Drop files to add them to your ZIP' : 'Drag & drop files here'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              or choose files and folders from your device
            </p>
          </div>

          {/* Action buttons inside card */}
          <div
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#491c94] text-white font-semibold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg hover:shadow-[#5722AF]/35 transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Add Files</span>
            </button>

            {supportsFolderInput && (
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-semibold text-sm shadow-xs transition-all cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Add Folder</span>
              </button>
            )}
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-1">
            Images, Documents, PDFs, Videos, Audio, Code & any files supported • Supports clipboard paste
          </p>
        </div>
      </div>

      {/* Unsupported folder warning if applicable */}
      {!supportsFolderInput && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Folder selection is not supported in this browser. You can still add files individually.
          </span>
        </div>
      )}
    </div>
  );
}
