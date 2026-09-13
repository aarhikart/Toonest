'use client';

import React from 'react';
import { Users, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { cleanCommentUsernames } from '@/lib/instagram/commentScript';

interface CommentInputCardProps {
  rawUsernames: string;
  onChangeUsernames: (value: string) => void;
  cleanedUsernames: string[];
}

const SAMPLE_USERS = `@designer_dreamwala
@drx.shivam_ray
@swapnilpawar57_
@stylish_rajput_7773
@khokan_094
@ig_riju_khan
@vvk_patel_924
@jigri_yaar14_2025
@laddlaansh
@_juveriyaa___`;

export const CommentInputCard: React.FC<CommentInputCardProps> = ({
  rawUsernames,
  onChangeUsernames,
  cleanedUsernames,
}) => {
  const handleLoadSample = () => {
    onChangeUsernames(SAMPLE_USERS);
  };

  const handleClear = () => {
    onChangeUsernames('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Target Instagram Usernames
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste user handles to tag in post comments (with or without &apos;@&apos;)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-[#9B6BE8] hover:bg-purple-100 dark:hover:bg-purple-900/60 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Load Sample</span>
          </button>

          {rawUsernames && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Clear all usernames"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Input Textarea */}
      <div className="space-y-1.5">
        <div className="relative">
          <textarea
            rows={7}
            value={rawUsernames}
            onChange={(e) => onChangeUsernames(e.target.value)}
            placeholder={`@designer_dreamwala\n@drx.shivam_ray\n@swapnilpawar57_\n@stylish_rajput_7773\n@khokan_094`}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5722AF] transition-all resize-y placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Counter & Status */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong>{cleanedUsernames.length}</strong> unique usernames recognized
          </span>

          <span className="text-[11px] text-slate-400">
            Accepts comma-separated, newlines, or @mentions
          </span>
        </div>
      </div>
    </div>
  );
};
