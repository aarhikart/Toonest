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
  ShieldCheck,
  HelpCircle,
  Zap,
  RotateCcw
} from 'lucide-react';
import { WebContact, WhatsAppWebSession } from '@/lib/whatsapp-web/types';
import { WhatsAppSenderEngine } from '@/lib/whatsapp-web/sender';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';
import { MediaAttachment } from './WhatsAppMessageComposer';
import { PlanLimitsConfig, WhatsAppLimitManager, CalculatedUsage } from '@/lib/whatsapp-web/limit-manager';

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
  const [showImageNoticeModal, setShowImageNoticeModal] = useState(false);

  // Anti-Ban & Human Mimicry Controls
  const [includeOptOutFooter, setIncludeOptOutFooter] = useState(true);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(0);
  const [nextDelaySeconds, setNextDelaySeconds] = useState(0);
  const skipBreakRef = useRef(false);

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

  // Keep usage refreshed locally
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

  const total = contacts.length;
  const sentCount = contacts.filter(c => c.status === 'SENT').length;
  const failedCount = contacts.filter(c => c.status === 'FAILED').length;
  const remainingCount = contacts.filter(c => c.status !== 'SENT').length;
  const progressPct = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  // 100% Client-side local sending loop with anti-ban protections
  const startCampaign = async (confirmedNotice: boolean = false) => {
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

    // Modal reminder for keeping tab open when media is attached
    if (!confirmedNotice && media) {
      setShowImageNoticeModal(true);
      return;
    }

    if (isRunningRef.current) return;

    // Check message limit quota before starting
    let currentQuota = WhatsAppLimitManager.getUsage(effectiveUserId, userLimit, effectiveResetHours);
    if (effectiveUserId && effectiveUserId !== 'default') {
      try {
        currentQuota = await WhatsAppLimitManager.fetchUsageFromDb(effectiveUserId, userLimit, effectiveResetHours);
      } catch (_) {}
    }
    setUsage(currentQuota);

    if (currentQuota.isLimitReached && currentQuota.isResetTimerActive) {
      alert(
        `Message quota limit of ${userLimit} reached for this ${effectiveResetHours}-hour window.\n\nYou can send messages again on ${currentQuota.resetTimeFormatted} (in ${currentQuota.timeRemainingStr}).`
      );
      return;
    }

    // Start campaign tracking in local storage
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
      if (confirm('All contacts in your list have already received messages!\n\nWould you like to reset all contacts to PENDING so you can send to this list again?')) {
        resetAllStatuses();
      }
      return;
    }

    onContactsUpdate([...currentList]);

    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;
    isPausedRef.current = false;

    try {
      const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': effectiveUserId
      };
      if (savedWorkerUrl) {
        requestHeaders['x-worker-url'] = savedWorkerUrl;
      }

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
            `Message limit of ${userLimit} reached!\n\nCampaign paused safely. Delivered contacts are saved. You can send the remaining contacts on ${liveQuota.resetTimeFormatted} (in ${liveQuota.timeRemainingStr}).`
          );
          break;
        }

        // 1. Anti-Ban Automated Rest Break (Coffee Break): Rest 90-135s after every 12-16 messages
        const breakBatchThreshold = 12 + (i % 5); // Natural varying batch size 12-16
        if (sentThisRun > 0 && sentThisRun % breakBatchThreshold === 0) {
          const breakDuration = 90 + Math.floor(Math.random() * 45); // 90 to 135 seconds
          setIsOnBreak(true);
          skipBreakRef.current = false;

          for (let sec = breakDuration; sec > 0; sec--) {
            if (!isRunningRef.current || skipBreakRef.current) break;
            while (isPausedRef.current) {
              await new Promise(r => setTimeout(r, 500));
              if (!isRunningRef.current) break;
            }
            setBreakSecondsLeft(sec);
            await new Promise(r => setTimeout(r, 1000));
          }
          setIsOnBreak(false);
          setBreakSecondsLeft(0);
        }
        if (!isRunningRef.current) break;

        // 2. Anti-ban & Session settlement delay between consecutive sends (with natural human jitter)
        if (sentThisRun > 0) {
          const base = Math.max(7, Math.min(60, delaySeconds || 16));
          // Natural random variance (+0% to +45% extra time) + micro-jitter
          const variance = Math.random() * (base * 0.45);
          const jitter = (Math.random() * 2 - 1);
          const safeTotalSec = Math.max(8, Math.round(base + variance + jitter));

          for (let s = safeTotalSec; s > 0; s--) {
            if (!isRunningRef.current) break;
            while (isPausedRef.current) {
              await new Promise(r => setTimeout(r, 500));
              if (!isRunningRef.current) break;
            }
            setNextDelaySeconds(s);
            await new Promise(r => setTimeout(r, 1000));
          }
          setNextDelaySeconds(0);
        }
        if (!isRunningRef.current) break;

        contact.status = 'SENDING';
        onContactsUpdate([...currentList]);

        // Format personalized text for this contact (including Spintax)
        let customizedText = WhatsAppSenderEngine.interpolate(messageTemplate, contact).trim();
        if (includeOptOutFooter && customizedText) {
          customizedText += '\n\nReply STOP to unsubscribe.';
        }
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

        let sendSuccess = false;
        let failureReason = '';
        let msgId = '';

        try {
          const formattedText = WhatsAppSenderEngine.formatMessageUrls(customizedText);

          const payload: any = {
            to: contact.phoneNumber,
            text: formattedText,
            sendTextSeparately: false,
            options: {
              linkPreview: false,
              sendTextSeparately: false
            }
          };

          if (media) {
            const cleanBase64 = media.dataUrl.includes(',') ? media.dataUrl.split(',')[1] : media.dataUrl;
            payload.mediaBase64 = cleanBase64;
            payload.mediaMimeType = media.type;
            payload.fileName = media.name;
            payload.isImage = media.isImage;
          }

          let res = await fetch('/api/whatsapp-service/send', {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(payload)
          });
          let data = await res.json().catch(() => ({}));

          if (res.ok && data.success) {
            sendSuccess = true;
            msgId = data.messageId || '';
          } else {
            sendSuccess = false;
            failureReason = data.error || `HTTP ${res.status}: Delivery rejected`;
          }
        } catch (err: any) {
          sendSuccess = false;
          failureReason = err.message || 'Worker service communication error';
        }

        contact.status = sendSuccess ? 'SENT' : 'FAILED';
        contact.sentAt = new Date().toISOString();
        sentThisRun++;
        onContactsUpdate([...currentList]);

        if (sendSuccess) {
          const updatedUsage = WhatsAppLimitManager.recordDelivery(
            effectiveUserId,
            contact.phoneNumber,
            userLimit,
            effectiveResetHours
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
            message: customizedText || (media ? `[Photo: ${media.name}]` : ''),
            hasAttachment: Boolean(media),
            error: failureReason || undefined,
            messageId: msgId || undefined
          },
          ...prev
        ]);
      }
    } catch (err: any) {
      console.error('Local campaign loop error:', err);
    } finally {
      setIsRunning(false);
      setIsPaused(false);
      isRunningRef.current = false;
      isPausedRef.current = false;

      // Automatically record campaign summary to MongoDB
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
  };

  const handlePauseResume = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsOnBreak(false);
    setBreakSecondsLeft(0);
    setNextDelaySeconds(0);
    skipBreakRef.current = false;
    isRunningRef.current = false;
    isPausedRef.current = false;
  };

  // Upgraded Reset: clears delivery history tracking, clears Live Delivery Status, and reverts contacts to PENDING
  const resetAllStatuses = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsOnBreak(false);
    setBreakSecondsLeft(0);
    setNextDelaySeconds(0);
    skipBreakRef.current = false;
    isRunningRef.current = false;
    isPausedRef.current = false;
    setCurrentIndex(0);
    setLogs([]); // Immediately wipe live delivery status table

    // Clear local deduplication so user can send again
    WhatsAppLimitManager.clearDeliveredNumbers(effectiveUserId);

    // Reset contact statuses to PENDING in state and localStorage
    const reset = contacts.map(c => ({
      ...c,
      status: 'PENDING' as const,
      sentAt: undefined,
      error: undefined
    }));
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
                title="Reset contact statuses so you can send to this list again"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (remainingCount === 0 && total > 0) {
                    if (confirm('All contacts have already received messages!\n\nWould you like to reset all contacts to PENDING so you can send to this list again?')) {
                      resetAllStatuses();
                    }
                    return;
                  }
                  startCampaign();
                }}
                disabled={isPlanExpired}
                title={
                  isPlanExpired
                    ? "Your plan has expired. Please renew your plan to start sending."
                    : remainingCount === 0 && total > 0
                    ? "All contacts delivered. Click to reset and resend."
                    : sentCount > 0
                    ? `Resume sending to remaining ${remainingCount} contacts`
                    : "Start sending messages to customer list"
                }
                className={`px-4 py-1.5 sm:px-5 sm:py-2 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition ${
                  isPlanExpired
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed shadow-none border border-zinc-300/50 dark:border-zinc-700/50'
                    : remainingCount === 0 && total > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer'
                    : 'bg-[#5722AF] hover:bg-[#471a93] text-white shadow-md cursor-pointer'
                }`}
              >
                {remainingCount === 0 && total > 0 ? (
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

      {/* Live Anti-Ban Rest Break / Coffee Break Notice */}
      {isOnBreak && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                <span>🛡️ Anti-Ban Human Rest Break</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-mono">
                  {Math.floor(breakSecondsLeft / 60)}m {breakSecondsLeft % 60}s remaining
                </span>
              </div>
              <p className="text-amber-700 dark:text-amber-300 text-xs mt-0.5">
                Simulating a natural human typing break to keep your WhatsApp account 100% safe from automated detection.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { skipBreakRef.current = true; }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition shrink-0"
          >
            Skip Break (Resume Now)
          </button>
        </div>
      )}

      {/* Live Anti-Ban Sending Notice Banner */}
      {isRunning ? (
        <div className="p-3.5 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <div className="leading-relaxed">
              <strong>Safe Anti-Ban Dispatch in Progress:</strong> Messages sent with real WebSocket typing state, Spintax text variations, and randomized pacing ({Math.max(7, delaySeconds || 16)}s+).
            </div>
          </div>
          {nextDelaySeconds > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-mono text-[11px] font-bold shrink-0 self-start sm:self-auto">
              Next in {nextDelaySeconds}s
            </span>
          )}
        </div>
      ) : (
        <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5722AF] dark:text-purple-400 shrink-0" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Anti-Ban Protection Active:
            </span>
            <span>Real typing presence • Spintax variation • Dynamic {Math.max(7, delaySeconds || 16)}s+ delay • Zero link crawlers</span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">100% Local Browser Engine</span>
        </div>
      )}

      {/* Anti-Ban Opt-Out Toggle Control */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeOptOutFooter}
            onChange={e => setIncludeOptOutFooter(e.target.checked)}
            className="w-4 h-4 rounded text-[#5722AF] accent-[#5722AF] cursor-pointer"
          />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            Anti-Ban Opt-Out Footer:
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px] bg-zinc-100 dark:bg-zinc-700/60 px-1.5 py-0.5 rounded">
            Reply STOP to unsubscribe
          </span>
        </label>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Stops recipients from clicking &quot;Report as Spam&quot;</span>
        </div>
      </div>

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
              className="text-[11px] text-zinc-400 hover:text-rose-600 transition cursor-pointer"
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
                  Image Campaign Notice
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Safe Anti-Ban Browser Dispatch
                </p>
              </div>
            </div>

            <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
              <p>
                Your message will be sent with the photo and caption together as <strong>one single WhatsApp message</strong> with safe anti-ban delays.
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
