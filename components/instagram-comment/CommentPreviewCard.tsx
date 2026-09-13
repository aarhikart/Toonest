'use client';

import React, { useState, useMemo } from 'react';
import { Eye, RotateCcw, Sparkles, Heart } from 'lucide-react';
import { AntiBanSettings } from '@/lib/instagram/commentTypes';
import { resolveSpintax } from '@/lib/instagram/commentScript';

interface CommentPreviewCardProps {
  usernames: string[];
  messages: string[];
  settings: AntiBanSettings;
}

function resolveSpintaxDeterministic(text: string, seed: number): string {
  const spintaxRegex = /\{([^{}]+)\}/g;
  let idx = 0;
  return text.replace(spintaxRegex, (_, choices) => {
    const parts = choices.split('|');
    const pick = parts[(seed + idx) % parts.length].trim();
    idx++;
    return pick;
  });
}

export const CommentPreviewCard: React.FC<CommentPreviewCardProps> = ({
  usernames,
  messages,
  settings,
}) => {
  const [seed, setSeed] = useState(0);

  const sampleComments = useMemo(() => {
    if (usernames.length === 0 || messages.length === 0) return [];

    const samples: { tags: string[]; text: string; timeAgo: string; likes: number }[] = [];
    const count = Math.min(3, Math.ceil(usernames.length / settings.tagsPerComment));

    const emojiPool = ['🎬', '🍿', '🔥', '✨', '🎥', '💫', '📽️', '🌟'];

    for (let i = 0; i < count; i++) {
      const startIdx = (i * settings.tagsPerComment) % usernames.length;
      const tags = usernames.slice(startIdx, startIdx + settings.tagsPerComment);
      const rawMsg = messages[(i + seed) % messages.length];
      let text = resolveSpintaxDeterministic(rawMsg, i + seed);

      if (settings.enableEmojiRotation) {
        text += ' ' + emojiPool[(i + seed) % emojiPool.length];
      }

      const tagString = tags.map((u) => '@' + u).join(' ');
      const full = settings.tagPosition === 'start' ? `${tagString} ${text}` : `${text} ${tagString}`;

      samples.push({
        tags,
        text: full,
        timeAgo: `${i * 2 + 1}m`,
        likes: ((i * 3 + seed * 5) % 8) + 2,
      });
    }

    return samples;
  }, [usernames, messages, settings, seed]);

  return (
    <div suppressHydrationWarning className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Comment Previews
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sample comments with randomized Spintax &amp; user tagging
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Shuffle Variations</span>
        </button>
      </div>

      {sampleComments.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-400">
          Add usernames and message templates above to preview generated comments.
        </div>
      ) : (
        <div className="space-y-2.5">
          {sampleComments.map((sample, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 text-xs animate-in fade-in duration-200"
            >
              <div className="flex items-start gap-2.5">
                {/* Simulated Instagram Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[1.5px] shrink-0">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-[10px] text-[#5722AF] dark:text-[#9B6BE8]">
                    You
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">your_account</span>
                    <span className="text-[10px] text-slate-400">&bull; {sample.timeAgo}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 font-normal leading-relaxed break-words">
                    {sample.text.split(' ').map((word, wIdx) => {
                      if (word.startsWith('@')) {
                        return (
                          <span key={wIdx} className="font-semibold text-[#5722AF] dark:text-[#9B6BE8]">
                            {word}{' '}
                          </span>
                        );
                      }
                      return word + ' ';
                    })}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-0.5">
                    <span>Reply</span>
                    <span>Translate</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-rose-500 transition-colors shrink-0">
                <Heart className="w-3.5 h-3.5" />
                <span className="text-[10px]">{sample.likes}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
