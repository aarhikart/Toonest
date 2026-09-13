'use client';

import React, { useEffect } from 'react';
import { X, HelpCircle, Command, Sparkles, Shield, Keyboard } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Help and User Guide"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              User Guide & Quick Reference
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-zinc-600 dark:text-zinc-300">
          {/* Custom Patterns */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              Pattern Placeholders
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              When using <strong>Custom Pattern</strong> mode, you can combine arbitrary text with placeholders:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200/80 dark:border-zinc-800">
                <code className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">{'{name}'}</code>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Original image name (without extension).
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200/80 dark:border-zinc-800">
                <code className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">{'{number}'}</code>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Sequence index padded with leading zeros.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200/80 dark:border-zinc-800">
                <code className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">{'{date}'}</code>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Current date formatted as YYYY-MM-DD.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200/80 dark:border-zinc-800">
                <code className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">{'{extension}'}</code>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Original file extension (.jpg, .png).
                </p>
              </div>
            </div>
          </div>

          {/* Reordering & Sorting */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Command className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              Image Reordering
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Files are automatically numbered in the exact visual sequence they appear in the table. Drag rows or use the Move Up / Move Down arrows to adjust positions, and sequence numbers will immediately recalculate.
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              Keyboard Navigation
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>Close active modal / dialog</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                  Escape
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>Navigate buttons and inputs</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                  Tab / Shift+Tab
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Activate selected button</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                  Enter / Space
                </kbd>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <Shield className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <strong>Privacy Assurance:</strong> Zero bytes leave your browser. Images are read, transformed, and archived 100% on your device using Web APIs.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 dark:bg-[#181d2a] border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#5722AF] hover:bg-[#4C1D9B] transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
