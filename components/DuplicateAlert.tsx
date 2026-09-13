'use client';

import React from 'react';
import { AlertTriangle, Wand2, ShieldAlert } from 'lucide-react';

interface DuplicateAlertProps {
  duplicateCount: number;
  onAutoResolve: () => void;
}

export function DuplicateAlert({ duplicateCount, onAutoResolve }: DuplicateAlertProps) {
  if (duplicateCount === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Duplicate Filenames Detected ({duplicateCount} conflict{duplicateCount > 1 ? 's' : ''})
          </h4>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5 max-w-xl">
            Multiple images would share identical names, which would overwrite files on download. Click auto-resolve to append unique numbering or adjust your rename settings.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAutoResolve}
        className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <Wand2 className="w-3.5 h-3.5" />
        <span>Auto-Resolve Conflicts</span>
      </button>
    </div>
  );
}
