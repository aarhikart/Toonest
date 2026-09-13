'use client';

import React, { useState } from 'react';
import { InstagramUser, OpenTargetMode, DestinationType } from '@/lib/instagram/types';
import {
  UserCheck,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Send,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Zap,
  MessageSquare,
  User as UserIcon,
  Terminal
} from 'lucide-react';

interface CurrentUserCardProps {
  currentUser: InstagramUser | null;
  currentIndex: number;
  totalUsers: number;
  preparedMessage: string;
  openMode: OpenTargetMode;
  destinationMode?: DestinationType;
  onChangeOpenMode: (mode: OpenTargetMode) => void;
  onChangeDestinationMode?: (mode: DestinationType) => void;
  onOpenHelperModal?: () => void;
  onOpenConsoleModal?: () => void;
  onMarkSent: (userId: string) => void;
  onSkipUser: (userId: string) => void;
  onPrevUser: () => void;
  onNextUser: () => void;
  onShowToast: (msg: string) => void;
}

export const CurrentUserCard: React.FC<CurrentUserCardProps> = ({
  currentUser,
  currentIndex,
  totalUsers,
  preparedMessage,
  openMode,
  destinationMode = 'direct_chat',
  onChangeOpenMode,
  onChangeDestinationMode,
  onOpenHelperModal,
  onOpenConsoleModal,
  onMarkSent,
  onSkipUser,
  onPrevUser,
  onNextUser,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [sentFeedback, setSentFeedback] = useState(false);

  // Copy message to clipboard helper
  const copyMessageToClipboard = async (): Promise<boolean> => {
    if (!preparedMessage) return false;
    try {
      await navigator.clipboard.writeText(preparedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      onShowToast('Could not automatically access clipboard. Please copy manually.');
      return false;
    }
  };

  // Open with message copied and #toolnest payload attached
  const handleCopyAndOpen = async (overrideDest?: DestinationType) => {
    if (!currentUser) return;
    const dest = overrideDest || destinationMode;
    const ok = await copyMessageToClipboard();
    if (ok) {
      onShowToast(
        dest === 'direct_chat'
          ? 'Message copied! Opening Instagram Direct DM...'
          : 'Message copied! Opening Instagram profile...'
      );
    }

    const target = openMode === 'new_tab' ? '_blank' : '_self';
    const encodedMsg = encodeURIComponent(preparedMessage);

    let base =
      dest === 'direct_chat'
        ? currentUser.directMessageUrl || `https://www.instagram.com/direct/t/${currentUser.username}/`
        : currentUser.profileUrl;

    // Attach #toolnest_msg for the Tampermonkey helper script
    const cleanBase = base.split('#')[0];
    const urlWithHash = `${cleanBase}#toolnest_msg=${encodedMsg}`;

    window.open(urlWithHash, target);
  };

  // Open raw profile or direct DM without copy
  const handleOpenRaw = (dest: DestinationType) => {
    if (!currentUser) return;
    const target = openMode === 'new_tab' ? '_blank' : '_self';
    const url =
      dest === 'direct_chat'
        ? currentUser.directMessageUrl || `https://www.instagram.com/direct/t/${currentUser.username}/`
        : currentUser.profileUrl;
    window.open(url, target);
  };

  // Mark sent with user feedback
  const handleSentClick = () => {
    if (!currentUser) return;
    setSentFeedback(true);
    onMarkSent(currentUser.id);
    onShowToast(`@${currentUser.username} marked as sent ✓`);
    setTimeout(() => setSentFeedback(false), 1500);
  };

  if (!currentUser || totalUsers === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[340px]">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          No Profile Selected
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Import Instagram usernames using the form below or choose a username from the list to start messaging.
        </p>
      </div>
    );
  }

  const isDirectChat = destinationMode === 'direct_chat';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-5">
      {/* Top Bar: Progress Indicator, Auto-Click Pill & Prev / Next */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#5722AF] dark:text-[#9B6BE8] bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900/40">
            User {currentIndex + 1} of {totalUsers}
          </span>

          {onOpenHelperModal && (
            <button
              type="button"
              onClick={onOpenHelperModal}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-semibold text-[11px] hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
              title="Auto-Click 'Message' Button & Auto-Fill Script (Tampermonkey)"
            >
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Helper Script</span>
            </button>
          )}

          {onOpenConsoleModal && (
            <button
              type="button"
              onClick={onOpenConsoleModal}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-[#5722AF] dark:text-[#9B6BE8] border border-purple-200 dark:border-purple-800/60 font-semibold text-[11px] hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
              title="Get Browser Console Script to Auto-Send All Profiles"
            >
              <Terminal className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Console Auto-Sender</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevUser}
            disabled={currentIndex <= 0}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous User"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 px-1">
            {currentIndex + 1} / {totalUsers}
          </span>
          <button
            type="button"
            onClick={onNextUser}
            disabled={currentIndex >= totalUsers - 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next User"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Profile Info */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
            Currently Processing
          </div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              @{currentUser.username}
            </h2>
            {/* Status Badge */}
            {currentUser.status === 'sent' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sent
              </span>
            )}
            {currentUser.status === 'pending' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-[#5722AF] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Pending
              </span>
            )}
            {currentUser.status === 'skipped' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Skipped
              </span>
            )}
            {currentUser.status === 'invalid' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-3.5 h-3.5" />
                Invalid
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            {isDirectChat ? (currentUser.directMessageUrl || `https://www.instagram.com/direct/t/${currentUser.username}/`) : currentUser.profileUrl}
          </div>
        </div>

        {/* Action Destination & Tab Preference Settings */}
        <div className="flex flex-col items-end gap-2 text-right">
          {onChangeDestinationMode && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Destination Action
              </label>
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => onChangeDestinationMode('direct_chat')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    destinationMode === 'direct_chat'
                      ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Directly opens the chat composer (skips profile)"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Direct DM</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeDestinationMode('profile')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    destinationMode === 'profile'
                      ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Opens profile page"
                >
                  <UserIcon className="w-3 h-3" />
                  <span>Profile</span>
                </button>
              </div>
            </div>
          )}

          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onChangeOpenMode('new_tab')}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                openMode === 'new_tab'
                  ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              New Tab
            </button>
            <button
              type="button"
              onClick={() => onChangeOpenMode('current_tab')}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                openMode === 'current_tab'
                  ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Same Tab
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Action Button: Copy & Open */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <button
            type="button"
            onClick={() => handleCopyAndOpen()}
            className="sm:col-span-8 w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#5722AF] via-[#6d2ec9] to-[#7B45D1] hover:opacity-95 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-purple-950/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>
              {isDirectChat ? 'Copy Message & Open Direct DM' : 'Copy Message & Open Profile'}
            </span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>

          <button
            type="button"
            onClick={() => handleCopyAndOpen(isDirectChat ? 'profile' : 'direct_chat')}
            className="sm:col-span-4 w-full py-3.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>{isDirectChat ? 'Open Profile Instead' : 'Open Direct DM Instead'}</span>
          </button>
        </div>

        {/* Automation Helper Note */}
        {onOpenHelperModal && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>
                Want Instagram to automatically click <strong>&ldquo;Message&rdquo;</strong> and paste into the chat box?
              </span>
            </span>
            <button
              type="button"
              onClick={onOpenHelperModal}
              className="font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:underline cursor-pointer"
            >
              Get Free Script &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Prepared Message Box */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Prepared Message Preview</span>
          </div>

          <button
            type="button"
            onClick={copyMessageToClipboard}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#5722AF]'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
          {preparedMessage}
        </div>
      </div>

      {/* Post-Messaging Completion Controls */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSentClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Message Sent</span>
          </button>

          <button
            type="button"
            onClick={() => onSkipUser(currentUser.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4 text-amber-500" />
            <span>Skip User</span>
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:flex items-center gap-2">
          <span>Shortcuts:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>
          <span>Mark Sent</span>
          <span>&bull;</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
            Ctrl+C
          </kbd>
          <span>Copy</span>
        </div>
      </div>

      {sentFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>✓ Message marked as sent! Loading next profile...</span>
        </div>
      )}
    </div>
  );
};
