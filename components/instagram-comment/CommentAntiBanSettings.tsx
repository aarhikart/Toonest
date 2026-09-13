'use client';

import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Coffee,
  Sparkles,
  Zap,
  AtSign,
  Keyboard,
  Info
} from 'lucide-react';
import { AntiBanSettings } from '@/lib/instagram/commentTypes';

interface CommentAntiBanSettingsProps {
  settings: AntiBanSettings;
  onChangeSettings: (updated: AntiBanSettings) => void;
}

export const CommentAntiBanSettings: React.FC<CommentAntiBanSettingsProps> = ({
  settings,
  onChangeSettings,
}) => {
  const update = (partial: Partial<AntiBanSettings>) => {
    onChangeSettings({ ...settings, ...partial });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>3. Anti-Detection &amp; Anti-Ban Controls</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] uppercase font-bold tracking-wider">
                Active Protection
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Settings specifically tuned to bypass Instagram&apos;s 5&ndash;6 comment rate-limit blocks
            </p>
          </div>
        </div>
      </div>

      {/* Feature 1: Smart Batch Rest (The Solution to 5-6 comment blocks) */}
      <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <label className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableBatchBreak}
                onChange={(e) => update({ enableBatchBreak: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600 text-[#5722AF] focus:ring-[#5722AF] w-4 h-4 cursor-pointer"
              />
              <span className="flex items-center gap-1.5 text-sm font-bold text-[#5722AF] dark:text-[#9B6BE8]">
                <Coffee className="w-4 h-4" />
                <span>Smart Batch Pause (Stops 5&ndash;6 Comment Block)</span>
              </span>
            </label>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
              Instagram allows a few comments in succession, but flags accounts that post non-stop. Pausing for a short rest resets Instagram&apos;s sliding rate-limit window!
            </p>
          </div>
        </div>

        {settings.enableBatchBreak && (
          <div className="pl-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-800/60 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Batch Size (Comments before resting)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={settings.batchSize}
                  onChange={(e) => update({ batchSize: Math.max(2, parseInt(e.target.value) || 4) })}
                  className="w-16 px-2 py-1.5 text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
                <span className="text-slate-500 dark:text-slate-400 font-medium">comments (Recommended: 3&ndash;5)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-800/60 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Rest Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={180}
                  value={settings.batchBreakSec}
                  onChange={(e) => update({ batchBreakSec: Math.max(15, parseInt(e.target.value) || 60) })}
                  className="w-16 px-2 py-1.5 text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
                <span className="text-slate-500 dark:text-slate-400 font-medium">seconds pause (Recommended: 60s)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Cooldown Delays */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Clock className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Random Delay Between Comments</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Randomized timing mimics real human behavior
          </p>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="number"
              min={1}
              max={60}
              value={settings.minDelaySec}
              onChange={(e) => update({ minDelaySec: Math.max(1, parseInt(e.target.value) || 2) })}
              className="w-16 px-2 py-1.5 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
            />
            <span className="text-slate-400">to</span>
            <input
              type="number"
              min={settings.minDelaySec}
              max={120}
              value={settings.maxDelaySec}
              onChange={(e) => update({ maxDelaySec: Math.max(settings.minDelaySec, parseInt(e.target.value) || 4) })}
              className="w-16 px-2 py-1.5 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
            />
            <span className="text-slate-500 dark:text-slate-400 font-medium">sec</span>
          </div>
        </div>

        {/* Tags per comment */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <AtSign className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Tagging Strategy</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tag placement and density per comment
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <select
              value={settings.tagsPerComment}
              onChange={(e) => update({ tagsPerComment: parseInt(e.target.value) || 1 })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value={1}>1 User / Comment</option>
              <option value={2}>2 Users / Comment</option>
              <option value={3}>3 Users / Comment</option>
            </select>

            <select
              value={settings.tagPosition}
              onChange={(e) => update({ tagPosition: e.target.value as 'start' | 'end' })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              <option value="start">@user Message</option>
              <option value="end">Message @user</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Zero Width Hash Randomizer */}
        <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableZeroWidthJitter}
            onChange={(e) => update({ enableZeroWidthJitter: e.target.checked })}
            className="rounded border-slate-300 dark:border-slate-600 text-[#5722AF] focus:ring-[#5722AF] w-4 h-4 mt-0.5 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              Invisible Unicode Jitter
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Injects invisible characters so each comment has a unique string hash.
            </p>
          </div>
        </label>

        {/* Dynamic Emoji Rotation */}
        <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableEmojiRotation}
            onChange={(e) => update({ enableEmojiRotation: e.target.checked })}
            className="rounded border-slate-300 dark:border-slate-600 text-[#5722AF] focus:ring-[#5722AF] w-4 h-4 mt-0.5 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              Emoji Pool Rotation
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Appends varied emojis (🎬, 🍿, 🔥, ✨) so comments don&apos;t look uniform.
            </p>
          </div>
        </label>

        {/* Human Typing Emulation */}
        <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.emulateHumanTyping}
            onChange={(e) => update({ emulateHumanTyping: e.target.checked })}
            className="rounded border-slate-300 dark:border-slate-600 text-[#5722AF] focus:ring-[#5722AF] w-4 h-4 mt-0.5 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              Simulate Human Cadence
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Types with natural keystroke timing rather than instant mechanical paste.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
