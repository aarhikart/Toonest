'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileArchive,
  ArrowRight,
  RefreshCw,
  FolderTree,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Info,
  Folder,
  FileText,
} from 'lucide-react';
import { ZipResult, FolderTreeNode } from '@/lib/zipCreatorTypes';
import { formatFileSize } from '@/lib/zipCreatorEngine';

interface ZipCompletionCardProps {
  result: ZipResult;
  folderTree: FolderTreeNode;
  onDownload: () => void;
  onEditFiles: () => void;
  onNewZip: () => void;
}

export function ZipCompletionCard({
  result,
  folderTree,
  onDownload,
  onEditFiles,
  onNewZip,
}: ZipCompletionCardProps) {
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['']));

  const isLarger = result.zipSize > result.originalTotalSize;
  const isIdentical = result.zipSize === result.originalTotalSize;

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderTreeItem = (node: FolderTreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.path);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.path || '__root__'} className="select-none text-xs">
        <div
          className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          onClick={() => toggleNode(node.path)}
        >
          {hasChildren ? (
            <span className="text-zinc-400">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>
          ) : (
            <span className="w-3.5" />
          )}
          <Folder className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {node.name || 'Root (/)'}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono ml-auto">
            {node.fileCount} {node.fileCount === 1 ? 'file' : 'files'} •{' '}
            {formatFileSize(node.totalSize)}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {node.children.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            ZIP Created Successfully
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-mono">
            {result.filename} • {result.fileCount} {result.fileCount === 1 ? 'file' : 'files'} •{' '}
            {result.folderCount} {result.folderCount === 1 ? 'folder' : 'folders'}
          </p>
        </div>
      </div>

      {/* Size Comparison Cards (Section 38) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Original Size */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-1">
          <div className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
            Original Size
          </div>
          <div className="text-xl font-bold text-zinc-800 dark:text-zinc-200 font-mono">
            {formatFileSize(result.originalTotalSize)}
          </div>
        </div>

        {/* ZIP Size */}
        <div className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/15 border border-[#5722AF]/20 dark:border-[#5722AF]/30 text-center space-y-1">
          <div className="text-xs text-[#5722AF] dark:text-[#9B6BE8] font-semibold uppercase tracking-wider">
            ZIP Size
          </div>
          <div className="text-xl font-extrabold text-[#5722AF] dark:text-[#9B6BE8] font-mono">
            {formatFileSize(result.zipSize)}
          </div>
        </div>

        {/* Saved Ratio / Note */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-1">
          <div className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
            Space Saved
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {result.savedPercentage > 0 ? `${result.savedPercentage}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Informative message if ZIP is slightly larger or equivalent */}
      {(isLarger || isIdentical) && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 text-xs">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            The ZIP is slightly larger or similar in size because files (such as JPG, PNG, or MP4)
            were already compressed. Archive metadata and directory headers add a small amount of overhead.
          </span>
        </div>
      )}

      {/* Primary Download Call to Action */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onDownload}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 text-white font-bold text-base shadow-lg shadow-[#5722AF]/25 hover:shadow-xl hover:shadow-[#5722AF]/35 transition-all cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Download ZIP ({formatFileSize(result.zipSize)})</span>
        </button>

        <button
          type="button"
          onClick={onEditFiles}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-semibold text-sm transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Edit Files</span>
        </button>

        <button
          type="button"
          onClick={onNewZip}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm font-semibold transition-colors cursor-pointer"
        >
          <span>Create New ZIP</span>
        </button>
      </div>

      {/* Expandable ZIP Contents Preview (Section 39) */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Preview ZIP Contents ({result.fileCount} files in {result.folderCount} folders)</span>
          </div>
          {isPreviewExpanded ? (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {isPreviewExpanded && (
          <div className="mt-2 p-3 bg-zinc-50/50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800 max-h-60 overflow-y-auto space-y-1 animate-in fade-in">
            {renderTreeItem(folderTree, 0)}
          </div>
        )}
      </div>
    </div>
  );
}
