'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  LogOut,
  Radio,
  Sparkles,
  Server,
  AlertCircle,
  Loader2,
  Settings,
  Globe,
  Wifi,
  WifiOff,
  HelpCircle
} from 'lucide-react';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';
import { WhatsAppWebSession } from '@/lib/whatsapp-web/types';

interface WhatsAppWebConnectProps {
  session: WhatsAppWebSession;
  onSessionChange: (session: WhatsAppWebSession) => void;
  onOpenGuide?: () => void;
  userId?: string;
}

export const WhatsAppWebConnect: React.FC<WhatsAppWebConnectProps> = ({ session, onSessionChange, onOpenGuide, userId }) => {
  const [activeTab, setActiveTab] = useState<'QR' | 'PAIRING'>('QR');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [realQrUrl, setRealQrUrl] = useState<string | null>(null);
  const [realPairingCode, setRealPairingCode] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<string>('CONNECTING');
  const [isWorkerOnline, setIsWorkerOnline] = useState<boolean>(false);
  const [isRequestingPairing, setIsRequestingPairing] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pairingError, setPairingError] = useState<string | null>(null);
  const [loadingTime, setLoadingTime] = useState(0);

  // Custom Worker URL for Vercel / Remote Hosting
  const [workerUrl, setWorkerUrl] = useState<string>('');
  const [workerInput, setWorkerInput] = useState<string>('');
  const [resolvedServiceUrl, setResolvedServiceUrl] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const effectiveUserId = (userId && userId.trim() !== 'default' ? userId.trim() : WhatsAppSessionManager.getUserId()).toLowerCase();

  // Load saved worker URL from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolnest_wa_worker_url');
      if (saved) {
        setWorkerUrl(saved);
        setWorkerInput(saved);
        document.cookie = 'toolnest_wa_worker_url=' + encodeURIComponent(saved) + '; path=/; max-age=31536000; SameSite=Lax';
      }
    } catch {}
  }, []);

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'x-user-id': effectiveUserId
    };
    if (workerUrl && workerUrl.trim()) {
      headers['x-worker-url'] = workerUrl.trim();
    }
    return headers;
  };

  const fetchStatus = async (restart = false, overrideUrl?: string) => {
    if (restart) {
      setIsRestarting(true);
      setRealQrUrl(null);
      setLoadingTime(0);
    }
    try {
      const targetWorker = overrideUrl !== undefined ? overrideUrl : workerUrl;
      const headers: Record<string, string> = {
        'x-user-id': effectiveUserId
      };
      if (targetWorker && targetWorker.trim()) {
        headers['x-worker-url'] = targetWorker.trim();
      }

      const url = restart ? '/api/whatsapp-service/status?restart=true' : '/api/whatsapp-service/status';
      const res = await fetch(url, { headers, cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();

      setIsWorkerOnline(data.isWorkerOnline ?? false);
      setServiceStatus(data.state || 'CONNECTING');
      if (data.resolvedServiceUrl) {
        setResolvedServiceUrl(data.resolvedServiceUrl);
        if (typeof window !== 'undefined') {
          (window as any).__toolnest_gateway_url = data.resolvedServiceUrl;
        }
      }

      if (data.qrCodeDataUrl) {
        setRealQrUrl(data.qrCodeDataUrl);
      }
      if (data.pairingCode) {
        setRealPairingCode(data.pairingCode);
      }

      // Detect authenticated session for this specific tenant
      if (data.isConnected && data.user) {
        const updatedSession: WhatsAppWebSession = {
          connected: true,
          phoneNumber: data.user.phoneNumber || data.user.id || 'Connected Account',
          connectedAt: data.lastConnectedAt || new Date().toISOString(),
          method: activeTab === 'QR' ? 'QR' : 'PAIRING_CODE',
          deviceId: 'Multi-Device-Web',
          profileName: data.user.name || 'WhatsApp Web Device',
          workerOnline: true
        };
        WhatsAppSessionManager.saveSession(updatedSession, effectiveUserId);
        onSessionChange(updatedSession);
      } else {
        // If not connected for this user, ensure UI reflects not connected
        if (session.connected) {
          const disconnectedSession: WhatsAppWebSession = {
            ...session,
            connected: false,
            phoneNumber: undefined,
            connectedAt: undefined
          };
          WhatsAppSessionManager.saveSession(disconnectedSession, effectiveUserId);
          onSessionChange(disconnectedSession);
        }
      }
    } catch (err) {
      console.error('Status fetch error', err);
    } finally {
      if (restart) {
        setTimeout(() => setIsRestarting(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchStatus();
    // Fast polling: every 1.5 seconds until connected
    const interval = setInterval(() => {
      if (!session.connected) {
        fetchStatus();
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [session.connected, workerUrl, effectiveUserId]);

  // Track loading time to offer direct help / reload
  useEffect(() => {
    if (session.connected || realQrUrl) {
      setLoadingTime(0);
      return;
    }
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [session.connected, realQrUrl]);

  const handleSaveWorkerUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = workerInput.trim();
    setWorkerUrl(clean);
    try {
      if (clean) {
        localStorage.setItem('toolnest_wa_worker_url', clean);
        document.cookie = 'toolnest_wa_worker_url=' + encodeURIComponent(clean) + '; path=/; max-age=31536000; SameSite=Lax';
      } else {
        localStorage.removeItem('toolnest_wa_worker_url');
        document.cookie = 'toolnest_wa_worker_url=; path=/; max-age=0;';
      }
    } catch {}
    setShowConfig(false);
    fetchStatus(true, clean);
  };

  const handleRequestPairingCode = async () => {
    if (!phoneNumberInput.trim()) return;
    setIsRequestingPairing(true);
    setPairingError(null);
    try {
      const res = await fetch('/api/whatsapp-service/pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders()
        },
        body: JSON.stringify({ phoneNumber: phoneNumberInput })
      });
      const data = await res.json();
      if (data.pairingCode) {
        setRealPairingCode(data.pairingCode);
      } else if (data.error) {
        setPairingError(data.error);
      }
    } catch {
      setPairingError('Could not reach WhatsApp session worker.');
    } finally {
      setIsRequestingPairing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/whatsapp-service/logout', {
        method: 'POST',
        headers: getHeaders()
      });
    } catch {}
    WhatsAppSessionManager.clearSession(effectiveUserId);
    onSessionChange({ connected: false, method: 'QR' });
    setRealPairingCode(null);
    setRealQrUrl(null);
    setServiceStatus('CONNECTING');
    fetchStatus(true);
  };

  const copyPairingCode = () => {
    if (!realPairingCode) return;
    const clean = realPairingCode.replace(/[^A-Za-z0-9]/g, '');
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Connected Active State Display
  if (session.connected) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-950/25 dark:via-zinc-900 dark:to-zinc-900/95 rounded-2xl sm:rounded-3xl border border-emerald-200/90 dark:border-emerald-800/60 p-4 sm:p-5 shadow-xs transition-all">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Device Icon + Title + Clean Number */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 relative">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  WhatsApp Connected
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <span>Number:</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                  {session.phoneNumber ? (session.phoneNumber.startsWith('+') ? session.phoneNumber : `+${session.phoneNumber}`) : 'Linked Device'}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Disconnect Action Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-100/80 dark:border-emerald-900/40">
            {session.connectedAt && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden md:inline">
                Linked at {new Date(session.connectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-800 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-white to-zinc-50/80 dark:from-[#131620] dark:via-zinc-900 dark:to-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
              Connect WhatsApp
            </h2>
            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                title="View Guide"
                className="p-1 rounded-lg text-zinc-400 hover:text-[#5722AF] dark:hover:text-purple-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1 ${
                isWorkerOnline
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isWorkerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isWorkerOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('QR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'QR' ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-purple-300 shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
          <button
            onClick={() => setActiveTab('PAIRING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'PAIRING' ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-purple-300 shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Code</span>
          </button>
        </div>
      </div>

      {/* Cloud Worker Configuration Card (for Vercel / Remote Hosting) */}
      {showConfig && (
        <form onSubmit={handleSaveWorkerUrl} className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#5722AF]" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                WhatsApp Server Connection (Cloud &amp; Hosting Setup)
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                Server: {workerUrl || 'Default (Port 5001)'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-mono font-semibold">
                User: {effectiveUserId}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <strong>Multi-User Protection Active:</strong> Multiple users can safely use the same server at the same time. Each user has their own private WhatsApp connection, QR code, and message list without mixing.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={workerInput}
              onChange={e => setWorkerInput(e.target.value)}
              placeholder="e.g. https://xxxx.ngrok-free.app or http://123.45.67.89:5001"
              className="flex-1 text-xs font-mono p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-semibold rounded-xl transition"
            >
              Save &amp; Connect
            </button>
          </div>
        </form>
      )}

      {/* Offline Guidance when on Vercel and Worker is not reachable */}
      {!isWorkerOnline && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">WhatsApp Server is currently offline or unreachable.</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                If hosted online, click <strong>&quot;Configure Server URL&quot;</strong> above to connect your server or tunnel, or start the server locally.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 transition"
          >
            Configure Worker URL
          </button>
        </div>
      )}

      {/* Tab 1: Real QR Code */}
      {activeTab === 'QR' && (
        <div className="flex flex-col md:flex-row items-center gap-8 justify-center py-2">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white rounded-2xl border border-zinc-200 shadow-md">
              {realQrUrl ? (
                <div className="relative">
                  <img
                    src={realQrUrl}
                    alt="Real WhatsApp Web Multi-Device QR Code"
                    className="w-60 h-60 rounded-xl"
                  />
                  <div className="absolute inset-0 border-2 border-[#5722AF]/20 rounded-xl pointer-events-none" />
                </div>
              ) : (
                <div className="w-60 h-60 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                  <Loader2 className="w-8 h-8 text-[#5722AF] animate-spin" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {isWorkerOnline ? 'Getting WhatsApp QR Code ready...' : 'Starting WhatsApp service...'}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {isRestarting ? 'Creating fresh QR code...' : (isWorkerOnline ? 'Preparing your WhatsApp connection...' : 'Connecting to WhatsApp service...')}
                    </p>
                  </div>

                  {/* Immediate Reset button if loading takes more than 3 seconds */}
                  {loadingTime >= 3 && (
                    <button
                      onClick={() => fetchStatus(true)}
                      className="mt-2 px-3 py-1.5 bg-[#5722AF] hover:bg-[#471a93] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition animate-in fade-in cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Generate New QR
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Secure WhatsApp Connection</span>
              <button
                onClick={() => fetchStatus(true)}
                disabled={isRestarting}
                className="text-[#5722AF] font-semibold hover:underline ml-1 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isRestarting ? 'animate-spin' : ''}`} />
                {isRestarting ? 'Generating...' : 'Refresh QR'}
              </button>
            </div>
          </div>

          <div className="space-y-3 max-w-xs w-full">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Quick Scan Steps
            </h3>

            <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="w-5 h-5 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-purple-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <span>Open <strong>WhatsApp</strong> on your phone</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="w-5 h-5 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-purple-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <span>Tap <strong>Linked Devices &gt; Link</strong></span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="w-5 h-5 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-purple-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <span>Point camera at this QR code</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Link with Phone Number (Pairing Code) */}
      {activeTab === 'PAIRING' && (
        <div className="flex flex-col md:flex-row items-center gap-8 justify-center py-2">
          <div className="w-full md:w-80 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Your WhatsApp Phone Number (with Country Code)
              </label>
              <input
                type="text"
                value={phoneNumberInput}
                onChange={e => setPhoneNumberInput(e.target.value)}
                placeholder="e.g. 9876543210 or +919876543210"
                className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Enter your 10-digit number (India +91 is auto-added) or include international country code.
              </p>
            </div>

            {pairingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {pairingError}
              </div>
            )}

            <button
              onClick={handleRequestPairingCode}
              disabled={isRequestingPairing || !phoneNumberInput.trim()}
              className="w-full py-2.5 bg-[#5722AF] hover:bg-[#471a93] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              {isRequestingPairing ? 'Requesting Code from WhatsApp...' : 'Request Official Pairing Code'}
            </button>
          </div>

          <div className="space-y-4 max-w-md">
            {realPairingCode ? (
              <div className="p-5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl text-center space-y-3 animate-in fade-in">
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Official WhatsApp Pairing Code
                </span>
                <div className="text-4xl font-black font-mono tracking-widest text-[#5722AF] dark:text-purple-200 select-all py-1">
                  {realPairingCode.length === 8
                    ? `${realPairingCode.slice(0, 4)}-${realPairingCode.slice(4)}`
                    : realPairingCode}
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={copyPairingCode}
                    className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700 rounded-lg text-xs font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-1.5 shadow-2xs hover:bg-purple-50 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Waiting for you to enter this code on your phone... Connection will activate automatically.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">How to enter code on WhatsApp:</h4>
                <ol className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Open WhatsApp on your phone</li>
                  <li>Tap <strong>Settings / Menu (3 dots) &gt; Linked Devices</strong></li>
                  <li>Tap <strong>Link a Device</strong></li>
                  <li>Tap <strong>Link with phone number instead</strong> at the bottom</li>
                  <li>Enter the official 8-character code shown above</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
