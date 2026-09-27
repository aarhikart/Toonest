import React from 'react';
import { Users, Phone, User, Clock, ChevronRight } from 'lucide-react';
import { ContactSummary } from '@/lib/call-history/types';
import { formatPhoneNumberForDisplay } from '@/lib/call-history/normalizer';

interface MostContactedListProps {
  contacts: ContactSummary[];
  onSelectContact: (contact: ContactSummary) => void;
  maxDisplay?: number;
}

export function MostContactedList({
  contacts,
  onSelectContact,
  maxDisplay = 6,
}: MostContactedListProps) {
  const topList = contacts.slice(0, maxDisplay);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              Most Contacted Numbers
            </h3>
            <p className="text-[11px] text-zinc-500">
              Analytical ranking based on total call frequency
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-zinc-400">
          Top {topList.length} of {contacts.length}
        </span>
      </div>

      {topList.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-xs">
          No contact records available
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {topList.map((c, i) => (
            <div
              key={i}
              onClick={() => onSelectContact(c)}
              className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 px-2 rounded-2xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </span>

                <div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-[#5722AF] dark:group-hover:text-[#B68BFF] transition-colors truncate max-w-[150px] sm:max-w-xs">
                    {c.contactName || formatPhoneNumberForDisplay(c.phoneNumber)}
                  </h4>
                  {c.contactName && (
                    <p className="font-mono text-[11px] text-zinc-400">
                      {formatPhoneNumberForDisplay(c.phoneNumber)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {c.totalCalls} {c.totalCalls === 1 ? 'call' : 'calls'}
                  </span>
                  <div className="text-[10px] text-zinc-400 flex items-center justify-end gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{c.totalDurationFormatted}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#5722AF] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
