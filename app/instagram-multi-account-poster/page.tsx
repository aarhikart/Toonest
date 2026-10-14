'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import {
  Play,
  Square,
  RefreshCw,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Video,
  Film,
  Sparkles,
  Folder,
  Layers,
  Shield,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  LogIn,
  Sliders,
  Flame,
  ArrowRight,
  Maximize2,
  Trash2,
} from 'lucide-react';

interface AccountItem {
  id: string;
  name: string;
  category: string;
  folder: string;
  sessionDir: string;
  color: string;
  badgeBg: string;
  hashtags?: string;
  description?: string;
  sessionExists: boolean;
  isLoggedIn: boolean;
  pendingCount: number;
  finishedCount: number;
  folderExists: boolean;
}

export default function MultiAccountApiPosterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<Record<string, boolean>>({});
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Settings
  const [delaySec, setDelaySec] = useState<number>(4.5);
  const [batchLimitPerAccount, setBatchLimitPerAccount] = useState<number>(50);
  const [rotationMode, setRotationMode] = useState<'sequential' | 'round_robin'>('sequential');
  const [archiveFinished, setArchiveFinished] = useState<boolean>(true);
  const [captionMode, setCaptionMode] = useState<'filename_title' | 'custom'>('filename_title');
  const [customCaption, setCustomCaption] = useState<string>('');

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [loginLoading, setLoginLoading] = useState<Record<string, boolean>>({});

  // Stats & Logs
  const [stats, setStats] = useState({
    totalPublished: 0,
    totalFailed: 0,
    currentSpeed: 0,
    activeAccountId: '',
    activeAccountName: '',
    elapsedSec: 0,
    lastPostUrl: '',
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Load Accounts
  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await fetch('/api/instagram/multi-api-poster/accounts');
      const data = await res.json();
      if (data.success && Array.isArray(data.accounts)) {
        setAccounts(data.accounts);
        // Default select all available accounts
        const initialMap: Record<string, boolean> = {};
        data.accounts.forEach((acc: AccountItem) => {
          initialMap[acc.id] = true;
        });
        setSelectedAccountIds((prev) => (Object.keys(prev).length > 0 ? prev : initialMap));
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Poll Status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/instagram/multi-api-poster/status');
        const data = await res.json();
        if (data.success) {
          setIsRunning(data.status === 'RUNNING');
          if (data.stats) {
            setStats(data.stats);
          }
          if (data.logs && Array.isArray(data.logs) && logs.length === 0) {
            setLogs(data.logs);
          }
        }
      } catch (_) {}
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // SSE Live Logs Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/instagram/multi-api-poster/logs');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'log' && data.line) {
            setLogs((prev) => {
              const next = [...prev, data.line];
              return next.length > 600 ? next.slice(-600) : next;
            });
          }
        } catch (_) {}
      };
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch (_) {}

    return () => {
      eventSource?.close();
    };
  }, []);

  // Auto-scroll logs INSIDE terminal container only (never scrolls the browser window)
  useEffect(() => {
    if (autoScroll && terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Actions
  const handleToggleAccount = (id: string) => {
    setSelectedAccountIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (select: boolean) => {
    const nextMap: Record<string, boolean> = {};
    accounts.forEach((acc) => {
      nextMap[acc.id] = select;
    });
    setSelectedAccountIds(nextMap);
  };

  const selectedAccounts = useMemo(() => {
    return accounts.filter((acc) => selectedAccountIds[acc.id]);
  }, [accounts, selectedAccountIds]);

  const handleStart = async () => {
    if (selectedAccounts.length === 0) {
      alert('Please select at least one account to start posting!');
      return;
    }

    try {
      setStarting(true);
      const res = await fetch('/api/instagram/multi-api-poster/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: selectedAccounts,
          delaySec,
          batchLimitPerAccount,
          rotationMode,
          archiveFinished,
          captionMode,
          customCaption,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsRunning(true);
      } else {
        alert(`Failed to start: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error starting: ${err.message}`);
    } finally {
      setStarting(false);
    }
  };

  const handleStop = async () => {
    try {
      setStopping(true);
      const res = await fetch('/api/instagram/multi-api-poster/stop', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsRunning(false);
      }
    } catch (err: any) {
      alert(`Error stopping: ${err.message}`);
    } finally {
      setStopping(false);
    }
  };

  const handleLogin = async (accId: string) => {
    try {
      setLoginLoading((prev) => ({ ...prev, [accId]: true }));
      const res = await fetch('/api/instagram/multi-api-poster/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: accId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Opened browser for account login. Please log in to Instagram and close the window.`);
        fetchAccounts();
      } else {
        alert(`Login launcher error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoginLoading((prev) => ({ ...prev, [accId]: false }));
    }
  };

  const formatElapsed = (sec: number) => {
    if (!sec || sec <= 0) return '0s';
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return mins > 0 ? `${mins}m ${s}s` : `${s}s`;
  };

  const estimatedDurationMinutes = useMemo(() => {
    const totalTarget = selectedAccounts.length * batchLimitPerAccount;
    const totalSeconds = totalTarget * delaySec;
    return Math.round((totalSeconds / 60) * 10) / 10;
  }, [selectedAccounts.length, batchLimitPerAccount, delaySec]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenHelp={() => {}}
        activeToolName="Multi-Account API Poster"
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="instagram-multi-account-poster"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/70 via-slate-900 to-cyan-950/70 border border-slate-800/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Pure Headless HTTP API Protocol • Zero Browser Lag
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Instagram Multi-Account Direct API Poster
              </h1>
              <p className="text-slate-400 text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
                Directly publish high-quality <strong>Video Reels (.mp4)</strong> and <strong>Photos</strong> across
                all your Instagram accounts with smart pacing (e.g. 50 posts in 3–4 minutes), zero opened Chrome
                windows during posting, and automatic title + hashtag formatting.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isRunning ? (
                <button
                  onClick={handleStop}
                  disabled={stopping}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Square className="w-5 h-5 fill-current" />
                  {stopping ? 'Stopping...' : 'Stop Posting'}
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={starting || selectedAccounts.length === 0}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {starting ? 'Launching...' : `Start Multi-Account (${selectedAccounts.length})`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Status Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Engine Status</span>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span className="text-lg font-bold text-white">
                {isRunning ? 'POSTING' : 'IDLE'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Published</span>
            <div className="mt-2 text-2xl font-black text-emerald-400">
              {stats.totalPublished}
              <span className="text-xs font-normal text-slate-500 ml-1">
                / {selectedAccounts.length * batchLimitPerAccount}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Current Speed</span>
            <div className="mt-2 text-2xl font-black text-cyan-400">
              ~{stats.currentSpeed}
              <span className="text-xs font-normal text-slate-500 ml-1">posts/min</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Account</span>
            <div className="mt-2 text-base font-bold text-amber-400 truncate">
              {stats.activeAccountName ? `@${stats.activeAccountName}` : 'None'}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Elapsed Time</span>
            <div className="mt-2 text-2xl font-black text-slate-200">
              {formatElapsed(stats.elapsedSec)}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Safe Pacing</span>
            <div className="mt-2 text-sm font-semibold text-teal-300">
              {delaySec}s delay
              <span className="block text-[11px] text-slate-400 font-normal">
                ~{Math.round(60 / delaySec)} posts/min
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Row: Pacing & Batch Limit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Safe Pacing Slider */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Post Delay (Safe Pacing)
              </label>
              <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                {delaySec}s
              </span>
            </div>
            <input
              type="range"
              min="2.0"
              max="15.0"
              step="0.5"
              value={delaySec}
              onChange={(e) => setDelaySec(parseFloat(e.target.value))}
              disabled={isRunning}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-xs text-slate-400">
              💡 Recommended <strong>3.5s – 5.0s</strong>: 50 posts will take{' '}
              <strong className="text-slate-200">
                ~{Math.round((50 * delaySec) / 60)}m {Math.round((50 * delaySec) % 60)}s
              </strong>
              . This matches human behavior and prevents action blocks.
            </p>
          </div>

          {/* 2. Batch Limit Slider */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Limit Per Account
              </label>
              <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {batchLimitPerAccount} posts
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={batchLimitPerAccount}
              onChange={(e) => setBatchLimitPerAccount(parseInt(e.target.value, 10))}
              disabled={isRunning}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-xs text-slate-400">
              🎯 User requested: post between <strong>20 to 100</strong> posts per account,
              then automatically rotate to the next account.
            </p>
          </div>

          {/* 3. Rotation Strategy & Archive */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Rotation & Archiving
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRotationMode('sequential')}
                disabled={isRunning}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  rotationMode === 'sequential'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Sequential Batch
              </button>
              <button
                type="button"
                onClick={() => setRotationMode('round_robin')}
                disabled={isRunning}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  rotationMode === 'round_robin'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Round-Robin (1/each)
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={archiveFinished}
                onChange={(e) => setArchiveFinished(e.target.checked)}
                disabled={isRunning}
                className="accent-purple-500 w-4 h-4 rounded"
              />
              Move posted videos to <code className="text-purple-300">finished_reels</code>
            </label>
          </div>
        </div>

        {/* Caption & Hashtags Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-pink-400" />
              Caption & Hashtags Flow
            </h3>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setCaptionMode('filename_title')}
                disabled={isRunning}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  captionMode === 'filename_title'
                    ? 'bg-pink-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Filename Title + Account Hashtags
              </button>
              <button
                type="button"
                onClick={() => setCaptionMode('custom')}
                disabled={isRunning}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  captionMode === 'custom'
                    ? 'bg-pink-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom Caption Override
              </button>
            </div>
          </div>

          {captionMode === 'custom' ? (
            <div>
              <textarea
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                placeholder="Enter caption and hashtags to use for all posts..."
                disabled={isRunning}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
              />
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold">Example Live Caption: </span>
                <span className="italic text-slate-300">
                  "Aesthetic Supercar Red Lamborghini Revuelto"
                </span>
                <span className="text-pink-400 ml-2">#reels #viral #explore #trending</span>
              </div>
              <span className="text-[11px] text-slate-500">
                (Cleaned automatically from video file name)
              </span>
            </div>
          )}
        </div>

        {/* Multi-Account Selection Grid */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Select Accounts to Post With ({selectedAccounts.length}/{accounts.length})
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Total planned run:{' '}
                <strong className="text-emerald-400">
                  {selectedAccounts.length * batchLimitPerAccount} posts
                </strong>{' '}
                across {selectedAccounts.length} account(s) • Est. Duration: ~
                <strong className="text-cyan-400">{estimatedDurationMinutes} mins</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                disabled={isRunning}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                disabled={isRunning}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 transition-colors"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={fetchAccounts}
                disabled={loadingAccounts || isRunning}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refresh Accounts"
              >
                <RefreshCw className={`w-4 h-4 ${loadingAccounts ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loadingAccounts ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading Instagram accounts and folder queues...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => {
                const isSelected = !!selectedAccountIds[acc.id];
                const isLoggingIn = !!loginLoading[acc.id];

                return (
                  <div
                    key={acc.id}
                    onClick={() => !isRunning && handleToggleAccount(acc.id)}
                    className={`relative rounded-xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-cyan-500/50 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-500/30'
                        : 'bg-slate-900/60 border-slate-800/80 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          disabled={isRunning}
                          className="w-4 h-4 accent-cyan-500 rounded cursor-pointer mt-0.5"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            @{acc.name || acc.id}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                              {acc.category || 'General'}
                            </span>
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {acc.isLoggedIn ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Ready / Logged In
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                Session Missing
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogin(acc.id);
                        }}
                        disabled={isRunning || isLoggingIn}
                        title="Open Chrome to Log In"
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-[11px] font-semibold text-slate-300 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <LogIn className="w-3 h-3" />
                        {isLoggingIn ? 'Opening...' : 'Login'}
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-[180px]" title={acc.folder}>
                        <Folder className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{acc.folder.split('\\').pop()}</span>
                      </span>
                      <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {acc.pendingCount} videos
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live SSE Terminal Console */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">
                Live Engine Console Output (Pure Headless HTTP)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {logs.length} lines
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {stats.lastPostUrl && (
                <a
                  href={stats.lastPostUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/30"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Last Post
                </a>
              )}
              <label className="flex items-center gap-1 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="accent-cyan-500 rounded"
                />
                Auto-scroll
              </label>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={terminalContainerRef}
            className="p-4 font-mono text-xs text-slate-300 bg-slate-950 h-80 overflow-y-auto space-y-1 select-text"
          >
            {logs.length === 0 ? (
              <div className="text-slate-600 italic py-8 text-center">
                Engine is idle. Click "Start Multi-Account" above to begin posting videos and reels across accounts.
              </div>
            ) : (
              logs.map((line, idx) => {
                const isSuccess = line.includes('✔ [SUCCESS]');
                const isError = line.includes('❌ [ERROR]') || line.includes('Action Block');
                const isSwitch = line.includes('Switched to: @');
                const isPost = line.includes('📤 Posting');

                return (
                  <div
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      isSuccess
                        ? 'text-emerald-400 font-semibold'
                        : isError
                        ? 'text-rose-400 font-semibold'
                        : isSwitch
                        ? 'text-cyan-300 font-bold bg-cyan-950/30 px-1 py-0.5 rounded'
                        : isPost
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {line}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
