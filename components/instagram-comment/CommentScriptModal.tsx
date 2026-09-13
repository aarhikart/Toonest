'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Terminal,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  HelpCircle
} from 'lucide-react';

interface CommentScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptCode: string;
  totalComments: number;
  totalUsers: number;
  onShowToast: (msg: string) => void;
}

export const CommentScriptModal: React.FC<CommentScriptModalProps> = ({
  isOpen,
  onClose,
  scriptCode,
  totalComments,
  totalUsers,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      onShowToast('✓ Auto-Commenter script copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Could not access clipboard. Please manually select all text.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5722AF] to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-950/30">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Generated Auto-Commenter Script
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                  Anti-Ban v4.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configured with Smart Batch Rest &amp; Invisible Unicode Jitter for {totalUsers} users ({totalComments} comments)
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

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {/* 4-Step Guide */}
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
                <div className="font-bold text-xs text-slate-900 dark:text-white">Open Post / Reel</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Open the Instagram Post or Reel where you want to post comments.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="w-6 h-6 rounded-lg bg-[#5722AF] text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Press F12 &rarr; Console</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">F12</kbd> &rarr; click <strong>Console</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="w-6 h-6 rounded-lg bg-[#5722AF] text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Paste &amp; Enter</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click <strong>&ldquo;Copy Script&rdquo;</strong> below, paste it, and press Enter.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Watch Safe Commenting</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Watch the on-screen HUD. Smart rests trigger automatically to protect your account.
                </p>
              </div>
            </div>
          </div>

          {/* Anti-Ban Protection Badge List */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Detection Safeguards Active Inside This Script:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-emerald-800/90 dark:text-emerald-300/90 pl-1">
              <li>✓ Smart batch pauses prevent 5&ndash;6 comment block</li>
              <li>✓ Invisible zero-width unicode hash randomizer</li>
              <li>✓ Spintax phrase rotation prevents repetitive text</li>
              <li>✓ Real pointer &amp; mouse click event simulation</li>
            </ul>
          </div>

          {/* Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Terminal className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Executable Script Code</span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#5722AF] hover:bg-[#481c91] text-white active:scale-[0.99]'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
              </button>
            </div>

            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 leading-relaxed">
              <pre>{scriptCode}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            100% In-Browser &bull; Zero login credentials stored or requested
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
