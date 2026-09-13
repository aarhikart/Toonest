'use client';

import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface TextKeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TextKeyboardShortcutsModal({
  isOpen,
  onClose,
}: TextKeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      keys: ['Ctrl', 'Shift', 'C'],
      macKeys: ['⌘', 'Shift', 'C'],
      desc: 'Copy converted result to clipboard',
    },
    {
      keys: ['Ctrl', 'Enter'],
      macKeys: ['⌘', 'Enter'],
      desc: 'Re-run / update live conversion',
    },
    {
      keys: ['Escape'],
      macKeys: ['Esc'],
      desc: 'Close open dialogs or drawers',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h2
              id="shortcuts-modal-title"
              className="text-sm font-bold text-zinc-900 dark:text-white"
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Close shortcuts modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
            >
              <span className="text-xs text-zinc-700 dark:text-zinc-300">
                {s.desc}
              </span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 shadow-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8] hover:underline cursor-pointer"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
}
