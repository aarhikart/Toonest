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
  HelpCircle,
  Zap
} from 'lucide-react';
import { WebContact, WhatsAppWebSession } from '@/lib/whatsapp-web/types';
import { WhatsAppSenderEngine } from '@/lib/whatsapp-web/sender';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';
import { MediaAttachment } from './WhatsAppMessageComposer';
import { PlanLimitsConfig, DEFAULT_PLAN_LIMITS, WhatsAppLimitManager, CalculatedUsage } from '@/lib/whatsapp-web/limit-manager';

interface WhatsAppAutoSenderProps {
  session: WhatsAppWebSession;
  contacts: WebContact[];
  onContactsUpdate: (contacts: WebContact[]) => void;
  messageTemplate: string;
  delaySeconds: number;
  media: MediaAttachment | null;
  onOpenGuide?: () => void;
  userId?: string;
  planLimits?: PlanLimitsConfig;
  currentUser?: {
    role?: string;
    subscriptionType?: string;
    planType?: string | null;
    username?: string;
    [key: string]: any;
  } | null;
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
  onOpenGuide,
  userId,
  planLimits,
  currentUser
}) => {
  const effectiveUserId = (userId && userId.trim() !== 'default' ? userId.trim() : WhatsAppSessionManager.getUserId()).toLowerCase();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [dispatchMode, setDispatchMode] = useState<'WORKER' | 'BROWSER_TABS'>('WORKER');

  const userLimit = WhatsAppLimitManager.getPlanLimit(
    currentUser?.role,
    currentUser?.subscriptionType,
    currentUser?.planType,
    planLimits
  );

  const [usage, setUsage] = useState<CalculatedUsage>(() =>
    WhatsAppLimitManager.getUsage(effectiveUserId, userLimit, planLimits?.resetHours)
  );

  // Keep usage and countdown timer refreshed
  React.useEffect(() => {
    let isMounted = true;
    const refreshUsage = async () => {
      const current = WhatsAppLimitManager.getUsage(effectiveUserId, userLimit, planLimits?.resetHours);
      if (isMounted) setUsage(current);

      if (effectiveUserId && effectiveUserId !== 'default') {
        try {
          const dbUsage = await WhatsAppLimitManager.fetchUsageFromDb(
            effectiveUserId,
            userLimit,
            planLimits?.resetHours
          );
          if (isMounted) setUsage(dbUsage);
        } catch (_) {}
      }
    };
    refreshUsage();

    const interval = setInterval(refreshUsage, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [effectiveUserId, userLimit, planLimits?.resetHours]);

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

    // Check message limit quota before starting (check latest from MongoDB)
    let currentQuota = WhatsAppLimitManager.getUsage(effectiveUserId, userLimit, planLimits?.resetHours);
    if (effectiveUserId && effectiveUserId !== 'default') {
      try {
        currentQuota = await WhatsAppLimitManager.fetchUsageFromDb(effectiveUserId, userLimit, planLimits?.resetHours);
      } catch (_) {}
    }
    setUsage(currentQuota);

    if (currentQuota.isLimitReached && currentQuota.isResetTimerActive) {
      alert(
        `Message quota limit of ${userLimit} reached for this ${planLimits?.resetHours || 24}-hour window.\n\nYou can send messages again on ${currentQuota.resetTimeFormatted} (in ${currentQuota.timeRemainingStr}).`
      );
      return;
    }

    // Anchor campaign start time when sending begins
    WhatsAppLimitManager.startCampaignTracking(effectiveUserId, planLimits?.resetHours);

    // Deduplication: mark contacts as SENT if already delivered in history
    let currentList = contacts.map(c => {
      if (c.status !== 'SENT' && WhatsAppLimitManager.isAlreadyDelivered(effectiveUserId, c.phoneNumber)) {
        return { ...c, status: 'SENT' as const };
      }
      return c;
    });

    const pendingContacts = currentList.filter(c => c.status !== 'SENT');
    if (pendingContacts.length === 0 && currentList.length > 0) {
      alert(
        'All contacts in your list have already received messages!\n\nTo prevent duplicate messages, already delivered contacts are not messaged again. Add new contacts to continue sending.'
      );
      return;
    }
    onContactsUpdate([...currentList]);

    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;
    isPausedRef.current = false;

    for (let i = 0; i < currentList.length; i++) {
      if (!isRunningRef.current) break;

      while (isPausedRef.current) {
        await new Promise(r => setTimeout(r, 500));
        if (!isRunningRef.current) break;
      }

      if (!isRunningRef.current) break;

      setCurrentIndex(i);
      const contact = currentList[i];
      if (contact.status === 'SENT' || WhatsAppLimitManager.isAlreadyDelivered(effectiveUserId, contact.phoneNumber)) {
        if (contact.status !== 'SENT') {
          contact.status = 'SENT';
          onContactsUpdate([...currentList]);
        }
        continue;
      }

      // Check quota before sending this contact
      const liveQuota = WhatsAppLimitManager.getUsage(effectiveUserId, userLimit, planLimits?.resetHours);
      if (liveQuota.isLimitReached && liveQuota.isResetTimerActive) {
        setUsage(liveQuota);
        setIsRunning(false);
        isRunningRef.current = false;
        alert(
          `Message limit of ${userLimit} reached for this ${planLimits?.resetHours || 24}-hour window!\n\nCampaign paused safely. Delivered contacts are saved so duplicate messages will not be sent.\n\nYou can send the remaining contacts on ${liveQuota.resetTimeFormatted} (in ${liveQuota.timeRemainingStr}).`
        );
        break;
      }

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
            'x-user-id': effectiveUserId
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
                    'x-user-id': effectiveUserId
                  },
                  body: JSON.stringify({ ...payload, userId: effectiveUserId })
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

      if (sendSuccess) {
        const updatedUsage = WhatsAppLimitManager.recordDelivery(
          effectiveUserId,
          contact.phoneNumber,
          userLimit,
          planLimits?.resetHours
        );
        setUsage(updatedUsage);
      }

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
    <div className="bg-gradient-to-br from-white via-white to-zinc-50/80 dark:from-[#131620] dark:via-zinc-900 dark:to-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
              Send 
            </h3>
            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                title="View Guide"
                className="p-1 rounded-lg hidden text-zinc-400 hover:text-[#5722AF] dark:hover:text-purple-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dispatch Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isRunning ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetAllStatuses}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 transition shadow-xs cursor-pointer"
                title="Reset so you can send to all contacts again"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset</span>
              </button>
              <button
                onClick={startCampaign}
                className="px-4 py-1.5 sm:px-5 sm:py-2 bg-[#5722AF] hover:bg-[#471a93] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Sending</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePauseResume}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={handleStop}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message Quota & Reset Window Telemetry Card */}
      <div className="p-4 bg-purple-50/70 dark:bg-purple-950/25 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
            <Zap className="w-4 h-4 text-[#5722AF] dark:text-purple-400" />
            <span>Message Quota:</span>
            {userLimit >= 999999 ? (
              <span className="text-emerald-600 font-extrabold">Unlimited (Admin Mode)</span>
            ) : (
              <span className={usage.isLimitReached ? 'text-rose-600 font-extrabold' : 'text-[#5722AF] dark:text-purple-300 font-extrabold'}>
                {usage.remaining} / {userLimit} messages remaining
              </span>
            )}
          </div>

          {userLimit < 999999 && (
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#5722AF]" />
              {usage.isResetTimerActive ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  Resets on <strong>{usage.resetTimeFormatted}</strong> (in {usage.timeRemainingStr})
                </span>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400">
                  Reset Window: {planLimits?.resetHours || 24}h (Timer starts once limit is fully used)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Small Quota Progress Bar */}
        {userLimit < 999999 && (
          <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                usage.isLimitReached ? 'bg-rose-500' : usage.remaining <= 10 ? 'bg-amber-500' : 'bg-[#5722AF]'
              }`}
              style={{ width: `${Math.min(100, Math.round((usage.sentInWindow / userLimit) * 100))}%` }}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 gap-1">
          <span>
            {usage.isLimitReached && usage.isResetTimerActive ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Limit reached! Next batch can be sent on {usage.resetTimeFormatted} (in {usage.timeRemainingStr}).
              </span>
            ) : (
              <span>Configured window: {planLimits?.resetHours || 24} hours • Deduplication active</span>
            )}
          </span>
          <span className="text-zinc-600 dark:text-zinc-300 font-medium">
            {usage.deliveredNumbers.length} delivered contacts saved (duplicates will be skipped)
          </span>
        </div>
      </div>

      {/* Progress Telemetry Bar */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            {isRunning && <span className="w-2 h-2 rounded-full bg-[#5722AF] animate-ping" />}
            {isRunning ? (isPaused ? 'Sending Paused' : `Sending to ${contacts[currentIndex]?.name || 'customer'} (${contacts[currentIndex]?.phoneNumber})...`) : 'Ready to Send'}
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
          <span>Remaining: {total - sentCount - failedCount}</span>
          <span className="text-emerald-600 font-semibold">Sent: {sentCount}</span>
          <span className={failedCount > 0 ? 'text-rose-600 font-semibold' : ''}>Failed: {failedCount}</span>
        </div>
      </div>

      {/* Real-time Dispatch Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-[#5722AF]" />
            Live Delivery Status ({logs.length})
          </h4>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => setLogs([])}
              className="text-[11px] text-zinc-400 hover:text-rose-600 transition"
              title="Clear transmission logs"
            >
              Clear Logs
            </button>
          )}
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-x-auto overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 bg-white dark:bg-zinc-900/60">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              Messages sent from your WhatsApp will appear here in real-time.
            </div>
          ) : (
            <table className="w-full text-left text-xs min-w-[420px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 backdrop-blur-xs">
                <tr>
                  <th className="py-2.5 px-3 min-w-[85px] font-semibold text-zinc-600 dark:text-zinc-300">Time</th>
                  <th className="py-2.5 px-3 min-w-[130px] font-semibold text-zinc-600 dark:text-zinc-300">Name</th>
                  <th className="py-2.5 px-3 min-w-[140px] font-semibold text-zinc-600 dark:text-zinc-300">Phone Number</th>
                  <th className="py-2.5 px-3 min-w-[95px] text-right font-semibold text-zinc-600 dark:text-zinc-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2 px-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2 px-3 font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
                      {log.contactName || '—'}
                    </td>
                    <td className="py-2 px-3 font-mono text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {log.phoneNumber}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title={log.error ? `Error: ${log.error}` : undefined}
                      >
                        {log.status === 'SENT' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        )}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
