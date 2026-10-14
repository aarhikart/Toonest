'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { QueueManagerCard } from '@/components/instagram-auto-sender/QueueManagerCard';
import { MessageComposerCard } from '@/components/instagram-auto-sender/MessageComposerCard';
import { AutomationSettingsCard } from '@/components/instagram-auto-sender/AutomationSettingsCard';
import { DeliveryStatsGrid } from '@/components/instagram-auto-sender/DeliveryStatsGrid';
import { TerminalLogViewer, TerminalLogEntry } from '@/components/instagram-auto-sender/TerminalLogViewer';
import { ScriptModal } from '@/components/instagram-auto-sender/ScriptModal';
import {
  generateFastAutoSenderScript,
  generateSingleTabInPageScript,
} from '@/lib/instagram/fastAutoSenderScript';
import {
  Send,
  Sparkles,
  Terminal,
  Play,
  Square,
  Copy,
  Check,
  RotateCcw,
  Shield,
  Layers,
  Zap,
  ExternalLink,
  ChevronRight,
  Info,
  Globe,
  LogIn,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import Link from 'next/link';

const DEFAULT_SAMPLE_USER_LIST = `capcut_update
_m.anav_
hariicharanlreddy
13_piyush
sincedec1996
lazy_leo_456`;

const DEFAULT_MESSAGE = 'hello';

export default function InstagramAutoMessageSenderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rawInput, setRawInput] = useState(DEFAULT_SAMPLE_USER_LIST);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [concurrentTabs, setConcurrentTabs] = useState(2);
  const [delaySec, setDelaySec] = useState(2.0);
  const [autoCloseTabs, setAutoCloseTabs] = useState(true);
  const [skipPrivate, setSkipPrivate] = useState(true);
  const [maxLimit, setMaxLimit] = useState(0);

  // Execution & Live Stats State
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [runningPid, setRunningPid] = useState<number | null>(null);
  const [sentCount, setSentCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [logs, setLogs] = useState<TerminalLogEntry[]>([]);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isStartingChrome, setIsStartingChrome] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const addLog = useCallback((type: TerminalLogEntry['type'], msg: string) => {
    const entry: TerminalLogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message: msg,
    };
    setLogs((prev) => [...prev.slice(-400), entry]);
  }, []);

  // Parse raw text into clean usernames
  const cleanAndParseUsernames = useCallback((text: string): string[] => {
    const rawTokens = text.split(/[\r\n,;\s]+/);
    const set = new Set<string>();
    rawTokens.forEach((t) => {
      const cleaned = t.trim().split(/\s+/)[0].replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '');
      if (cleaned.length > 0) {
        set.add(cleaned);
      }
    });
    return Array.from(set);
  }, []);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('toolnest_auto_dm_usernames');
      const savedMsg = localStorage.getItem('toolnest_auto_dm_message');
      const savedTabs = localStorage.getItem('toolnest_auto_dm_tabs');
      const savedDelay = localStorage.getItem('toolnest_auto_dm_delay');

      if (savedUsers) {
        setRawInput(savedUsers);
        setUsernames(cleanAndParseUsernames(savedUsers));
      } else {
        setUsernames(cleanAndParseUsernames(DEFAULT_SAMPLE_USER_LIST));
      }

      if (savedMsg) setMessage(savedMsg);
      if (savedTabs) setConcurrentTabs(Number(savedTabs) || 2);
      if (savedDelay) setDelaySec(Number(savedDelay) || 2.0);
    } catch (_) {}
  }, [cleanAndParseUsernames]);

  // Persist changes
  const handleUpdateRawInput = (val: string) => {
    setRawInput(val);
    try {
      localStorage.setItem('toolnest_auto_dm_usernames', val);
    } catch (_) {}
  };

  const handleUpdateMessage = (val: string) => {
    setMessage(val);
    try {
      localStorage.setItem('toolnest_auto_dm_message', val);
    } catch (_) {}
  };

  const handleUpdateTabs = (tabs: number) => {
    setConcurrentTabs(tabs);
    try {
      localStorage.setItem('toolnest_auto_dm_tabs', String(tabs));
    } catch (_) {}
  };

  const handleUpdateDelay = (sec: number) => {
    setDelaySec(sec);
    try {
      localStorage.setItem('toolnest_auto_dm_delay', String(sec));
    } catch (_) {}
  };

  // Format action
  const handleCleanQueue = () => {
    const parsed = cleanAndParseUsernames(rawInput);
    setUsernames(parsed);
    setRawInput(parsed.join('\n'));
    showToast(`Queue sanitized: ${parsed.length} unique usernames ready!`);
    addLog('info', `Queue sanitized: ${parsed.length} unique accounts verified.`);
  };

  const handleLoadSample = () => {
    setRawInput(DEFAULT_SAMPLE_USER_LIST);
    const parsed = cleanAndParseUsernames(DEFAULT_SAMPLE_USER_LIST);
    setUsernames(parsed);
    showToast(`Loaded sample user list (${parsed.length} accounts).`);
    addLog('info', `Loaded sample user list with ${parsed.length} accounts.`);
  };

  const handleClearAll = () => {
    setRawInput('');
    setUsernames([]);
    showToast('Queue cleared.');
  };

  const handleRemoveUser = (target: string) => {
    const next = usernames.filter((u) => u !== target);
    setUsernames(next);
    setRawInput(next.join('\n'));
    showToast(`Removed @${target}`);
  };

  // Backend Polling & SSE Log Streaming (Like automation-dashboard)
  const fetchBackendStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/instagram/auto-dm/status');
      const data = await res.json();
      if (data.success) {
        if (data.status === 'RUNNING') {
          setStatus('running');
          setRunningPid(data.pid);
        } else if (status === 'running' && data.status !== 'RUNNING') {
          setStatus('idle');
          setRunningPid(null);
        }

        if (data.stats) {
          setSentCount(data.stats.sentCount || 0);
          setSkippedCount(data.stats.skippedCount || 0);
          setFailedCount(data.stats.failedCount || 0);
        }
      }
    } catch (_) {}
  }, [status]);

  useEffect(() => {
    fetchBackendStatus();
    const interval = setInterval(fetchBackendStatus, 2500);
    return () => clearInterval(interval);
  }, [fetchBackendStatus]);

  // Server-Sent Events (SSE) for Real-Time Streaming Logs
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/instagram/auto-dm/logs');
      eventSource.onmessage = (event) => {
        try {
          const logEntry = JSON.parse(event.data);
          if (logEntry && logEntry.message) {
            const entryWithId: TerminalLogEntry = {
              id: logEntry.id || `sse-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: logEntry.timestamp || new Date().toLocaleTimeString(),
              type: logEntry.type || 'info',
              message: logEntry.message,
              workerId: logEntry.workerId,
              username: logEntry.username,
            };
            setLogs((prev) => {
              if (prev.some((p) => p.id === entryWithId.id)) return prev;
              return [...prev.slice(-400), entryWithId];
            });
          }
        } catch (_) {}
      };
    } catch (_) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Launch Chrome Automated Browser (Playwright / Node)
  const handleStartChrome = async (loginOnly = false) => {
    if (!loginOnly && usernames.length === 0) {
      showToast('Please add target usernames to queue!');
      return;
    }

    setIsStartingChrome(true);
    addLog('info', `[Command Center] Initiating Chrome launch (Mode: ${loginOnly ? 'Login Session' : 'Auto-Sender'})...`);

    try {
      const res = await fetch('/api/instagram/auto-dm/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames,
          message,
          tabs: concurrentTabs,
          delaySec,
          skipPrivate,
          loginOnly,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        showToast(`Failed to launch: ${data.error}`);
        addLog('error', `Failed to launch Chrome: ${data.error}`);
      } else {
        setStatus('running');
        setRunningPid(data.result?.pid || null);
        showToast(loginOnly ? 'Chrome opened! Please log in to Instagram.' : 'Chrome Auto Sender launched!');
        addLog('success', `Chrome process started (PID: ${data.result?.pid || 'Active'}). Persistent session ready.`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
      addLog('error', `Connection error: ${err.message}`);
    } finally {
      setIsStartingChrome(false);
    }
  };

  // Stop Chrome Automation
  const handleStopChrome = async () => {
    try {
      await fetch('/api/instagram/auto-dm/stop', { method: 'POST' });
      setStatus('idle');
      setRunningPid(null);
      showToast('Chrome automation stopped.');
      addLog('warning', 'Chrome automation process terminated by user.');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/instagram/auto-dm/status', { method: 'DELETE' });
    } catch (_) {}
    setLogs([]);
    showToast('Logs cleared.');
  };

  // Generate Single-Tab and Multi-Tab Scripts
  const singleTabScript = useMemo(() => {
    return generateSingleTabInPageScript(usernames, message, {
      delaySec,
      skipPrivate,
      maxLimit,
    });
  }, [usernames, message, delaySec, skipPrivate, maxLimit]);

  const multiTabScript = useMemo(() => {
    return generateFastAutoSenderScript(usernames, message, {
      concurrentTabs,
      delaySec,
      autoCloseTabs,
      skipPrivate,
      maxLimit,
    });
  }, [usernames, message, concurrentTabs, delaySec, autoCloseTabs, skipPrivate, maxLimit]);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161b2b] text-white border border-purple-500/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeToolName="Instagram Auto Message Sender"
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenHelp={() => {}}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeToolId="instagram-auto-message-sender"
        onOpenHelp={() => {}}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* COMMAND CENTER HEADER BAR (Styled like automation-dashboard) */}
        <div className="bg-[#0f121d] rounded-3xl border border-zinc-800/80 p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          {/* Glowing backdrops */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Title & Tag */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>Playwright Automated Chrome Hub</span>
                </span>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b2b] border border-zinc-700/60 text-xs font-mono font-bold">
                  <span className="text-zinc-400">Worker Tabs:</span>
                  <span className="text-purple-400">{concurrentTabs} Parallel Tabs</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b2b] border border-zinc-700/60 text-xs font-mono font-bold">
                  <span className="text-zinc-400">Session Profile:</span>
                  <span className="text-emerald-400 font-mono">ig_dm_session</span>
                </div>

                {runningPid && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-xs font-mono font-bold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PID: {runningPid}</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Instagram Auto Message Sender Command Center
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Launches dedicated Chrome browser tabs with persistent session cookies, auto-detects Message buttons, and types direct messages with 100% verified delivery tracking.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Login / Open Chrome Button */}
              <button
                type="button"
                onClick={() => handleStartChrome(true)}
                disabled={status === 'running' || isStartingChrome}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#161b2b] hover:bg-[#1f263d] text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer disabled:opacity-50"
                title="Opens Chrome so you can log into Instagram once. Session is saved permanently!"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                Open Chrome (Log In)
              </button>

              {/* Start in Chrome Button */}
              {status === 'running' ? (
                <button
                  type="button"
                  onClick={handleStopChrome}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  Stop Chrome Automation
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartChrome(false)}
                  disabled={isStartingChrome || usernames.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  {isStartingChrome ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  Start in Chrome Browser
                </button>
              )}

              {/* Copy Script Modal */}
              <button
                type="button"
                onClick={() => setIsScriptModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#161b2b] hover:bg-[#1f263d] text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-purple-400" />
                Copy Console Script
              </button>
            </div>
          </div>
        </div>

        {/* PERFORMANCE STATS GRID */}
        <DeliveryStatsGrid
          total={usernames.length}
          sentCount={sentCount}
          skippedCount={skippedCount}
          failedCount={failedCount}
          status={status}
        />

        {/* QUEUE & COMPOSER 2-COLUMN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QueueManagerCard
            usernames={usernames}
            onChangeUsernames={setUsernames}
            rawInput={rawInput}
            onChangeRawInput={handleUpdateRawInput}
            onCleanUsernames={handleCleanQueue}
            onLoadSample={handleLoadSample}
            onClearAll={handleClearAll}
            onRemoveUser={handleRemoveUser}
            disabled={status === 'running'}
          />

          <MessageComposerCard
            message={message}
            onChangeMessage={handleUpdateMessage}
            sampleUsername={usernames[0] || 'capcut_update'}
            disabled={status === 'running'}
          />
        </div>

        {/* AUTOMATION SETTINGS CARD */}
        <AutomationSettingsCard
          concurrentTabs={concurrentTabs}
          onChangeConcurrentTabs={handleUpdateTabs}
          delaySec={delaySec}
          onChangeDelaySec={handleUpdateDelay}
          autoCloseTabs={autoCloseTabs}
          onChangeAutoCloseTabs={setAutoCloseTabs}
          skipPrivate={skipPrivate}
          onChangeSkipPrivate={setSkipPrivate}
          maxLimit={maxLimit}
          onChangeMaxLimit={setMaxLimit}
          disabled={status === 'running'}
        />

        {/* TERMINAL LOG VIEWER */}
        <TerminalLogViewer logs={logs} onClearLogs={handleClearLogs} />

        {/* INFO CALLOUT FOOTER */}
        <div className="p-5 rounded-2xl bg-[#0f121d] border border-zinc-800/80 text-xs text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>
              Chrome session directory is saved at <code className="bg-[#161b2b] px-1.5 py-0.5 rounded text-zinc-300 font-mono">C:\Users\HP\ig_dm_session</code>. You only log in once!
            </span>
          </div>

          <Link
            href="/automation-dashboard"
            className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
          >
            Go to Automation Dashboard <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Script Copy Modal */}
      <ScriptModal
        singleTabScript={singleTabScript}
        multiTabScript={multiTabScript}
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        userCount={usernames.length}
        concurrentTabs={concurrentTabs}
      />

      <Footer />
    </div>
  );
}
