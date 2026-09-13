'use client';

import React from 'react';
import { FileEdit } from 'lucide-react';

interface NotesPanelProps {
  notes: string;
  onChangeNotes: (notes: string) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onChangeNotes }) => {
  return (
    <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3">
      <div className="flex items-center gap-2">
        <FileEdit className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
          Responsive QA Notes &amp; Observations
        </h4>
      </div>

      <textarea
        value={notes}
        onChange={(e) => onChangeNotes(e.target.value)}
        rows={5}
        placeholder="Example: Navigation breaks below 375px; Hero banner image overlaps button on iPad landscape; Footer typography wraps awkwardly on Small Android..."
        className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
      />
      <p className="text-[11px] text-zinc-400">
        Notes are stored locally in your browser and automatically included in exported QA reports.
      </p>
    </div>
  );
};
