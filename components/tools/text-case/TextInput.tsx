'use client';

import React, { useRef } from 'react';
import { Clipboard, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { TextStatistics } from '@/lib/text/types';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onTryExample: () => void;
  stats: TextStatistics;
  maxLength?: number;
}

export function TextInput({
  value,
  onChange,
  onClear,
  onTryExample,
  stats,
  maxLength = 500000,
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text.slice(0, maxLength));
      }
    } catch {
      textareaRef.current?.focus();
    }
  };

  const isLimitReached = value.length >= maxLength;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors">
      {/* Input Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80 mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <label
            htmlFor="text-input-area"
            className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white"
          >
            Input Text
          </label>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            ({stats.words} words • {stats.characters} chars)
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTryExample}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/10 dark:hover:bg-[#5722AF]/20 border border-[#5722AF]/20 dark:border-[#5722AF]/30 transition-colors flex items-center gap-1 cursor-pointer"
            title="Load sample text"
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
            <Clipboard className="w-3.5 h-3.5" />
          </button>

          {value && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Clear input"
              aria-label="Clear input text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative flex-1 min-h-[260px] sm:min-h-[320px]">
        <textarea
          id="text-input-area"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="Type or paste your text here..."
          spellCheck={false}
          className="w-full h-full min-h-[260px] sm:min-h-[320px] resize-y p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5722AF] focus:border-transparent transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />

        {isLimitReached && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-1 rounded-md border border-amber-300 dark:border-amber-700">
            <AlertCircle className="w-3 h-3" />
            <span>Character limit reached ({maxLength.toLocaleString()})</span>
          </div>
        )}
      </div>

      {/* Footer info bar */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-1">
        <span>Characters: {stats.characters} • Words: {stats.words} • Lines: {stats.lines}</span>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors font-medium cursor-pointer"
          >
            Clear Text
          </button>
        )}
      </div>
    </div>
  );
}
