'use client';

import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  BookOpen,
  Clock,
  Hash,
  AlignLeft,
  ListTree,
} from 'lucide-react';
import { ExtractedWebData } from '@/lib/web-extractor/types';

interface ExtractedTextTabProps {
  data: ExtractedWebData;
}

export const ExtractedTextTab: React.FC<ExtractedTextTabProps> = ({ data }) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const { textContent, headings } = data;

  const handleCopyText = () => {
    navigator.clipboard.writeText(textContent.cleanText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyMarkdown = () => {
    const mdLines: string[] = [];
    mdLines.push(`# ${data.metadata.title || data.domain}\n`);
    mdLines.push(`Source: ${data.targetUrl}\n\n`);

    if (headings.length > 0) {
      headings.forEach((h) => {
        mdLines.push(`${'#'.repeat(h.level)} ${h.text}\n`);
      });
      mdLines.push('\n---\n');
    }

    textContent.paragraphs.forEach((p) => {
      mdLines.push(`${p}\n\n`);
    });

    navigator.clipboard.writeText(mdLines.join(''));
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([textContent.cleanText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.domain}-extracted-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
            <BookOpen className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Word Count</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {textContent.wordCount.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Reading Time</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            ~{textContent.readingTimeMinutes} min
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
            <Hash className="w-4 h-4 text-cyan-500" />
            <span>Characters</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {textContent.charCount.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
            <AlignLeft className="w-4 h-4 text-amber-500" />
            <span>Paragraphs</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {textContent.paragraphs.length}
          </p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Extracted Article &amp; Body Content</span>
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'Copied Text!' : 'Copy Plain Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMd ? 'Copied Markdown!' : 'Copy Markdown'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Content Layout: Headings Outline + Body Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Headings Outline */}
        {headings.length > 0 && (
          <div className="lg:col-span-1 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-fit max-h-[500px] overflow-y-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
              <ListTree className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Headings Structure ({headings.length})</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              {headings.map((h, idx) => (
                <div
                  key={idx}
                  className="truncate text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                  title={h.text}
                >
                  <span className="font-mono text-[10px] text-zinc-400 mr-1">H{h.level}</span>
                  {h.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Paragraphs */}
        <div className={`${headings.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'} p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4`}>
          {textContent.paragraphs.length > 0 ? (
            textContent.paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
              >
                {para}
              </p>
            ))
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
              No long text paragraphs detected on this page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
