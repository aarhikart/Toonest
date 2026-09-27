'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  User,
  Clock,
  Calendar,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ArrowUpDown,
  ShieldCheck,
  Trophy,
  Timer,
  ChevronDown,
} from 'lucide-react';
import { ContactSummary, CallRecord } from '@/lib/call-history/types';
import { formatPhoneNumberForDisplay, formatCallDate, formatCallTime, formatDuration } from '@/lib/call-history/normalizer';

interface CallDetailsModalProps {
  contact: ContactSummary | null;
  onClose: () => void;
}

export function CallDetailsModal({ contact, onClose }: CallDetailsModalProps) {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  if (!contact) return null;

  // Sort calls
  const timelineCalls = [...contact.calls].sort((a, b) =>
    sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
  );

  // Calculate longest call for this contact
  const longestCallSec = Math.max(0, ...contact.calls.map((c) => c.durationSeconds || 0));

  // Group calls by date for clean timeline view
  const groupedByDate: { [dateStr: string]: CallRecord[] } = {};
  timelineCalls.forEach((call) => {
    const dateLabel = formatCallDate(call.timestamp);
    if (!groupedByDate[dateLabel]) {
      groupedByDate[dateLabel] = [];
    }
    groupedByDate[dateLabel].push(call);
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Incoming':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800/40',
          icon: PhoneIncoming,
        };
      case 'Outgoing':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800/40',
          icon: PhoneOutgoing,
        };
      case 'Missed':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-800/40',
          icon: PhoneMissed,
        };
      default:
        return {
          bg: 'bg-zinc-100 dark:bg-zinc-800',
          text: 'text-zinc-700 dark:text-zinc-300',
          border: 'border-zinc-200 dark:border-zinc-700',
          icon: Phone,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center shrink-0">
              {contact.contactName ? <User className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {contact.contactName || 'Call Details'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300">
                  Authorized Record
                </span>
              </div>
              <p className="font-mono text-xs text-zinc-500">
                {formatPhoneNumberForDisplay(contact.phoneNumber)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase">Total Calls</span>
              <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                {contact.totalCalls}
              </div>
              <span className="text-[10px] text-zinc-500">
                {contact.incoming} In / {contact.outgoing} Out
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase">Missed Calls</span>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {contact.missed}
              </div>
              <span className="text-[10px] text-zinc-500">
                {contact.rejected > 0 ? `${contact.rejected} rejected` : '0 rejected'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase">Total Duration</span>
              <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                {contact.totalDurationFormatted}
              </div>
              <span className="text-[10px] text-zinc-500">
                Avg: {contact.averageDurationFormatted}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase">Longest Call</span>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                {formatDuration(longestCallSec, 'compact')}
              </div>
              <span className="text-[10px] text-zinc-500">
                Connected talk time
              </span>
            </div>
          </div>

          {/* First & Last Call Dates */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5722AF]" />
              <span className="text-zinc-600 dark:text-zinc-400">
                First Contact: <strong className="text-zinc-900 dark:text-zinc-100">{contact.firstCallFormatted}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-zinc-600 dark:text-zinc-400">
                Last Contact: <strong className="text-zinc-900 dark:text-zinc-100">{contact.lastCallFormatted}</strong>
              </span>
            </div>
          </div>

          {/* Call Timeline Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Call Timeline ({contact.calls.length} Records)
              </h4>
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Toggle timeline ordering"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-4">
              {Object.keys(groupedByDate).map((dateKey) => (
                <div key={dateKey} className="space-y-2">
                  <div className="sticky top-0 z-10 py-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5722AF]" />
                    <span>{dateKey}</span>
                  </div>

                  <div className="space-y-2 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 ml-1">
                    {groupedByDate[dateKey].map((call) => {
                      const badge = getTypeBadge(call.type);
                      const Icon = badge.icon;
                      return (
                        <div
                          key={call.id}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-xl border ${badge.bg} ${badge.border} ${badge.text}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                                {call.type} Call
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                {formatCallTime(call.timestamp)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                              {call.durationFormatted}
                            </span>
                            <div className="text-[10px] text-zinc-400">
                              {call.durationSeconds > 0 ? `${call.durationSeconds}s` : 'Unanswered'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50">
          <span>All analytics calculated directly from user&apos;s supplied dataset</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#5722AF] hover:bg-[#682BC9] transition-colors cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
