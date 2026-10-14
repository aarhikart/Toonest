'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { TerminalLogViewer, TerminalLogEntry } from '@/components/instagram-auto-sender/TerminalLogViewer';
import { generateFastPosterConsoleScript } from '@/lib/instagram/fastPosterConsoleScript';
import {
  Rocket,
  Zap,
  Layers,
  FolderOpen,
  RefreshCw,
  Play,
  Square,
  Globe,
  Terminal,
  Shield,
  Clock,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Gauge,
  Repeat,
  Image as ImageIcon,
  User,
  Users,
  LogIn,
  Key,
  ChevronDown,
  CheckCheck,
} from 'lucide-react';
import Link from 'next/link';

const DEFAULT_FOLDER = 'C:\\Users\\HP\\Documents\\uploaded\\10M-images';

export default function InstagramFastAutoPosterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Configuration State
  const [folderPath, setFolderPath] = useState(DEFAULT_FOLDER);
  const [concurrentTabs, setConcurrentTabs] = useState(4);
  const [turboMode, setTurboMode] = useState(true);
  const [delaySec, setDelaySec] = useState(1.0);
  const [maxLimit, setMaxLimit] = useState(10000000);
  const [caption, setCaption] = useState('');
  const [engine, setEngine] = useState<'api' | 'browser'>('api');

  // Folder Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    exists: boolean;
    count: number;
    files: string[];
    error?: string;
  } | null>(null);

  // Execution & Live Stats State
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'ERROR'>('IDLE');
  const [runningPid, setRunningPid] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStartingChrome, setIsStartingChrome] = useState(false);
  const [stats, setStats] = useState({
    totalPosted: 0,
    currentSpeed: 0,
    currentLoop: 1,
    currentImageIndex: 0,
    totalAvailableImages: 0,
    activeTabs: 4,
    failedCount: 0,
    lastImageName: '',
  });

  const [logs, setLogs] = useState<TerminalLogEntry[]>([]);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Account Sessions State
  const [accounts, setAccounts] = useState<{ id: string; name: string; path: string; isCurrent: boolean }[]>([]);
  const [activeSession, setActiveSession] = useState('ig_fastposter_session');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newSessionInput, setNewSessionInput] = useState('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
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

  // 1. Scan folder on mount and when folder changes
  const handleScanFolder = useCallback(async (path = folderPath) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/instagram/fast-poster/scan-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: path }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult({
          exists: data.exists,
          count: data.count,
          files: data.files || [],
          error: data.error,
        });
        if (data.exists) {
          setStats((prev) => ({ ...prev, totalAvailableImages: data.count }));
        }
      } else {
        setScanResult({
          exists: false,
          count: 0,
          files: [],
          error: data.error || 'Failed to scan folder',
        });
      }
    } catch (err: any) {
      setScanResult({
        exists: false,
        count: 0,
        files: [],
        error: err.message,
      });
    } finally {
      setIsScanning(false);
    }
  }, [folderPath]);

  useEffect(() => {
    handleScanFolder();
  }, [handleScanFolder]);

  // 2. Poll status every 2 seconds
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/instagram/fast-poster/status');
      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
        setRunningPid(data.pid);
        if (data.stats) {
          setStats((prev) => ({ ...prev, ...data.stats }));
        }
        if (Array.isArray(data.logs) && data.logs.length > 0) {
          setLogs((prev) => {
            const existingIds = new Set(prev.map((l) => l.id));
            const newEntries = data.logs.filter((l: any) => !existingIds.has(l.id));
            return newEntries.length > 0 ? [...prev.slice(-300), ...newEntries] : prev;
          });
        }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // 3. Fetch Accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const res = await fetch('/api/instagram/fast-poster/accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts || []);
        setActiveSession(data.activeSession || 'ig_fastposter_session');
      }
    } catch (_) {}
    finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSwitchAccount = async (sessionName: string) => {
    try {
      const res = await fetch('/api/instagram/fast-poster/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch', sessionName }),
      });
      const data = await res.json();
      if (data.success) {
        const finalSession = data.sessionDir || sessionName;
        setActiveSession(finalSession);
        await fetchAccounts();
        showToast(`✔ Active account switched to ${data.name || finalSession}!`);
        addLog('success', `✔ Active posting account switched to: ${finalSession}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    }
  };

  const handleLoginNewAccount = async (sessionName?: string) => {
    const target = (sessionName || newSessionInput || 'ig_fastposter_session').trim();
    if (!target) return;
    setIsStartingChrome(true);
    showToast(`🌐 Opening fresh Chrome to log into ${target}...`);
    addLog('info', `🌐 Launching fresh Chrome window to log into: ${target}`);
    try {
      const res = await fetch('/api/instagram/fast-poster/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', sessionName: target }),
      });
      const data = await res.json();
      if (data.success) {
        const finalSession = data.sessionDir || target;
        setActiveSession(finalSession);
        setNewSessionInput('');
        await fetchAccounts();
        showToast('✔ Chrome opened! Please log in to your Instagram account in the browser.');
        addLog('success', `✔ Chrome launched for ${finalSession}. Log in and your session will be saved automatically.`);
      } else {
        showToast(`Error: ${data.error || 'Failed to open Chrome'}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setIsStartingChrome(false);
    }
  };

  // 4. Connect to SSE Log Stream
  useEffect(() => {
    const sse = new EventSource('/api/instagram/fast-poster/logs');
    eventSourceRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data);
        if (entry && entry.message) {
          setLogs((prev) => [...prev.slice(-400), entry]);
        }
      } catch (_) {}
    };

    sse.onerror = () => {
      // SSE auto-reconnects
    };

    return () => {
      sse.close();
      eventSourceRef.current = null;
    };
  }, []);

  // 5. Start Ultra Fast Poster
  const handleStartPoster = async () => {
    if (status === 'RUNNING') {
      showToast('⚠️ Auto Poster is already running!');
      return;
    }

    if (scanResult && scanResult.count === 0) {
      showToast('❌ No images found in folder! Please add images first.');
      return;
    }

    setIsStarting(true);
    addLog('info', `🚀 Starting Ultra Fast Auto Poster (${engine === 'api' ? 'Direct API Engine' : 'Browser Engine'}, ${concurrentTabs} workers, Account: ${activeSession})...`);

    try {
      const res = await fetch('/api/instagram/fast-poster/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: folderPath,
          engine,
          tabs: concurrentTabs,
          turboMode,
          delaySec,
          maxLimit,
          caption,
          sessionDir: activeSession,
          loginOnly: false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('RUNNING');
        setRunningPid(data.result?.pid || null);
        showToast('🚀 Ultra Fast Auto Poster launched successfully!');
        addLog('success', `✔ Process started with PID: ${data.result?.pid}`);
      } else {
        showToast(`❌ Failed to start: ${data.error}`);
        addLog('error', `Failed: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`❌ Network error: ${err.message}`);
      addLog('error', `Error: ${err.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  // 5. Stop Automation
  const handleStopPoster = async () => {
    try {
      const res = await fetch('/api/instagram/fast-poster/stop', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatus('IDLE');
        setRunningPid(null);
        showToast('⏹️ Automation stopped successfully.');
        addLog('warning', '⏹️ Automation stopped by user.');
      }
    } catch (err: any) {
      showToast(`Error stopping: ${err.message}`);
    }
  };

  // 6. Open Chrome for Login
  const handleOpenChromeLogin = async () => {
    setIsStartingChrome(true);
    addLog('info', `🌐 Launching Chrome to check/save Instagram login session (${activeSession})...`);
    showToast('🌐 Launching Chrome window for login...');

    try {
      const res = await fetch('/api/instagram/fast-poster/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginOnly: true, sessionDir: activeSession }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✔ Chrome opened! Log into your Instagram account in the browser.');
        await fetchAccounts();
      } else {
        showToast(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsStartingChrome(false);
    }
  };

  // 7. Clear Logs
  const handleClearLogs = async () => {
    setLogs([]);
    try {
      await fetch('/api/instagram/fast-poster/status', { method: 'DELETE' });
    } catch (_) {}
  };

  // 8. Generate & Copy In-Browser Console Script
  const consoleScript = generateFastPosterConsoleScript({
    turboMode,
    delaySec,
    maxLimit,
    caption,
  });

  const handleCopyConsoleScript = () => {
    navigator.clipboard.writeText(consoleScript);
    setCopiedScript(true);
    showToast('✔ Console Script copied to clipboard!');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenHelp={() => {}}
        activeToolName="Ultra Fast Auto Poster"
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="instagram-fast-auto-poster"
      />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-cyan-500/40 text-cyan-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Console Script Modal */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#0d111c] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">In-Browser Console Runner</h3>
                  <p className="text-xs text-zinc-400">Run directly inside Chrome DevTools Console on instagram.com</p>
                </div>
              </div>
              <button
                onClick={() => setIsScriptModalOpen(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800/60 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-hidden flex flex-col">
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl mb-3 text-xs text-cyan-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                <div>
                  <strong>Tip:</strong> For automatic folder picking from <code className="text-white bg-black/40 px-1 py-0.5 rounded">{folderPath}</code>, use the green <strong>Start Ultra Auto Poster</strong> button on the dashboard! This console script is provided if you want to run in-page.
                </div>
              </div>

              <div className="relative flex-1 bg-[#06080e] border border-zinc-800 rounded-2xl p-4 overflow-auto font-mono text-xs text-zinc-300">
                <pre>{consoleScript}</pre>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsScriptModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCopyConsoleScript}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedScript ? 'Copied!' : 'Copy Script'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Selection & Login Switcher Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#0d111c] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Select Instagram Account</h3>
                  <p className="text-xs text-zinc-400">Choose which account will send the mass posts</p>
                </div>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800/60 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Existing Logged-in Accounts List */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Available Instagram Sessions on System</label>
                <div className="grid grid-cols-1 gap-2">
                  {accounts.map((acc) => {
                    const isSelected = acc.id === activeSession;
                    return (
                      <div
                        key={acc.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                            : 'bg-[#06080e] border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">{acc.name}</span>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-zinc-500 truncate block">{acc.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoginNewAccount(acc.id)}
                            disabled={isStartingChrome}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Launch fresh Chrome window to log into this account"
                          >
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{isSelected ? 'Verify / Re-Login' : 'Log In'}</span>
                          </button>

                          {!isSelected && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSwitchAccount(acc.id);
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-cyan-500 hover:text-black text-zinc-200 transition-all cursor-pointer"
                            >
                              Use Account
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Log In With New Account Section */}
              <div className="p-4 rounded-2xl bg-[#080b12] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <LogIn className="w-4 h-4 text-cyan-400" />
                  <span>Add & Log In to New Instagram Account</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Type any account nickname (e.g. <span className="text-cyan-300 font-mono">whaatsapp_bulk_sender</span>). Clicking &quot;Open Chrome & Log In&quot; creates the profile and opens a fresh Chrome browser window where you can log into Instagram. Session is saved permanently!
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSessionInput}
                    onChange={(e) => setNewSessionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSessionInput.trim()) {
                        handleLoginNewAccount(newSessionInput.trim());
                      }
                    }}
                    placeholder="e.g. whaatsapp_bulk_sender"
                    className="flex-1 bg-[#06080e] border border-zinc-800 focus:border-cyan-500 text-white font-mono text-xs px-3.5 py-2.5 rounded-xl outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleLoginNewAccount(newSessionInput.trim());
                    }}
                    disabled={isStartingChrome || !newSessionInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{isStartingChrome ? 'Opening...' : 'Open Chrome & Log In'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Link href="/" className="hover:text-zinc-200 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/automation-dashboard" className="hover:text-zinc-200 transition-colors">Automation</Link>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">Ultra Fast Auto Poster</span>
          </div>

          {/* Quick Engine Status Indicator */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${
              status === 'RUNNING'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-900/80 text-zinc-400 border-zinc-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${status === 'RUNNING' ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
              <span>{status === 'RUNNING' ? `POSTING ACTIVE (PID: ${runningPid})` : 'ENGINE IDLE'}</span>
            </div>

            {/* Active Account Switcher Button */}
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#111827] hover:bg-[#1e293b] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Click to choose which Instagram account will send posts or log into a new account"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono max-w-[180px] truncate">
                {accounts.find((a) => a.id === activeSession)?.name || activeSession}
              </span>
              <ChevronDown className="w-3 h-3 text-cyan-400" />
            </button>

            <button
              onClick={handleOpenChromeLogin}
              disabled={isStartingChrome}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 flex items-center gap-2 transition-all cursor-pointer"
              title="Launch persistent Chrome to log into Instagram once"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isStartingChrome ? 'Opening...' : 'Check Login'}</span>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#09101d] to-[#060a14] border border-cyan-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>Mass Posting Engine (1 Account Dedicated)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Instagram <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">Ultra Fast Auto Poster</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Post thousands of posts continuously using multi-tab parallel workers with zero-wait optimistic restart. Continuously cycles through your local image folder repeatedly without moving or deleting files.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch gap-3">
              {status === 'RUNNING' ? (
                <button
                  onClick={handleStopPoster}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Auto Poster</span>
                </button>
              ) : (
                <button
                  onClick={handleStartPoster}
                  disabled={isStarting}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Rocket className="w-5 h-5 text-black" />
                  <span>{isStarting ? 'Starting Workers...' : 'Start Ultra Auto Poster'}</span>
                </button>
              )}

              <button
                onClick={() => setIsScriptModalOpen(true)}
                className="px-5 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 hover:border-zinc-500 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Console Script</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Metric 1: Total Posts */}
          <div className="bg-[#0c101a] border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Posts Shared</span>
              <Rocket className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
              {stats.totalPosted.toLocaleString()}
            </div>
            <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Target: {maxLimit > 0 ? maxLimit.toLocaleString() : 'Unlimited'}</span>
            </div>
          </div>

          {/* Metric 2: Live Speed */}
          <div className="bg-[#0c101a] border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Posting Velocity</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
              ~{stats.currentSpeed} <span className="text-xs font-medium text-zinc-400">/min</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Turbo: {turboMode ? 'Optimistic Restart (Active)' : 'Standard'}</span>
            </div>
          </div>

          {/* Metric 3: Looping Cycle */}
          <div className="bg-[#0c101a] border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Cycle & Images</span>
              <Repeat className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-400">
              Loop #{stats.currentLoop}
            </div>
            <div className="text-[11px] text-zinc-400 mt-2 truncate">
              {scanResult?.count || 0} images in rotation
            </div>
          </div>

          {/* Metric 4: Parallel Tabs */}
          <div className="bg-[#0c101a] border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Parallel Tabs</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">
              {concurrentTabs} <span className="text-xs font-medium text-zinc-400">Workers</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Continuous concurrent uploading</span>
            </div>
          </div>
        </div>

        {/* Main Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Folder Setup (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0d111c] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Target Image Folder</h2>
                    <p className="text-xs text-zinc-400">Reads all images and loops repeatedly forever</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleScanFolder(folderPath)}
                  disabled={isScanning}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>Scan Folder</span>
                </button>
              </div>

              {/* Folder Path Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Folder Path on Windows</span>
                  <span className="text-[11px] text-zinc-500">Local Filesystem</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    placeholder="C:\Users\HP\Documents\uploaded\10M-images"
                    className="flex-1 bg-[#06080e] border border-zinc-800 focus:border-cyan-500 text-white font-mono text-xs px-4 py-3 rounded-2xl outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFolderPath(DEFAULT_FOLDER);
                      handleScanFolder(DEFAULT_FOLDER);
                    }}
                    className="px-3 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    title="Reset to default folder"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Folder Scan Status / Preview */}
              <div className="p-4 rounded-2xl bg-[#080b12] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {scanResult?.exists ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle className="w-4 h-4" /> Folder Detected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                        <AlertTriangle className="w-4 h-4" /> {scanResult?.error || 'Folder not accessible'}
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {scanResult?.count || 0} Images Found
                  </span>
                </div>

                {/* File list preview */}
                {scanResult && scanResult.files.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-zinc-400">Images loaded in queue (cycling repeatedly):</p>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                      {scanResult.files.map((file, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-zinc-900/90 text-zinc-300 border border-zinc-800 flex items-center gap-1"
                        >
                          <ImageIcon className="w-3 h-3 text-cyan-400" />
                          <span className="truncate max-w-[140px]">{file}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic py-2">
                    Drop your images into <code className="text-zinc-300">{folderPath}</code> and click &quot;Scan Folder&quot;.
                  </div>
                )}
              </div>

              {/* Safety & Non-Destructive Guarantee */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3">
                <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 space-y-1">
                  <p className="font-bold text-cyan-300">Non-Destructive Continuous Looping Guarantee</p>
                  <p className="text-zinc-400 leading-relaxed">
                    Images are <strong>never moved</strong> to completed or in_progress folders, and filenames are never modified. Even if you have just 5 to 10 images, the engine cycles them continuously (Image 1 → 10 → 1 → 10...) forever until your target limit is reached.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Performance & Automation Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0d111c] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Speed & Concurrency Settings</h2>
                  <p className="text-xs text-zinc-400">Configure engine mode, workers & timing</p>
                </div>
              </div>

              {/* Setting 0: Engine Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-200">Execution Engine</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEngine('api')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      engine === 'api'
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                        : 'bg-[#080b12] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      PURE SPEED
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-400 mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Direct API Protocol</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      ⚡ 100% headless HTTP posting. No Chrome windows opened. Pure network speed!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEngine('browser');
                      if (concurrentTabs > 10) setConcurrentTabs(4);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      engine === 'browser'
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                        : 'bg-[#080b12] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400 mb-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Browser GUI Engine</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      Automated Chrome tabs clicking Next & Share in real-time.
                    </p>
                  </button>
                </div>
              </div>

              {/* Setting 1: Parallel Tabs / Workers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-200">{engine === 'api' ? 'Concurrent HTTP Workers' : 'Concurrent Browser Tabs'}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max={engine === 'api' ? 1000 : 10}
                      value={concurrentTabs}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setConcurrentTabs(Math.max(1, Math.min(engine === 'api' ? 1000 : 10, val)));
                        }
                      }}
                      className="w-16 bg-[#06080e] border border-zinc-700 focus:border-cyan-500 text-cyan-400 font-mono font-bold text-xs px-2 py-1 rounded-lg text-center outline-none"
                    />
                    <span className="text-cyan-400 font-mono text-xs font-bold">
                      {engine === 'api' ? 'Workers' : 'Tabs'}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max={engine === 'api' ? 1000 : 10}
                  step={engine === 'api' ? 5 : 1}
                  value={concurrentTabs}
                  onChange={(e) => setConcurrentTabs(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />

                {engine === 'api' ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 flex-wrap gap-2">
                      <span>Quick Presets:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[10, 50, 100, 250, 500, 1000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setConcurrentTabs(preset)}
                            className={`px-2.5 py-0.5 rounded-lg font-mono font-bold text-[11px] transition-all cursor-pointer ${
                              concurrentTabs === preset
                                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                                : preset === 1000
                                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                            }`}
                          >
                            {preset === 1000 ? '🚀 1000' : preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      ⚡ <strong>Up to 1,000 Concurrent HTTP Workers Supported</strong>: Direct API protocol runs as lightweight asynchronous Node.js network promises with zero browser overhead.
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>1 tab (Safe)</span>
                    <span>4 tabs (Recommended)</span>
                    <span>10 tabs (Max Speed)</span>
                  </div>
                )}
              </div>

              {/* Setting 2: Ultra Turbo Mode (Optimistic Restart) */}
              <div className="p-4 rounded-2xl bg-[#080b12] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-zinc-200">Ultra Turbo Mode</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={turboMode}
                      onChange={(e) => setTurboMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                  </label>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong>Zero-Wait Optimistic Restart:</strong> Once the Share button is clicked and Instagram receives the request, the worker tab immediately launches the next post without waiting 20-30s for the UI loading spinner!
                </p>
              </div>

              {/* Setting 3: Post Delay */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-200">Delay Between Posts</span>
                  <span className="text-cyan-400 font-mono font-bold">{delaySec}s</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value={delaySec}
                  onChange={(e) => setDelaySec(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Setting 4: Post Limit */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                  <span>Target Post Count Limit</span>
                  <span className="text-[11px] text-zinc-500">0 for unlimited</span>
                </label>
                <input
                  type="number"
                  value={maxLimit}
                  onChange={(e) => setMaxLimit(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#06080e] border border-zinc-800 focus:border-cyan-500 text-white font-mono text-xs px-4 py-2.5 rounded-xl outline-none"
                />
              </div>

              {/* Setting 5: Optional Caption */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                  <span>Custom Caption (Optional)</span>
                  <span className="text-[11px] text-zinc-500">Skipped by default for max speed</span>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Leave empty to skip captions and maximize posting speed!"
                  rows={2}
                  className="w-full bg-[#06080e] border border-zinc-800 focus:border-cyan-500 text-white text-xs p-3 rounded-xl outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Command Terminal Log Viewer */}
        <div className="h-[420px]">
          <TerminalLogViewer logs={logs} onClearLogs={handleClearLogs} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
