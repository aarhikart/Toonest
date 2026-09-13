'use client';

import React, { useState, useRef } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Clipboard,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';
import { downloadTextAsFile } from '@/lib/text/text-download';

const EXAMPLE_TEXT = `Writing clearly is an important skill for websites, emails, reports, and everyday communication. This simple word counter helps you understand the length of your text. You can quickly check words, characters, sentences, paragraphs, and estimated reading time.`;

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onOpenSettings: () => void;
  wordCount: number;
}

export function TextEditor({
  value,
  onChange,
  onOpenSettings,
  wordCount,
}: TextEditorProps) {
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch {
      textareaRef.current?.focus();
    }
  };

  const handleClearClick = () => {
    if (wordCount > 300) {
      setShowClearConfirm(true);
    } else {
      onChange('');
    }
  };

  const confirmClear = () => {
    onChange('');
    setShowClearConfirm(false);
  };

  const handleDownload = () => {
    if (!value) return;
    downloadTextAsFile(value, 'word-counter-text.txt');
  };

  const handleTryExample = () => {
    onChange(EXAMPLE_TEXT);
  };

  return (
    <div className="w-full bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-sm space-y-4">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex-wrap">
        <div className="flex items-center gap-2">
          <label
            htmlFor="word-counter-textarea"
            className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Text Editor</span>
          </label>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleTryExample}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/10 dark:hover:bg-[#5722AF]/20 border border-[#5722AF]/20 dark:border-[#5722AF]/30 transition-colors flex items-center gap-1 cursor-pointer"
            title="Load sample paragraph"
          >
            <Sparkles className="w-3 h-3" />
            <span>Try Example</span>
          </button>

          <button
            type="button"
            onClick={handlePaste}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Paste from clipboard"
            aria-label="Paste text from clipboard"
          >
            <Clipboard className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="WPM Speed Settings"
            aria-label="Calculation settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {value && (
            <button
              type="button"
              onClick={handleClearClick}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Clear text"
              aria-label="Clear all text"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative min-h-[280px] sm:min-h-[340px]">
        <textarea
          id="word-counter-textarea"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type or paste your text here to instantly count words, characters, and sentences..."
          spellCheck={true}
          className="w-full h-full min-h-[280px] sm:min-h-[340px] resize-y p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-base font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5722AF] focus:border-transparent transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />

        {/* Clear confirmation popover for long text */}
        {showClearConfirm && (
          <div className="absolute inset-0 m-auto w-full max-w-xs h-fit p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl z-20 space-y-3 animate-in fade-in zoom-in-95">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Clear this text ({wordCount} words)?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClear}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#491B93] hover:to-[#6A3ABF] text-white shadow-[#5722AF]/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!value}
            className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download as word-counter-text.txt"
          >
            <Download className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>Download .TXT</span>
          </button>
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClearClick}
            className="text-xs font-semibold text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            Clear Text
          </button>
        )}
      </div>
    </div>
  );
}
