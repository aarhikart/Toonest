'use client';

import React from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';

interface BreadcrumbNavProps {
  currentPath: string | null;
  onNavigate: (path: string | null) => void;
}

export function BreadcrumbNav({ currentPath, onNavigate }: BreadcrumbNavProps) {
  if (currentPath === null) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 py-1 font-medium">
        <span className="flex items-center gap-1 text-[#5722AF] dark:text-[#9B6BE8] font-semibold">
          <Home className="w-3.5 h-3.5" />
          <span>All Files in Archive</span>
        </span>
      </div>
    );
  }

  const segments = currentPath ? currentPath.split('/') : [];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-xs text-zinc-500 dark:text-zinc-400 py-1">
      <button
        type="button"
        onClick={() => onNavigate('')}
        className="flex items-center gap-1 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors font-semibold"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Root</span>
      </button>

      {segments.map((seg, idx) => {
        const pathUpTo = segments.slice(0, idx + 1).join('/');
        const isLast = idx === segments.length - 1;

        return (
          <React.Fragment key={pathUpTo}>
            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            {isLast ? (
              <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>{seg}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(pathUpTo)}
                className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors"
              >
                {seg}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
