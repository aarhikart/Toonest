'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeGenerator } from '@/lib/camera/qr';
import { Copy, Check, ExternalLink, QrCode, Clock, Key, RefreshCw, ShieldCheck } from 'lucide-react';

interface QRCodeCardProps {
  roomId: string;
  pin: string | null;
  expiresAt: number;
  onGenerateNew: () => void;
  phoneConnected: boolean;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  roomId,
  pin,
  expiresAt,
  onGenerateNew,
  phoneConnected
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('10:00');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [phoneUrl, setPhoneUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setPhoneUrl(`${origin}/camera/${roomId}`);
    }
  }, [roomId]);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        setIsExpired(true);
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopy = () => {
    if (!phoneUrl) return;
    navigator.clipboard.writeText(phoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrSvg = phoneUrl ? QRCodeGenerator.generateSvg(phoneUrl, 210, '#5722AF', '#ffffff') : '';

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5722AF] dark:text-purple-400">
            Connection Created
          </span>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Scan with Your Phone
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Expiration badge */}
          <div
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
              isExpired
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-purple-50 text-[#5722AF] dark:bg-purple-950 dark:text-purple-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isExpired ? 'Expired' : timeLeft}</span>
          </div>

          <button
            type="button"
            onClick={onGenerateNew}
            title="Generate New Session"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpired ? (
        <div className="p-6 text-center space-y-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900">
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
            This camera session has expired.
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Generate a new URL to establish a fresh peer connection.
          </p>
          <button
            type="button"
            onClick={onGenerateNew}
            className="px-4 py-2 bg-[#5722AF] text-white rounded-xl text-xs font-bold hover:bg-[#491c96] transition"
          >
            Generate New Camera URL
          </button>
        </div>
      ) : (
        <>
          {/* QR Code Matrix Display */}
          <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
            <div
              className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200/90"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1 font-medium">
              <QrCode className="w-3.5 h-3.5 text-[#5722AF]" />
              Scan using your iPhone Camera or Android QR Scanner
            </p>
          </div>

          {/* Details & Actions */}
          <div className="space-y-3">
            {/* Room ID and PIN Pill Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Room ID</span>
                <span className="font-mono font-black text-sm text-[#5722AF] dark:text-purple-300 tracking-wider">
                  {roomId}
                </span>
              </div>

              {pin ? (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-0.5">
                    <Key className="w-3 h-3" /> Room PIN
                  </span>
                  <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-300 tracking-widest">
                    {pin}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-0.5">
                    <ShieldCheck className="w-3 h-3" /> Security
                  </span>
                  <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-300">
                    Direct Link Auth
                  </span>
                </div>
              )}
            </div>

            {/* URL Input with Copy & Open */}
            <div className="relative">
              <input
                type="text"
                readOnly
                value={phoneUrl}
                className="w-full text-xs font-mono py-2.5 pl-3 pr-24 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 select-all focus:outline-none"
              />
              <div className="absolute right-1 top-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 text-xs font-bold border border-zinc-200 dark:border-zinc-600 transition flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={phoneUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-[#5722AF] dark:hover:text-purple-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  title="Open phone page in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
