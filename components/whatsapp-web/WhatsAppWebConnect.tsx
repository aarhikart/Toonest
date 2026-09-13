'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Loader2
} from 'lucide-react';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';
import { WhatsAppWebSession } from '@/lib/whatsapp-web/types';

interface WhatsAppWebConnectProps {
  session: WhatsAppWebSession;
  onSessionChange: (session: WhatsAppWebSession) => void;
}

export const WhatsAppWebConnect: React.FC<WhatsAppWebConnectProps> = ({ session, onSessionChange }) => {
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

  const fetchStatus = async (restart = false) => {
    if (restart) {
      setIsRestarting(true);
      setRealQrUrl(null);
      setLoadingTime(0);
    }
    try {
      const url = restart ? '/api/whatsapp-service/status?restart=true' : '/api/whatsapp-service/status';
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();

      setIsWorkerOnline(data.isWorkerOnline ?? false);
      setServiceStatus(data.state || 'CONNECTING');

      if (data.qrCodeDataUrl) {
        setRealQrUrl(data.qrCodeDataUrl);
      }
      if (data.pairingCode) {
        setRealPairingCode(data.pairingCode);
      }

      // Detect authenticated session
      if (data.isConnected && data.user) {
        const updatedSession: WhatsAppWebSession = {
          connected: true,
          phoneNumber: data.user.phoneNumber || data.user.id || 'Connected Account',
          connectedAt: data.lastConnectedAt || new Date().toISOString(),
          method: activeTab === 'QR' ? 'QR' : 'PAIRING_CODE',
          deviceId: 'Multi-Device-Web',
          profileName: data.user.name || 'WhatsApp Web Device'
        };
        WhatsAppSessionManager.saveSession(updatedSession);
        onSessionChange(updatedSession);
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
  }, [session.connected]);

  // Track how long we have been waiting for QR to offer direct reset
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

  const handleRequestPairingCode = async () => {
    if (!phoneNumberInput.trim()) return;
    setIsRequestingPairing(true);
    setPairingError(null);
    try {
      const res = await fetch('/api/whatsapp-service/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      await fetch('/api/whatsapp-service/logout', { method: 'POST' });
    } catch {}
    WhatsAppSessionManager.clearSession();
    onSessionChange({ connected: false, method: 'QR' });
    setRealPairingCode(null);
    setRealQrUrl(null);
    setServiceStatus('CONNECTING');
    fetchStatus(true);
  };

  const copyPairingCode = () => {
    if (!realPairingCode) return;
    navigator.clipboard.writeText(realPairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Connected Active State Display
  if (session.connected) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center relative">
              <Smartphone className="w-6 h-6" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">WhatsApp Web Multi-Device Linked</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ACTIVE &amp; PERSISTENT
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Connected Number: <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{session.phoneNumber}</span> &bull; Authenticated session active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Live Session Active
              </div>
              <div className="text-[10px] text-zinc-400">
                Connected: {new Date(session.connectedAt || '').toLocaleTimeString()}
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              WhatsApp Web Authentication
            </h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isWorkerOnline
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isWorkerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isWorkerOnline ? 'WhatsApp Multi-Device Engine: Online' : 'Connecting to Worker...'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real WhatsApp Web Multi-Device connection. Scan the real QR code with your phone or request an official 8-digit Pairing Code.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('QR')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'QR' ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-purple-300 shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Scan Real QR Code
          </button>
          <button
            onClick={() => setActiveTab('PAIRING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'PAIRING' ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-purple-300 shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Link with Phone Number
          </button>
        </div>
      </div>

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
                      Generating WhatsApp QR Code...
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {isRestarting ? 'Wiping stale session & creating new handshake...' : 'Establishing official Noise handshake'}
                    </p>
                  </div>

                  {/* Immediate Reset button if loading takes more than 3 seconds */}
                  {loadingTime >= 3 && (
                    <button
                      onClick={() => fetchStatus(true)}
                      className="mt-2 px-3 py-1.5 bg-[#5722AF] hover:bg-[#471a93] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition animate-in fade-in"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Force Regenerate QR
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official WhatsApp Multi-Device Protocol</span>
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

          <div className="space-y-4 max-w-md">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Steps to link your WhatsApp:
            </h3>

            <ol className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 list-decimal list-inside leading-relaxed">
              <li>Open <strong>WhatsApp</strong> on your mobile phone</li>
              <li>Tap <strong>Settings</strong> (on iPhone) or <strong>Menu &gt; Linked Devices</strong> (on Android)</li>
              <li>Tap <strong>Link a Device</strong></li>
              <li>Point your phone camera at this real QR code to scan</li>
            </ol>

            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#5722AF] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Automatic Detection:</strong> As soon as you scan this QR code on your phone, this page will automatically detect the authenticated connection and activate your sender.
              </p>
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
                placeholder="+12025550192 or +919876543210"
                className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Must include country code without spaces or dashes.</p>
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
                <div className="text-3xl font-black font-mono tracking-widest text-[#5722AF] dark:text-purple-200 select-all py-1">
                  {realPairingCode}
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={copyPairingCode}
                    className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700 rounded-lg text-xs font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-1.5 shadow-2xs"
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
                  <li>Open <strong>WhatsApp &gt; Settings / Menu &gt; Linked Devices</strong></li>
                  <li>Tap <strong>Link a Device</strong></li>
                  <li>Tap <strong>Link with phone number instead</strong> at the bottom</li>
                  <li>Enter the official 8-digit code shown above</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
