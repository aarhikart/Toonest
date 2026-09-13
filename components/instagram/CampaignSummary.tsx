'use client';

import React, { useState } from 'react';
import { Campaign, CampaignStats } from '@/lib/instagram/types';
import { exportCampaignCSV } from '@/lib/instagram/csv';
import { FileDown, Trash2, Edit3, Check, BarChart2, AlertCircle } from 'lucide-react';

interface CampaignSummaryProps {
  campaign: Campaign;
  stats: CampaignStats;
  onChangeCampaignName: (name: string) => void;
  onClearCampaign: () => void;
  onShowToast: (msg: string) => void;
}

export const CampaignSummary: React.FC<CampaignSummaryProps> = ({
  campaign,
  stats,
  onChangeCampaignName,
  onClearCampaign,
  onShowToast,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(campaign.name);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onChangeCampaignName(tempName.trim());
      onShowToast(`Campaign renamed to "${tempName.trim()}"`);
    }
    setIsEditingName(false);
  };

  const handleExport = () => {
    if (campaign.users.length === 0) {
      onShowToast('No users to export in current campaign');
      return;
    }
    exportCampaignCSV(campaign);
    onShowToast('Campaign exported to CSV successfully');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header & Campaign Name */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Campaign Overview
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-2.5 py-1 text-sm font-bold rounded-lg border border-[#5722AF] bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-1 rounded-lg bg-[#5722AF] text-white hover:bg-[#481c91] transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {campaign.name}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(campaign.name);
                    setIsEditingName(true);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-[#5722AF] hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                  title="Rename Campaign"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={campaign.users.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmClear(true)}
            disabled={campaign.users.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Campaign</span>
          </button>
        </div>
      </div>

      {/* Summary Table */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Users</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {stats.total}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Sent</div>
          <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
            {stats.sent}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
          <div className="text-[11px] font-medium text-purple-700 dark:text-purple-300">Pending</div>
          <div className="text-xl font-extrabold text-purple-900 dark:text-purple-100 mt-1">
            {stats.pending}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
          <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300">Skipped</div>
          <div className="text-xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
            {stats.skipped}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300">Invalid</div>
          <div className="text-xl font-extrabold text-rose-900 dark:text-rose-100 mt-1">
            {stats.invalid}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Clear Campaign Data?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will delete your imported users list and progress. Your saved message templates will remain safe.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmClear(false);
                  onClearCampaign();
                  onShowToast('Campaign cleared successfully');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Delete Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
