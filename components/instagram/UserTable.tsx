'use client';

import React, { useState, useMemo } from 'react';
import { InstagramUser, OpenTargetMode, UserStatus } from '@/lib/instagram/types';
import { UserRow } from './UserRow';
import {
  Search,
  Users,
  Trash2,
  SkipForward,
  CheckCircle2,
  CheckSquare,
  Square,
  RotateCcw
} from 'lucide-react';

interface UserTableProps {
  users: InstagramUser[];
  currentIndex: number;
  openMode: OpenTargetMode;
  onSetActiveUser: (index: number) => void;
  onUpdateStatus: (id: string, status: UserStatus) => void;
  onDeleteUser: (id: string) => void;
  onBulkUpdateStatus: (ids: string[], status: UserStatus) => void;
  onBulkDelete: (ids: string[]) => void;
  onClearCompleted: () => void;
  onShowToast: (msg: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentIndex,
  openMode,
  onSetActiveUser,
  onUpdateStatus,
  onDeleteUser,
  onBulkUpdateStatus,
  onBulkDelete,
  onClearCompleted,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered users based on search & status
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchQuery.trim() ||
        u.username.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  // Counts by status
  const counts = useMemo(() => {
    const c = { all: users.length, pending: 0, sent: 0, skipped: 0, invalid: 0, failed: 0 };
    for (const u of users) {
      if (u.status in c) {
        c[u.status as keyof typeof c]++;
      }
    }
    return c;
  }, [users]);

  // Checkbox handlers
  const handleToggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleSelectPending = () => {
    const pending = users.filter((u) => u.status === 'pending').map((u) => u.id);
    setSelectedIds(new Set(pending));
    onShowToast(`Selected ${pending.length} pending users`);
  };

  const handleBulkMarkSent = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    onBulkUpdateStatus(ids, 'sent');
    setSelectedIds(new Set());
    onShowToast(`Marked ${ids.length} users as Sent`);
  };

  const handleBulkMarkSkipped = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    onBulkUpdateStatus(ids, 'skipped');
    setSelectedIds(new Set());
    onShowToast(`Marked ${ids.length} users as Skipped`);
  };

  const handleBulkDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    onBulkDelete(ids);
    setSelectedIds(new Set());
    onShowToast(`Deleted ${ids.length} users`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
      {/* Header & Search */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Instagram User Directory ({users.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any row to make it the active outreach target
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search usernames..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'sent', label: 'Sent', count: counts.sent },
            { key: 'skipped', label: 'Skipped', count: counts.skipped },
            { key: 'invalid', label: 'Invalid', count: counts.invalid },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#5722AF] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bulk Actions Bar (visible when rows selected) */}
        {selectedIds.size > 0 && (
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-150">
            <div className="font-bold text-[#5722AF] dark:text-purple-300 flex items-center gap-2">
              <span>{selectedIds.size} users selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleBulkMarkSent}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1 hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Sent</span>
              </button>

              <button
                type="button"
                onClick={handleBulkMarkSkipped}
                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-semibold flex items-center gap-1 hover:bg-amber-700 transition-colors cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Mark Skipped</span>
              </button>

              <button
                type="button"
                onClick={handleBulkDeleteSelected}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold flex items-center gap-1 hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Selection Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="hover:text-[#5722AF] dark:hover:text-purple-400 font-medium cursor-pointer"
            >
              {selectedIds.size === filteredUsers.length && filteredUsers.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleSelectPending}
              className="hover:text-[#5722AF] dark:hover:text-purple-400 font-medium cursor-pointer"
            >
              Select Pending ({counts.pending})
            </button>
          </div>

          {counts.sent > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 font-medium cursor-pointer"
            >
              Clear Completed Sent ({counts.sent})
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-700 text-[#5722AF] focus:ring-[#5722AF] w-3.5 h-3.5 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-2 w-12 text-center">#</th>
              <th className="py-2.5 px-3">Username</th>
              <th className="py-2.5 px-3">Instagram Profile</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                // Determine original index in the main users list
                const originalIndex = users.findIndex((u) => u.id === user.id);
                return (
                  <UserRow
                    key={user.id}
                    user={user}
                    index={originalIndex}
                    isActive={originalIndex === currentIndex}
                    isSelected={selectedIds.has(user.id)}
                    openMode={openMode}
                    onSelectRow={handleToggleRow}
                    onSetActiveUser={onSetActiveUser}
                    onUpdateStatus={onUpdateStatus}
                    onDeleteUser={onDeleteUser}
                  />
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                  {searchQuery ? (
                    <span>No usernames found matching &quot;{searchQuery}&quot;</span>
                  ) : (
                    <span>No users in this filter category</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
