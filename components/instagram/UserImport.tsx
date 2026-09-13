'use client';

import React, { useState, useRef } from 'react';
import { parseRawUsernames } from '@/lib/instagram/username';
import { parseCSVUsers } from '@/lib/instagram/csv';
import { InstagramUser } from '@/lib/instagram/types';
import { UserPlus, Upload, FileText, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface UserImportProps {
  existingUsers: InstagramUser[];
  onImportUsers: (newUsers: InstagramUser[], duplicatesCount: number, invalidCount: number) => void;
  onShowToast: (msg: string) => void;
}

export const UserImport: React.FC<UserImportProps> = ({
  existingUsers,
  onImportUsers,
  onShowToast,
}) => {
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportText = () => {
    if (!inputText.trim()) {
      onShowToast('Please paste or type at least one Instagram username');
      return;
    }

    const existingHandles = existingUsers.map((u) => u.username);
    const result = parseRawUsernames(inputText, existingHandles);

    if (result.users.length === 0 && result.duplicatesCount === 0 && result.invalidCount === 0) {
      onShowToast('No usernames could be extracted');
      return;
    }

    onImportUsers(result.users, result.duplicatesCount, result.invalidCount);
    setInputText('');

    if (result.duplicatesCount > 0) {
      onShowToast(`${result.duplicatesCount} duplicate entries removed`);
    } else {
      onShowToast(`${result.users.length} usernames imported successfully`);
    }
  };

  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      onShowToast('Please upload a .csv or .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.csv')) {
        const { usernames, error } = parseCSVUsers(content);
        if (error) {
          onShowToast(`CSV Error: ${error}`);
          return;
        }
        const existingHandles = existingUsers.map((u) => u.username);
        const result = parseRawUsernames(usernames.join('\n'), existingHandles);
        onImportUsers(result.users, result.duplicatesCount, result.invalidCount);
        onShowToast(`${result.users.length} usernames imported from CSV`);
      } else {
        const existingHandles = existingUsers.map((u) => u.username);
        const result = parseRawUsernames(content, existingHandles);
        onImportUsers(result.users, result.duplicatesCount, result.invalidCount);
        onShowToast(`${result.users.length} usernames imported from file`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    const sample = `blastoff.movies
@movieupdates
https://www.instagram.com/movie_world
example_user
film_trailers_hub
hollywood_buzz
cine_pulse
daily_cinema_box`;
    setInputText(sample);
    onShowToast('Loaded sample Instagram usernames');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-5">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8]">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Add Instagram Usernames
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste profiles, handles with @, full Instagram URLs, or upload a CSV file
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5722AF] dark:text-purple-400" />
          <span>Load Sample List</span>
        </button>
      </div>

      {/* Main Textarea Input */}
      <div className="space-y-1.5">
        <div className="relative">
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste Instagram usernames here...\n\nExamples:\nblastoff.movies\n@movieupdates\nhttps://www.instagram.com/movie_world\nexample_user, daily_cinema`}
            className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5722AF] transition-all resize-y leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
          <span>Supports newlines, commas, @ handles, and full Instagram URLs.</span>
          <span>Automatic duplicate removal</span>
        </div>
      </div>

      {/* Action Row & CSV Drag Drop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* CSV Dropzone (7 cols) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-8 p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-3 cursor-pointer text-xs ${
            isDragging
              ? 'border-[#5722AF] bg-purple-50/60 dark:bg-purple-950/40 text-[#5722AF]'
              : 'border-slate-200 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />
          <div className="p-2 rounded-xl bg-purple-100/70 dark:bg-purple-900/30 text-[#5722AF] dark:text-[#9B6BE8] shrink-0">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Upload CSV / TXT
            </span>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">
              Drag and drop your spreadsheet or click to browse (processed 100% locally)
            </span>
          </div>
        </div>

        {/* Primary Import Button (4 cols) */}
        <div className="md:col-span-4">
          <button
            type="button"
            onClick={handleImportText}
            className="w-full py-3.5 px-6 rounded-xl bg-[#5722AF] hover:bg-[#481c91] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-purple-950/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Import Users</span>
          </button>
        </div>
      </div>
    </div>
  );
};
