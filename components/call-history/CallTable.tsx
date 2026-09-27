'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Filter,
  Phone,
  User,
  Clock,
  Calendar,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Eye,
  Info,
} from 'lucide-react';
import { CallRecord, CallType } from '@/lib/call-history/types';
import {
  formatPhoneNumberForDisplay,
  formatCallDate,
  formatCallTime,
} from '@/lib/call-history/normalizer';
import {
  searchCalls,
  filterCallsByType,
  filterCallsByDuration,
  sortCalls,
} from '@/lib/call-history/filters';
import { CallCardMobile } from './CallCardMobile';

interface CallTableProps {
  records: CallRecord[];
  onSelectCall: (call: CallRecord) => void;
}

export function CallTable({ records, onSelectCall }: CallTableProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'contact' | 'number' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    let list = records;
    list = searchCalls(list, search);
    list = filterCallsByType(list, selectedType);
    list = filterCallsByDuration(list, durationFilter);
    list = sortCalls(list, sortBy, sortOrder);
    return list;
  }, [records, search, selectedType, durationFilter, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pagedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleSort = (column: 'date' | 'duration' | 'contact' | 'number' | 'type') => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

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
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search phone number or contact name..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & Row count */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Call Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
          >
            <option value="ALL">All Call Types</option>
            <option value="Incoming">Incoming Calls</option>
            <option value="Outgoing">Outgoing Calls</option>
            <option value="Missed">Missed Calls</option>
            <option value="Rejected">Rejected Calls</option>
            <option value="Declined">Declined Calls</option>
            <option value="Blocked">Blocked Calls</option>
          </select>

          {/* Duration Filter */}
          <select
            value={durationFilter}
            onChange={(e) => {
              setDurationFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
          >
            <option value="all">Any Duration</option>
            <option value="zero">0s (Missed / Unanswered)</option>
            <option value="under1m">&lt; 1 minute</option>
            <option value="1to5m">1 – 5 minutes</option>
            <option value="5to15m">5 – 15 minutes</option>
            <option value="over15m">15+ minutes</option>
          </select>

          {/* Rows per page */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-2.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            title="Rows per page"
          >
            <option value={15}>15 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date & Time</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('number')}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Phone Number</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('contact')}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Contact Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('type')}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Call Type</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('duration')}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Duration</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3 px-4 w-20 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {pagedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No call records found matching your filters.
                  </td>
                </tr>
              ) : (
                pagedRecords.map((item) => {
                  const badge = getTypeBadge(item.type);
                  const Icon = badge.icon;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectCall(item)}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {formatCallDate(item.timestamp)}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {formatCallTime(item.timestamp)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
                        {formatPhoneNumberForDisplay(item.phoneNumber)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.contactName ? (
                          <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                            <User className="w-3 h-3 text-[#5722AF]" />
                            <span>{item.contactName}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">Unsaved</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.border} ${badge.text}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{item.type}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {item.durationFormatted}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCall(item);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-[#5722AF] dark:hover:text-[#B68BFF] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="View Contact Call Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        <div className="py-3 px-4 bg-zinc-50/70 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden space-y-2.5">
        {pagedRecords.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            No call records found matching your filters.
          </div>
        ) : (
          pagedRecords.map((item) => (
            <CallCardMobile
              key={item.id}
              call={item}
              onClick={() => onSelectCall(item)}
            />
          ))
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between text-xs text-zinc-500">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-xs font-semibold"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
