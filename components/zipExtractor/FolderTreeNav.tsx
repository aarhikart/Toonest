'use client';

import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Layers,
  Download,
  FolderTree as FolderTreeIcon,
} from 'lucide-react';
import { FolderNode } from '@/lib/zipExtractorTypes';
import { formatFileSize } from '@/lib/zipExtractorEngine';

interface FolderTreeNavProps {
  tree: FolderNode;
  selectedFolderPath: string | null; // null for All Files, "" for root
  onSelectFolder: (path: string | null) => void;
  onDownloadFolderAsZip: (folderPath: string, folderName: string) => void;
}

export function FolderTreeNav({
  tree,
  selectedFolderPath,
  onSelectFolder,
  onDownloadFolderAsZip,
}: FolderTreeNavProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['']));

  const toggleExpand = (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderNode = (node: FolderNode, depth: number = 0) => {
    const isRoot = node.path === '';
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = selectedFolderPath === node.path;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.path || '__root__'} className="select-none">
        <div
          onClick={() => onSelectFolder(node.path)}
          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
            isSelected
              ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] font-semibold border border-[#5722AF]/30 dark:border-[#5722AF]/40'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-transparent'
          }`}
          style={{ paddingLeft: `${Math.max(10, depth * 14 + 10)}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
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
              <span className="w-3.5" />
            )}

            {isExpanded || isSelected ? (
              <FolderOpen className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            )}

            <span className="truncate font-medium">
              {isRoot ? 'Archive Root (/)' : node.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono">
              {node.fileCount}
            </span>

            {/* Quick Download Folder action (hover only) */}
            {!isRoot && (
              <button
                type="button"
                title={`Download "${node.name}" as ZIP`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadFolderAsZip(node.path, node.name);
                }}
                className="hidden group-hover:flex p-1 rounded text-zinc-400 hover:text-[#5722AF] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Download className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-3 sm:p-4 flex flex-col h-full shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
        <div className="flex items-center gap-2">
          <FolderTreeIcon className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
            Archive Folders
          </span>
        </div>
      </div>

      {/* "All Files" Top View Filter */}
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
            <span>All Files in Archive</span>
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
        {renderNode(tree, 0)}
      </div>
    </div>
  );
}
