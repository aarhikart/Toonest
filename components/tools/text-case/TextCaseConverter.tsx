'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CaseMode,
  TitleCaseOptions,
  ConversionHistoryItem,
} from '@/lib/text/types';
import {
  convertCase,
  removeExtraSpaces,
  removeLineBreaks,
  trimLines,
} from '@/lib/text/case-converter';
import { getTextStatistics } from '@/lib/text/text-statistics';

import { CaseSelector } from './CaseSelector';
import { TitleCaseSettings } from './TitleCaseSettings';
import { TextInput } from './TextInput';
import { TextOutput } from './TextOutput';
import { TextStats } from './TextStats';
import { TextActions } from './TextActions';
import { TextHistory } from './TextHistory';
import { TextKeyboardShortcutsModal } from './TextKeyboardShortcutsModal';

import { History, Keyboard } from 'lucide-react';

const STORAGE_HISTORY_KEY = 'toolnest_text_history';

const SAMPLE_TEXT = `welcome to our new website.
this tool helps you convert text quickly.
it works with UPPERCASE, lowercase, and Title Case.
john's new car is fast-and-efficient!`;

export function TextCaseConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<CaseMode>('uppercase');
  const [titleCaseOptions, setTitleCaseOptions] = useState<TitleCaseOptions>({
    style: 'standard',
    preserveSmallWords: true,
  });

  // History state
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveHistory = (items: ConversionHistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  };

  // Instant Live Conversion
  const output = useMemo(() => {
    return convertCase(input, mode, titleCaseOptions);
  }, [input, mode, titleCaseOptions]);

  // Instant Text Statistics
  const stats = useMemo(() => {
    return getTextStatistics(input);
  }, [input]);

  // Record into history when conversion finishes/pauses (debounced)
  useEffect(() => {
    if (!input.trim()) return;

    const timer = setTimeout(() => {
      const entry: ConversionHistoryItem = {
        id: `conv-${Date.now()}`,
        timestamp: Date.now(),
        mode,
        inputPreview: input.slice(0, 80),
        outputPreview: output.slice(0, 80),
        charCount: input.length,
        wordCount: stats.words,
      };

      // Avoid duplicating the immediate last item
      setHistory((prev) => {
        if (prev.length > 0 && prev[0].outputPreview === entry.outputPreview) {
          return prev;
        }
        const updated = [entry, ...prev].slice(0, 20);
        try {
          localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [input, output, mode, stats.words]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + C: Copy result
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        if (output) {
          navigator.clipboard.writeText(output);
        }
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        setIsHistoryOpen(false);
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [output]);

  // Actions
  const handleSwap = useCallback(() => {
    if (!output) return;
    setInput(output);
  }, [output]);

  const handleRemoveExtraSpaces = useCallback(() => {
    setInput((prev) => removeExtraSpaces(prev));
  }, []);

  const handleRemoveLineBreaks = useCallback(() => {
    setInput((prev) => removeLineBreaks(prev));
  }, []);

  const handleTrim = useCallback(() => {
    setInput((prev) => trimLines(prev));
  }, []);

  const handleReset = useCallback(() => {
    setInput('');
    setMode('uppercase');
    setTitleCaseOptions({ style: 'standard', preserveSmallWords: true });
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  const handleTryExample = useCallback(() => {
    setInput(SAMPLE_TEXT);
  }, []);

  const handleLoadHistoryItem = useCallback((item: ConversionHistoryItem) => {
    setInput(item.inputPreview);
    setMode(item.mode);
  }, []);

  const handleClearHistory = useCallback(() => {
    saveHistory([]);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* 1. Main Case Selector Tabs */}
      <div className="w-full max-w-xl mx-auto">
        <CaseSelector mode={mode} onSelectMode={setMode} />
      </div>

      {/* 2. Optional Title Case Settings Bar */}
      {mode === 'titlecase' && (
        <div className="w-full max-w-3xl mx-auto">
          <TitleCaseSettings
            options={titleCaseOptions}
            onChangeOptions={setTitleCaseOptions}
          />
        </div>
      )}

      {/* 3. Two-Column Editing Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* Input Column */}
        <div className="h-full">
          <TextInput
            value={input}
            onChange={setInput}
            onClear={handleClear}
            onTryExample={handleTryExample}
            stats={stats}
          />
        </div>

        {/* Output Column */}
        <div className="h-full">
          <TextOutput
            value={output}
            originalInput={input}
            mode={mode}
            stats={stats}
          />
        </div>
      </div>

      {/* 4. Text Statistics Bar */}
      <TextStats stats={stats} />

      {/* 5. Extra Text Utilities */}
      <TextActions
        onSwap={handleSwap}
        onRemoveExtraSpaces={handleRemoveExtraSpaces}
        onRemoveLineBreaks={handleRemoveLineBreaks}
        onTrim={handleTrim}
        onReset={handleReset}
        hasInput={Boolean(input)}
        hasOutput={Boolean(output)}
      />

      {/* 6. Utility Footer (History & Shortcuts buttons) */}
      <div className="flex items-center justify-between pt-2 px-1 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors font-medium cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Recent History ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            className="flex items-center gap-1.5 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors font-medium cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>
        </div>

        <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Fast in-browser processing
        </div>
      </div>

      {/* Modals */}
      <TextHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadItem={handleLoadHistoryItem}
        onClearHistory={handleClearHistory}
      />

      <TextKeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
