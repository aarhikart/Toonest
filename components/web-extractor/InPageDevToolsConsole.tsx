'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  X,
  Trash2,
  Copy,
  Check,
  CornerDownLeft,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  Sliders,
  Sparkles,
  ExternalLink,
  Layers,
  Wrench,
} from 'lucide-react';
import { ConsoleLogItem } from '@/lib/web-extractor/types';

interface InPageDevToolsConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ConsoleLogItem[];
  onClear: () => void;
  onSendCommand: (code: string) => void;
  enableEruda: boolean;
  onToggleEruda: (enabled: boolean) => void;
}

const QUICK_COMMANDS = [
  { label: 'Title', code: 'document.title' },
  { label: 'URL', code: 'window.location.href' },
  { label: 'Images count', code: "document.querySelectorAll('img').length" },
  { label: 'Links count', code: "document.querySelectorAll('a').length" },
  { label: 'Body Text', code: 'document.body.innerText.slice(0, 300)' },
  { label: 'Cookies', code: 'document.cookie || "No cookies"' },
  { label: 'User Agent', code: 'navigator.userAgent' },
];

export const InPageDevToolsConsole: React.FC<InPageDevToolsConsoleProps> = ({
  isOpen,
  onClose,
  logs,
  onClear,
  onSendCommand,
  enableEruda,
  onToggleEruda,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'log' | 'eval'>('all');
  const [copiedAll, setCopiedAll] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    onSendCommand(cmd);
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCommandInput(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(nextIdx);
        setCommandInput(history[nextIdx] || '');
      }
    }
  };

  const filteredLogs = logs.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'error') return item.level === 'error' || item.level === 'eval-error';
    if (filter === 'warn') return item.level === 'warn';
    if (filter === 'log') return item.level === 'log' || item.level === 'info';
    if (filter === 'eval') return item.level === 'eval-in' || item.level === 'eval-out';
    return true;
  });

  const errorCount = logs.filter((l) => l.level === 'error' || l.level === 'eval-error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}]: ${l.messages.join(' ')}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="w-full border-t border-zinc-800 bg-[#0c1017] text-zinc-200 flex flex-col h-[320px] transition-all select-none">
      {/* Console Chrome Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#5722AF]/20 text-[#9B6BE8] font-bold text-[11px] border border-[#5722AF]/30">
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Web Console</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('error')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                filter === 'error' ? 'bg-rose-500/20 text-rose-300' : 'text-zinc-400 hover:text-rose-300'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Errors ({errorCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('warn')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                filter === 'warn' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Warns ({warnCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('log')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filter === 'log' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Logs
            </button>
            <button
              type="button"
              onClick={() => setFilter('eval')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filter === 'eval' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Evals
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Full Eruda In-Page DevTools */}
          <button
            type="button"
            onClick={() => onToggleEruda(!enableEruda)}
            title="Inject full in-page mobile & desktop DevTools (Console, Elements, Network)"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              enableEruda
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'bg-zinc-800/80 text-zinc-300 hover:text-white border-zinc-700/60'
            }`}
          >
            <Wrench className="w-3 h-3 text-emerald-400" />
            <span>{enableEruda ? 'DevTools Overlay: ON' : 'Floating DevTools'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLogs}
            title="Copy all logs"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClear}
            title="Clear Console"
            className="p-1 rounded-lg text-zinc-400 hover:text-rose-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close Console Panel"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed Display */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-[11px] space-y-1 divide-y divide-zinc-800/40 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs italic">
            Console is clean. No messages or errors captured yet. Type a command below to inspect the site.
          </div>
        ) : (
          filteredLogs.map((log) => {
            let rowStyle = 'text-zinc-300';
            let badge = <span className="text-zinc-500">[log]</span>;

            if (log.level === 'warn') {
              rowStyle = 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-400 pl-2';
              badge = <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />;
            } else if (log.level === 'error' || log.level === 'eval-error') {
              rowStyle = 'bg-rose-500/10 text-rose-300 border-l-2 border-rose-400 pl-2';
              badge = <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />;
            } else if (log.level === 'eval-in') {
              rowStyle = 'text-[#9B6BE8] font-bold';
              badge = <ChevronRight className="w-3 h-3 text-[#9B6BE8] shrink-0" />;
            } else if (log.level === 'eval-out') {
              rowStyle = 'text-emerald-400 bg-emerald-500/5 pl-2';
              badge = <span className="text-emerald-500 font-bold">&lt;</span>;
            }

            return (
              <div key={log.id} className={`py-1 flex items-start justify-between gap-2 ${rowStyle}`}>
                <div className="flex items-start gap-1.5 min-w-0 flex-1 break-words">
                  {badge}
                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed flex-1">
                    {log.messages.join(' ')}
                  </pre>
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0 font-sans select-none">
                  {log.timestamp}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950/80 border-t border-zinc-800/60 overflow-x-auto text-[10px] shrink-0">
        <span className="text-zinc-500 shrink-0">Quick Run:</span>
        {QUICK_COMMANDS.map((qc) => (
          <button
            key={qc.label}
            type="button"
            onClick={() => {
              setCommandInput(qc.code);
              onSendCommand(qc.code);
            }}
            className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0 font-mono"
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Interactive Command REPL Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-t border-zinc-800 text-xs shrink-0"
      >
        <span className="font-mono font-bold text-[#9B6BE8] text-sm">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Execute JavaScript inside website (e.g. document.title, window.location)..."
          className="flex-1 bg-transparent border-0 text-zinc-100 font-mono text-xs focus:outline-none placeholder-zinc-500"
        />
        <button
          type="submit"
          disabled={!commandInput.trim()}
          className="px-2.5 py-1 rounded-lg bg-[#5722AF] hover:bg-[#481c91] text-white font-bold text-[11px] flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
        >
          <CornerDownLeft className="w-3 h-3" />
          <span>Run</span>
        </button>
      </form>
    </div>
  );
};
