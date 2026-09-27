'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Phone,
  User,
  Clock,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  X,
  Calendar,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { CallRecord, ContactSummary } from '@/lib/call-history/types';
import { normalizePhoneNumber, formatPhoneNumberForDisplay } from '@/lib/call-history/normalizer';
import { groupCallsByNumber } from '@/lib/call-history/statistics';

interface SearchNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: CallRecord[];
  onSelectContact?: (contact: ContactSummary) => void;
}

export function SearchNumberModal({
  isOpen,
  onClose,
  records,
  onSelectContact,
}: SearchNumberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Group all user's records by phone number/contact
  const contactSummaries = useMemo(() => {
    return groupCallsByNumber(records);
  }, [records]);

  // Filtered summaries strictly within the imported records
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const normQ = normalizePhoneNumber(q);

    return contactSummaries.filter((c) => {
      // Name match
      if (c.contactName && c.contactName.toLowerCase().includes(q)) return true;
      // Raw phone match
      if (c.phoneNumber && c.phoneNumber.toLowerCase().includes(q)) return true;
      // Normalized digits match
      if (normQ && c.normalizedNumber && c.normalizedNumber.includes(normQ)) return true;
      return false;
    });
  }, [searchQuery, contactSummaries]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Search Authorized Call Records
              </h3>
              <p className="text-[11px] text-zinc-500">
                Lookup phone numbers or contact names in your imported data
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

        {/* Search Bar Input */}
        <div className="p-6 pb-2 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone number (e.g. +91XXXXXXXXXX) or contact name..."
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Searches strictly within your {records.length.toLocaleString()} uploaded call records.</span>
          </div>
        </div>

        {/* Results Area */}
        <div className="p-6 pt-2 overflow-y-auto flex-1 space-y-3">
          {!searchQuery.trim() ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              Enter a phone number or contact name to search matching records.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No matching call records found in the imported data.
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No records matching &quot;{searchQuery}&quot; exist in the currently loaded dataset.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Matching Records ({searchResults.length})
              </div>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (onSelectContact) {
                      onSelectContact(item);
                      onClose();
                    }
                  }}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 border border-zinc-200 dark:border-zinc-700/80 hover:border-[#5722AF]/40 transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center shrink-0">
                        {item.contactName ? <User className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                      </div>
                      <div>
                        {item.contactName && (
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#5722AF] dark:group-hover:text-[#B68BFF] transition-colors">
                            {item.contactName}
                          </h4>
                        )}
                        <p className="font-mono text-xs text-zinc-600 dark:text-zinc-300 font-semibold">
                          {formatPhoneNumberForDisplay(item.phoneNumber)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5722AF] text-white shadow-2xs">
                        {item.totalCalls} {item.totalCalls === 1 ? 'call' : 'calls'}
                      </span>
                    </div>
                  </div>

                  {/* Call Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-400">Incoming</div>
                      <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {item.incoming}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-400">Outgoing</div>
                      <div className="font-bold text-xs text-blue-600 dark:text-blue-400">
                        {item.outgoing}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-400">Missed</div>
                      <div className="font-bold text-xs text-rose-600 dark:text-rose-400">
                        {item.missed}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                      <div className="text-[10px] text-zinc-400">Duration</div>
                      <div className="font-bold text-xs text-purple-600 dark:text-purple-400 truncate">
                        {item.totalDurationFormatted}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span>First: {item.firstCallFormatted}</span>
                    <span>Last: {item.lastCallFormatted}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50">
          <span>Click any contact to view full chronological call timeline</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
