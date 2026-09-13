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
  Trash2,
  Edit2,
  FolderInput,
  Download,
  Info,
  ArrowUpDown,
  Filter,
  Layers,
  ChevronDown,
  X,
  Plus,
} from 'lucide-react';
import {
  ZipFileItem,
  ZipFolderItem,
  FileCategory,
  SortOption,
} from '@/lib/zipCreatorTypes';
import { formatFileSize, sanitizeFilename, sanitizePath } from '@/lib/zipCreatorEngine';
import { FileDetailsModal } from './FileDetailsModal';
import { BulkRenameModal } from './BulkRenameModal';

interface FileTableListProps {
  files: ZipFileItem[];
  folders: ZipFolderItem[];
  selectedFolderPath: string | null;
  onRemoveFile: (id: string) => void;
  onRemoveMultiple: (ids: string[]) => void;
  onRenameFile: (id: string, newName: string) => void;
  onBulkRename: (renamedMap: Map<string, string>) => void;
  onMoveFiles: (fileIds: string[], targetFolderPath: string) => void;
  onClearFiles: () => void;
}

export function FileTableList({
  files,
  folders,
  selectedFolderPath,
  onRemoveFile,
  onRemoveMultiple,
  onRenameFile,
  onBulkRename,
  onMoveFiles,
  onClearFiles,
}: FileTableListProps) {
  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FileCategory>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals state
  const [previewFile, setPreviewFile] = useState<ZipFileItem | null>(null);
  const [bulkRenameOpen, setBulkRenameOpen] = useState(false);

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Move files modal state
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [targetMoveIds, setTargetMoveIds] = useState<string[]>([]);
  const [selectedMoveFolder, setSelectedMoveFolder] = useState<string>('');
  const [newFolderNameInput, setNewFolderNameInput] = useState<string>('');

  // Filter & Search files
  const displayedFiles = useMemo(() => {
    return files
      .filter((file) => {
        // 1. Folder hierarchy filter
        if (selectedFolderPath !== null) {
          if (file.folderPath !== selectedFolderPath) {
            return false;
          }
        }

        // 2. Category filter
        if (categoryFilter !== 'all' && file.category !== categoryFilter) {
          return false;
        }

        // 3. Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = file.name.toLowerCase().includes(q);
          const matchesFolder = file.folderPath.toLowerCase().includes(q);
          const matchesExt = file.name.split('.').pop()?.toLowerCase().includes(q);
          if (!matchesName && !matchesFolder && !matchesExt) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'name-asc':
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          case 'name-desc':
            return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
          case 'size-asc':
            return a.size - b.size;
          case 'size-desc':
            return b.size - a.size;
          case 'type':
            return a.category.localeCompare(b.category);
          case 'date':
            return (b.lastModified || 0) - (a.lastModified || 0);
          default:
            return 0;
        }
      });
  }, [files, selectedFolderPath, categoryFilter, searchQuery, sortOption]);

  // Total statistics for current files
  const totalBytes = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files]);
  const distinctFoldersCount = useMemo(() => {
    const s = new Set<string>();
    files.forEach((f) => {
      if (f.folderPath) s.add(f.folderPath);
    });
    folders.forEach((fo) => {
      if (fo.path) s.add(fo.path);
    });
    return s.size;
  }, [files, folders]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === displayedFiles.length && displayedFiles.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedFiles.map((f) => f.id)));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Inline rename submit
  const handleStartInlineRename = (file: ZipFileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(file.id);
    setEditName(file.name);
  };

  const handleSaveInlineRename = (id: string) => {
    const clean = sanitizeFilename(editName);
    if (clean) {
      onRenameFile(id, clean);
    }
    setEditingId(null);
  };

  // Open Move modal for a single file or multiple
  const handleOpenMoveModal = (fileIds: string[]) => {
    setTargetMoveIds(fileIds);
    setSelectedMoveFolder('');
    setNewFolderNameInput('');
    setMoveModalOpen(true);
  };

  const handleConfirmMove = () => {
    let finalPath = selectedMoveFolder;
    if (newFolderNameInput.trim()) {
      const cleanNew = sanitizePath(newFolderNameInput);
      finalPath = selectedMoveFolder ? `${selectedMoveFolder}/${cleanNew}` : cleanNew;
    }
    onMoveFiles(targetMoveIds, finalPath);
    setMoveModalOpen(false);
    setSelectedIds(new Set());
  };

  // Download original file
  const handleDownloadOriginal = (file: ZipFileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to render file icon by category
  const renderFileIcon = (category: FileCategory) => {
    switch (category) {
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
      {/* 1. Header Toolbar with Statistics & Search */}
      <div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* File Statistics Banner */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-semibold">
            <span className="font-extrabold text-zinc-900 dark:text-white">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>
              {distinctFoldersCount} {distinctFoldersCount === 1 ? 'folder' : 'folders'}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">
              {formatFileSize(totalBytes)}
            </span>
          </div>

          {/* Search Input & Sort Selector */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-48 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search files..."
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
            <div className="relative">
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
                <option value="date">Date Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {(
            [
              { id: 'all', label: 'All Files' },
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

      {/* 2. Selection & Bulk Action Bar */}
      <div className="px-3 sm:px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 font-medium cursor-pointer"
          >
            {selectedIds.size === displayedFiles.length && displayedFiles.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            ) : (
              <Square className="w-4 h-4 text-zinc-400" />
            )}
            <span>
              {selectedIds.size === displayedFiles.length && displayedFiles.length > 0
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

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedIds.size > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setBulkRenameOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] font-medium transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-[#5722AF]" />
                <span>Rename Selected</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenMoveModal(Array.from(selectedIds))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] font-medium transition-colors cursor-pointer"
              >
                <FolderInput className="w-3 h-3 text-[#5722AF]" />
                <span>Move Selected</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onRemoveMultiple(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove Selected</span>
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2 py-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                Clear
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setBulkRenameOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] font-medium transition-colors cursor-pointer"
            >
              <Edit2 className="w-3 h-3 text-[#5722AF]" />
              <span>Bulk Rename All</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Main File List / Table */}
      {displayedFiles.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Layers className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            No files match your current filter
          </p>
          <p className="text-xs text-zinc-400">
            {searchQuery
              ? `Try clearing your search term "${searchQuery}"`
              : 'Add more files or select a different folder'}
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
                <th className="py-2.5 px-3">Filename</th>
                <th className="py-2.5 px-3">Folder Path</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 pr-4 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {displayedFiles.map((file) => {
                const isSelected = selectedIds.has(file.id);
                const isEditing = editingId === file.id;

                return (
                  <tr
                    key={file.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', file.id);
                    }}
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
                        onClick={(e) => handleToggleSelectOne(file.id, e)}
                        className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                        )}
                      </button>
                    </td>

                    {/* File Icon & Name */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                          {renderFileIcon(file.category)}
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlineRename(file.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              className="px-2 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-[#5722AF] rounded outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveInlineRename(file.id)}
                              className="px-2 py-0.5 text-[11px] font-semibold bg-[#5722AF] text-white rounded cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="font-medium text-zinc-900 dark:text-white font-mono text-[11px] hover:text-[#5722AF] cursor-pointer"
                            onClick={() => setPreviewFile(file)}
                            title="Click to preview file details"
                          >
                            {file.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Folder Path */}
                    <td className="py-2 px-3">
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        {file.folderPath ? `/${file.folderPath}` : '/ (Root)'}
                      </span>
                    </td>

                    {/* Category Badge */}
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                        {file.category}
                      </span>
                    </td>

                    {/* File Size */}
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                      {formatFileSize(file.size)}
                    </td>

                    {/* Row Actions */}
                    <td className="py-2 pr-4 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          title="Preview & Details"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-[#5722AF] hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleStartInlineRename(file, e)}
                          title="Rename File"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenMoveModal([file.id])}
                          title="Move to Folder"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <FolderInput className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownloadOriginal(file, e)}
                          title="Download Original"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveFile(file.id)}
                          title="Remove from ZIP Queue"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {displayedFiles.map((file) => {
              const isSelected = selectedIds.has(file.id);

              return (
                <div
                  key={file.id}
                  className={`p-3 space-y-2 transition-colors ${
                    isSelected ? 'bg-[#5722AF]/5 dark:bg-[#5722AF]/15' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectOne(file.id, e)}
                        className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                        )}
                      </button>

                      <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        {renderFileIcon(file.category)}
                      </div>

                      <div className="min-w-0">
                        <div
                          className="font-medium text-xs text-zinc-900 dark:text-white font-mono truncate cursor-pointer"
                          onClick={() => setPreviewFile(file)}
                        >
                          {file.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate">
                          {file.folderPath ? `/${file.folderPath}` : '/ (Root)'} •{' '}
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="p-1 text-zinc-400 hover:text-zinc-700"
                        title="Details"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenMoveModal([file.id])}
                        className="p-1 text-zinc-400 hover:text-zinc-700"
                        title="Move"
                      >
                        <FolderInput className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveFile(file.id)}
                        className="p-1 text-zinc-400 hover:text-red-500"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Move Files Modal */}
      {moveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-[#5722AF] dark:text-[#9B6BE8]">
              <FolderInput className="w-5 h-5" />
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                Move {targetMoveIds.length} {targetMoveIds.length === 1 ? 'file' : 'files'}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Existing Destination Folder
                </label>
                <select
                  value={selectedMoveFolder}
                  onChange={(e) => setSelectedMoveFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-[#5722AF]"
                >
                  <option value="">Root (/)</option>
                  {Array.from(
                    new Set([
                      ...folders.map((f) => f.path),
                      ...files.map((f) => f.folderPath).filter(Boolean),
                    ])
                  )
                    .filter(Boolean)
                    .sort()
                    .map((path) => (
                      <option key={path} value={path}>
                        /{path}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Or Create New Subfolder Here
                </label>
                <input
                  type="text"
                  placeholder="e.g. icons or extra/assets"
                  value={newFolderNameInput}
                  onChange={(e) => setNewFolderNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-[#5722AF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMoveModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMove}
                className="px-4 py-1.5 text-xs font-semibold bg-[#5722AF] text-white rounded-xl shadow-xs hover:bg-[#491c94]"
              >
                Move Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Preview Modal */}
      <FileDetailsModal fileItem={previewFile} onClose={() => setPreviewFile(null)} />

      {/* Bulk Rename Modal */}
      <BulkRenameModal
        isOpen={bulkRenameOpen}
        onClose={() => setBulkRenameOpen(false)}
        files={displayedFiles}
        selectedFileIds={selectedIds}
        onApply={(renamedMap) => {
          onBulkRename(renamedMap);
          setSelectedIds(new Set());
        }}
      />
    </div>
  );
}
