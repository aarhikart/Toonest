import React from 'react';
import { Phone, User, Clock, Calendar, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { CallRecord } from '@/lib/call-history/types';
import { formatPhoneNumberForDisplay, formatCallDate, formatCallTime } from '@/lib/call-history/normalizer';

interface CallCardMobileProps {
  call: CallRecord;
  onClick: () => void;
}

export function CallCardMobile({ call, onClick }: CallCardMobileProps) {
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

  const badge = getTypeBadge(call.type);
  const Icon = badge.icon;

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-[#5722AF]/40 transition-all cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${badge.bg} ${badge.border} ${badge.text}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              {call.contactName || formatPhoneNumberForDisplay(call.phoneNumber)}
            </h4>
            {call.contactName && (
              <p className="font-mono text-[11px] text-zinc-400">
                {formatPhoneNumberForDisplay(call.phoneNumber)}
              </p>
            )}
          </div>
        </div>

        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.border} ${badge.text}`}
        >
          {call.type}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>{formatCallDate(call.timestamp)}</span>
          <span>•</span>
          <span>{formatCallTime(call.timestamp)}</span>
        </div>

        <div className="flex items-center gap-1 font-mono font-bold text-zinc-800 dark:text-zinc-200">
          <Clock className="w-3 h-3 text-[#5722AF]" />
          <span>{call.durationFormatted}</span>
        </div>
      </div>
    </div>
  );
}
