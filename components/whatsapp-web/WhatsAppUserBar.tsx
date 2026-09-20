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

interface WhatsAppUserBarProps {
  user: {
    id: string;
    username: string;
    businessName: string;
    phoneNumber: string;
    role: 'admin' | 'user';
    status: string;
  };
  onLogout: () => void;
  onOpenAdminCenter?: () => void;
}

export const WhatsAppUserBar: React.FC<WhatsAppUserBarProps> = ({
  user,
  onLogout,
  onOpenAdminCenter
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pastCampaigns, setPastCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

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

  return (
    <>
      <div className="p-4 bg-gradient-to-br from-white via-white to-purple-50/20 dark:from-[#131620] dark:via-zinc-900 dark:to-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* User Identity Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 flex items-center justify-center font-bold text-sm">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-2">
          {user.role === 'admin' && onOpenAdminCenter && (
            <button
              onClick={onOpenAdminCenter}
              className="px-3 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#471b92] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Management</span>
            </button>
          )}

          <button
            onClick={handleOpenDrawer}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>Past Campaigns</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
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
