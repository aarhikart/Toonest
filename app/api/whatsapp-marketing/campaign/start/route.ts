import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { User, UserQuota, SystemSetting, WhatsAppAudience, WhatsAppCampaignProgress } from '@/lib/mongodb/models';
import { WhatsAppLimitManager, DEFAULT_PLAN_LIMITS } from '@/lib/whatsapp-web/limit-manager';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';
import { WhatsAppSenderEngine } from '@/lib/whatsapp-web/sender';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = getWorkerUserId(req);
    const body = await req.json();
    const { contacts, template, delaySeconds = 7, media, sendTextSeparately } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer list is empty. Add contacts before starting campaign.' },
        { status: 400 }
      );
    }

    if (!template?.trim() && !media) {
      return NextResponse.json(
        { success: false, error: 'Message text or attachment is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check user quota (admin is exempt)
    if (userId && userId !== 'default') {
      const userDoc = await User.findOne({ username: userId }).lean() as any;
      if (userDoc?.role !== 'admin') {
        const setting = await SystemSetting.findOne({ key: 'planLimitsConfig' }).lean() as any;
        let planLimits = { ...DEFAULT_PLAN_LIMITS };
        if (setting?.value) {
          try { planLimits = { ...planLimits, ...JSON.parse(setting.value) }; } catch (_) {}
        }
        const userLimit = WhatsAppLimitManager.getPlanLimit(
          userDoc?.role,
          userDoc?.subscriptionType,
          userDoc?.planType,
          planLimits,
          userDoc?.customDailyLimit,
          userDoc?.customLimitEnabled
        );

        const quotaDoc = await UserQuota.findOne({ username: userId });
        const now = Date.now();
        if (quotaDoc) {
          const resetTimeMs = quotaDoc.resetTime ? new Date(quotaDoc.resetTime).getTime() : null;
          if (resetTimeMs && now >= resetTimeMs) {
            quotaDoc.sentInWindow = 0;
            quotaDoc.resetTime = null;
            quotaDoc.campaignStartedAt = null;
            quotaDoc.updatedAt = new Date();
            await quotaDoc.save();
          } else if (userLimit < 999999 && (quotaDoc.sentInWindow || 0) >= userLimit) {
            const resetStr = resetTimeMs ? WhatsAppLimitManager.formatResetTime(resetTimeMs) : 'soon';
            const timeStr = resetTimeMs ? ` (in ${WhatsAppLimitManager.formatTimeRemaining(resetTimeMs)})` : '';
            return NextResponse.json(
              {
                success: false,
                error: `Message limit of ${userLimit} reached. You can send again on ${resetStr}${timeStr}.`,
                isLimitReached: true,
                resetTime: resetTimeMs
              },
              { status: 429 }
            );
          }
        }
      }
    }

    // Save/update customer list in WhatsAppAudience
    await WhatsAppAudience.findOneAndUpdate(
      { username: userId },
      { username: userId, contacts, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Save campaign progress record in MongoDB
    await WhatsAppCampaignProgress.findOneAndUpdate(
      { username: userId },
      {
        username: userId,
        isRunning: true,
        isPaused: false,
        status: 'running',
        total: contacts.length,
        currentIndex: 0,
        sentCount: contacts.filter((c: any) => c.status === 'SENT').length,
        failedCount: contacts.filter((c: any) => c.status === 'FAILED').length,
        delaySeconds: Math.max(7, Math.min(60, Number(delaySeconds) || 7)),
        template: template || '',
        media: media || null,
        contacts,
        logs: [],
        startedAt: new Date(),
        completedAt: null,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Prepare media for worker
    let mediaPayload: any = null;
    if (media && media.dataUrl) {
      mediaPayload = {
        mediaBase64: media.dataUrl.split(',')[1] || media.dataUrl,
        mediaMimeType: media.type,
        fileName: media.name,
        isImage: media.isImage
      };
    }

    // Dispatch campaign to persistent worker
    const serviceUrl = await getWhatsAppServiceUrl(req);
    const serviceSecret = getWhatsAppServiceSecret();

    const workerPayload: any = {
      userId,
      contacts,
      template: WhatsAppSenderEngine.formatMessageUrls(template || ''),
      delaySeconds: Math.max(7, Math.min(60, Number(delaySeconds) || 7)),
      sendTextSeparately: sendTextSeparately ?? true,
      ...(mediaPayload || {})
    };

    try {
      const workerRes = await fetch(`${serviceUrl}/campaign/start`, {
        method: 'POST',
        headers: getWorkerHeaders(serviceSecret, userId),
        body: JSON.stringify(workerPayload)
      });
      const workerData = await workerRes.json().catch(() => ({}));
      if (!workerRes.ok) {
        throw new Error(workerData.error || `Worker returned HTTP ${workerRes.status}`);
      }
    } catch (workerErr: any) {
      console.warn('[Campaign Start Worker Warning]:', workerErr.message);
      // Even if worker gateway returned warning, progress is saved in MongoDB and can be retried
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk campaign started in background. You can safely close or refresh this tab.',
      total: contacts.length
    });
  } catch (err: any) {
    console.error('[API Campaign Start Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to start campaign' },
      { status: 500 }
    );
  }
}
