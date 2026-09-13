'use client';

import React from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';

interface VideoInputTabsProps {
  activeTab: 'upload' | 'url';
  onSelectTab: (tab: 'upload' | 'url') => void;
}

export function VideoInputTabs({ activeTab, onSelectTab }: VideoInputTabsProps) {
  return (
    <div className="flex items-center justify-center p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700/70 max-w-sm mx-auto">
      <button
        type="button"
        onClick={() => onSelectTab('upload')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'upload'
            ? 'bg-white dark:bg-[#151923] text-[#5722AF] dark:text-[#9B6BE8] shadow-xs border border-[#5722AF]/20 dark:border-[#5722AF]/40'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <Upload className="w-4 h-4" />
        <span>Upload Video</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('url')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'url'
            ? 'bg-white dark:bg-[#151923] text-[#5722AF] dark:text-[#9B6BE8] shadow-xs border border-[#5722AF]/20 dark:border-[#5722AF]/40'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <LinkIcon className="w-4 h-4" />
        <span>Video URL</span>
      </button>
    </div>
  );
}
