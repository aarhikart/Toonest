'use client';

import React, { useState, useEffect } from 'react';
import { History, Trash2, ArrowRight } from 'lucide-react';
import { TestSession } from '@/lib/responsive/types';
import { getTestHistory, deleteTestSessionFromHistory } from '@/lib/responsive/storage';

interface TestHistoryProps {
  onLoadSession: (session: TestSession) => void;
}

export const TestHistory: React.FC<TestHistoryProps> = ({ onLoadSession }) => {
  const [history, setHistory] = useState<TestSession[]>([]);

  useEffect(() => {
    setHistory(getTestHistory());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTestSessionFromHistory(id);
    setHistory(getTestHistory());
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
            Recent Test Sessions ({history.length})
          </h4>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-56 overflow-y-auto text-xs">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onLoadSession(item)}
            className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl cursor-pointer transition-colors"
          >
            <div className="min-w-0">
              <p className="font-bold text-zinc-900 dark:text-white truncate">{item.url}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {new Date(item.timestamp).toLocaleDateString()} • {Object.keys(item.deviceStatuses).length} viewports
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => handleDelete(item.id, e)}
                className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors"
                title="Delete session"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
