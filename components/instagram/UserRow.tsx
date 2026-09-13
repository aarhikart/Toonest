'use client';

import React from 'react';
import { InstagramUser, OpenTargetMode } from '@/lib/instagram/types';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  SkipForward,
  AlertCircle,
  Play,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface UserRowProps {
  user: InstagramUser;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  openMode: OpenTargetMode;
  onSelectRow: (id: string) => void;
  onSetActiveUser: (index: number) => void;
  onUpdateStatus: (id: string, status: InstagramUser['status']) => void;
  onDeleteUser: (id: string) => void;
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  index,
  isActive,
  isSelected,
  openMode,
  onSelectRow,
  onSetActiveUser,
  onUpdateStatus,
  onDeleteUser,
}) => {
  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = openMode === 'new_tab' ? '_blank' : '_self';
    window.open(user.profileUrl, target);
  };

  return (
    <tr
      onClick={() => onSetActiveUser(index)}
      className={`group border-b border-slate-100 dark:border-slate-800 text-xs transition-colors cursor-pointer ${
        isActive
          ? 'bg-purple-50/80 dark:bg-purple-950/30'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
      }`}
    >
      {/* Checkbox */}
      <td className="py-3 px-3 w-10 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectRow(user.id)}
          className="rounded border-slate-300 dark:border-slate-700 text-[#5722AF] focus:ring-[#5722AF] w-3.5 h-3.5 cursor-pointer"
        />
      </td>

      {/* Index */}
      <td className="py-3 px-2 w-12 font-mono text-slate-400 text-center">
        {index + 1}
      </td>

      {/* Username */}
      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
        <div className="flex items-center gap-1.5">
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#5722AF] dark:bg-[#9B6BE8] animate-pulse shrink-0" />
          )}
          <span className="truncate max-w-[160px] sm:max-w-[200px]">
            @{user.username}
          </span>
        </div>
      </td>

      {/* Instagram Direct DM & Profile */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const target = openMode === 'new_tab' ? '_blank' : '_self';
              window.open(
                user.directMessageUrl || `https://www.instagram.com/direct/t/${user.username}/`,
                target
              );
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:underline"
            title="Open Direct DM Chat composer"
          >
            <span>Direct DM</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const target = openMode === 'new_tab' ? '_blank' : '_self';
              window.open(user.profileUrl, target);
            }}
            className="inline-flex items-center text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:underline"
            title="Open Instagram Profile"
          >
            <span>Profile</span>
          </button>
        </div>
      </td>

      {/* Status Badge */}
      <td className="py-3 px-3">
        {user.status === 'sent' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            Sent
          </span>
        )}
        {user.status === 'pending' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-[#5722AF] dark:text-purple-300 font-semibold text-[10px]">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )}
        {user.status === 'skipped' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-semibold text-[10px]">
            <SkipForward className="w-3 h-3" />
            Skipped
          </span>
        )}
        {user.status === 'invalid' && (
          <span
            title={user.errorReason || 'Invalid username'}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-semibold text-[10px]"
          >
            <AlertCircle className="w-3 h-3" />
            Invalid
          </span>
        )}
      </td>

      {/* Row Actions */}
      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
          {user.status === 'pending' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(user.id, 'sent')}
              className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-600 transition-colors"
              title="Mark as Sent"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}

          {user.status !== 'pending' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(user.id, 'pending')}
              className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950 text-purple-600 transition-colors"
              title="Reset to Pending"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onSetActiveUser(index)}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-[#5722AF] dark:text-[#9B6BE8] transition-colors"
            title="Set as Current User"
          >
            <Play className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteUser(user.id)}
            className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 transition-colors"
            title="Remove User"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
