'use client';

import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
  FolderTree as FolderTreeIcon,
} from 'lucide-react';
import { FolderTreeNode, ZipFolderItem } from '@/lib/zipCreatorTypes';
import { sanitizeFilename, sanitizePath } from '@/lib/zipCreatorEngine';

interface FolderTreeSidebarProps {
  tree: FolderTreeNode;
  selectedFolderPath: string | null; // null means "All Files", "" means Root only
  onSelectFolder: (path: string | null) => void;
  onCreateFolder: (parentPath: string, folderName: string) => void;
  onRenameFolder: (oldPath: string, newName: string) => void;
  onDeleteFolder: (path: string, deleteFiles: boolean) => void;
  onDropFileToFolder?: (folderPath: string, fileId: string) => void;
}

export function FolderTreeSidebar({
  tree,
  selectedFolderPath,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onDropFileToFolder,
}: FolderTreeSidebarProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['']));
  const [isCreatingIn, setIsCreatingIn] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [deleteConfirmPath, setDeleteConfirmPath] = useState<string | null>(null);
  const [dragOverPath, setDragOverPath] = useState<string | null>(null);

  const toggleExpand = (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleStartCreate = (parentPath: string) => {
    setIsCreatingIn(parentPath);
    setNewFolderName('');
    // Ensure parent is expanded
    setExpandedPaths((prev) => new Set([...prev, parentPath]));
  };

  const handleConfirmCreate = () => {
    const clean = sanitizeFilename(newFolderName);
    if (clean && isCreatingIn !== null) {
      onCreateFolder(isCreatingIn, clean);
    }
    setIsCreatingIn(null);
    setNewFolderName('');
  };

  const handleStartRename = (path: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPath(path);
    setEditFolderName(currentName);
  };

  const handleConfirmRename = () => {
    const clean = sanitizeFilename(editFolderName);
    if (clean && editingPath) {
      onRenameFolder(editingPath, clean);
    }
    setEditingPath(null);
    setEditFolderName('');
  };

  const renderTreeNode = (node: FolderTreeNode, depth: number = 0) => {
    const isRoot = node.path === '';
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = selectedFolderPath === node.path;
    const hasChildren = node.children.length > 0;
    const isEditing = editingPath === node.path;
    const isDragOver = dragOverPath === node.path;

    return (
      <div key={node.path || '__root__'} className="select-none">
        <div
          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
            isSelected
              ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] font-semibold border border-[#5722AF]/30 dark:border-[#5722AF]/40'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-transparent'
          } ${isDragOver ? 'ring-2 ring-[#5722AF] bg-[#5722AF]/15' : ''}`}
          style={{ paddingLeft: `${Math.max(10, depth * 16 + 10)}px` }}
          onClick={() => onSelectFolder(node.path)}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dragOverPath !== node.path) setDragOverPath(node.path);
          }}
          onDragLeave={() => {
            if (dragOverPath === node.path) setDragOverPath(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverPath(null);
            const fileId = e.dataTransfer.getData('text/plain');
            if (fileId && onDropFileToFolder) {
              onDropFileToFolder(node.path, fileId);
            }
          }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Expand / Collapse Icon */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(node.path, e)}
                className="p-0.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}

            {/* Folder Icon */}
            {isExpanded || isSelected ? (
              <FolderOpen className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            )}

            {/* Folder Name or Inline Rename */}
            {isEditing ? (
              <div
                className="flex items-center gap-1 flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={editFolderName}
                  onChange={(e) => setEditFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRename();
                    if (e.key === 'Escape') setEditingPath(null);
                  }}
                  autoFocus
                  className="px-1.5 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-[#5722AF] rounded outline-none w-full"
                />
                <button
                  type="button"
                  onClick={handleConfirmRename}
                  className="p-0.5 text-emerald-600 hover:text-emerald-700"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPath(null)}
                  className="p-0.5 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="truncate font-medium">{isRoot ? 'ZIP Root (/)' : node.name}</span>
            )}
          </div>

          {/* Counts & Action Buttons */}
          {!isEditing && (
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono">
                {node.fileCount}
              </span>

              {/* Context Actions (Hover Only) */}
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button
                  type="button"
                  title="New Subfolder"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartCreate(node.path);
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-[#5722AF] hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>

                {!isRoot && (
                  <>
                    <button
                      type="button"
                      title="Rename Folder"
                      onClick={(e) => handleStartRename(node.path, node.name, e)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Delete Folder"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmPath(node.path);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Inline Subfolder Creation input */}
        {isCreatingIn === node.path && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 ml-6 mr-2 mt-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700"
            style={{ marginLeft: `${depth * 16 + 24}px` }}
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreate();
                if (e.key === 'Escape') setIsCreatingIn(null);
              }}
              autoFocus
              className="flex-1 px-1.5 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded outline-none focus:border-[#5722AF]"
            />
            <button
              type="button"
              onClick={handleConfirmCreate}
              className="px-2 py-0.5 text-[11px] font-semibold bg-[#5722AF] text-white rounded hover:bg-[#491c94]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingIn(null)}
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Render child nodes */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-3 sm:p-4 flex flex-col h-full shadow-xs">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
        <div className="flex items-center gap-2">
          <FolderTreeIcon className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
            Folder Structure
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleStartCreate('')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/10 transition-colors"
          title="Create New Folder at Root"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* "All Files" Filter option */}
      <div className="mb-2">
        <div
          onClick={() => onSelectFolder(null)}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
            selectedFolderPath === null
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>All Files & Folders</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedFolderPath === null
                ? 'bg-white/20 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {tree.fileCount}
          </span>
        </div>
      </div>

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 min-h-[160px] max-h-[420px]">
        {renderTreeNode(tree, 0)}
      </div>

      {/* Tip for drag drop */}
      <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
        Tip: Drag files into any folder to move them
      </div>

      {/* Delete Folder Modal Confirmation */}
      {deleteConfirmPath !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Delete Folder: <span className="font-mono text-xs">{deleteConfirmPath}</span>
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              How would you like to handle any files inside this folder?
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onDeleteFolder(deleteConfirmPath, false);
                  setDeleteConfirmPath(null);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="font-semibold text-xs text-zinc-900 dark:text-white">
                  Move files to Root (/)
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Keep files in the ZIP archive, just remove this folder path
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteFolder(deleteConfirmPath, true);
                  setDeleteConfirmPath(null);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-950/40 transition-colors"
              >
                <div className="font-semibold text-xs text-red-600 dark:text-red-400">
                  Remove folder and all its files
                </div>
                <div className="text-[11px] text-red-500/80 dark:text-red-400/80">
                  Files are only removed from the ZIP queue (never deleted from your device)
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPath(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
