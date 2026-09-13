'use client';

import React, { useState } from 'react';
import {
  Archive,
  Settings,
  Info,
  ChevronDown,
  ChevronUp,
  FolderTree,
  FileCheck,
  AlertTriangle,
  FileArchive,
} from 'lucide-react';
import {
  ZipCreatorConfig,
  CompressionLevel,
  DuplicateStrategy,
} from '@/lib/zipCreatorTypes';
import { sanitizeZipName } from '@/lib/zipCreatorEngine';

interface ZipSettingsCardProps {
  config: ZipCreatorConfig;
  onChangeConfig: (newConfig: ZipCreatorConfig) => void;
  totalFiles: number;
  totalBytes: number;
}

export function ZipSettingsCard({
  config,
  onChangeConfig,
  totalFiles,
  totalBytes,
}: ZipSettingsCardProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const isLargeBatch = totalFiles > 100 || totalBytes > 250 * 1024 * 1024;

  const handleZipNameChange = (val: string) => {
    onChangeConfig({
      ...config,
      zipName: val,
    });
  };

  const handleZipNameBlur = () => {
    onChangeConfig({
      ...config,
      zipName: sanitizeZipName(config.zipName),
    });
  };

  const handleCompressionChange = (level: CompressionLevel) => {
    onChangeConfig({
      ...config,
      compressionLevel: level,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Title & Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <FileArchive className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
            ZIP Settings
          </h3>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Standards-compliant .zip format
        </span>
      </div>

      {/* Large File Set Alert (Section 45) */}
      {isLargeBatch && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="font-bold">Large file set detected</div>
            <div>
              Creating this ZIP may use significant browser memory and take longer. If performance
              is an issue, consider choosing the <strong>Fast</strong> or <strong>Store</strong> compression level.
            </div>
          </div>
        </div>
      )}

      {/* Primary Settings: ZIP Filename & Compression Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ZIP Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            ZIP File Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={config.zipName}
              onChange={(e) => handleZipNameChange(e.target.value)}
              onBlur={handleZipNameBlur}
              placeholder="my-files.zip"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-[#5722AF] font-mono text-zinc-900 dark:text-white"
            />
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Automatically formatted with .zip extension
          </p>
        </div>

        {/* Compression Level Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Compression Level
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
            {(
              [
                { id: 'STORE', label: 'Store', tip: 'No compression (fastest)' },
                { id: 'FAST', label: 'Fast', tip: 'Level 1' },
                { id: 'BALANCED', label: 'Balanced', tip: 'Level 6 (recommended)' },
                { id: 'MAXIMUM', label: 'Maximum', tip: 'Level 9' },
              ] as { id: CompressionLevel; label: string; tip: string }[]
            ).map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleCompressionChange(lvl.id)}
                title={lvl.tip}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  config.compressionLevel === lvl.id
                    ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <Info className="w-3 h-3 text-zinc-400 shrink-0" />
            <span>
              Images, videos, and existing archives are already compressed and may not shrink
              significantly.
            </span>
          </p>
        </div>
      </div>

      {/* Empty Folders Option */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Include Empty Folders
          </div>
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Preserve folders in the archive even if they contain no files
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            onChangeConfig({
              ...config,
              includeEmptyFolders: !config.includeEmptyFolders,
            })
          }
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            config.includeEmptyFolders ? 'bg-[#5722AF]' : 'bg-zinc-200 dark:bg-zinc-700'
          }`}
          role="switch"
          aria-checked={config.includeEmptyFolders}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              config.includeEmptyFolders ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Advanced Settings Collapsible */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Advanced Options</span>
          {isAdvancedOpen ? (
            <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        {isAdvancedOpen && (
          <div className="mt-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-3.5 text-xs animate-in fade-in duration-150">
            {/* ZIP Comment */}
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                ZIP Archive Comment
              </label>
              <input
                type="text"
                value={config.comment}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    comment: e.target.value,
                  })
                }
                placeholder="e.g. Project Archive - Created with ToolNest"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:border-[#5722AF] text-zinc-800 dark:text-zinc-200"
              />
              <p className="text-[10px] text-zinc-400">
                Embedded inside the ZIP metadata header (standard zip comment format)
              </p>
            </div>

            {/* Duplicate Strategy */}
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Duplicate Filename Resolution
              </label>
              <select
                value={config.duplicateStrategy}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    duplicateStrategy: e.target.value as DuplicateStrategy,
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:border-[#5722AF] text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <option value="auto-rename">Auto-Rename (photo (1).jpg, photo (2).jpg)</option>
                <option value="keep-folders">Keep Original Folder Paths</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
