'use client';

import React from 'react';
import { MessageSquare, Tag, Eye, Sparkles } from 'lucide-react';

interface MessageComposerCardProps {
  message: string;
  onChangeMessage: (msg: string) => void;
  sampleUsername?: string;
  disabled?: boolean;
}

const TEMPLATES = [
  { label: 'Short Hello', text: 'hello' },
  { label: 'Personalized Wave', text: 'Hey {username}! Hope you are having a great day! 🙌' },
  { label: 'Content Fan', text: 'Hey @{username}! Loved your recent reels, just wanted to connect! 🚀' },
  { label: 'Outreach / Promo', text: 'Hey {username}, saw your profile and thought you might love this: check it out! 🍿' },
];

export function MessageComposerCard({
  message,
  onChangeMessage,
  sampleUsername = 'capcut_update',
  disabled = false,
}: MessageComposerCardProps) {
  const insertToken = (token: string) => {
    onChangeMessage(message ? `${message} ${token}` : token);
  };

  const preview = message
    ? message.replace(/{username}/gi, sampleUsername).replace(/{user}/gi, sampleUsername)
    : 'No message written yet.';

  return (
    <div className="bg-[#0f121d] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Message to Send</h3>
            <p className="text-[11px] text-zinc-500">The message dispatched to each recipient</p>
          </div>
        </div>

        {/* Character count */}
        <span className="text-xs font-mono text-zinc-500">
          {message.length} chars
        </span>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mr-1">
          Templates:
        </span>
        {TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.label}
            type="button"
            onClick={() => onChangeMessage(tmpl.text)}
            disabled={disabled}
            className="px-2.5 py-1 rounded-lg bg-[#161b2b] hover:bg-cyan-950/60 text-zinc-300 hover:text-cyan-300 border border-zinc-800 hover:border-cyan-800 transition-colors whitespace-nowrap cursor-pointer text-[11px]"
          >
            {tmpl.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="flex-1 flex flex-col space-y-3">
        <textarea
          value={message}
          onChange={(e) => onChangeMessage(e.target.value)}
          disabled={disabled}
          placeholder="Paste your multiline message here..."
          rows={7}
          className="w-full p-4 rounded-2xl font-sans text-xs bg-[#090b12] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-y min-h-[160px] leading-relaxed"
        />

        {/* Token pills */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 font-semibold">Variables:</span>
            <button
              type="button"
              onClick={() => insertToken('{username}')}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800 hover:bg-purple-900 transition-colors cursor-pointer"
            >
              <Tag className="w-3 h-3" />
              {'{username}'}
            </button>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Line breaks &amp; emojis 100% preserved
          </span>
        </div>

        {/* Live Output Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[#090b12] border border-zinc-800/80 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              <Eye className="w-3.5 h-3.5" />
              <span>Exact Live Output Preview (for @{sampleUsername}):</span>
            </div>
            <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Direct DM Format
            </span>
          </div>
          <div className="text-zinc-100 font-sans text-xs whitespace-pre-wrap break-words leading-relaxed bg-[#131b2e] p-3.5 rounded-xl border border-zinc-800 max-h-[200px] overflow-y-auto selection:bg-cyan-600">
            {preview}
          </div>
        </div>
      </div>
    </div>
  );
}
