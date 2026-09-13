'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Campaign,
  InstagramUser,
  MessageTemplate,
  OpenTargetMode,
  UserStatus,
} from '@/lib/instagram/types';
import {
  DEFAULT_MESSAGE,
  DEFAULT_TEMPLATES,
  loadCampaign,
  saveCampaign,
  clearCampaign,
  loadTemplates,
  saveTemplates,
  calculateStats,
} from '@/lib/instagram/storage';
import { SafetyNotice } from './SafetyNotice';
import { ProgressCard } from './ProgressCard';
import { MessageEditor } from './MessageEditor';
import { MessageTemplatesModal } from './MessageTemplatesModal';
import { CurrentUserCard } from './CurrentUserCard';
import { UserImport } from './UserImport';
import { UserTable } from './UserTable';
import { CampaignSummary } from './CampaignSummary';
import { InstagramSEO } from './InstagramSEO';
import { AutoClickModal } from './AutoClickModal';
import { ConsoleScriptModal } from './ConsoleScriptModal';
import {
  Play,
  RotateCcw,
  Sparkles,
  Check,
  RotateCw,
  Clock,
  Send,
  Square,
  Zap,
  Terminal
} from 'lucide-react';

export const InstagramDMTool: React.FC = () => {
  // Main Campaign State
  const [campaign, setCampaign] = useState<Campaign>({
    id: `camp_${Date.now()}`,
    name: 'Movie Promotion Campaign',
    users: [],
    activeMessage: DEFAULT_MESSAGE,
    templates: DEFAULT_TEMPLATES,
    currentIndex: 0,
    openMode: 'new_tab',
    destinationMode: 'direct_chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // UI state
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isAutoClickModalOpen, setIsAutoClickModalOpen] = useState(false);
  const [isConsoleScriptModalOpen, setIsConsoleScriptModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [cachedPendingCount, setCachedPendingCount] = useState(0);

  // Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  // Initialize from LocalStorage on mount
  useEffect(() => {
    const savedCampaign = loadCampaign();
    const savedTemplates = loadTemplates();

    if (savedCampaign && savedCampaign.users && savedCampaign.users.length > 0) {
      const stats = calculateStats(savedCampaign.users);
      if (stats.pending > 0) {
        setCachedPendingCount(stats.pending);
        setShowResumeBanner(true);
      }
      setCampaign({
        ...savedCampaign,
        templates: savedTemplates.length > 0 ? savedTemplates : savedCampaign.templates,
      });
    } else {
      setCampaign((prev) => ({
        ...prev,
        templates: savedTemplates,
      }));
    }
    setIsLoaded(true);
  }, []);

  // Auto-persist campaign to LocalStorage whenever it updates
  useEffect(() => {
    if (!isLoaded) return;
    saveCampaign(campaign);
  }, [campaign, isLoaded]);

  // Derived Statistics
  const stats = useMemo(() => {
    return calculateStats(campaign.users);
  }, [campaign.users]);

  // Current active user
  const currentUser: InstagramUser | null = useMemo(() => {
    if (campaign.users.length === 0) return null;
    const idx = Math.min(Math.max(0, campaign.currentIndex), campaign.users.length - 1);
    return campaign.users[idx] || null;
  }, [campaign.users, campaign.currentIndex]);

  // Find next pending user index
  const findNextPendingIndex = useCallback((fromIndex: number, usersList: InstagramUser[]): number => {
    // Search forward from current
    for (let i = fromIndex + 1; i < usersList.length; i++) {
      if (usersList[i].status === 'pending') return i;
    }
    // If not found forward, search from beginning
    for (let i = 0; i < fromIndex; i++) {
      if (usersList[i].status === 'pending') return i;
    }
    // Default to last valid index or same index
    return fromIndex;
  }, []);

  // Handlers for Users & Campaign
  const handleImportUsers = (newUsers: InstagramUser[]) => {
    setCampaign((prev) => {
      const updatedUsers = [...prev.users, ...newUsers];
      let newCurrentIndex = prev.currentIndex;
      // If previous list was empty, set current to first pending
      if (prev.users.length === 0 && updatedUsers.length > 0) {
        const firstPending = updatedUsers.findIndex((u) => u.status === 'pending');
        newCurrentIndex = firstPending !== -1 ? firstPending : 0;
      }
      return {
        ...prev,
        users: updatedUsers,
        currentIndex: newCurrentIndex,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleUpdateStatus = (id: string, newStatus: UserStatus) => {
    setCampaign((prev) => {
      const updatedUsers = prev.users.map((u) =>
        u.id === id
          ? {
              ...u,
              status: newStatus,
              sentAt: newStatus === 'sent' ? new Date().toISOString() : u.sentAt,
            }
          : u
      );
      return {
        ...prev,
        users: updatedUsers,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleMarkSent = (userId: string) => {
    setCampaign((prev) => {
      const currentIdx = prev.users.findIndex((u) => u.id === userId);
      const updatedUsers = prev.users.map((u) =>
        u.id === userId
          ? { ...u, status: 'sent' as UserStatus, sentAt: new Date().toISOString() }
          : u
      );
      const nextIdx = findNextPendingIndex(currentIdx, updatedUsers);
      return {
        ...prev,
        users: updatedUsers,
        currentIndex: nextIdx,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleSkipUser = (userId: string) => {
    setCampaign((prev) => {
      const currentIdx = prev.users.findIndex((u) => u.id === userId);
      const updatedUsers = prev.users.map((u) =>
        u.id === userId ? { ...u, status: 'skipped' as UserStatus } : u
      );
      const nextIdx = findNextPendingIndex(currentIdx, updatedUsers);
      return {
        ...prev,
        users: updatedUsers,
        currentIndex: nextIdx,
        updatedAt: new Date().toISOString(),
      };
    });
    showToast('Skipped user. Loaded next profile.');
  };

  const handlePrevUser = () => {
    setCampaign((prev) => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
  };

  const handleNextUser = () => {
    setCampaign((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.users.length - 1, prev.currentIndex + 1),
    }));
  };

  const handleSetActiveUser = (index: number) => {
    setCampaign((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.users.length - 1, Math.max(0, index)),
    }));
    const target = campaign.users[index];
    if (target) {
      showToast(`Selected @${target.username}`);
    }
  };

  const handleDeleteUser = (id: string) => {
    setCampaign((prev) => {
      const updated = prev.users.filter((u) => u.id !== id);
      const newIdx = Math.min(prev.currentIndex, Math.max(0, updated.length - 1));
      return {
        ...prev,
        users: updated,
        currentIndex: newIdx,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleBulkUpdateStatus = (ids: string[], status: UserStatus) => {
    setCampaign((prev) => {
      const idSet = new Set(ids);
      const updated = prev.users.map((u) =>
        idSet.has(u.id)
          ? {
              ...u,
              status,
              sentAt: status === 'sent' ? new Date().toISOString() : u.sentAt,
            }
          : u
      );
      return {
        ...prev,
        users: updated,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    setCampaign((prev) => {
      const idSet = new Set(ids);
      const updated = prev.users.filter((u) => !idSet.has(u.id));
      const newIdx = Math.min(prev.currentIndex, Math.max(0, updated.length - 1));
      return {
        ...prev,
        users: updated,
        currentIndex: newIdx,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleClearCompleted = () => {
    setCampaign((prev) => {
      const updated = prev.users.filter((u) => u.status !== 'sent');
      return {
        ...prev,
        users: updated,
        currentIndex: 0,
        updatedAt: new Date().toISOString(),
      };
    });
    showToast('Removed all completed users from directory');
  };

  const handleClearEntireCampaign = () => {
    clearCampaign();
    setCampaign((prev) => ({
      ...prev,
      users: [],
      currentIndex: 0,
      updatedAt: new Date().toISOString(),
    }));
    setShowResumeBanner(false);
  };

  const handleStartMessaging = () => {
    if (campaign.users.length === 0) {
      showToast('Please import some usernames first');
      return;
    }
    const firstPending = campaign.users.findIndex((u) => u.status === 'pending');
    if (firstPending !== -1) {
      setCampaign((prev) => ({ ...prev, currentIndex: firstPending }));
      showToast(`Started messaging from first pending user @${campaign.users[firstPending].username}`);
    } else {
      showToast('All users have already been messaged or skipped');
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl+Enter or Cmd+Enter: Mark as Sent
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentUser && currentUser.status === 'pending') {
          handleMarkSent(currentUser.id);
        }
      }

      // ArrowLeft: Previous User
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevUser();
      }

      // ArrowRight: Next User
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextUser();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, handleMarkSent]);

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 dark:border-slate-200">
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Resume Session Banner */}
      {showResumeBanner && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-[#5722AF]/30 dark:border-purple-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#5722AF] text-white shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Previous Campaign Session Found
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                You have {cachedPendingCount} pending usernames remaining from your last session.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowResumeBanner(false);
                handleStartMessaging();
              }}
              className="px-4 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Resume Session
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResumeBanner(false);
                handleClearEntireCampaign();
                showToast('Started new clean session');
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Start New Session
            </button>
          </div>
        </div>
      )}

      {/* Safety & Compliance Notice */}
      <SafetyNotice />

      {/* Primary Action Banner: Start Messaging Button */}
      {campaign.users.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-purple-950/20 border border-purple-200 dark:border-purple-900/50 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Outreach Workflow Controller</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.pending > 0 ? `${stats.pending} Profiles Ready for Outreach` : 'All Profiles Processed!'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Process your list sequentially without repetitive typing or losing your place
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleStartMessaging}
              className="py-3 px-6 rounded-xl bg-[#5722AF] hover:bg-[#481c91] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-purple-950/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{stats.sent > 0 ? 'Resume Messaging' : 'Start Messaging'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAutoClickModalOpen(true)}
              className="py-3 px-3.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-[#9B6BE8] hover:bg-purple-100 dark:hover:bg-purple-900/60 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Auto-Click 'Message' Button Script"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">Helper Script</span>
            </button>

            <button
              type="button"
              onClick={() => setIsConsoleScriptModalOpen(true)}
              className="py-3 px-3.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-[#9B6BE8] hover:bg-purple-100 dark:hover:bg-purple-900/60 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Generate Browser Console Auto-Sender Script"
            >
              <Terminal className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span className="hidden sm:inline">Console Auto-Sender</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handlePrevUser();
                showToast('Reset to previous profile');
              }}
              disabled={campaign.currentIndex <= 0}
              className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
              title="Previous Profile"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Dashboard Layout (Desktop 7 / 5 split, responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Inputs & Directory */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Message Composer */}
          <MessageEditor
            message={campaign.activeMessage}
            onChangeMessage={(msg) =>
              setCampaign((prev) => ({ ...prev, activeMessage: msg }))
            }
            templates={campaign.templates}
            onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
            onShowToast={showToast}
          />

          {/* 2. Add / Import Instagram Usernames */}
          <UserImport
            existingUsers={campaign.users}
            onImportUsers={handleImportUsers}
            onShowToast={showToast}
          />

          {/* 3. User Directory & Table */}
          <UserTable
            users={campaign.users}
            currentIndex={campaign.currentIndex}
            openMode={campaign.openMode}
            onSetActiveUser={handleSetActiveUser}
            onUpdateStatus={handleUpdateStatus}
            onDeleteUser={handleDeleteUser}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onBulkDelete={handleBulkDelete}
            onClearCompleted={handleClearCompleted}
            onShowToast={showToast}
          />
        </div>

        {/* Right Column (5 cols): Active Hub & Progress Tracker */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* Progress Tracker Card */}
          <ProgressCard stats={stats} />

          {/* Current Processing Profile Card */}
          <CurrentUserCard
            currentUser={currentUser}
            currentIndex={campaign.currentIndex}
            totalUsers={campaign.users.length}
            preparedMessage={campaign.activeMessage}
            openMode={campaign.openMode}
            destinationMode={campaign.destinationMode || 'direct_chat'}
            onChangeOpenMode={(mode) =>
              setCampaign((prev) => ({ ...prev, openMode: mode }))
            }
            onChangeDestinationMode={(mode) =>
              setCampaign((prev) => ({ ...prev, destinationMode: mode }))
            }
            onOpenHelperModal={() => setIsAutoClickModalOpen(true)}
            onOpenConsoleModal={() => setIsConsoleScriptModalOpen(true)}
            onMarkSent={handleMarkSent}
            onSkipUser={handleSkipUser}
            onPrevUser={handlePrevUser}
            onNextUser={handleNextUser}
            onShowToast={showToast}
          />

          {/* Campaign Summary & Export */}
          <CampaignSummary
            campaign={campaign}
            stats={stats}
            onChangeCampaignName={(name) =>
              setCampaign((prev) => ({ ...prev, name }))
            }
            onClearCampaign={handleClearEntireCampaign}
            onShowToast={showToast}
          />
        </div>
      </div>

      {/* Auto-Click Helper Modal (Tampermonkey) */}
      <AutoClickModal
        isOpen={isAutoClickModalOpen}
        onClose={() => setIsAutoClickModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Browser Console Sequential Auto-Sender Modal */}
      <ConsoleScriptModal
        isOpen={isConsoleScriptModalOpen}
        onClose={() => setIsConsoleScriptModalOpen(false)}
        users={campaign.users}
        activeMessage={campaign.activeMessage}
        onShowToast={showToast}
      />

      {/* Message Templates Modal */}
      <MessageTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        templates={campaign.templates}
        onSaveTemplates={(tmpls) => {
          saveTemplates(tmpls);
          setCampaign((prev) => ({ ...prev, templates: tmpls }));
        }}
        onSelectTemplate={(content) => {
          setCampaign((prev) => ({ ...prev, activeMessage: content }));
        }}
        onShowToast={showToast}
      />

      {/* SEO & Educational Guide */}
      <InstagramSEO />
    </div>
  );
};
