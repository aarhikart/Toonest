'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Hash, Calendar, FileText, Type, X, Check, ArrowRight } from 'lucide-react';
import { ZipFileItem, BulkRenameConfig } from '@/lib/zipCreatorTypes';
import { evaluateRenamePattern } from '@/lib/zipCreatorEngine';

interface BulkRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ZipFileItem[];
  selectedFileIds: Set<string>;
  onApply: (renamedMap: Map<string, string>) => void;
}

export function BulkRenameModal({
  isOpen,
  onClose,
  files,
  selectedFileIds,
  onApply,
}: BulkRenameModalProps) {
  const [pattern, setPattern] = useState('project-{number}');
  const [startNumber, setStartNumber] = useState(1);
  const [padding, setPadding] = useState(3);
  const [targetScope, setTargetScope] = useState<'all' | 'selected'>(
    selectedFileIds.size > 0 ? 'selected' : 'all'
  );

  const targetFiles = useMemo(() => {
    if (targetScope === 'selected' && selectedFileIds.size > 0) {
      return files.filter((f) => selectedFileIds.has(f.id));
    }
    return files;
  }, [files, targetScope, selectedFileIds]);

  const config: BulkRenameConfig = useMemo(
    () => ({
      pattern,
      startNumber,
      padding,
      targetScope,
    }),
    [pattern, startNumber, padding, targetScope]
  );

  // Compute live preview pairs
  const previewPairs = useMemo(() => {
    const map = new Map<string, string>();
    const pairs: { id: string; original: string; renamed: string }[] = [];

    targetFiles.forEach((file, idx) => {
      const renamed = evaluateRenamePattern(pattern, file, idx, config);
      map.set(file.id, renamed);
      pairs.push({
        id: file.id,
        original: file.name,
        renamed,
      });
    });

    return { map, pairs };
  }, [targetFiles, pattern, config]);

  if (!isOpen) return null;

  const insertTag = (tag: string) => {
    setPattern((prev) => `${prev}${tag}`);
  };

  const handleApply = () => {
    onApply(previewPairs.map);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Bulk Rename Files"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-white">Bulk Rename</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rename {targetFiles.length} files using custom patterns
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Target Scope Switcher */}
          {selectedFileIds.size > 0 && (
            <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTargetScope('selected')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  targetScope === 'selected'
                    ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Selected Files ({selectedFileIds.size})
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  targetScope === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                All Files ({files.length})
              </button>
            </div>
          )}

          {/* Pattern Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Filename Pattern
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. photo-{number} or {name}-{date}"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-[#5722AF] font-mono text-zinc-900 dark:text-white"
            />
            {/* Quick Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                Insert tag:
              </span>
              <button
                type="button"
                onClick={() => insertTag('{number}')}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#5722AF]/10 hover:text-[#5722AF] transition-colors"
              >
                <Hash className="w-3 h-3" /> {'{number}'}
              </button>
              <button
                type="button"
                onClick={() => insertTag('{name}')}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#5722AF]/10 hover:text-[#5722AF] transition-colors"
              >
                <Type className="w-3 h-3" /> {'{name}'}
              </button>
              <button
                type="button"
                onClick={() => insertTag('{date}')}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#5722AF]/10 hover:text-[#5722AF] transition-colors"
              >
                <Calendar className="w-3 h-3" /> {'{date}'}
              </button>
              <button
                type="button"
                onClick={() => insertTag('{extension}')}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#5722AF]/10 hover:text-[#5722AF] transition-colors"
              >
                <FileText className="w-3 h-3" /> {'{extension}'}
              </button>
            </div>
          </div>

          {/* Numbers & Padding Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Start Number
              </label>
              <input
                type="number"
                min={0}
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-[#5722AF]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Number Padding (Digits)
              </label>
              <select
                value={padding}
                onChange={(e) => setPadding(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-[#5722AF]"
              >
                <option value={1}>1 (e.g. 1, 2, 3)</option>
                <option value={2}>2 (e.g. 01, 02, 03)</option>
                <option value={3}>3 (e.g. 001, 002, 003)</option>
                <option value={4}>4 (e.g. 0001, 0002)</option>
              </select>
            </div>
          </div>

          {/* Live Preview List */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span>Preview</span>
              <span className="text-[11px] font-normal text-zinc-400">
                Showing first {Math.min(5, previewPairs.pairs.length)} files
              </span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 space-y-1.5 max-h-40 overflow-y-auto">
              {previewPairs.pairs.slice(0, 8).map((pair) => (
                <div
                  key={pair.id}
                  className="flex items-center justify-between gap-2 text-xs px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
                >
                  <span className="truncate text-zinc-400 dark:text-zinc-500 font-mono text-[11px] max-w-[42%]">
                    {pair.original}
                  </span>
                  <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="truncate text-[#5722AF] dark:text-[#9B6BE8] font-mono text-[11px] font-semibold max-w-[50%]">
                    {pair.renamed}
                  </span>
                </div>
              ))}
              {previewPairs.pairs.length === 0 && (
                <div className="text-center py-3 text-xs text-zinc-400">No files selected</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2.5 bg-zinc-50/50 dark:bg-zinc-800/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={targetFiles.length === 0}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-[#5722AF] hover:bg-[#491c94] text-white rounded-xl shadow-md shadow-[#5722AF]/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Rename</span>
          </button>
        </div>
      </div>
    </div>
  );
}
