'use client';

import React from 'react';
import {
  ArrowLeftRight,
  Minimize2,
  Sparkles,
  RotateCcw,
  Scissors,
  Space,
} from 'lucide-react';

interface TextActionsProps {
  onSwap: () => void;
  onRemoveExtraSpaces: () => void;
  onRemoveLineBreaks: () => void;
  onTrim: () => void;
  onReset: () => void;
  hasInput: boolean;
  hasOutput: boolean;
}

export function TextActions({
  onSwap,
  onRemoveExtraSpaces,
  onRemoveLineBreaks,
  onTrim,
  onReset,
  hasInput,
  hasOutput,
}: TextActionsProps) {
  return (
    <div className="w-full bg-white dark:bg-[#12151e] rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Swap Button */}
          <button
            type="button"
            onClick={onSwap}
            disabled={!hasOutput}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Swap converted output back into input"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Swap Input/Output</span>
          </button>

          {/* Remove Extra Spaces */}
          <button
            type="button"
            onClick={onRemoveExtraSpaces}
            disabled={!hasInput}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Collapse consecutive spaces to a single space"
          >
            <Space className="w-3.5 h-3.5" />
            <span>Remove Extra Spaces</span>
          </button>

          {/* Remove Line Breaks */}
          <button
            type="button"
            onClick={onRemoveLineBreaks}
            disabled={!hasInput}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Join all lines into a continuous paragraph"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Remove Line Breaks</span>
          </button>

          {/* Trim Text */}
          <button
            type="button"
            onClick={onTrim}
            disabled={!hasInput}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Trim leading and trailing whitespace from lines"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Trim Text</span>
          </button>
        </div>

        {/* Reset Button */}
        <div>
          <button
            type="button"
            onClick={onReset}
            disabled={!hasInput && !hasOutput}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset everything to default state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
