'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  FileText,
} from 'lucide-react';
import { CaseMode, TextStatistics } from '@/lib/text/types';
import { downloadTextFile } from '@/lib/text/download-text';

interface TextOutputProps {
  value: string;
  originalInput: string;
  mode: CaseMode;
  stats: TextStatistics;
}

export function TextOutput({
  value,
  originalInput,
  mode,
  stats,
}: TextOutputProps) {
  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyResult = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    } catch {
      // Fallback
      const el = document.getElementById('text-output-area') as HTMLTextAreaElement;
      if (el) {
        el.select();
        document.execCommand('copy');
        setCopiedResult(true);
        setTimeout(() => setCopiedResult(false), 2000);
      }
    }
  };

  const handleCopyInput = async () => {
    if (!originalInput) return;
    try {
      await navigator.clipboard.writeText(originalInput);
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!value) return;
    downloadTextFile(value, mode);
  };

  const modeBadge =
    mode === 'uppercase'
      ? 'UPPERCASE'
      : mode === 'lowercase'
      ? 'lowercase'
      : 'Title Case';

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-all ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl overflow-hidden' : ''
      }`}
    >
      {/* Output Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80 mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <label
            htmlFor="text-output-area"
            className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white"
          >
            Converted Text
          </label>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] border border-[#5722AF]/20 dark:border-[#5722AF]/30">
            {modeBadge}
          </span>
        </div>

        {/* Action Header Controls */}
        <div className="flex items-center gap-1.5">
          {originalInput && (
            <button
              type="button"
              onClick={handleCopyInput}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy original input text"
            >
              {copiedInput ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Input Copied</span>
                </>
              ) : (
                <span>Copy Input</span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={!value}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download text file (.txt)"
          >
            <Download className="w-3 h-3" />
            <span>.TXT</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Exit expanded view' : 'Expand view'}
            aria-label="Toggle expanded output view"
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Output Textarea */}
      <div className="relative flex-1 min-h-[260px] sm:min-h-[320px]">
        <textarea
          id="text-output-area"
          readOnly
          value={value}
          placeholder="Converted text will appear here automatically..."
          spellCheck={false}
          className="w-full h-full min-h-[260px] sm:min-h-[320px] resize-y p-3.5 rounded-xl bg-purple-50/20 dark:bg-purple-950/10 border border-[#5722AF]/20 dark:border-[#5722AF]/30 text-zinc-900 dark:text-zinc-100 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5722AF] focus:border-transparent transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 cursor-text"
        />

        {!value && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 pointer-events-none p-4 text-center">
            <FileText className="w-8 h-8 mb-2 stroke-1 opacity-50" />
            <p className="text-xs font-medium">Ready to convert</p>
            <p className="text-[11px] text-zinc-400/80">Type or paste text on the left to see instant conversion</p>
          </div>
        )}
      </div>

      {/* Prominent Copy Result Button */}
      <div className="mt-3 pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleCopyResult}
          disabled={!value}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            copiedResult
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#491B93] hover:to-[#6A3ABF] text-white shadow-[#5722AF]/20'
          }`}
        >
          {copiedResult ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Result</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
