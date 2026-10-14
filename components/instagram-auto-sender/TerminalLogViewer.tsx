'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, ArrowDown, Filter } from 'lucide-react';

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  workerId?: number;
  username?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface TerminalLogViewerProps {
  logs: TerminalLogEntry[];
  onClearLogs: () => void;
}

export function TerminalLogViewer({ logs, onClearLogs }: TerminalLogViewerProps) {
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'success' | 'warning' | 'error'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((l) => {
    if (filterType === 'all') return true;
    return l.type === filterType;
  });

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0f121d] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>Execution Command Terminal</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#161b2b] text-zinc-400 border border-zinc-800">
                {logs.length} events
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500">Live multi-worker activity & delivery confirmation stream</p>
          </div>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#161b2b] border border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType('success')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'success' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sent
            </button>
            <button
              type="button"
              onClick={() => setFilterType('warning')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'warning' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Skipped
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded-lg bg-[#161b2b] hover:bg-[#1f263d] text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded-lg bg-[#161b2b] hover:bg-[#1f263d] text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="flex-1 rounded-2xl bg-[#05070c] border border-zinc-800/90 p-4 font-mono text-[11px] overflow-hidden flex flex-col shadow-inner">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60 text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-[10px] text-zinc-500 ml-2">toolnest-instagram-sender ~ bash</span>
          </div>

          <label className="flex items-center gap-1 text-[10px] cursor-pointer select-none text-zinc-500 hover:text-zinc-400">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-zinc-800 bg-zinc-900 text-purple-600 w-3 h-3"
            />
            <span>Auto-scroll</span>
          </label>
        </div>

        {/* Log Entries Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 max-h-[220px] pr-1">
          {filteredLogs.length === 0 ? (
            <div className="text-zinc-600 py-6 text-center italic">
              Terminal ready. Click "Copy Fast Auto-Sender Script" or start live execution to stream worker logs.
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={`terminal-entry-${log.id || 'row'}-${index}-${log.timestamp || ''}`}
                className="flex items-start gap-2 leading-relaxed"
              >
                <span className="text-zinc-600 select-none">[{log.timestamp}]</span>
                {log.workerId && (
                  <span className="px-1 rounded bg-[#161b2b] text-purple-400 font-bold text-[10px]">
                    W{log.workerId}
                  </span>
                )}
                <span
                  className={
                    log.type === 'success'
                      ? 'text-emerald-400 font-semibold'
                      : log.type === 'warning'
                      ? 'text-amber-400'
                      : log.type === 'error'
                      ? 'text-red-400'
                      : 'text-zinc-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
