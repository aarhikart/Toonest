'use client';

import React from 'react';
import { MessageSquare, HelpCircle, Sparkles, Film, Gift, Users2 } from 'lucide-react';
import { COMMENT_PRESETS, DEFAULT_MOVIE_MESSAGES } from '@/lib/instagram/commentScript';

interface CommentMessageCardProps {
  rawMessages: string;
  onChangeMessages: (value: string) => void;
  messageCount: number;
}

export const CommentMessageCard: React.FC<CommentMessageCardProps> = ({
  rawMessages,
  onChangeMessages,
  messageCount,
}) => {
  const handleLoadPreset = (presetId: string) => {
    const preset = COMMENT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onChangeMessages(preset.messages.join('\n'));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Comment Message Variations &amp; Spintax
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add multiple variations (1 per line). Supports Spintax syntax like <code className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">{'{Hey|Hello}'}</code>
            </p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleLoadPreset('movie_promo')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-[#9B6BE8] border border-purple-200 dark:border-purple-800/60 font-semibold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <Film className="w-3 h-3" />
            <span>Movie Promo</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('creator_collab')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Users2 className="w-3 h-3" />
            <span>Collab</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('giveaway_tag')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Gift className="w-3 h-3" />
            <span>Giveaway</span>
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <textarea
          rows={7}
          value={rawMessages}
          onChange={(e) => onChangeMessages(e.target.value)}
          placeholder={`MovieMela link in bio, latest movies available to watch 🎬\n{MovieMela|New movie site} link in bio, check out latest releases 🍿\nMovie lovers should check this out: MovieMela link in bio ✨`}
          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5722AF] transition-all resize-y placeholder:text-slate-400 leading-relaxed"
        />

        {/* Spintax Helper Tip */}
        <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
          <HelpCircle className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Spintax Anti-Spam Tip:</strong> Wrap synonyms in brackets separated by a pipe character, e.g. <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-[#5722AF] dark:text-[#9B6BE8]">{'{Watch now|Check it out|Explore movies}'}</code>. Every comment will randomly choose one variation so Instagram never flags identical text!
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            <strong>{messageCount}</strong> message templates loaded (randomly picked per comment)
          </span>
          <span className="text-[11px] text-slate-400">
            One template per line
          </span>
        </div>
      </div>
    </div>
  );
};
