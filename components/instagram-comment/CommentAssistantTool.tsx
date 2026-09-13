'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  MessageSquare,
  Sparkles,
  Terminal,
  ShieldCheck,
  Play,
  Check,
  Clock,
  Coffee,
  AtSign,
  AlertCircle
} from 'lucide-react';
import {
  AntiBanSettings,
  CommentConfig,
} from '@/lib/instagram/commentTypes';
import {
  cleanCommentUsernames,
  DEFAULT_MOVIE_MESSAGES,
  generateCommentScript,
} from '@/lib/instagram/commentScript';
import { CommentInputCard } from './CommentInputCard';
import { CommentMessageCard } from './CommentMessageCard';
import { CommentAntiBanSettings } from './CommentAntiBanSettings';
import { CommentPreviewCard } from './CommentPreviewCard';
import { CommentScriptModal } from './CommentScriptModal';
import { CommentSEO } from './CommentSEO';

const DEFAULT_USERNAMES_TEXT = `@designer_dreamwala
@drx.shivam_ray
@swapnilpawar57_
@stylish_rajput_7773
@khokan_094
@ig_riju_khan
@vvk_patel_924
@jigri_yaar14_2025
@laddlaansh
@_juveriyaa___
@xm_divan_ll
@750rro
@eliteflix_update
@rohan__01_sanatani`;

export const CommentAssistantTool: React.FC = () => {
  // Inputs state
  const [rawUsernames, setRawUsernames] = useState<string>(DEFAULT_USERNAMES_TEXT);
  const [rawMessages, setRawMessages] = useState<string>(DEFAULT_MOVIE_MESSAGES.join('\n'));

  // Anti-Ban Settings state
  const [antiBan, setAntiBan] = useState<AntiBanSettings>({
    minDelaySec: 2,
    maxDelaySec: 3,
    enableBatchBreak: false,
    batchSize: 5,
    batchBreakSec: 45,
    enableZeroWidthJitter: true,
    enableEmojiRotation: true,
    tagsPerComment: 1,
    tagPosition: 'end',
    emulateHumanTyping: true,
  });

  // UI state
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  // Derived Clean Usernames
  const cleanedUsernames = useMemo(() => {
    return cleanCommentUsernames(rawUsernames);
  }, [rawUsernames]);

  // Derived Messages List
  const cleanedMessages = useMemo(() => {
    return rawMessages
      .split('\n')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
  }, [rawMessages]);

  // Calculation Metrics
  const totalComments = useMemo(() => {
    if (cleanedUsernames.length === 0) return 0;
    return Math.ceil(cleanedUsernames.length / antiBan.tagsPerComment);
  }, [cleanedUsernames, antiBan.tagsPerComment]);

  // Estimated Duration Calculation
  const estimatedTimeText = useMemo(() => {
    if (totalComments === 0) return '0 min';
    const avgDelay = (antiBan.minDelaySec + antiBan.maxDelaySec) / 2;
    let totalSec = totalComments * avgDelay;

    if (antiBan.enableBatchBreak && antiBan.batchSize > 0) {
      const numBreaks = Math.floor((totalComments - 1) / antiBan.batchSize);
      totalSec += numBreaks * antiBan.batchBreakSec;
    }

    const minutes = Math.ceil(totalSec / 60);
    return `${minutes} min`;
  }, [totalComments, antiBan]);

  // Generated Script Code
  const generatedScriptCode = useMemo(() => {
    return generateCommentScript({
      usernames: cleanedUsernames,
      messages: cleanedMessages.length > 0 ? cleanedMessages : DEFAULT_MOVIE_MESSAGES,
      antiBan,
    });
  }, [cleanedUsernames, cleanedMessages, antiBan]);

  const handleOpenScript = () => {
    if (cleanedUsernames.length === 0) {
      showToast('Please add at least one username first.');
      return;
    }
    if (cleanedMessages.length === 0) {
      showToast('Please add at least one message template first.');
      return;
    }
    setIsScriptModalOpen(true);
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 dark:border-slate-200">
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-[#5722AF] dark:text-[#9B6BE8] text-xs font-bold border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Anti-Ban Auto Commenter v4.0</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Instagram Auto Comment &amp; User Tag Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Automatically tag lists of users with randomized Spintax messages &amp; smart batch breaks to prevent Instagram action blocks.
        </p>
      </div>

      {/* Primary Action Controller Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-purple-950/20 border border-purple-200 dark:border-purple-900/50 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Campaign Overview</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span>
              <strong>{cleanedUsernames.length}</strong> Target Users
            </span>
            <span>&bull;</span>
            <span>
              <strong>{totalComments}</strong> Comments to Post
            </span>
            <span>&bull;</span>
            <span className="text-[#5722AF] dark:text-[#9B6BE8]">
              Est. Duration: <strong>~{estimatedTimeText}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenScript}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#5722AF] via-[#6d2ec9] to-[#7B45D1] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-purple-950/20 active:scale-[0.99] transition-all cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-amber-300" />
          <span>Generate Auto-Commenter Script</span>
        </button>
      </div>

      {/* Main Grid: Inputs on Left, Controls & Previews on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Usernames & Messages */}
        <div className="lg:col-span-7 space-y-6">
          <CommentInputCard
            rawUsernames={rawUsernames}
            onChangeUsernames={setRawUsernames}
            cleanedUsernames={cleanedUsernames}
          />

          <CommentMessageCard
            rawMessages={rawMessages}
            onChangeMessages={setRawMessages}
            messageCount={cleanedMessages.length}
          />
        </div>

        {/* Right Column (5 cols): Anti-Ban Controls & Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          <CommentAntiBanSettings
            settings={antiBan}
            onChangeSettings={setAntiBan}
          />

          <CommentPreviewCard
            usernames={cleanedUsernames}
            messages={cleanedMessages}
            settings={antiBan}
          />
        </div>
      </div>

      {/* Modal with Copyable Code */}
      <CommentScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        scriptCode={generatedScriptCode}
        totalComments={totalComments}
        totalUsers={cleanedUsernames.length}
        onShowToast={showToast}
      />

      {/* Educational Guide, Anti-Ban Tips & SEO */}
      <CommentSEO />
    </div>
  );
};
