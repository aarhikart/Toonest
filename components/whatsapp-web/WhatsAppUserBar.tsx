'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  User,
  Phone,
  LogOut,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { PlanLimitsConfig, DEFAULT_PLAN_LIMITS, WhatsAppLimitManager, CalculatedUsage } from '@/lib/whatsapp-web/limit-manager';

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
}

export const WhatsAppUserBar: React.FC<WhatsAppUserBarProps> = ({
  user,
  onLogout,
  onOpenAdminCenter,
  onOpenRenewalModal,
  onOpenPlansModal,
  planLimits
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pastCampaigns, setPastCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  const userLimit = WhatsAppLimitManager.getPlanLimit(
    user.role,
    user.subscriptionType,
    user.planType,
    planLimits
  );

  const [usage, setUsage] = useState<CalculatedUsage>(() =>
    WhatsAppLimitManager.getUsage(user.username, userLimit, planLimits?.resetHours)
  );

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

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    fetchUserCampaigns();
  };

  const planLabels: Record<string, string> = {
    '1_month': '1 Month',
    '3_months': '3 Months',
    '6_months': '6 Months'
  };

  return (
    <>
      <div className="space-y-2">
        <div className="p-4 bg-gradient-to-br from-white via-white to-purple-50/20 dark:from-[#131620] dark:via-zinc-900 dark:to-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* User Identity Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-zinc-900 dark:text-white">
                  {user.businessName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono">
                  @{user.username}
                </span>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Admin
                  </span>
                )}

                {/* Plan / Trial Countdown Badge (Visible only to this user) */}
                {user.role !== 'admin' && user.subscriptionType === 'trial' && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                      user.isExpired
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                        : (user.daysRemaining ?? 10) <= 3
                        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                        : 'bg-purple-50 text-[#5722AF] border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
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
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
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

                {/* Daily Message Quota & Time Window Badge */}
                {user.role !== 'admin' && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                      usage.isLimitReached
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                        : usage.remaining <= 10
                        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                    }`}
                    title={
                      usage.isResetTimerActive
                        ? `Limit reached. Resets on ${usage.resetTimeFormatted} (in ${usage.timeRemainingStr})`
                        : `${usage.remaining}/${userLimit} messages remaining. Reset timer starts when limit is fully used.`
                    }
                  >
                    <span>✉️</span>
                    <span>
                      {usage.isLimitReached && usage.isResetTimerActive
                        ? `Limit Reached (Resets ${usage.resetTimeFormatted} - in ${usage.timeRemainingStr})`
                        : `${usage.remaining}/${userLimit} msgs left`}
                    </span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-zinc-400" />
                  {user.phoneNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenPlansModal && (
              <button
                type="button"
                onClick={onOpenPlansModal}
                className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-[#5722AF] dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>View Plans</span>
              </button>
            )}

            {user.role !== 'admin' && onOpenRenewalModal && (
              <button
                type="button"
                onClick={() => onOpenRenewalModal()}
                className="px-3 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#471b92] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <span>Renew Plan</span>
              </button>
            )}

            {user.role === 'admin' && onOpenAdminCenter && (
              <button
                type="button"
                onClick={onOpenAdminCenter}
                className="px-3 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#471b92] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Management</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenDrawer}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>Past Campaigns</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 3-Day Expiry Reminder Banner (Visible only when <= 3 days left) */}
        {user.role !== 'admin' &&
          user.daysRemaining !== null &&
          user.daysRemaining !== undefined &&
          user.daysRemaining <= 3 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Reminder:</strong> Your{' '}
                  {user.subscriptionType === 'paid' ? 'WhatsApp Plan' : '10-day Free Trial'}{' '}
                  will expire in <strong>{user.daysRemaining} days</strong>. Renew now to avoid interruption.
                </span>
              </div>
              {onOpenRenewalModal && (
                <button
                  type="button"
                  onClick={() => onOpenRenewalModal()}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer self-start sm:self-auto"
                >
                  Renew Plan Now
                </button>
              )}
            </div>
          )}
      </div>

      {/* Slide-out Drawer: Past User Campaigns */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#5722AF] dark:text-purple-400" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">Your Past Campaigns</h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {isLoadingCampaigns ? (
                <div className="text-center py-12 text-zinc-400">Loading your past campaigns...</div>
              ) : pastCampaigns.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 space-y-2">
                  <Layers className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                  <p>You haven't run any campaigns yet.</p>
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
                      <span className="font-semibold text-zinc-900 dark:text-white text-xs">
                        {c.campaignName}
                      </span>
                      <span className="text-[10px] text-zinc-400">
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
                        <div className="font-bold text-zinc-800 dark:text-zinc-200">{c.totalContacts}</div>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Delivered</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">{c.successfulMessages}</div>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="text-[10px] text-rose-600 dark:text-rose-400">Failed</div>
                        <div className="font-bold text-rose-600 dark:text-rose-400">{c.failedMessages}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
