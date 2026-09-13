'use client';

import React from 'react';
import { DashboardStats } from '@/lib/whatsapp/types';
import { TrendingUp, CheckCircle2, Eye, ShieldCheck, DollarSign } from 'lucide-react';

interface AnalyticsProps {
  stats: DashboardStats;
}

export const AnalyticsView: React.FC<AnalyticsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">WhatsApp Marketing Analytics</h2>
        <p className="text-xs text-zinc-500">Deliverability metrics, engagement benchmarks and conversation tier utilization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Delivery Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{stats.deliveryRate}%</div>
          <p className="text-xs text-zinc-500 mt-1">Industry benchmark: 92%</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Message Open / Read Rate</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{stats.readRate}%</div>
          <p className="text-xs text-zinc-500 mt-1">4.2x higher than traditional email channels</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Opt-out / Suppression Rate</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">0.2%</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Well within Meta green threshold (&lt; 1%)</p>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4">Performance by Template Category</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Marketing Broadcasts (Promotions, announcements)</span>
              <span>96% Delivery • 82% Read</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#5722AF] h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Utility Notifications (Orders, reminders, updates)</span>
              <span>99% Delivery • 94% Read</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Authentication (OTP, Verification)</span>
              <span>100% Delivery • 98% Read</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '98%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
