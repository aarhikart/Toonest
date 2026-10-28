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
  Zap,
  RotateCcw,
  Loader2
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
    isExpired?: boolean;
    daysRemaining?: number | null;
    customDailyLimit?: number | null;
    customResetHours?: number | null;
    customLimitEnabled?: boolean;
    [key: string]: any;
  } | null;
  onOpenRenewalModal?: (plan?: '1_month' | '3_months' | '6_months') => void;
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
  currentUser,
  onOpenRenewalModal
}) => {
  const effectiveUserId = (userId && userId.trim() !== 'default' ? userId.trim() : WhatsAppSessionManager.getUserId()).toLowerCase();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [dispatchMode, setDispatchMode] = useState<'WORKER' | 'BROWSER_TABS'>('WORKER');
  const [showImageNoticeModal, setShowImageNoticeModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const isPlanExpired = !!currentUser && currentUser.role !== 'admin' && (
    currentUser.isExpired === true ||
    (currentUser.daysRemaining !== undefined && currentUser.daysRemaining !== null && currentUser.daysRemaining <= 0) ||
    currentUser.subscriptionType === 'none'
  );

  const userLimit = WhatsAppLimitManager.getPlanLimit(
    currentUser?.role,
    currentUser?.subscriptionType,
    currentUser?.planType,
    planLimits,
    currentUser?.customDailyLimit,
    currentUser?.customLimitEnabled
  );

  const effectiveResetHours = WhatsAppLimitManager.getResetHours(
    currentUser?.customResetHours,
    currentUser?.customLimitEnabled,
    planLimits?.resetHours
  );

  const [usage, setUsage] = useState<CalculatedUsage>(() =>
    WhatsAppLimitManager.getUsage(effectiveUserId, userLimit, effectiveResetHours)
  );

  // Keep usage and countdown timer refreshed
  React.useEffect(() => {
    let isMounted = true;
    const refreshUsage = async () => {
      const current = WhatsAppLimitManager.getUsage(effectiveUserId, userLimit, effectiveResetHours);
      if (isMounted) setUsage(current);

      if (effectiveUserId && effectiveUserId !== 'default') {
        try {
          const dbUsage = await WhatsAppLimitManager.fetchUsageFromDb(
            effectiveUserId,
            userLimit,
            effectiveResetHours
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
  }, [effectiveUserId, userLimit, effectiveResetHours]);

  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const isStartingRef = useRef(false);
  const isLocalSendingRef = useRef(false);

  // Poll campaign status from MongoDB / Worker Gateway to support tab closures & multi-device sync
  React.useEffect(() => {
    let isMounted = true;

    const pollStatus = async () => {
      try {
        const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
        const res = await fetch('/api/whatsapp-marketing/campaign/status', {
          headers: {
            'x-user-id': effectiveUserId,
            ...(savedWorkerUrl ? { 'x-worker-url': savedWorkerUrl } : {})
          }
        });
        const data = await res.json();
        if (!isMounted || !data.success) return;

        if (data.isRunning) {
          setIsRunning(true);
          setIsPaused(data.isPaused ?? false);
          isRunningRef.current = true;
          isPausedRef.current = data.isPaused ?? false;
          setCurrentIndex(data.currentIndex ?? 0);
          if (Array.isArray(data.contacts) && data.contacts.length > 0) {
            onContactsUpdate(data.contacts);
          }
          if (Array.isArray(data.logs)) {
            setLogs(data.logs);
          }
        } else {
          // IMPORTANT: If we just started a campaign or are currently streaming media locally in the tab,
          // DO NOT let the idle server status overwrite isRunning!
          if (!isStartingRef.current && !isLocalSendingRef.current) {
            if (isRunningRef.current) {
              setIsRunning(false);
              setIsPaused(false);
              isRunningRef.current = false;
              isPausedRef.current = false;
            }
            if (Array.isArray(data.contacts) && data.contacts.length > 0) {
              onContactsUpdate(data.contacts);
            }
            if (Array.isArray(data.logs)) {
              setLogs(data.logs);
            }
          }
        }
      } catch (_) {}
    };

    // Initial check on mount: recover campaign progress if tab was closed or refreshed
    pollStatus();

    // Poll every 2.5 seconds when campaign is active
    const timer = setInterval(() => {
      if (isRunningRef.current && !isLocalSendingRef.current) {
        pollStatus();
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const total = contacts.length;
  const sentCount = contacts.filter(c => c.status === 'SENT').length;
  const failedCount = contacts.filter(c => c.status === 'FAILED').length;
  const remainingCount = contacts.filter(c => c.status !== 'SENT').length;
  const progressPct = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  const startCampaign = async (confirmedImageNotice: boolean = false) => {
    if (isPlanExpired) {
      alert('Your plan has expired!\n\nPlease renew your plan to start sending WhatsApp marketing campaigns.');
      if (onOpenRenewalModal) onOpenRenewalModal();
      return;
    }
    if (!session.connected) {
      alert('Please connect WhatsApp Web first via QR Code or Pairing Code in Step 1.');
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

    // Notice modal for image campaigns: remind user to keep browser tab open
    if (media && !confirmedImageNotice) {
      setShowImageNoticeModal(true);
      return;
    }

    // Guard: Prevent double-click launches
    if (isRunningRef.current || isStartingRef.current) {
      return;
    }

    // Lock starting state immediately to prevent flicker and multi-clicks
    setIsStarting(true);
    isStartingRef.current = true;

    // Check message limit quota before starting (check latest from MongoDB)
    let currentQuota = WhatsAppLimitManager.getUsage(effectiveUserId, userLimit, effectiveResetHours);
    if (effectiveUserId && effectiveUserId !== 'default') {
      try {
        currentQuota = await WhatsAppLimitManager.fetchUsageFromDb(effectiveUserId, userLimit, effectiveResetHours);
      } catch (_) {}
    }
    setUsage(currentQuota);

    if (currentQuota.isLimitReached && currentQuota.isResetTimerActive) {
      setIsStarting(false);
      isStartingRef.current = false;
      alert(
        `Message quota limit of ${userLimit} reached for this ${effectiveResetHours}-hour window.\n\nYou can send messages again on ${currentQuota.resetTimeFormatted} (in ${currentQuota.timeRemainingStr}).`
      );
      return;
    }

    // Anchor campaign start time when sending begins
    WhatsAppLimitManager.startCampaignTracking(effectiveUserId, effectiveResetHours);

    // Deduplication: mark contacts as SENT if already delivered in history
    let currentList = contacts.map(c => {
      if (c.status !== 'SENT' && WhatsAppLimitManager.isAlreadyDelivered(effectiveUserId, c.phoneNumber)) {
        return { ...c, status: 'SENT' as const };
      }
      return c;
    });

    const pendingContacts = currentList.filter(c => c.status !== 'SENT');
    if (pendingContacts.length === 0 && currentList.length > 0) {
      setIsStarting(false);
      isStartingRef.current = false;
      if (confirm('All contacts in your list have already received messages!\n\nWould you like to reset all contacts so you can send to this list again?')) {
        resetAllStatuses();
      }
      return;
    }
    onContactsUpdate([...currentList]);

    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;
    isPausedRef.current = false;

    // --- PIPELINE 1: MEDIA (IMAGE/DOCUMENT) ATTACHED ---
    // Sequential delivery directly from the tab so media streams cleanly with caption in ONE message.
    // Tab must remain open during sending; if closed, remaining contacts pause and can be resumed.
    if (media) {
      isLocalSendingRef.current = true;
      setIsStarting(false);
      isStartingRef.current = false;

      try {
        const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
        const cleanBase64 = media.dataUrl.includes(',') ? media.dataUrl.split(',')[1] : media.dataUrl;

        let sentThisRun = 0;
        for (let i = 0; i < currentList.length; i++) {
          if (!isRunningRef.current) break;

          while (isPausedRef.current) {
            await new Promise(r => setTimeout(r, 500));
            if (!isRunningRef.current) break;
          }
          if (!isRunningRef.current) break;

          const contact = currentList[i];
          if (contact.status === 'SENT') {
            continue;
          }

          setCurrentIndex(i);

          // Check live quota before each send
          const liveQuota = WhatsAppLimitManager.getUsage(effectiveUserId, userLimit, effectiveResetHours);
          if (liveQuota.isLimitReached && liveQuota.isResetTimerActive) {
            setUsage(liveQuota);
            setIsRunning(false);
            isRunningRef.current = false;
            alert(
              `Message limit of ${userLimit} reached!\n\nCampaign paused safely. You can send the remaining contacts on ${liveQuota.resetTimeFormatted} (in ${liveQuota.timeRemainingStr}).`
            );
            break;
          }

          // Anti-ban & session settlement delay between consecutive sends
          if (sentThisRun > 0) {
            const effectiveDelay = Math.max(7, Math.min(60, delaySeconds || 7));
            const safeDelayMs = Math.max(7000, (effectiveDelay + (Math.random() * 1.5 - 0.75)) * 1000);
            await new Promise(r => setTimeout(r, safeDelayMs));
          }
          if (!isRunningRef.current) break;

          contact.status = 'SENDING';
          onContactsUpdate([...currentList]);

          // Use currently edited message template with customer variables
          const customizedText = WhatsAppSenderEngine.interpolate(messageTemplate, contact).trim();

          let sendSuccess = false;
          let failureReason = '';
          let msgId = '';

          try {
            const res = await fetch('/api/whatsapp-service/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': effectiveUserId,
                ...(savedWorkerUrl ? { 'x-worker-url': savedWorkerUrl } : {})
              },
              body: JSON.stringify({
                userId: effectiveUserId,
                to: contact.phoneNumber,
                text: customizedText,
                mediaBase64: cleanBase64,
                mediaMimeType: media.type,
                fileName: media.name,
                isImage: media.isImage,
                sendTextSeparately: false,
                linkPreview: false
              })
            });

            const sendData = await res.json().catch(() => ({}));
            if (res.ok && sendData.success) {
              sendSuccess = true;
              msgId = sendData.messageId || '';
            } else {
              failureReason = sendData.error || 'Message delivery failed';
            }
          } catch (err: any) {
            failureReason = err.message || 'Network error';
          }

          if (sendSuccess) {
            sentThisRun++;
            contact.status = 'SENT';
            contact.sentAt = new Date().toISOString();
            contact.error = undefined;
            const updatedUsage = WhatsAppLimitManager.recordDelivery(
              effectiveUserId,
              contact.phoneNumber,
              userLimit,
              effectiveResetHours
            );
            setUsage(updatedUsage);
          } else {
            contact.status = 'FAILED';
            contact.error = failureReason;
          }

          onContactsUpdate([...currentList]);

          // Persist progress to MongoDB after each contact so tab closing never loses status
          try {
            fetch('/api/whatsapp-marketing/contacts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-user-id': effectiveUserId },
              body: JSON.stringify({ userId: effectiveUserId, contacts: currentList })
            }).catch(() => {});
          } catch (_) {}

          setLogs(prev => [
            {
              id: `log_${Date.now()}_${i}`,
              timestamp: new Date().toLocaleTimeString(),
              contactName: contact.name,
              phoneNumber: contact.phoneNumber,
              status: sendSuccess ? 'SENT' : 'FAILED',
              message: customizedText || (media ? `[Photo: ${media.name}]` : ''),
              hasAttachment: true,
              error: failureReason || undefined,
              messageId: msgId || undefined
            },
            ...prev
          ]);
        }
      } catch (err: any) {
        console.error('Image campaign loop error:', err);
      } finally {
        isLocalSendingRef.current = false;
        setIsRunning(false);
        setIsPaused(false);
        isRunningRef.current = false;
        isPausedRef.current = false;

        // Record campaign summary to MongoDB
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
      }
      return;
    }

    // --- PIPELINE 2: TEXT-ONLY CAMPAIGN ---
    // Dispatched to persistent background worker on server: tab can be safely closed!
    try {
      const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
      const res = await fetch('/api/whatsapp-marketing/campaign/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': effectiveUserId,
          ...(savedWorkerUrl ? { 'x-worker-url': savedWorkerUrl } : {})
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          contacts: currentList,
          template: messageTemplate,
          delaySeconds: Math.max(7, Math.min(60, delaySeconds || 7)),
          sendTextSeparately: false,
          linkPreview: false
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setIsRunning(false);
        isRunningRef.current = false;
        setIsStarting(false);
        isStartingRef.current = false;
        alert(data.error || 'Failed to start background campaign.');
        return;
      }

      // Safe grace window: keep isStartingRef true for 3.5s so early polls cannot flip isRunning to false
      setTimeout(() => {
        isStartingRef.current = false;
        setIsStarting(false);
      }, 3500);

      // Initial status poll
      try {
        const statusRes = await fetch('/api/whatsapp-marketing/campaign/status', {
          headers: {
            'x-user-id': effectiveUserId,
            ...(savedWorkerUrl ? { 'x-worker-url': savedWorkerUrl } : {})
          }
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.success) {
            if (Array.isArray(statusData.contacts)) onContactsUpdate(statusData.contacts);
            if (Array.isArray(statusData.logs)) setLogs(statusData.logs);
          }
        }
      } catch (_) {}
    } catch (err: any) {
      setIsRunning(false);
      isRunningRef.current = false;
      setIsStarting(false);
      isStartingRef.current = false;
      alert('Could not start campaign: ' + (err.message || 'Network error'));
    }
  };

  const handlePauseResume = async () => {
    try {
      const nextPaused = !isPaused;
      setIsPaused(nextPaused);
      isPausedRef.current = nextPaused;

      const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': effectiveUserId
      };
      if (savedWorkerUrl) headers['x-worker-url'] = savedWorkerUrl;

      await fetch('/api/whatsapp-marketing/campaign/pause', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: effectiveUserId, action: nextPaused ? 'pause' : 'resume' })
      }).catch(() => {});
    } catch (_) {}
  };

  const handleStop = async () => {
    setIsRunning(false);
    setIsPaused(false);
    isRunningRef.current = false;
    isPausedRef.current = false;

    try {
      const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': effectiveUserId
      };
      if (savedWorkerUrl) headers['x-worker-url'] = savedWorkerUrl;

      await fetch('/api/whatsapp-marketing/campaign/stop', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: effectiveUserId })
      }).catch(() => {});
    } catch (_) {}
  };

  // Upgraded Reset: clears delivery history tracking, clears Live Delivery Status, and reverts contacts to PENDING
  const resetAllStatuses = async () => {
    try {
      setIsStarting(false);
      isStartingRef.current = false;
      isLocalSendingRef.current = false;
      setIsRunning(false);
      setIsPaused(false);
      isRunningRef.current = false;
      isPausedRef.current = false;
      setCurrentIndex(0);
      setLogs([]); // Immediately clear local Live Delivery Status

      // 1. Clear database delivered numbers, delivery logs, and reset progress in MongoDB & Worker
      const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': effectiveUserId
      };
      if (savedWorkerUrl) headers['x-worker-url'] = savedWorkerUrl;

      await fetch('/api/whatsapp-marketing/campaign/reset', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: effectiveUserId })
      }).catch(() => {});

      // 2. Clear local delivered numbers tracking so previously processed users can be sent to again
      WhatsAppLimitManager.clearDeliveredNumbers(effectiveUserId);

      // 3. Reset contact statuses to PENDING in state
      const reset = contacts.map(c => ({
        ...c,
        status: 'PENDING' as const,
        sentAt: undefined,
        error: undefined
      }));
      onContactsUpdate(reset);

      // 4. Save reset contacts to MongoDB
      fetch('/api/whatsapp-marketing/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': effectiveUserId },
        body: JSON.stringify({ userId: effectiveUserId, contacts: reset })
      }).catch(() => {});

      // 5. Ensure logs state is completely cleared
      setLogs([]);
    } catch (err) {
      console.error('Reset error:', err);
      WhatsAppLimitManager.clearDeliveredNumbers(effectiveUserId);
      const reset = contacts.map(c => ({ ...c, status: 'PENDING' as const, sentAt: undefined, error: undefined }));
      onContactsUpdate(reset);
      setLogs([]);
    }
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
                title="Reset contact statuses so you can send to this list again"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isStarting) return;
                  if (remainingCount === 0 && total > 0) {
                    if (confirm('All contacts have already received messages!\n\nWould you like to reset all contacts to PENDING so you can send to this list again?')) {
                      resetAllStatuses();
                    }
                    return;
                  }
                  startCampaign();
                }}
                disabled={isPlanExpired || isStarting}
                title={
                  isPlanExpired
                    ? "Your plan has expired. Please renew your plan to start sending."
                    : isStarting
                    ? "Starting campaign..."
                    : remainingCount === 0 && total > 0
                    ? "All contacts delivered. Click to reset and resend."
                    : sentCount > 0
                    ? `Resume sending to remaining ${remainingCount} contacts`
                    : "Start sending messages to customer list"
                }
                className={`px-4 py-1.5 sm:px-5 sm:py-2 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition ${
                  isPlanExpired || isStarting
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed shadow-none border border-zinc-300/50 dark:border-zinc-700/50'
                    : remainingCount === 0 && total > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer'
                    : 'bg-[#5722AF] hover:bg-[#471a93] text-white shadow-md cursor-pointer'
                }`}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : remainingCount === 0 && total > 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>All Sent (Click Reset to Resend)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>
                      {sentCount > 0 && remainingCount > 0
                        ? `Resume Sending (${remainingCount} Remaining)`
                        : 'Start Sending'}
                    </span>
                  </>
                )}
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

      {/* Attachment Active Banner Notice */}
      {media && !isRunning && (
        <div className="p-3 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-300 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Attachment Active:</strong> Please keep this tab / website open while sending image messages. If you close this tab, sending will pause.
          </span>
        </div>
      )}

      {/* Live Running Status Banners */}
      {isRunning && !media && (
        <div className="p-3 bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-300 shadow-2xs">
          <Radio className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span>
            <strong>Background Sending Active:</strong> Messages are being dispatched by the server in the background. You can safely close or refresh this tab.
          </span>
        </div>
      )}
      {isRunning && media && (
        <div className="p-3 bg-purple-50/90 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 rounded-2xl flex items-center gap-2.5 text-xs text-[#5722AF] dark:text-purple-300 shadow-2xs">
          <Radio className="w-4 h-4 shrink-0 text-[#5722AF] dark:text-purple-400 animate-pulse" />
          <span>
            <strong>Live Image Streaming Active:</strong> Please keep this website / tab open while sending image messages.
          </span>
        </div>
      )}

      {/* Plan Expired Alert Message */}
      {isPlanExpired && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                Your plan has expired
              </h4>
              <p className="text-rose-700 dark:text-rose-300 text-xs mt-0.5">
                Your subscription has ended. The <strong>Start Sending</strong> button is disabled until your plan is renewed.
              </p>
            </div>
          </div>
          {onOpenRenewalModal && (
            <button
              type="button"
              onClick={() => onOpenRenewalModal()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-sm transition shrink-0 cursor-pointer"
            >
              Renew Plan Now
            </button>
          )}
        </div>
      )}

      {/* Message Quota & Reset Window Telemetry Card */}
      <div className="p-4 bg-purple-50/70 dark:bg-purple-950/25 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white flex-wrap">
            <Zap className="w-4 h-4 text-[#5722AF] dark:text-purple-400" />
            <span>Message Quota:</span>
            {userLimit >= 999999 ? (
              <span className="text-emerald-600 font-extrabold">Unlimited (Admin Mode)</span>
            ) : (
              <span className={usage.isLimitReached ? 'text-rose-600 font-extrabold' : 'text-[#5722AF] dark:text-purple-300 font-extrabold'}>
                {usage.remaining} / {userLimit} messages remaining
              </span>
            )}
            {currentUser?.customLimitEnabled && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Custom Limit
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
                  Reset Window: {effectiveResetHours}h (Timer starts once limit is fully used)
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
              <span>Configured window: {effectiveResetHours} hours {currentUser?.customLimitEnabled ? '(Individual Custom Limit)' : ''} • Deduplication active</span>
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

      {/* Image Campaign: Keep Tab Open Notice Modal */}
      {showImageNoticeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowImageNoticeModal(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#131620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Image Campaign: Keep Tab Open
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Browser streaming required for media transmission
                </p>
              </div>
            </div>

            <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
              <p>
                Your message will be sent with the photo and caption together as <strong>one single WhatsApp message</strong>.
              </p>
              <p className="text-amber-800 dark:text-amber-300 font-semibold">
                ⚠️ Please keep this tab / website open while sending. If you close this tab, sending will pause. You can reopen and click &ldquo;Resume Sending&rdquo; at any time.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImageNoticeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowImageNoticeModal(false);
                  startCampaign(true);
                }}
                className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold transition shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Keep Tab Open & Start Sending</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
