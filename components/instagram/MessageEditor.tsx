'use client';

import React, { useState } from 'react';
import { MessageTemplate } from '@/lib/instagram/types';
import { DEFAULT_MESSAGE } from '@/lib/instagram/storage';
import { MessageSquare, Copy, Check, RotateCcw, LayoutTemplate } from 'lucide-react';

interface MessageEditorProps {
  message: string;
  onChangeMessage: (msg: string) => void;
  templates: MessageTemplate[];
  onOpenTemplatesModal: () => void;
  onShowToast: (msg: string) => void;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({
  message,
  onChangeMessage,
  templates,
  onOpenTemplatesModal,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      onShowToast('Message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Could not copy message automatically');
    }
  };

  const handleReset = () => {
    onChangeMessage(DEFAULT_MESSAGE);
    onShowToast('Message reset to default');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Prepared Message Composer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The exact text prepared for manual pasting into Instagram DM
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenTemplatesModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors cursor-pointer"
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>Templates ({templates.length})</span>
        </button>
      </div>

      {/* Template Quick Chips */}
      {templates.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 shrink-0 text-[11px] font-medium mr-1">Quick Select:</span>
          {templates.map((tmpl) => {
            const isActive = message.trim() === tmpl.content.trim();
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  onChangeMessage(tmpl.content);
                  onShowToast(`Applied template: "${tmpl.name}"`);
                }}
                className={`px-2.5 py-1 rounded-lg shrink-0 border text-[11px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#5722AF] text-white border-[#5722AF] shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                {tmpl.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
          placeholder="Write your prepared message here..."
          className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5722AF] focus:border-transparent transition-all resize-y leading-relaxed"
        />
      </div>

      {/* Footer Controls & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono">
          <span>{message.length} chars</span>
          <span>•</span>
          <span>{message.split(/\s+/).filter(Boolean).length} words</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-purple-50 dark:bg-purple-950/50 text-[#5722AF] dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-[#5722AF] hover:text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Message'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
