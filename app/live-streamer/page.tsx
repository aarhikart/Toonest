'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import {
  Tv,
  Radio,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Activity,
  Layers,
  Key,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  Download,
  Calendar,
  Zap,
  Server,
  Trash2,
  Video,
} from 'lucide-react';

interface StreamHealth {
  status: 'healthy' | 'warning' | 'error' | 'idle';
  fps: number;
  bitrate: string;
  duration: string;
  speed: string;
  droppedFrames: number;
}

interface StreamLog {
  timestamp: string | Date;
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface StreamSession {
  streamId: string;
  youtubeUrl: string;
  sourceTitle: string;
  target: 'facebook' | 'instagram' | 'both';
  destinations: Array<{
    platform: 'facebook' | 'instagram';
    rtmpUrl: string;
    streamKey: string;
  }>;
  scheduledStartTime?: string | null;
  status: 'READY' | 'STARTING' | 'LIVE' | 'STOPPING' | 'STOPPED' | 'ERROR';
  health: StreamHealth;
  startedAt?: string | null;
  stoppedAt?: string | null;
  errorMessage?: string;
  logs: StreamLog[];
}

interface SocialAccount {
  platform: 'facebook' | 'instagram';
  accountName: string;
  accountId: string;
  avatarUrl: string;
  rtmpUrl: string;
  hasStreamKey: boolean;
  hasOAuth: boolean;
  isConfigured: boolean;
  maskedKey: string;
  streamKey: string;
  isConnected: boolean;
  lastUsedAt?: string | null;
}

export default function LiveStreamerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [target, setTarget] = useState<'facebook' | 'instagram' | 'both'>('both');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleDateTime, setScheduleDateTime] = useState('');

  // Destination accounts & Credentials
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);

  // Active Session & Live Monitoring State
  const [activeSession, setActiveSession] = useState<StreamSession | null>(null);
  const [workerOnline, setWorkerOnline] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Key Configuration Modal
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<'facebook' | 'instagram'>('facebook');
  const [modalRtmpUrl, setModalRtmpUrl] = useState('');
  const [modalStreamKey, setModalStreamKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Stream Logs Terminal
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);
  const logsTerminalRef = useRef<HTMLDivElement>(null);

  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Extract YouTube Video ID for preview embed
  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/)|^)([\w-]{11})(?:[^\w-]|$)/);
    return match ? match[1] : null;
  };

  const youtubeVideoId = extractYoutubeId(youtubeUrl);

  // 1. Fetch Connected Accounts
  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/live-streamer/auth/accounts');
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setIsAccountsLoading(false);
    }
  };

  // 2. Poll Status & Health
  const fetchStatus = async () => {
    try {
      const url = activeSession?.streamId
        ? `/api/live-streamer/stream/status?streamId=${encodeURIComponent(activeSession.streamId)}`
        : '/api/live-streamer/stream/status';
      const res = await fetch(url);
      const data = await res.json();

      setWorkerOnline(Boolean(data.workerOnline));

      if (data.success && data.session) {
        setActiveSession(prev => {
          // If we had no session or same streamId, update it
          if (!prev || prev.streamId === data.session.streamId) {
            return data.session;
          }
          // If the fetched session is LIVE or STARTING, adopt it
          if (data.session.status === 'LIVE' || data.session.status === 'STARTING') {
            return data.session;
          }
          return prev;
        });

        // Sync input URL if active session has it and input is empty
        if (data.session.youtubeUrl && !youtubeUrl) {
          setYoutubeUrl(data.session.youtubeUrl);
        }
      }
    } catch (err) {
      // Background poll failure
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchStatus();

    // Set up polling interval every 2.5 seconds
    pollingRef.current = setInterval(fetchStatus, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScrollLogs && logsTerminalRef.current) {
      logsTerminalRef.current.scrollTop = logsTerminalRef.current.scrollHeight;
    }
  }, [activeSession?.logs, autoScrollLogs]);

  // Handle Query Parameters (e.g. from OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const oauthError = params.get('oauth_error');

    if (connected) {
      setStatusMessage({
        text: `Successfully connected ${connected.toUpperCase()} Live account!`,
        type: 'success',
      });
      fetchAccounts();
    } else if (oauthError) {
      if (oauthError === 'facebook_not_configured' || oauthError === 'instagram_not_configured') {
        setStatusMessage({
          text: `Meta OAuth is not configured in .env.local yet. No problem! You can use the "Configure Stream Key" button below to stream immediately with your Stream Key.`,
          type: 'info',
        });
      } else {
        setStatusMessage({
          text: `OAuth Notice: ${decodeURIComponent(oauthError)}`,
          type: 'error',
        });
      }
    }
  }, []);

  // Start Live Stream
  const handleStartLive = async () => {
    if (!youtubeUrl.trim()) {
      setStatusMessage({ text: 'Please enter a valid YouTube Live URL first.', type: 'error' });
      return;
    }

    setIsActionLoading(true);
    setStatusMessage({ text: 'Initiating re-streaming pipeline...', type: 'info' });

    try {
      const payload: any = {
        youtubeUrl: youtubeUrl.trim(),
        target,
        scheduledStartTime: scheduleMode === 'later' && scheduleDateTime ? new Date(scheduleDateTime).toISOString() : null,
      };

      const res = await fetch('/api/live-streamer/stream/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.workerOffline) {
          setStatusMessage({
            text: data.error,
            type: 'error',
          });
        } else {
          setStatusMessage({ text: data.error || 'Failed to start live stream.', type: 'error' });
        }
        return;
      }

      setStatusMessage({
        text: data.message || 'Stream starting! Connecting to destinations...',
        type: 'success',
      });

      // Refresh immediately
      fetchStatus();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Network error occurred.', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Stop Live Stream
  const handleStopLive = async () => {
    if (!activeSession?.streamId) return;

    setIsActionLoading(true);
    setStatusMessage({ text: 'Gracefully stopping live stream...', type: 'info' });

    try {
      const res = await fetch('/api/live-streamer/stream/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: activeSession.streamId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ text: data.error || 'Failed to stop stream.', type: 'error' });
        return;
      }

      setStatusMessage({ text: 'Live stream stopped successfully.', type: 'success' });
      fetchStatus();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Network error.', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open Stream Key Modal
  const openKeyModal = (platform: 'facebook' | 'instagram') => {
    const acc = accounts.find(a => a.platform === platform);
    setModalPlatform(platform);
    setModalRtmpUrl(
      acc?.rtmpUrl ||
      (platform === 'facebook'
        ? 'rtmps://live-api-s.facebook.com:443/rtmp/'
        : 'rtmps://live-upload.instagram.com:443/rtmp/')
    );
    setModalStreamKey(acc?.streamKey || '');
    setKeyModalOpen(true);
  };

  // Save Stream Key
  const handleSaveStreamKey = async () => {
    if (!modalStreamKey.trim()) {
      alert('Please enter a valid Stream Key.');
      return;
    }

    setIsSavingKey(true);
    try {
      const res = await fetch('/api/live-streamer/auth/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: modalPlatform,
          rtmpUrl: modalRtmpUrl.trim(),
          streamKey: modalStreamKey.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          text: `${modalPlatform === 'facebook' ? 'Facebook' : 'Instagram'} Stream Key saved successfully!`,
          type: 'success',
        });
        setKeyModalOpen(false);
        fetchAccounts();
      } else {
        alert(data.error || 'Failed to save credentials.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save.');
    } finally {
      setIsSavingKey(false);
    }
  };

  // Disconnect Account
  const handleDisconnect = async (platform: 'facebook' | 'instagram') => {
    if (!confirm(`Are you sure you want to disconnect ${platform === 'facebook' ? 'Facebook' : 'Instagram'}?`)) return;
    try {
      const res = await fetch(`/api/live-streamer/auth/accounts?platform=${platform}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: `Disconnected ${platform} account.`, type: 'info' });
        fetchAccounts();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to disconnect');
    }
  };

  // Download Logs
  const handleDownloadLogs = () => {
    if (!activeSession?.logs || activeSession.logs.length === 0) return;
    const logText = activeSession.logs
      .map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.level.toUpperCase()}] ${l.message}`)
      .join('\n');
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stream_logs_${activeSession.streamId || 'session'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fbAccount = accounts.find(a => a.platform === 'facebook');
  const igAccount = accounts.find(a => a.platform === 'instagram');

  const streamStatus = activeSession?.status || 'READY';
  const isStreamingLive = streamStatus === 'LIVE';
  const isStarting = streamStatus === 'STARTING';
  const isStopping = streamStatus === 'STOPPING';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onOpenHelp={() => {}}
        activeToolName="Live Streamer"
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenHelp={() => {}} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Introduction */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-xl text-white shadow-md shadow-rose-500/20">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Live Stream Re-broadcaster
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Stream any YouTube Live feed directly to Facebook Live and Instagram Live simultaneously
                </p>
              </div>
            </div>
          </div>

          {/* Worker Status Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                workerOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${workerOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <Server className="w-3.5 h-3.5" />
              Worker: {workerOnline ? 'Online (Port 5002)' : 'Offline'}
            </div>

            <button
              onClick={() => {
                fetchAccounts();
                fetchStatus();
              }}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Worker Offline Alert Banner */}
        {!workerOnline && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Streaming Worker Process is Offline:</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                To start live transcoding, double-click <span className="font-semibold text-slate-800 dark:text-slate-200">start-streaming-worker.bat</span> in the project folder, or run these commands in your terminal:
              </p>
              <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs shadow-inner">
                  <code>cd /d d:\Aarhi_kart\ToolNest\toolnest &amp;&amp; npm run streaming:worker</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Notification Banner */}
        {statusMessage && (
          <div
            className={`mt-4 p-4 rounded-xl border flex items-start justify-between gap-3 text-sm transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 shrink-0" />
              ) : (
                <Zap className="w-5 h-5 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Grid: Control Deck + Telemetry & Logs */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input, Destination, Schedule, Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: YouTube Source Ingestion */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  YouTube Live Source URL
                </label>
                {youtubeVideoId && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-medium">
                    Valid Video ID: {youtubeVideoId}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/live/..."
                  disabled={isStreamingLive || isStarting}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition disabled:opacity-60"
                />
              </div>

              {/* YouTube Video Preview Embed */}
              {youtubeVideoId && (
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video max-h-56 w-full shadow-inner">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=0&mute=1&controls=1`}
                    title="YouTube Live Preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Step 2: Destination Accounts & Credentials */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Connect Destinations (OAuth or Stream Key)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Facebook Destination Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    fbAccount?.isConfigured
                      ? 'border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        f
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {fbAccount?.accountName || 'Facebook Live'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {fbAccount?.hasOAuth
                            ? '● Auto-Live via Meta API'
                            : fbAccount?.hasStreamKey
                            ? '● Stream Key Configured'
                            : 'Not configured'}
                        </p>
                      </div>
                    </div>
                    {fbAccount?.isConfigured ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <button
                          onClick={() => handleDisconnect('facebook')}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                          title="Disconnect Facebook"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <AlertCircle className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => openKeyModal('facebook')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      {fbAccount?.hasStreamKey ? 'Edit Key' : 'Enter Stream Key'}
                    </button>

                    <a
                      href="/api/live-streamer/auth/facebook?action=login"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1877F2] hover:bg-blue-600 text-white transition flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {fbAccount?.hasOAuth ? 'Reconnect OAuth' : 'OAuth 1-Click Login'}
                    </a>
                  </div>
                </div>

                {/* Instagram Destination Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    igAccount?.isConfigured
                      ? 'border-pink-300 dark:border-pink-800 bg-pink-50/40 dark:bg-pink-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        IG
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {igAccount?.accountName || 'Instagram Live'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {igAccount?.hasOAuth
                            ? '● Auto-Live via Meta API'
                            : igAccount?.hasStreamKey
                            ? '● Stream Key Configured'
                            : 'Not configured'}
                        </p>
                      </div>
                    </div>
                    {igAccount?.isConfigured ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <button
                          onClick={() => handleDisconnect('instagram')}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                          title="Disconnect Instagram"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <AlertCircle className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => openKeyModal('instagram')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      {igAccount?.hasStreamKey ? 'Edit Key' : 'Enter Stream Key'}
                    </button>

                    <a
                      href="/api/live-streamer/auth/instagram?action=login"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white transition flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {igAccount?.hasOAuth ? 'Reconnect OAuth' : 'OAuth 1-Click Login'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Target Destination Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Select Streaming Destination
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  disabled={isStreamingLive || isStarting}
                  onClick={() => setTarget('facebook')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    target === 'facebook'
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Facebook Only</span>
                    <input
                      type="radio"
                      name="target"
                      checked={target === 'facebook'}
                      onChange={() => setTarget('facebook')}
                      className="text-blue-600"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Stream single feed to Facebook Page
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isStreamingLive || isStarting}
                  onClick={() => setTarget('instagram')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    target === 'instagram'
                      ? 'border-pink-500 bg-pink-50/60 dark:bg-pink-950/40 ring-2 ring-pink-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Instagram Only</span>
                    <input
                      type="radio"
                      name="target"
                      checked={target === 'instagram'}
                      onChange={() => setTarget('instagram')}
                      className="text-pink-600"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Stream to Instagram Live Producer
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isStreamingLive || isStarting}
                  onClick={() => setTarget('both')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    target === 'both'
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">Both</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                        Dual Stream
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="target"
                      checked={target === 'both'}
                      onChange={() => setTarget('both')}
                      className="text-emerald-600"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Simultaneous re-broadcast via FFmpeg Tee
                  </span>
                </button>
              </div>
            </div>

            {/* Step 4: Schedule Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                When to Start
              </label>

              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleMode"
                    value="now"
                    checked={scheduleMode === 'now'}
                    onChange={() => setScheduleMode('now')}
                    disabled={isStreamingLive || isStarting}
                    className="text-rose-600"
                  />
                  <span>Start Immediately</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleMode"
                    value="later"
                    checked={scheduleMode === 'later'}
                    onChange={() => setScheduleMode('later')}
                    disabled={isStreamingLive || isStarting}
                    className="text-rose-600"
                  />
                  <span>Schedule for Later</span>
                </label>
              </div>

              {scheduleMode === 'later' && (
                <div className="mt-3 flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={scheduleDateTime}
                    onChange={e => setScheduleDateTime(e.target.value)}
                    disabled={isStreamingLive || isStarting}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons: Start & Stop */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleStartLive}
                disabled={isStreamingLive || isStarting || isActionLoading || !workerOnline}
                className={`flex-1 min-w-[200px] py-4 px-6 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all shadow-lg ${
                  isStreamingLive || isStarting || !workerOnline
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25 active:scale-[0.99]'
                }`}
              >
                {isStarting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Connecting Feed...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>{scheduleMode === 'later' ? 'Schedule Broadcast' : 'Start Live Broadcast'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStopLive}
                disabled={!isStreamingLive && !isStarting && !isStopping}
                className={`py-4 px-6 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all shadow-lg ${
                  !isStreamingLive && !isStarting && !isStopping
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-500/25 active:scale-[0.99]'
                }`}
              >
                {isStopping ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Finalizing...</span>
                  </>
                ) : (
                  <>
                    <Square className="w-5 h-5 fill-current" />
                    <span>Stop Live</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Status, Health Telemetry & Logs (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Stream Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Broadcast Status
                </span>

                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                    streamStatus === 'LIVE'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : streamStatus === 'STARTING'
                      ? 'bg-amber-400 text-slate-900'
                      : streamStatus === 'STOPPING'
                      ? 'bg-orange-500 text-white'
                      : streamStatus === 'ERROR'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {streamStatus === 'LIVE' && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                  {streamStatus === 'LIVE' ? '● REC LIVE' : streamStatus}
                </div>
              </div>

              {/* Source Title & Target Info */}
              <div className="mt-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {activeSession?.sourceTitle || (youtubeVideoId ? `YouTube Feed (${youtubeVideoId})` : 'No Active Feed')}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Destinations:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 uppercase">
                    {activeSession?.target || target}
                  </span>
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">FPS</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {activeSession?.health?.fps || 0}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Bitrate</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
                    {activeSession?.health?.bitrate || '0 kbps'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Duration</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block mt-0.5">
                    {activeSession?.health?.duration || '00:00:00'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Health</span>
                  <span
                    className={`text-xs font-bold capitalize block mt-0.5 ${
                      activeSession?.health?.status === 'healthy'
                        ? 'text-emerald-500'
                        : activeSession?.health?.status === 'warning'
                        ? 'text-amber-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {activeSession?.health?.status || 'Idle'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stream Logs Terminal */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md flex flex-col h-[340px]">
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Streaming Engine Output</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoScrollLogs(!autoScrollLogs)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      autoScrollLogs
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Auto-scroll
                  </button>
                  <button
                    onClick={handleDownloadLogs}
                    className="p-1 text-slate-400 hover:text-white rounded"
                    title="Download Logs"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Logs Content Area */}
              <div
                ref={logsTerminalRef}
                className="flex-1 p-3 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text bg-slate-900 text-slate-300"
              >
                {activeSession?.logs && activeSession.logs.length > 0 ? (
                  activeSession.logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-slate-600 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`font-semibold shrink-0 uppercase text-[10px] px-1 rounded ${
                          log.level === 'error'
                            ? 'bg-rose-950 text-rose-400'
                            : log.level === 'warn'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-slate-800 text-emerald-400'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span
                        className={`break-all ${
                          log.level === 'error'
                            ? 'text-rose-300'
                            : log.level === 'warn'
                            ? 'text-amber-300'
                            : 'text-slate-300'
                        }`}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 italic">
                    Ready to stream. Logs will display here in real time.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stream Key Modal / Dialog */}
        {keyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-500">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Configure {modalPlatform === 'facebook' ? 'Facebook Live' : 'Instagram Live'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter your destination Stream URL and Stream Key
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setKeyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {/* RTMPS Server URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Server RTMPS URL
                </label>
                <input
                  type="text"
                  value={modalRtmpUrl}
                  onChange={e => setModalRtmpUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              {/* Stream Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Stream Key
                </label>
                <input
                  type="password"
                  value={modalStreamKey}
                  onChange={e => setModalStreamKey(e.target.value)}
                  placeholder="Paste your Stream Key here..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Find this in{' '}
                  {modalPlatform === 'facebook'
                    ? 'Facebook Page -> Live Video Producer'
                    : 'Instagram Web -> Create -> Live video (Live Producer)'}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setKeyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStreamKey}
                  disabled={isSavingKey}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-60"
                >
                  {isSavingKey ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
