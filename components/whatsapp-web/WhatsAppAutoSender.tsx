'use client';

import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Send,
  CheckCircle2,
  AlertCircle,
  Radio,
  Clock,
  ListFilter,
  ExternalLink,
  ShieldCheck,
  Server,
  HelpCircle
} from 'lucide-react';
import { WebContact, WhatsAppWebSession } from '@/lib/whatsapp-web/types';
import { WhatsAppSenderEngine } from '@/lib/whatsapp-web/sender';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';
import { MediaAttachment } from './WhatsAppMessageComposer';

interface WhatsAppAutoSenderProps {
  session: WhatsAppWebSession;
  contacts: WebContact[];
  onContactsUpdate: (contacts: WebContact[]) => void;
  messageTemplate: string;
  delaySeconds: number;
  media: MediaAttachment | null;
  onOpenGuide?: () => void;
}

interface LogItem {
  id: string;
  timestamp: string;
  contactName: string;
  phoneNumber: string;
  status: 'SENT' | 'FAILED';
  message: string;
  hasAttachment: boolean;
  error?: string;
  messageId?: string;
}

export const WhatsAppAutoSender: React.FC<WhatsAppAutoSenderProps> = ({
  session,
  contacts,
  onContactsUpdate,
  messageTemplate,
  delaySeconds,
  media,
  onOpenGuide
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [dispatchMode, setDispatchMode] = useState<'WORKER' | 'BROWSER_TABS'>('WORKER');

  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);

  const total = contacts.length;
  const sentCount = contacts.filter(c => c.status === 'SENT').length;
  const failedCount = contacts.filter(c => c.status === 'FAILED').length;
  const progressPct = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  const startCampaign = async () => {
    if (dispatchMode === 'WORKER' && !session.connected) {
      alert('Please connect WhatsApp Web first via QR Code or Pairing Code in Step 1, or select "Browser Direct Mode".');
      return;
    }
    if (contacts.length === 0) {
      alert('Please add at least one contact.');
      return;
    }
    if (!messageTemplate.trim() && !media) {
      alert('Please enter a message template or attach media.');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;
    isPausedRef.current = false;

    // If all contacts are already marked SENT, auto-reset all to PENDING so the campaign can re-run
    let currentList = [...contacts];
    const pendingContacts = currentList.filter(c => c.status !== 'SENT');
    if (pendingContacts.length === 0 && currentList.length > 0) {
      currentList = currentList.map(c => ({ ...c, status: 'PENDING' as const }));
      onContactsUpdate([...currentList]);
    }

    for (let i = 0; i < currentList.length; i++) {
      if (!isRunningRef.current) break;

      while (isPausedRef.current) {
        await new Promise(r => setTimeout(r, 500));
        if (!isRunningRef.current) break;
      }

      if (!isRunningRef.current) break;

      setCurrentIndex(i);
      const contact = currentList[i];
      if (contact.status === 'SENT') continue;

      contact.status = 'SENDING';
      onContactsUpdate([...currentList]);

      const customizedText = WhatsAppSenderEngine.interpolate(messageTemplate, contact).trim();
      if (!customizedText && !media) {
        contact.status = 'FAILED';
        onContactsUpdate([...currentList]);
        setLogs(prev => [
          {
            id: `log_${Date.now()}_${i}`,
            timestamp: new Date().toLocaleTimeString(),
            contactName: contact.name,
            phoneNumber: contact.phoneNumber,
            status: 'FAILED',
            message: '(Empty message text)',
            hasAttachment: false,
            error: 'Cannot send empty message'
          },
          ...prev
        ]);
        continue;
      }

      // Safe anti-ban & Signal session settlement delay between consecutive contacts
      if (i > 0) {
        const effectiveDelay = Math.max(7, Math.min(60, delaySeconds || 7));
        const safeDelayMs = Math.max(7000, (effectiveDelay + (Math.random() * 1.5 - 0.75)) * 1000);
        await new Promise(r => setTimeout(r, safeDelayMs));
      }

      if (!isRunningRef.current) break;

      let sendSuccess = false;
      let failureReason = '';
      let msgId = '';

      if (dispatchMode === 'WORKER') {
        try {
          // Exactly ONE message: media with caption or text template
          const payload: any = {
            to: contact.phoneNumber,
            text: customizedText
          };
          if (media) {
            payload.mediaBase64 = media.dataUrl.split(',')[1];
            payload.mediaMimeType = media.type;
            payload.fileName = media.name;
            payload.isImage = media.isImage;
          }

          const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
          const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-user-id': WhatsAppSessionManager.getUserId()
          };
          if (savedWorkerUrl) {
            requestHeaders['x-worker-url'] = savedWorkerUrl;
          }

          let res = await fetch('/api/whatsapp-service/send', {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(payload)
          });

          let data = await res.json().catch(() => ({}));

          // If failed due to HTTP 413 (Vercel payload limit) or temporary server error (5xx),
          // auto-fallback directly to the worker gateway
          if (!res.ok && (res.status === 413 || res.status >= 500)) {
            const directTarget = savedWorkerUrl || (typeof window !== 'undefined' ? (window as any).__toolnest_gateway_url : '');
            if (directTarget && directTarget.startsWith('http')) {
              try {
                console.log(`Endpoint returned ${res.status}. Retrying dispatch directly to Worker Gateway: ${directTarget}`);
                const directRes = await fetch(`${directTarget.replace(/\/$/, '')}/send`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-service-key': 'toolnest_secure_service_token_2026',
                    'x-user-id': WhatsAppSessionManager.getUserId()
                  },
                  body: JSON.stringify({ ...payload, userId: WhatsAppSessionManager.getUserId() })
                });
                if (directRes.ok) {
                  res = directRes;
                  data = await directRes.json().catch(() => ({}));
                }
              } catch (directErr) {
                console.warn('Direct gateway retry error:', directErr);
              }
            } else if (res.status >= 500) {
              console.log(`First send attempt encountered status ${res.status}, waiting 3.5s and retrying once...`);
              await new Promise(r => setTimeout(r, 3500));
              res = await fetch('/api/whatsapp-service/send', {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(payload)
              });
              data = await res.json().catch(() => ({}));
            }
          }

          if (res.ok && data.success) {
            sendSuccess = true;
            msgId = data.messageId || '';
          } else {
            sendSuccess = false;
            if (res.status === 413) {
              failureReason = 'Media file is too large for cloud hosting (HTTP 413). Please re-attach the image so it is auto-compressed.';
            } else {
              failureReason = data.error || `HTTP ${res.status}: Delivery rejected`;
            }
          }
        } catch (err: any) {
          sendSuccess = false;
          failureReason = err.message || 'Worker service communication error';
        }
      } else {
        // Browser tab mode: open WhatsApp Web send tab
        const url = WhatsAppSenderEngine.getDirectWhatsAppWebUrl(contact.phoneNumber, customizedText);
        window.open(url, '_blank');
        sendSuccess = true;
      }

      contact.status = sendSuccess ? 'SENT' : 'FAILED';
      contact.sentAt = new Date().toISOString();
      onContactsUpdate([...currentList]);

      setLogs(prev => [
        {
          id: `log_${Date.now()}_${i}`,
          timestamp: new Date().toLocaleTimeString(),
          contactName: contact.name,
          phoneNumber: contact.phoneNumber,
          status: sendSuccess ? 'SENT' : 'FAILED',
          message: customizedText,
          hasAttachment: Boolean(media),
          error: failureReason || undefined,
          messageId: msgId || undefined
        },
        ...prev
      ]);
    }

    setIsRunning(false);
    setIsPaused(false);
    isRunningRef.current = false;
    isPausedRef.current = false;

    // Automatically record campaign run to MongoDB
    try {
      const finalSent = currentList.filter(c => c.status === 'SENT').length;
      const finalFailed = currentList.filter(c => c.status === 'FAILED').length;
      if (finalSent > 0 || finalFailed > 0) {
        fetch('/api/campaigns/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignName: `Campaign (${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`,
            template: messageTemplate,
            totalContacts: currentList.length,
            successfulMessages: finalSent,
            failedMessages: finalFailed,
            status: 'completed'
          })
        }).catch(() => {});
      }
    } catch (_) {}
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
    } else {
      setIsPaused(true);
      isPausedRef.current = true;
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    isRunningRef.current = false;
    isPausedRef.current = false;
  };

  const resetAllStatuses = () => {
    const reset = contacts.map(c => ({ ...c, status: 'PENDING' as const }));
    onContactsUpdate(reset);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#5722AF]" />
              Sequential Campaign Engine
            </h3>
            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                title="View Step 4 Dispatcher Guide"
                className="p-1 rounded-lg text-zinc-400 hover:text-[#5722AF] dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Automated rate-limited sequential message delivery.
          </p>
        </div>

        {/* Dispatch Mode Selector & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center hidden bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
            <button
              onClick={() => setDispatchMode('WORKER')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                dispatchMode === 'WORKER'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-purple-300 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Persistent Baileys socket on port 5001 / Cloud Worker"
            >
              Worker Daemon
            </button>
            <button
              onClick={() => setDispatchMode('BROWSER_TABS')}
              className={`px-2.5 py-1 rounded-lg hidden font-semibold transition ${
                dispatchMode === 'BROWSER_TABS'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-purple-300 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Universal fallback for Vercel/Shared hosting without a background daemon"
            >
              Browser Direct
            </button>
          </div>

          {!isRunning ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetAllStatuses}
                className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition shadow-xs"
                title="Reset all contacts status to PENDING so you can resend template to everyone"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Reset List
              </button>
              <button
                onClick={startCampaign}
                className="px-6 py-2.5 bg-[#5722AF] hover:bg-[#471a93] text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
              >
                <Play className="w-4 h-4" />
                Start Campaign
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Pause className="w-3.5 h-3.5" />
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Square className="w-3.5 h-3.5" />
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Telemetry Bar */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            {isRunning && <span className="w-2 h-2 rounded-full bg-[#5722AF] animate-ping" />}
            {isRunning ? (isPaused ? 'Campaign Paused' : `Sending to ${contacts[currentIndex]?.name || 'next recipient'} (${contacts[currentIndex]?.phoneNumber})...`) : 'Ready to Launch'}
          </span>
          <span className="font-mono text-zinc-600 dark:text-zinc-300">
            {sentCount} / {total} Sent ({progressPct}%)
          </span>
        </div>

        <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden">
          <div
            className="bg-[#5722AF] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
          <span>Pending: {total - sentCount - failedCount}</span>
          <span className="text-emerald-600 font-semibold">Delivered / Sent: {sentCount}</span>
          <span className={failedCount > 0 ? 'text-rose-600 font-semibold' : ''}>Failed: {failedCount}</span>
        </div>
      </div>

      {/* Transmission Logs */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
          <ListFilter className="w-3.5 h-3.5 text-[#5722AF]" /> Real-time Dispatch Telemetry
        </h4>

        {logs.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
            Recipient dispatches from the active WhatsApp session will be logged here in real-time.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-64 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="p-3 text-xs flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-400">{log.timestamp}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{log.contactName}</span>
                      <span className="font-mono text-[11px] text-zinc-400">({log.phoneNumber})</span>
                      {log.hasAttachment && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-[#5722AF] dark:bg-purple-950 dark:text-purple-300 text-[9px] font-bold">
                          MEDIA
                        </span>
                      )}
                      {log.messageId && (
                        <span className="font-mono text-[9px] text-zinc-400">
                          ID: {log.messageId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-[11px] line-clamp-1">{log.message}</p>
                    {log.error && (
                      <p className="text-rose-600 dark:text-rose-400 text-[10px] font-mono mt-0.5">
                        Error: {log.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {log.status === 'FAILED' && (
                    <a
                      href={WhatsAppSenderEngine.getDirectWhatsAppWebUrl(log.phoneNumber, log.message)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg flex items-center gap-1 transition"
                      title="Send manually via WhatsApp Web"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Chat
                    </a>
                  )}

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      log.status === 'SENT'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {log.status === 'SENT' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
