'use client';

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Archive,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';
import { GeneratedFaviconFile, FaviconConfig } from '@/lib/faviconTypes';
import { formatBytes } from '@/lib/renameEngine';
import { generateHtmlSnippet } from '@/lib/faviconEngine';
import { downloadFaviconPackageAsZip } from '@/lib/zipUtils';

interface GeneratedFilesListProps {
  files: GeneratedFaviconFile[];
  config: FaviconConfig;
  onGenerateAgain: () => void;
}

export function GeneratedFilesList({
  files,
  config,
  onGenerateAgain,
}: GeneratedFilesListProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipFilename, setZipFilename] = useState('favicon-package.zip');

  const htmlSnippet = generateHtmlSnippet(config);
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlSnippet);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleDownloadSingle = (file: GeneratedFaviconFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllZip = async () => {
    if (files.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);

    try {
      await downloadFaviconPackageAsZip(
        files.map((f) => ({ filename: f.filename, blob: f.blob })),
        zipFilename || 'favicon-package.zip',
        (percent) => setZipProgress(percent)
      );
    } catch (err) {
      console.error('ZIP package download failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Completion Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#5722AF]/10 to-transparent border border-emerald-500/30 space-y-4 animate-in fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                Favicon Package Ready
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                {files.length} files generated • Total package size:{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatBytes(totalBytes)}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Package Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <input
                type="text"
                value={zipFilename}
                onChange={(e) => setZipFilename(e.target.value)}
                placeholder="favicon-package.zip"
                className="text-xs px-2 py-1 bg-transparent font-mono text-zinc-800 dark:text-zinc-200 w-44 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#5722AF] hover:bg-[#471a93] text-white flex items-center gap-1.5 shadow-md shadow-[#5722AF]/25 transition-all disabled:opacity-60"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Zipping ({zipProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Package (.zip)</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onGenerateAgain}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
            >
              Edit Settings
            </button>
          </div>
        </div>
      </div>

      {/* Two Columns: Generated Files List (Left) + HTML Snippet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): File List */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-[#0f121a]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Generated Assets ({files.length})
            </h3>
            <span className="text-xs text-zinc-400">Click download for individual files</span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[520px] overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail / Icon preview */}
                  <div
                    className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 p-1 shadow-2xs"
                    style={{
                      backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                    }}
                  >
                    {file.isManifest || file.isHtml ? (
                      <FileCode className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>

                  {/* File info */}
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono block truncate">
                      {file.filename}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      {file.width && file.height && (
                        <span>
                          {file.width}×{file.height} px
                        </span>
                      )}
                      {file.width && <span>•</span>}
                      <span className="uppercase font-semibold text-zinc-500">
                        {file.format}
                      </span>
                      <span>•</span>
                      <span>{formatBytes(file.size)}</span>
                    </div>
                  </div>
                </div>

                {/* Individual Download CTA */}
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(file)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] hover:text-[#5722AF] text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): HTML Code Snippet */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  HTML &lt;head&gt; Code
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyHtml}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-[#5722AF]/10 hover:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] transition-colors flex items-center gap-1.5"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy HTML</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Paste these tags into your HTML website&apos;s <code className="text-[#5722AF] font-bold">&lt;head&gt;</code> section:
            </p>

            <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-800 select-all">
              {htmlSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
