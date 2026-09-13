'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Eye,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Upload,
  QrCode,
  FileText
} from 'lucide-react';
import { DashboardStats, WhatsAppAccount } from '@/lib/whatsapp/types';

interface DashboardOverviewProps {
  stats: DashboardStats;
  account: WhatsAppAccount;
  onNavigate: (tab: string) => void;
  onOpenQr: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, account, onNavigate, onOpenQr }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Account Health */}
      <div className="bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-purple-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Meta Cloud API Connected (v21.0)
            </div>
            <h2 className="text-2xl font-bold mt-1 tracking-tight">{account.businessName}</h2>
            <p className="text-purple-100 text-sm mt-1 max-w-xl">
              Official WhatsApp Business Account: <span className="font-mono text-xs bg-white/15 px-2 py-0.5 rounded">{account.wabaId}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl">
              <div className="text-xs text-purple-200">Quality Rating</div>
              <div className="text-base font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                HIGH (Green)
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl">
              <div className="text-xs text-purple-200">Daily Quota Tier</div>
              <div className="text-base font-semibold">100k / Day</div>
            </div>

            <button
              onClick={() => onNavigate('campaigns')}
              className="bg-white text-[#5722AF] hover:bg-purple-50 font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Launch Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Sent</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalSent.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14.2% this week
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Delivery Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.deliveryRate}%</div>
            <div className="text-xs text-zinc-500 mt-1">High deliverability health</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Read / Open Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.readRate}%</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 4x higher than email
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Opted-In Contacts</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#5722AF] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.optedInContacts}</div>
            <div className="text-xs text-zinc-500 mt-1">100% policy-compliant verified</div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Quick Operations:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('campaigns')}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-[#5722AF] text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#5722AF]" />
            New Broadcast
          </button>
          <button
            onClick={() => onNavigate('contacts')}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-[#5722AF] text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Import CSV
          </button>
          <button
            onClick={() => onNavigate('templates')}
            className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-[#5722AF] text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            Templates
          </button>
          <button
            onClick={onOpenQr}
            className="px-3 py-1.5 text-xs font-medium bg-[#5722AF]/10 hover:bg-[#5722AF]/20 text-[#5722AF] rounded-lg flex items-center gap-1.5 transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            Opt-in QR Code
          </button>
        </div>
      </div>

      {/* Recent Messages & Live Status Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Live Messaging Activity</h3>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs text-[#5722AF] hover:underline flex items-center gap-1 font-medium"
            >
              View Full Audit Logs <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {stats.recentMessages.map(msg => (
              <div key={msg.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    msg.direction === 'OUTBOUND'
                      ? 'bg-purple-100 text-[#5722AF] dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {msg.direction === 'OUTBOUND' ? 'OUT' : 'IN'}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {msg.contactName || msg.to || msg.from}
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-1 max-w-md">{msg.content}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    msg.status === 'READ'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : msg.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : msg.status === 'SENT'
                      ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  }`}>
                    {msg.status}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy & Account Compliance Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Policy & Compliance</h3>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="font-medium text-zinc-800 dark:text-zinc-200">Opt-in Requirement</div>
                <p className="mt-0.5 text-zinc-500">
                  ToolNest automatically blocks campaign sends to any contact without verified opt-in consent.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="font-medium text-zinc-800 dark:text-zinc-200">24-Hour Customer Care Window</div>
                <p className="mt-0.5 text-zinc-500">
                  Free-form replies are allowed within 24 hours of customer initiation. Beyond 24 hours, approved Meta templates are strictly required.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="font-medium text-zinc-800 dark:text-zinc-200">Automatic STOP Unsubscribe</div>
                <p className="mt-0.5 text-zinc-500">
                  Inbound messages containing STOP, CANCEL or UNSUBSCRIBE immediately suppress the number from future broadcasts.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => onNavigate('settings')}
              className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
            >
              Configure Meta API & Webhooks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
