'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Terminal, Sparkles, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ScriptModalProps {
  scriptCode?: string;
  singleTabScript?: string;
  multiTabScript?: string;
  isOpen: boolean;
  onClose: () => void;
  userCount: number;
  concurrentTabs: number;
}

export function ScriptModal({
  scriptCode,
  singleTabScript,
  multiTabScript,
  isOpen,
  onClose,
  userCount,
  concurrentTabs,
}: ScriptModalProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Active script selection
  const singleCode = singleTabScript || scriptCode || '';
  const multiCode = multiTabScript || scriptCode || '';
  const currentCode = activeTab === 'single' ? singleCode : multiCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f121d] border border-zinc-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Instagram Auto Message Sender Console Scripts</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {userCount} Target(s)
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Choose the script mode that fits your workflow. Copy and paste into your browser console!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#161b2b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 pb-2 bg-[#0b0e17] border-b border-zinc-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('single');
              setCopied(false);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'single'
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-md'
                : 'bg-[#131b2e] text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Single-Tab In-Page (Popup Chat Fix)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Recommended
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('multi');
              setCopied(false);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'multi'
                ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 shadow-md'
                : 'bg-[#131b2e] text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Multi-Tab Background Worker</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {concurrentTabs} Tabs + HUD
            </span>
          </button>
        </div>

        {/* Mode Feature Guarantee Callout */}
        <div className="px-5 py-3 bg-[#090c14] border-b border-zinc-800/60 text-xs">
          {activeTab === 'single' ? (
            <div className="flex items-start gap-2 text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Popup Premature Close Fixed: </span>
                <span>
                  Uses reliable viewport bounding checks (ignores <code className="bg-[#161b2b] px-1 py-0.5 rounded text-zinc-300">offsetParent</code>). Verifies the chatbox input and Send button first, types your multiline message, and <strong>ONLY closes the popup AFTER the message is 100% sent</strong>! If chatbox is not ready, the popup will NEVER be closed prematurely.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-zinc-300">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Parallel Worker Pool: </span>
                <span>
                  Dispatches up to {concurrentTabs} background tabs simultaneously with a floating on-screen HUD, pause/stop controls, and trusted click dispatch.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Steps */}
        <div className="p-4 bg-[#090b12] border-b border-zinc-800 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#131b2e] border border-zinc-800/80 space-y-0.5">
              <div className="font-bold text-purple-400">1. Open Instagram</div>
              <p className="text-[11px] text-zinc-400">
                Go to{' '}
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline font-semibold"
                >
                  instagram.com
                </a>{' '}
                and log into your account.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#131b2e] border border-zinc-800/80 space-y-0.5">
              <div className="font-bold text-purple-400">2. Press F12 Console</div>
              <p className="text-[11px] text-zinc-400">
                Press <code className="bg-[#090b12] px-1 py-0.5 rounded text-zinc-300">F12</code> (or Inspect &gt; Console).
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#131b2e] border border-zinc-800/80 space-y-0.5">
              <div className="font-bold text-purple-400">3. Paste &amp; Press Enter</div>
              <p className="text-[11px] text-zinc-400">
                Paste the copied code and press Enter. Sit back and watch it run!
              </p>
            </div>
          </div>
        </div>

        {/* Script Preview Box */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col space-y-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">
              {activeTab === 'single' ? 'Single-Tab In-Page Script (fastDirectMessagePersisted):' : 'Multi-Tab Background Worker Script:'}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">{currentCode.length} bytes</span>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl bg-[#05070c] border border-zinc-800 p-4 font-mono text-[11px] text-zinc-300 leading-relaxed shadow-inner max-h-[220px]">
            <pre className="whitespace-pre-wrap">{currentCode}</pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#0f121d] flex items-center justify-between gap-3 flex-wrap">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#161b2b] hover:bg-[#1f263d] text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            Open Instagram in New Tab
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy {activeTab === 'single' ? 'Single-Tab' : 'Multi-Tab'} Script
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
