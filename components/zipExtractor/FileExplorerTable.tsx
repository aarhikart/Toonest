'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileArchive,
  Code,
  FileSpreadsheet,
  File,
  Search,
  CheckSquare,
  Square,
  Download,
  Eye,
  Info,
  Layers,
  Folder,
  FolderOpen,
  X,
  PackageOpen,
} from 'lucide-react';
import JSZip from 'jszip';
import { ZipEntryItem, FileCategory, SortOption } from '@/lib/zipExtractorTypes';
import { formatFileSize, downloadBlob, extractSingleFile } from '@/lib/zipExtractorEngine';
import { FilePreviewModal } from './FilePreviewModal';
import { FileDetailsModal } from './FileDetailsModal';
import { BreadcrumbNav } from './BreadcrumbNav';

interface FileExplorerTableProps {
  entries: ZipEntryItem[];
  zip: JSZip | null;
  selectedFolderPath: string | null;
  onSelectFolder: (path: string | null) => void;
  onExtractSelected: (selectedItems: ZipEntryItem[]) => void;
  onDownloadFolderAsZip: (folderPath: string, folderName: string) => void;
}

export function FileExplorerTable({
  entries,
  zip,
  selectedFolderPath,
  onSelectFolder,
  onExtractSelected,
  onDownloadFolderAsZip,
}: FileExplorerTableProps) {
  // Search, Filter, Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FileCategory>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [previewEntry, setPreviewEntry] = useState<ZipEntryItem | null>(null);
  const [detailsEntry, setDetailsEntry] = useState<ZipEntryItem | null>(null);

  // Filter entries
  const displayedEntries = useMemo(() => {
    return entries
      .filter((item) => {
        // 1. Folder hierarchy filter
        if (selectedFolderPath !== null) {
          // If viewing specific folder, match exact parent folder or descendants
          if (item.folderPath !== selectedFolderPath) {
            return false;
          }
        }

        // 2. Category filter
        if (categoryFilter !== 'all' && item.category !== categoryFilter) {
          return false;
        }

        // 3. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesPath = item.path.toLowerCase().includes(q);
          const matchesExt = item.name.split('.').pop()?.toLowerCase().includes(q);
          if (!matchesName && !matchesPath && !matchesExt) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Folders always first when viewing a folder
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        switch (sortOption) {
          case 'name-asc':
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          case 'name-desc':
            return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
          case 'size-asc':
            return a.uncompressedSize - b.uncompressedSize;
          case 'size-desc':
            return b.uncompressedSize - a.uncompressedSize;
          case 'type':
            return a.category.localeCompare(b.category);
          case 'folder':
            return a.folderPath.localeCompare(b.folderPath);
          default:
            return 0;
        }
      });
  }, [entries, selectedFolderPath, categoryFilter, searchQuery, sortOption]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === displayedEntries.length && displayedEntries.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedEntries.map((e) => e.id)));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleDownloadSingleFile = async (entry: ZipEntryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!zip || entry.isDirectory) return;
    try {
      const blob = await extractSingleFile(zip, entry.path);
      downloadBlob(blob, entry.name);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  const renderIcon = (entry: ZipEntryItem) => {
    if (entry.isDirectory) {
      return <Folder className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />;
    }
    switch (entry.category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'archive':
        return <FileArchive className="w-4 h-4 text-amber-500" />;
      case 'code':
        return <Code className="w-4 h-4 text-cyan-600" />;
      default:
        return <File className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col shadow-xs overflow-hidden">
      {/* 1. Header Toolbar with Breadcrumbs & Search */}
      <div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumb path */}
          <BreadcrumbNav currentPath={selectedFolderPath} onNavigate={onSelectFolder} />

          {/* Search Input & Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-[#5722AF] rounded-xl outline-none text-zinc-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort Menu */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              aria-label="Sort files"
              className="text-xs px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-[#5722AF] text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
            >
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="size-desc">Size Largest</option>
              <option value="size-asc">Size Smallest</option>
              <option value="type">File Type</option>
              <option value="folder">Folder Path</option>
            </select>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'image', label: 'Images' },
              { id: 'document', label: 'Documents' },
              { id: 'pdf', label: 'PDFs' },
              { id: 'video', label: 'Videos' },
              { id: 'audio', label: 'Audio' },
              { id: 'spreadsheet', label: 'Spreadsheets' },
              { id: 'code', label: 'Code' },
              { id: 'archive', label: 'Archives' },
              { id: 'other', label: 'Other' },
            ] as { id: FileCategory; label: string }[]
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors font-medium text-[11px] cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Selection & Action Bar */}
      <div className="px-3 sm:px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 font-medium cursor-pointer"
          >
            {selectedIds.size === displayedEntries.length && displayedEntries.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            ) : (
              <Square className="w-4 h-4 text-zinc-400" />
            )}
            <span>
              {selectedIds.size === displayedEntries.length && displayedEntries.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </span>
          </button>

          {selectedIds.size > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] font-bold">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        {/* Selected Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const selected = entries.filter((e) => selectedIds.has(e.id));
                onExtractSelected(selected);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#5722AF] text-white font-semibold hover:bg-[#491c94] transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download Selection as ZIP</span>
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Explorer List / Table */}
      {displayedEntries.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Layers className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            No files in this view
          </p>
          <p className="text-xs text-zinc-400">
            {searchQuery
              ? `No items match "${searchQuery}"`
              : 'Select another folder or clear category filters'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pl-4 pr-2 w-8">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Path</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 pr-4 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {displayedEntries.map((item) => {
                const isSelected = selectedIds.has(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`group transition-colors ${
                      isSelected
                        ? 'bg-[#5722AF]/5 dark:bg-[#5722AF]/15'
                        : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2 pl-4 pr-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectOne(item.id, e)}
                        className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                        )}
                      </button>
                    </td>

                    {/* Name & Icon */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                          {renderIcon(item)}
                        </div>
                        {item.isDirectory ? (
                          <button
                            type="button"
                            onClick={() => onSelectFolder(item.path)}
                            className="font-bold text-zinc-900 dark:text-white hover:text-[#5722AF] dark:hover:text-[#9B6BE8] flex items-center gap-1 cursor-pointer"
                          >
                            <span>{item.name}</span>
                          </button>
                        ) : (
                          <span
                            onClick={() => setPreviewEntry(item)}
                            className="font-medium text-zinc-900 dark:text-white font-mono text-[11px] hover:text-[#5722AF] dark:hover:text-[#9B6BE8] cursor-pointer"
                            title="Click to preview file"
                          >
                            {item.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Folder Path */}
                    <td className="py-2 px-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      {item.folderPath ? `/${item.folderPath}` : '/'}
                    </td>

                    {/* Type Badge */}
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                        {item.isDirectory ? 'folder' : item.category}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                      {item.isDirectory ? '—' : formatFileSize(item.uncompressedSize)}
                    </td>

                    {/* Actions */}
                    <td className="py-2 pr-4 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {!item.isDirectory ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewEntry(item)}
                              title="Preview"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-[#5722AF] hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDetailsEntry(item)}
                              title="Details"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDownloadSingleFile(item, e)}
                              title="Download this file"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onDownloadFolderAsZip(item.path, item.name)}
                            title="Download folder as ZIP"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/10 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download Folder</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {displayedEntries.map((item) => {
              const isSelected = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-3 space-y-2 transition-colors ${
                    isSelected ? 'bg-[#5722AF]/5 dark:bg-[#5722AF]/15' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectOne(item.id, e)}
                        className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                        )}
                      </button>

                      <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        {renderIcon(item)}
                      </div>

                      <div className="min-w-0">
                        {item.isDirectory ? (
                          <div
                            onClick={() => onSelectFolder(item.path)}
                            className="font-bold text-xs text-zinc-900 dark:text-white cursor-pointer"
                          >
                            📁 {item.name}
                          </div>
                        ) : (
                          <div
                            onClick={() => setPreviewEntry(item)}
                            className="font-medium text-xs text-zinc-900 dark:text-white font-mono truncate cursor-pointer"
                          >
                            {item.name}
                          </div>
                        )}
                        <div className="text-[10px] text-zinc-400 font-mono truncate">
                          {item.folderPath ? `/${item.folderPath}` : '/'} •{' '}
                          {item.isDirectory ? 'Folder' : formatFileSize(item.uncompressedSize)}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Quick Action */}
                    {!item.isDirectory ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewEntry(item)}
                          className="p-1 text-zinc-400 hover:text-zinc-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownloadSingleFile(item, e)}
                          className="p-1 text-zinc-400 hover:text-emerald-600"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onDownloadFolderAsZip(item.path, item.name)}
                        className="p-1 text-zinc-400 hover:text-[#5722AF]"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <FilePreviewModal
        entry={previewEntry}
        zip={zip}
        onClose={() => setPreviewEntry(null)}
      />

      <FileDetailsModal
        entry={detailsEntry}
        onClose={() => setDetailsEntry(null)}
        onOpenPreview={(e) => setPreviewEntry(e)}
      />
    </div>
  );
}
