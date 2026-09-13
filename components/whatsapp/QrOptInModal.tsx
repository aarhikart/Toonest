'use client';

import React, { useState } from 'react';
import { WhatsAppQrService } from '@/lib/whatsapp/qr';
import { X, Copy, Check, Download, ExternalLink, ShieldCheck, QrCode } from 'lucide-react';

interface QrOptInModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export const QrOptInModal: React.FC<QrOptInModalProps> = ({ isOpen, onClose, phoneNumber }) => {
  const [prefilled, setPrefilled] = useState('Hi! I agree to receive official ToolNest updates on WhatsApp.');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const clickToChatUrl = WhatsAppQrService.generateClickToChatUrl(phoneNumber, prefilled);
  const qrSvg = WhatsAppQrService.generateQrSvg(clickToChatUrl, 220);

  const handleCopy = () => {
    navigator.clipboard.writeText(clickToChatUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-optin-qr-${phoneNumber.replace(/[^0-9]/g, '')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#5722AF]/10 text-[#5722AF] flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Click-to-Chat & Opt-in QR Code</h3>
              <p className="text-xs text-zinc-500">Official Meta Policy compliant opt-in initiation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            <div
              className="p-3 bg-white rounded-xl shadow-xs border border-zinc-200"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="text-xs text-zinc-500 mt-3 text-center">
              Scan with any mobile camera or WhatsApp app to open a chat session with pre-filled opt-in text.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Pre-filled Message (Consent text)
            </label>
            <textarea
              rows={2}
              value={prefilled}
              onChange={e => setPrefilled(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
              placeholder="Enter prefilled message..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Direct wa.me Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={clickToChatUrl}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <strong>WhatsApp Policy Compliant:</strong> This QR code directs customers to official <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded">wa.me</code> links and does not hijack web sessions.
            </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
          <button
            onClick={handleDownloadSvg}
            className="px-3.5 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download SVG
          </button>
          <a
            href={clickToChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Test Link
          </a>
        </div>
      </div>
    </div>
  );
};
