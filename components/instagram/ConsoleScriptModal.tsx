'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Terminal,
  Play,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  Settings2,
  Layers
} from 'lucide-react';
import { generateConsoleScript, ConsoleScriptOptions } from '@/lib/instagram/consoleScript';
import { InstagramUser } from '@/lib/instagram/types';

interface ConsoleScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: InstagramUser[];
  activeMessage: string;
  onShowToast: (msg: string) => void;
}

export const ConsoleScriptModal: React.FC<ConsoleScriptModalProps> = ({
  isOpen,
  onClose,
  users,
  activeMessage,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [targetScope, setTargetScope] = useState<'pending_only' | 'all'>('pending_only');
  const [minDelay, setMinDelay] = useState<number>(2);
  const [maxDelay, setMaxDelay] = useState<number>(3);
  const [autoSend, setAutoSend] = useState<boolean>(true);
  const [mode, setMode] = useState<'profile' | 'direct'>('profile');

  // Filter target usernames based on scope
  const targetUsernames = useMemo(() => {
    const validList = users.filter((u) => u.status !== 'invalid');
    if (targetScope === 'pending_only') {
      const pending = validList.filter((u) => u.status === 'pending').map((u) => u.username);
      return pending.length > 0 ? pending : validList.map((u) => u.username);
    }
    return validList.map((u) => u.username);
  }, [users, targetScope]);

  // Generate the customized script code dynamically
  const generatedCode = useMemo(() => {
    return generateConsoleScript(targetUsernames, activeMessage, {
      minDelaySec: minDelay,
      maxDelaySec: maxDelay,
      autoSend,
      mode,
    });
  }, [targetUsernames, activeMessage, minDelay, maxDelay, autoSend, mode]);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      onShowToast('✓ Console Auto-Sender script copied! Ready to paste into Instagram.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Could not access clipboard. Please select all code manually.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5722AF] to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-950/30">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Browser Console Auto-Sender
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-[#5722AF] dark:text-[#9B6BE8] font-bold text-[10px] uppercase tracking-wider">
                  No Extensions
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste once into Instagram&apos;s DevTools Console &mdash; automatically messages all profiles one by one
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {/* Quick 4-Step Instructions */}
          <div className="space-y-3">
            <div className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>How To Run In 4 Steps</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="w-6 h-6 rounded-lg bg-[#5722AF] text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Open Instagram</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Open <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="text-[#5722AF] dark:text-[#9B6BE8] underline">instagram.com</a> and make sure you are logged in.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="w-6 h-6 rounded-lg bg-[#5722AF] text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Press F12 &rarr; Console</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">F12</kbd> (or right click &rarr; Inspect &rarr; <strong>Console</strong>).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="w-6 h-6 rounded-lg bg-[#5722AF] text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Paste &amp; Press Enter</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click <strong>&ldquo;Copy Script&rdquo;</strong> below, paste it into the console, and hit Enter.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Watch Auto-Send</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  The script opens each profile, clicks &ldquo;Message&rdquo;, types, sends, and proceeds!
                </p>
              </div>
            </div>
          </div>

          {/* Config Controls */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Settings2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Script Options &amp; Targets</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#5722AF] dark:text-[#9B6BE8] bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg">
                {targetUsernames.length} Usernames Included
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Scope */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Profiles to Include
                </label>
                <select
                  value={targetScope}
                  onChange={(e) => setTargetScope(e.target.value as 'pending_only' | 'all')}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="pending_only">Pending Profiles Only</option>
                  <option value="all">All Imported Profiles</option>
                </select>
              </div>

              {/* Mode */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Workflow Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'profile' | 'direct')}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  <option value="profile">Profile (Click &ldquo;Message&rdquo; button)</option>
                  <option value="direct">Direct DM (/direct/t/{'{user}'}/)</option>
                </select>
              </div>

              {/* Delay Range */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Cooldown Delay (Anti-Ban)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={minDelay}
                    onChange={(e) => setMinDelay(Math.max(1, parseInt(e.target.value) || 2))}
                    className="w-16 px-2 py-2 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="number"
                    min={minDelay}
                    max={60}
                    value={maxDelay}
                    onChange={(e) => setMaxDelay(Math.max(minDelay, parseInt(e.target.value) || 3))}
                    className="w-16 px-2 py-2 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                  />
                  <span className="text-slate-400">sec</span>
                </div>
              </div>
            </div>

            {/* Auto-send toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={autoSend}
                  onChange={(e) => setAutoSend(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-[#5722AF] focus:ring-[#5722AF] w-4 h-4 cursor-pointer"
                />
                <span>Automatically press Enter / click Send</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {autoSend ? 'Full hands-free sending' : 'Types text only (you click send)'}
              </span>
            </div>
          </div>

          {/* Generated Code Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Terminal className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Generated Console Script ({targetUsernames.length} targets pre-loaded)</span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#5722AF] hover:bg-[#481c91] text-white active:scale-[0.99]'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
              </button>
            </div>

            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              <pre>{generatedCode}</pre>
            </div>
          </div>

          {/* Important Tip / Pop-up permission notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Important Browser Pop-up Notice</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              When you paste this into your Instagram console, your browser may show a small pop-up blocked icon in the address bar.
              Click it &rarr; choose <strong>&ldquo;Always allow pop-ups for instagram.com&rdquo;</strong>, then run the script again.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-side &bull; Zero login credentials sent to any server</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
