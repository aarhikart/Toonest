'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import {
  Play,
  Square,
  RotateCcw,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Folder,
  Copy,
  Check,
  Layers,
  Activity,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  FileVideo,
  Shield,
  Film,
  Dumbbell,
  Utensils,
  Wrench,
  Clapperboard,
  Power,
  Plus,
  X,
  CheckSquare,
  Repeat
} from 'lucide-react';

const ACCOUNT_ICONS = {
  cars: Film,
  gym: Dumbbell,
  food: Utensils,
  pipe: Wrench,
  moviemela: Clapperboard,
};

function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function AutomationDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState({});
  const [runningCount, setRunningCount] = useState(0);
  const [totalCount, setTotalCount] = useState(5);
  const [logs, setLogs] = useState({
    cars: [],
    gym: [],
    food: [],
    pipe: [],
    moviemela: [],
  });

  const [expandedTerminals, setExpandedTerminals] = useState({
    cars: true,
    gym: true,
    food: true,
    pipe: true,
    moviemela: true,
  });

  const [autoScroll, setAutoScroll] = useState(true);
  const [globalTabs, setGlobalTabs] = useState(2);
  const [globalLoopCount, setGlobalLoopCount] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('toolnest_automation_global_loop_count');
        if (saved !== null && saved !== '') {
          const parsed = parseInt(saved, 10);
          return isNaN(parsed) ? 20 : parsed;
        }
      } catch (_) {}
    }
    return 20;
  });

  const updateGlobalLoopCount = (val) => {
    const parsed = typeof val === 'number' ? val : parseInt(val, 10);
    const safe = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setGlobalLoopCount(safe);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('toolnest_automation_global_loop_count', String(safe));
      } catch (_) {}
    }
  };

  const [copiedFolder, setCopiedFolder] = useState(null);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isStoppingAll, setIsStoppingAll] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  // Checkbox selection state for batch posting (persisted in localStorage)
  const [selectedAccounts, setSelectedAccounts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('toolnest_automation_selected_accounts');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return {
      cars: true,
      gym: true,
      food: true,
      pipe: true,
      moviemela: true,
    };
  });

  // Modal state for adding a new custom account
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingNewAccount, setIsSubmittingNewAccount] = useState(false);
  const [addAccountError, setAddAccountError] = useState('');
  const [newAccountForm, setNewAccountForm] = useState({
    name: '',
    folder: '',
    category: '',
    hashtags: '#reels #viral #explore #trending',
    color: '#06b6d4',
  });

  const terminalRefs = useRef({});

  // Helper to persist selection changes to localStorage
  const updateSelectedAccounts = (updater) => {
    setSelectedAccounts((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('toolnest_automation_selected_accounts', JSON.stringify(next));
        } catch (_) {}
      }
      return next;
    });
  };

  const toggleAccountSelect = (accId) => {
    updateSelectedAccounts((prev) => ({
      ...prev,
      [accId]: prev[accId] === false ? true : false,
    }));
  };

  // Ensure newly discovered accounts default to selected
  useEffect(() => {
    const keys = Object.keys(accounts);
    if (keys.length > 0) {
      setSelectedAccounts((prev) => {
        let changed = false;
        const next = { ...prev };
        keys.forEach((k) => {
          if (next[k] === undefined) {
            next[k] = true;
            changed = true;
          }
        });
        if (changed && typeof window !== 'undefined') {
          try {
            localStorage.setItem('toolnest_automation_selected_accounts', JSON.stringify(next));
          } catch (_) {}
        }
        return changed ? next : prev;
      });
    }
  }, [accounts]);

  // Fetch status of all accounts
  const fetchStatus = useCallback(async () => {
    try {
      setIsPolling(true);
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
        setRunningCount(data.runningCount || 0);
        setTotalCount(data.totalCount || Object.keys(data.accounts).length);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('[Dashboard] Error polling status:', err);
    } finally {
      setIsPolling(false);
    }
  }, []);

  // Set up periodic polling for status & video queue counts
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Set up Server-Sent Events (SSE) for real-time log streaming
  useEffect(() => {
    let eventSource = null;

    try {
      eventSource = new EventSource('/api/logs');

      eventSource.onmessage = (event) => {
        try {
          const logEntry = JSON.parse(event.data);
          if (logEntry && logEntry.accountId) {
            setLogs((prev) => {
              const currentList = prev[logEntry.accountId] || [];
              if (currentList.some((item) => item.id === logEntry.id)) {
                return prev;
              }
              const nextList = [...currentList, logEntry];
              if (nextList.length > 500) nextList.shift();
              return {
                ...prev,
                [logEntry.accountId]: nextList,
              };
            });
          }
        } catch (_) {}
      };

      eventSource.onerror = (err) => {
        // SSE automatically reconnects on error
      };
    } catch (e) {
      console.error('[Dashboard] Failed to initialize SSE:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Auto-scroll terminals to bottom when new logs arrive
  useEffect(() => {
    if (!autoScroll) return;
    Object.keys(terminalRefs.current).forEach((accId) => {
      const el = terminalRefs.current[accId];
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, [logs, autoScroll]);

  const accountKeys = Object.keys(accounts);
  const selectedAccountIds = accountKeys.filter((id) => selectedAccounts[id] !== false);
  const selectedCount = selectedAccountIds.length;
  const allSelected = accountKeys.length > 0 && selectedCount === accountKeys.length;

  const toggleSelectAll = () => {
    updateSelectedAccounts((prev) => {
      const next = { ...prev };
      const targetState = !allSelected;
      accountKeys.forEach((id) => {
        next[id] = targetState;
      });
      return next;
    });
  };

  // Trigger Start Selected (or All) with configured concurrent tabs
  const handleStartAll = async () => {
    if (selectedCount === 0) {
      alert('Please check at least 1 account to start batch posting.');
      return;
    }

    setIsLoadingAll(true);
    try {
      const res = await fetch('/api/start-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabs: globalTabs,
          postLimit: globalLoopCount,
          accountIds: selectedAccountIds,
        }),
      });
      const data = await res.json();
      if (data.status) {
        setAccounts(data.status.accounts || {});
        setRunningCount(data.status.runningCount || 0);
      }
      fetchStatus();
    } catch (err) {
      alert(`Failed to start selected scripts: ${err.message}`);
    } finally {
      setIsLoadingAll(false);
    }
  };

  // Create new custom account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setAddAccountError('');

    if (!newAccountForm.name.trim()) {
      setAddAccountError('Account name is required.');
      return;
    }
    if (!newAccountForm.folder.trim()) {
      setAddAccountError('Local folder path on your Windows PC is required.');
      return;
    }

    setIsSubmittingNewAccount(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccountForm),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAddAccountError(data.error || 'Failed to create account.');
      } else {
        if (data.account?.id) {
          updateSelectedAccounts((prev) => ({ ...prev, [data.account.id]: true }));
        }
        setIsAddModalOpen(false);
        setNewAccountForm({
          name: '',
          folder: '',
          category: '',
          hashtags: '#reels #viral #explore #trending',
          color: '#06b6d4',
        });
        await fetchStatus();
      }
    } catch (err) {
      setAddAccountError(err.message || 'Failed to connect to server.');
    } finally {
      setIsSubmittingNewAccount(false);
    }
  };

  // Delete a custom account
  const handleDeleteAccount = async (accountId, accountName) => {
    if (!window.confirm(`Are you sure you want to delete "${accountName}"? If it is currently active, its process will be stopped immediately.`)) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [accountId]: true }));
    try {
      const res = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete account.');
      } else {
        await fetchStatus();
      }
    } catch (err) {
      alert(`Error deleting account: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  // Trigger Emergency Stop All
  const handleStopAll = async () => {
    setIsStoppingAll(true);
    try {
      const res = await fetch('/api/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (data.status) {
        setAccounts(data.status.accounts || {});
        setRunningCount(data.status.runningCount || 0);
      }
      fetchStatus();
    } catch (err) {
      alert(`Failed to stop scripts: ${err.message}`);
    } finally {
      setIsStoppingAll(false);
    }
  };

  // Trigger Start Single with configured concurrent tabs
  const handleStartSingle = async (accountId) => {
    setActionLoading((prev) => ({ ...prev, [accountId]: true }));
    try {
      const res = await fetch('/api/start-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, tabs: globalTabs, postLimit: globalLoopCount }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to start script.');
      } else if (data.status) {
        setAccounts(data.status.accounts || {});
        setRunningCount(data.status.runningCount || 0);
      }
      fetchStatus();
    } catch (err) {
      alert(`Error starting script: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  // Trigger Stop Single
  const handleStopSingle = async (accountId) => {
    setActionLoading((prev) => ({ ...prev, [accountId]: true }));
    try {
      const res = await fetch('/api/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to stop script.');
      } else if (data.status) {
        setAccounts(data.status.accounts || {});
        setRunningCount(data.status.runningCount || 0);
      }
      fetchStatus();
    } catch (err) {
      alert(`Error stopping script: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  const toggleTerminal = (accountId) => {
    setExpandedTerminals((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const handleClearLogs = (accountId) => {
    setLogs((prev) => ({
      ...prev,
      [accountId]: [],
    }));
  };

  const handleCopyFolder = (folderPath, accountId) => {
    navigator.clipboard.writeText(folderPath);
    setCopiedFolder(accountId);
    setTimeout(() => setCopiedFolder(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeToolName="Playwright Automation Hub"
        onOpenHelp={() => {}}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* COMMAND CENTER HEADER BAR */}
        <div className="bg-[#0f121d] rounded-3xl border border-zinc-800/80 p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Title & Status Overview */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>Local Command Center</span>
                </span>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b2b] border border-zinc-700/60 text-xs font-mono font-bold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      runningCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                    }`}
                  />
                  <span className={runningCount > 0 ? 'text-emerald-400' : 'text-zinc-400'}>
                    {runningCount} of {totalCount} Running
                  </span>
                </div>

                {lastRefreshed && (
                  <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                    Updated: {lastRefreshed}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Playwright Automation Hub
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Simultaneously trigger, manage, and monitor 5 standalone Instagram reels automation scripts on Windows with isolated browser sessions, atomic locks, and real-time logs.
              </p>
            </div>

            {/* Global Actions Bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={fetchStatus}
                disabled={isPolling}
                className="p-3 rounded-2xl bg-[#161a28] hover:bg-[#1f2538] border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer shadow-xs"
                title="Refresh Status"
              >
                <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin text-purple-400' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="py-3 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2 cursor-pointer"
                title="Add a new Instagram automation account with a local folder"
              >
                <Plus className="w-4 h-4" />
                <span>Add Account</span>
              </button>

              <button
                type="button"
                onClick={handleStartAll}
                disabled={isLoadingAll || selectedCount === 0}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={selectedCount === 0 ? 'Please select at least 1 account' : `Start posting to ${selectedCount} selected account(s)`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {isLoadingAll
                    ? 'Starting...'
                    : selectedCount === 0
                    ? 'Select Accounts'
                    : selectedCount === accountKeys.length
                    ? `Start All (${accountKeys.length} Accs, ${globalTabs} Tabs, ${globalLoopCount > 0 ? `${globalLoopCount} Posts Max` : 'All Posts'})`
                    : `Start Selected (${selectedCount} Accs, ${globalTabs} Tabs, ${globalLoopCount > 0 ? `${globalLoopCount} Posts Max` : 'All Posts'})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleStopAll}
                disabled={isStoppingAll}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-950/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Immediately force-kill all 5 automation scripts, close browser tabs, and release profile locks"
              >
                <Power className="w-4 h-4" />
                <span>{isStoppingAll ? 'Stopping All...' : 'Emergency Stop All'}</span>
              </button>
            </div>
          </div>

          {/* GLOBAL SETTINGS: CONCURRENT TABS & TOTAL POST LIMIT */}
          <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Setting 1: Concurrent Tabs */}
            <div className="p-3.5 rounded-2xl bg-[#121624]/70 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Concurrent Tabs (Global)</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold">
                      {globalTabs} Tabs / Acc
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Parallel browser tabs for each account.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                <div className="flex items-center rounded-xl bg-[#141824] border border-zinc-700/80 p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setGlobalTabs((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-black text-sm flex items-center justify-center transition cursor-pointer"
                    title="Decrease tabs"
                  >
                    -
                  </button>
                  <div className="px-2 flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={globalTabs}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setGlobalTabs(Math.max(1, Math.min(10, val)));
                      }}
                      className="w-8 text-center font-mono font-black text-xs bg-transparent border-none text-white focus:outline-hidden"
                    />
                    <span className="text-[10px] font-bold text-zinc-500">tabs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGlobalTabs((prev) => Math.min(10, prev + 1))}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-black text-sm flex items-center justify-center transition cursor-pointer"
                    title="Increase tabs"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 5].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGlobalTabs(preset)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition cursor-pointer border ${
                        globalTabs === preset
                          ? 'bg-purple-600/30 text-purple-300 border-purple-500/60'
                          : 'bg-[#141824] text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Setting 2: Total Loop Count / Post Limit */}
            <div className="p-3.5 rounded-2xl bg-[#121624]/70 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Total Loop Count (Global Post Limit)</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                      {globalLoopCount > 0 ? `${globalLoopCount} Posts Max` : 'Post All'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Max videos to post per account (0 = post all).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                <div className="flex items-center rounded-xl bg-[#141824] border border-zinc-700/80 p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => updateGlobalLoopCount(Math.max(0, globalLoopCount - 5))}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-black text-sm flex items-center justify-center transition cursor-pointer"
                    title="Decrease limit"
                  >
                    -
                  </button>
                  <div className="px-2 flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={globalLoopCount}
                      onChange={(e) => updateGlobalLoopCount(e.target.value)}
                      className="w-10 text-center font-mono font-black text-xs bg-transparent border-none text-white focus:outline-hidden"
                    />
                    <span className="text-[10px] font-bold text-zinc-500">posts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateGlobalLoopCount(globalLoopCount + 5)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-black text-sm flex items-center justify-center transition cursor-pointer"
                    title="Increase limit"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {[5, 10, 20, 50, 0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateGlobalLoopCount(preset)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition cursor-pointer border ${
                        globalLoopCount === preset
                          ? 'bg-amber-600/30 text-amber-300 border-amber-500/60'
                          : 'bg-[#141824] text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {preset === 0 ? 'All' : preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BATCH SELECTION & FILTER BAR */}
          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  allSelected
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                    : 'bg-[#151928] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                  allSelected ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-600 bg-zinc-900'
                }`}>
                  {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
              </button>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-white px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  {selectedCount} of {accountKeys.length}
                </span>
                <span className="text-zinc-400">accounts selected for batch posting</span>
              </div>
            </div>

            <div className="text-zinc-500 font-mono text-[11px] flex items-center gap-1.5">
              <span>Uncheck any account box below to exclude it from batch starting.</span>
            </div>
          </div>
        </div>

        {/* 5 ACCOUNT CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {accountKeys.map((accId) => {
            const acc = accounts[accId];
            const isRunning = acc.status === 'RUNNING';
            const isError = acc.status === 'ERROR';
            const Icon = ACCOUNT_ICONS[acc.id] || Film;
            const accountLogs = logs[acc.id] || [];
            const isExpanded = expandedTerminals[acc.id] !== false;
            const isLoading = actionLoading[acc.id];

            const isSelected = selectedAccounts[acc.id] !== false;

            return (
              <div
                key={acc.id}
                className={`bg-[#0d101a] rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-md ${
                  isRunning
                    ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : isError
                    ? 'border-rose-500/40'
                    : isSelected
                    ? 'border-zinc-800/80 hover:border-zinc-700/80'
                    : 'border-zinc-800/50 opacity-75 hover:opacity-100'
                }`}
              >
                {/* CARD HEADER */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* BATCH SELECTION CHECKBOX */}
                      <button
                        type="button"
                        onClick={() => toggleAccountSelect(acc.id)}
                        className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 border-purple-500 text-white shadow-xs ring-1 ring-purple-500/50'
                            : 'bg-[#141824] border-zinc-700/80 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400'
                        }`}
                        title={isSelected ? 'Included in Batch Post. Click to exclude.' : 'Excluded from Batch Post. Click to include.'}
                      >
                        {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                      </button>

                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md border"
                        style={{
                          backgroundColor: `${acc.color}15`,
                          borderColor: `${acc.color}40`,
                          color: acc.color,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-base sm:text-lg text-white">
                            {acc.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${acc.badgeBg}`}>
                            {acc.category}
                          </span>
                          {acc.isCustom && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                          node {acc.scriptName}
                        </p>
                      </div>
                    </div>

                    {/* STATUS PILL & DELETE BUTTON */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-2">
                        {acc.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(acc.id, acc.name)}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700/50 hover:border-rose-500/40 transition cursor-pointer"
                            title="Delete custom account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isRunning ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>RUNNING</span>
                          </div>
                        ) : isError ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>ERROR</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 font-semibold text-xs">
                            <span className="w-2 h-2 rounded-full bg-zinc-600" />
                            <span>IDLE</span>
                          </div>
                        )}
                      </div>

                      {isRunning && acc.pid && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          PID: {acc.pid} &bull; {acc.tabs || globalTabs} Tabs &bull; {acc.postLimit > 0 ? `${acc.postLimit} Limit` : 'All'} &bull; {formatUptime(acc.uptimeSeconds)}
                        </span>
                      )}

                      {!isRunning && (
                        <span className="text-[10px] font-mono flex items-center gap-1">
                          <span className="text-zinc-500">{globalTabs} tabs</span>
                          <span className="text-zinc-600">&bull;</span>
                          <span className="text-amber-400/80">{globalLoopCount > 0 ? `${globalLoopCount} posts` : 'all'}</span>
                          <span className="text-zinc-600">&bull;</span>
                          <span className={isSelected ? 'text-purple-400 font-bold' : 'text-zinc-500 italic'}>
                            {isSelected ? 'In batch' : 'Excluded'}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* FOLDER & QUEUE METRICS */}
                  <div className="p-3 rounded-2xl bg-[#131724] border border-zinc-800/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-zinc-400 min-w-0">
                        <Folder className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                        <span className="font-mono truncate text-[11px] text-zinc-300" title={acc.folder}>
                          {acc.folder}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyFolder(acc.folder, acc.id)}
                        className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition shrink-0 cursor-pointer"
                        title="Copy Folder Path"
                      >
                        {copiedFolder === acc.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-[11px] font-mono">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <FileVideo className="w-3 h-3 text-blue-400" />
                        <span>Upload Queue:</span>
                      </span>
                      <span className="font-bold text-white">
                        {acc.folderStats?.pendingCount || 0} MP4 waiting{' '}
                        <span className="text-zinc-500 font-normal">
                          ({acc.folderStats?.finishedCount || 0} finished)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS (Start & Stop per Card) */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStartSingle(acc.id)}
                      disabled={isRunning || isLoading}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 border border-emerald-500/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>
                        {isLoading && !isRunning
                          ? 'Starting...'
                          : `Start (${globalTabs} Tabs${globalLoopCount > 0 ? `, ${globalLoopCount} Limit` : ''})`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStopSingle(acc.id)}
                      disabled={!isRunning || isLoading}
                      className="py-2.5 px-4 rounded-xl bg-rose-600/80 hover:bg-rose-600 border border-rose-500/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>{isLoading && isRunning ? 'Stopping...' : 'Stop'}</span>
                    </button>
                  </div>
                </div>

                {/* COLLAPSIBLE LIVE TERMINAL */}
                <div className="border-t border-zinc-800/90 bg-[#080a11]">
                  {/* Terminal Header */}
                  <div className="px-4 py-2 flex items-center justify-between bg-[#0b0e17] border-b border-zinc-800/80 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleTerminal(acc.id)}
                      className="flex items-center gap-2 text-zinc-300 hover:text-white font-mono font-bold transition cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span>Live Console ({accountLogs.length})</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleClearLogs(acc.id)}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition"
                        title="Clear console"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Terminal Log Viewport */}
                  {isExpanded && (
                    <div
                      ref={(el) => (terminalRefs.current[acc.id] = el)}
                      className="h-44 sm:h-52 overflow-y-auto p-3.5 font-mono text-[11px] leading-relaxed space-y-1 select-text scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
                    >
                      {accountLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center py-6">
                          <Terminal className="w-6 h-6 mb-1 opacity-40" />
                          <span>Console idle. Click &quot;Start&quot; to initiate Playwright pipeline.</span>
                        </div>
                      ) : (
                        accountLogs.map((item) => {
                          const isStderr = item.stream === 'stderr';
                          const isSystem = item.stream === 'system';
                          return (
                            <div
                              key={item.id}
                              className={`flex items-start gap-2 break-all ${
                                isStderr
                                  ? 'text-rose-400'
                                  : isSystem
                                  ? 'text-cyan-400 font-semibold'
                                  : 'text-zinc-300'
                              }`}
                            >
                              <span className="text-zinc-600 shrink-0 select-none text-[10px]">
                                {item.timestamp}
                              </span>
                              <span>{item.message}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ADD NEW ACCOUNT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f121e] border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Add New Account</h2>
                  <p className="text-xs text-zinc-400">Configure a new Instagram account & local video folder</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setAddAccountError('');
                }}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addAccountError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{addAccountError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">
                  Account Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gaming Highlights, Travel Diary"
                  value={newAccountForm.name}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#141824] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-hidden focus:border-purple-500 text-xs transition"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">
                  Local Video Folder Path (Windows) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C:\Users\HP\Documents\uploaded\gaming"
                  value={newAccountForm.folder}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, folder: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#141824] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-hidden focus:border-purple-500 text-xs font-mono transition"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  ToolNest will automatically create <code className="text-purple-400">finished_reels</code> and <code className="text-purple-400">in_progress</code> subfolders inside this path.
                </p>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">
                  Category / Niche (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gaming & Esports, Cooking, Lifestyle"
                  value={newAccountForm.category}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#141824] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-hidden focus:border-purple-500 text-xs transition"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">
                  Hashtags & Caption Keywords (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="#reels #viral #explore #trending"
                  value={newAccountForm.hashtags}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, hashtags: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-hidden focus:border-purple-500 text-xs transition resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { color: '#06b6d4', name: 'Cyan' },
                    { color: '#8b5cf6', name: 'Purple' },
                    { color: '#10b981', name: 'Emerald' },
                    { color: '#f59e0b', name: 'Amber' },
                    { color: '#ec4899', name: 'Pink' },
                    { color: '#3b82f6', name: 'Blue' },
                    { color: '#f43f5e', name: 'Rose' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setNewAccountForm({ ...newAccountForm, color: c.color })}
                      className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                        newAccountForm.color === c.color ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAddAccountError('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#151928] hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingNewAccount}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/40 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingNewAccount ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create & Initialize Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="automation-dashboard"
      />
    </div>
  );
}
