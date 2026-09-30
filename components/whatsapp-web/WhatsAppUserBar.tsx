'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Phone,
  LogOut,
  History,
  AlertCircle,
  X,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  HelpCircle,
  Shield,
  FileText
} from 'lucide-react';
import { PlanLimitsConfig, WhatsAppLimitManager, CalculatedUsage } from '@/lib/whatsapp-web/limit-manager';

interface WhatsAppUserBarProps {
  user: {
    id: string;
    username: string;
    businessName: string;
    phoneNumber: string;
    role: 'admin' | 'user';
    status: string;
    subscriptionType?: 'trial' | 'paid' | 'none';
    planType?: '1_month' | '3_months' | '6_months' | null;
    daysRemaining?: number | null;
    isExpired?: boolean;
  };
  onLogout: () => void;
  onOpenAdminCenter?: () => void;
  onOpenRenewalModal?: (plan?: '1_month' | '3_months' | '6_months') => void;
  onOpenPlansModal?: () => void;
  planLimits?: PlanLimitsConfig;
  isOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const WhatsAppUserBar: React.FC<WhatsAppUserBarProps> = ({
  user,
  onLogout,
  onOpenAdminCenter,
  onOpenRenewalModal,
  onOpenPlansModal,
  planLimits,
  isOpen: controlledIsOpen,
  onToggleSidebar
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isSidebarOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsSidebarOpen = (open: boolean) => {
    if (onToggleSidebar) {
      if ((open && !isSidebarOpen) || (!open && isSidebarOpen)) {
        onToggleSidebar();
      }
    }
    setInternalIsOpen(open);
  };

  const [activeTab, setActiveTab] = useState<'menu' | 'campaigns'>('menu');
  const [pastCampaigns, setPastCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isCopiedPhone, setIsCopiedPhone] = useState(false);

  const userLimit = WhatsAppLimitManager.getPlanLimit(
    user.role,
    user.subscriptionType,
    user.planType,
    planLimits
  );

  const [usage, setUsage] = useState<CalculatedUsage>(() =>
    WhatsAppLimitManager.getUsage(user.username, userLimit, planLimits?.resetHours)
  );

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  // Real-time message limit usage updater
  useEffect(() => {
    let isMounted = true;
    const refresh = async () => {
      // 1. Instant local render
      const local = WhatsAppLimitManager.getUsage(user.username, userLimit, planLimits?.resetHours);
      if (isMounted) setUsage(local);

      // 2. Fetch latest shared quota from MongoDB across devices
      if (user.username && user.username !== 'default') {
        try {
          const dbUsage = await WhatsAppLimitManager.fetchUsageFromDb(
            user.username,
            userLimit,
            planLimits?.resetHours
          );
          if (isMounted) setUsage(dbUsage);
        } catch (_) {}
      }
    };

    refresh();
    const timer = setInterval(refresh, 10000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [user.username, userLimit, planLimits?.resetHours]);

  const fetchUserCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const res = await fetch('/api/campaigns/record');
      const data = await res.json();
      if (data.success) {
        setPastCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to load past campaigns:', err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const handleOpenCampaignsTab = () => {
    setActiveTab('campaigns');
    fetchUserCampaigns();
  };

  const handleCopyPhone = () => {
    if (!user.phoneNumber) return;
    navigator.clipboard.writeText(user.phoneNumber);
    setIsCopiedPhone(true);
    setTimeout(() => setIsCopiedPhone(false), 2000);
  };

  const planLabels: Record<string, string> = {
    '1_month': '1 Month',
    '3_months': '3 Months',
    '6_months': '6 Months'
  };

  // If closed, completely remove in-page section from main layout
  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="User Options & Profile Sidebar"
    >
      {/* Left Panel: Exactly 80% screen width (w-[80vw]), slides from left to right */}
      <div className="relative w-[80vw] max-w-sm sm:max-w-md h-full bg-white dark:bg-[#0f121a] border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-20 animate-in slide-in-from-left duration-200 ease-out overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
          {activeTab === 'campaigns' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className="p-1.5 -ml-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Back</span>
              </button>
              <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                Past Campaigns
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5722AF] to-[#7B45D1] flex items-center justify-center text-white shadow-sm shadow-[#5722AF]/30 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                  WhatsApp Portal
                </div>
                <div className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  Account & Operations
                </div>
              </div>
            </div>
          )}

          {/* Close Icon (X) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close sidebar"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {activeTab === 'menu' ? (
            <>
              {/* User Identity & Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#5722AF]/10 via-[#5722AF]/5 to-transparent dark:from-[#5722AF]/20 dark:via-zinc-900/60 dark:to-zinc-900/40 border border-[#5722AF]/20 dark:border-[#5722AF]/30 space-y-3">
                {/* Profile Header */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#5722AF] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-[#5722AF]/25 shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-base text-zinc-900 dark:text-white truncate">
                        {user.businessName}
                      </h4>
                      {user.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 inline-block mt-0.5">
                      @{user.username}
                    </span>
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {/* Subscription / Trial Capsule */}
                  {user.role !== 'admin' && user.subscriptionType === 'trial' && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${
                        user.isExpired
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                          : (user.daysRemaining ?? 10) <= 3
                          ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                          : 'bg-[#5722AF]/10 text-[#5722AF] border-[#5722AF]/25 dark:bg-[#5722AF]/25 dark:text-purple-300 dark:border-[#5722AF]/40'
                      }`}
                    >
                      <span>🕒</span>
                      <span>
                        {user.isExpired
                          ? 'Trial Ended'
                          : `10-Day Free Trial: ${user.daysRemaining ?? 10} days left`}
                      </span>
                    </span>
                  )}

                  {user.role !== 'admin' && user.subscriptionType === 'paid' && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${
                        user.isExpired
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                          : (user.daysRemaining ?? 30) <= 3
                          ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                      }`}
                    >
                      <span>⭐</span>
                      <span>
                        {user.isExpired
                          ? 'Plan Expired'
                          : `${planLabels[user.planType || '1_month'] || 'Paid'} Plan: ${user.daysRemaining ?? 0} days left`}
                      </span>
                    </span>
                  )}

                  {/* Quota Capsule */}
                  {user.role !== 'admin' && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${
                        usage.isLimitReached
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                          : usage.remaining <= 10
                          ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                          : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                      }`}
                      title={
                        usage.isResetTimerActive
                          ? `Limit reached. Resets on ${usage.resetTimeFormatted} (in ${usage.timeRemainingStr})`
                          : `${usage.remaining}/${userLimit} messages remaining`
                      }
                    >
                      <span>✉️</span>
                      <span>
                        {usage.isLimitReached && usage.isResetTimerActive
                          ? `Limit Reached (${usage.timeRemainingStr})`
                          : `${usage.remaining}/${userLimit} msgs left`}
                      </span>
                    </span>
                  )}
                </div>

                {/* Phone Number with quick copy */}
                <div className="flex items-center justify-between pt-2 border-t border-[#5722AF]/15 dark:border-zinc-800/80 text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Registered Phone</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono flex items-center gap-1 hover:text-[#5722AF] dark:hover:text-purple-300 transition cursor-pointer"
                    title="Click to copy phone number"
                  >
                    <span>{user.phoneNumber}</span>
                    {isCopiedPhone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* 3-Day Expiry Reminder Alert */}
              {user.role !== 'admin' &&
                user.daysRemaining !== null &&
                user.daysRemaining !== undefined &&
                user.daysRemaining <= 3 && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                        <strong>Expiring Soon:</strong> Your{' '}
                        {user.subscriptionType === 'paid' ? 'WhatsApp Plan' : '10-day Free Trial'}{' '}
                        will expire in <strong>{user.daysRemaining} days</strong>. Renew now to avoid interruption.
                      </p>
                    </div>
                    {onOpenRenewalModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSidebarOpen(false);
                          onOpenRenewalModal();
                        }}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Renew Plan Now
                      </button>
                    )}
                  </div>
                )}

              {/* ========================================================================= */}
              {/* Sidebar Item List UI (Uniform list rows matching ToolNest Sidebar styling) */}
              {/* ========================================================================= */}
              <div className="space-y-1.5">
                <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
                  <span>Account Actions & Options</span>
                </div>

                <div className="space-y-1">
                  {/* 1. View Plans */}
                  {onOpenPlansModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onOpenPlansModal();
                      }}
                      className="w-full p-2.5 rounded-xl flex items-center gap-3 transition-all hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300 group cursor-pointer text-left"
                    >
                      <div className="p-2 rounded-lg shrink-0 bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] group-hover:bg-[#5722AF] group-hover:text-white transition-colors">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate text-zinc-900 dark:text-white">
                            View Plans
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                          Explore 1, 3, and 6-month marketing packages
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 2. Renew Plan */}
                  {user.role !== 'admin' && onOpenRenewalModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onOpenRenewalModal();
                      }}
                      className="w-full p-2.5 rounded-xl flex items-center gap-3 transition-all hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300 group cursor-pointer text-left"
                    >
                      <div className="p-2 rounded-lg shrink-0 bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] group-hover:bg-[#5722AF] group-hover:text-white transition-colors">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate text-zinc-900 dark:text-white">
                            Renew Plan
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                          Instant online renewal & quota extension
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 3. Admin Management */}
                  {user.role === 'admin' && onOpenAdminCenter && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onOpenAdminCenter();
                      }}
                      className="w-full p-2.5 rounded-xl flex items-center gap-3 transition-all hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300 group cursor-pointer text-left"
                    >
                      <div className="p-2 rounded-lg shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate text-zinc-900 dark:text-white">
                            Admin Management
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                          Approve client trials, plans & quota limits
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 4. Past Campaigns */}
                  <button
                    type="button"
                    onClick={handleOpenCampaignsTab}
                    className="w-full p-2.5 rounded-xl flex items-center gap-3 transition-all hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300 group cursor-pointer text-left"
                  >
                    <div className="p-2 rounded-lg shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-[#5722AF] group-hover:text-white transition-colors">
                      <History className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate text-zinc-900 dark:text-white">
                          Past Campaigns
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        View broadcast logs & delivery statistics
                      </p>
                    </div>
                  </button>

                  {/* 5. Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      onLogout();
                    }}
                    className="w-full p-2.5 rounded-xl flex items-center gap-3 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 group cursor-pointer text-left"
                  >
                    <div className="p-2 rounded-lg shrink-0 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate text-rose-600 dark:text-rose-400">
                          Logout
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-rose-500/80 dark:text-rose-400/70 truncate mt-0.5">
                        Sign out of your active session
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Portal Information Links */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Resources & Support
                </div>
                <div className="space-y-1">
                  <a
                    href="#how-it-works"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full p-2 rounded-xl flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#161a26] transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>How WhatsApp Marketing Works</span>
                  </a>
                  <a
                    href="#privacy-section"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full p-2 rounded-xl flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#161a26] transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>Security & Anti-Ban Safeguards</span>
                  </a>
                  <a
                    href="#faq-section"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full p-2 rounded-xl flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#161a26] transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>Frequently Asked Questions</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            /* Campaigns View */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  Recent Broadcasts
                </span>
                <button
                  type="button"
                  onClick={fetchUserCampaigns}
                  disabled={isLoadingCampaigns}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                  title="Refresh campaigns"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isLoadingCampaigns ? 'animate-spin text-[#5722AF]' : ''
                    }`}
                  />
                </button>
              </div>

              {isLoadingCampaigns ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  Loading your past campaigns...
                </div>
              ) : pastCampaigns.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 space-y-2">
                  <Layers className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                  <p className="text-xs">You haven't run any campaigns yet.</p>
                  <p className="text-[11px] text-zinc-500">
                    Once you start sending messages, your delivery history will appear here.
                  </p>
                </div>
              ) : (
                pastCampaigns.map(c => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 dark:text-white text-xs truncate max-w-[180px]">
                        {c.campaignName}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="text-[10px] text-zinc-400">Total</div>
                        <div className="font-bold text-zinc-800 dark:text-zinc-200">
                          {c.totalContacts}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Delivered
                        </div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {c.successfulMessages}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="text-[10px] text-rose-600 dark:text-rose-400">
                          Failed
                        </div>
                        <div className="font-bold text-rose-600 dark:text-rose-400">
                          {c.failedMessages}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Exactly 20% transparent overlay (w-[20vw] / flex-1) that dismisses the sidebar on tap */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className="flex-1 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
        title="Click transparent background to close"
        aria-label="Close sidebar"
      />
    </div>
  );
};
