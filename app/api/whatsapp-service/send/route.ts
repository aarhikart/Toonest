import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const serviceUrl = await getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();
  const userId = getWorkerUserId(req);

  try {
    const body = await req.json();

    if (!body.to) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number (to) is required.' },
        { status: 400 }
      );
    }

    // Server-side daily message quota verification across devices
    if (userId && userId !== 'default') {
      try {
        const { connectToDatabase } = await import('@/lib/mongodb/client');
        const { User, UserQuota, SystemSetting } = await import('@/lib/mongodb/models');
        const { WhatsAppLimitManager, DEFAULT_PLAN_LIMITS } = await import('@/lib/whatsapp-web/limit-manager');
        await connectToDatabase();

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
            planLimits
          );

          const quotaDoc = await UserQuota.findOne({ username: userId });
          const now = Date.now();
          if (quotaDoc) {
            const resetTimeMs = quotaDoc.resetTime ? new Date(quotaDoc.resetTime).getTime() : null;
            if (resetTimeMs && now >= resetTimeMs) {
              // Expired window, reset in database
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
                  error: `Message quota of ${userLimit} messages reached for this window. You can send messages again on ${resetStr}${timeStr}.`,
                  isLimitReached: true,
                  resetTime: resetTimeMs
                },
                { status: 429 }
              );
            }
          }
        }
      } catch (quotaErr) {
        console.warn('[Send Quota Check Warning]:', quotaErr);
      }
    }

    const trySend = async (url: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const res = await fetch(`${url}/send`, {
          method: 'POST',
          headers: getWorkerHeaders(serviceSecret, userId),
          body: JSON.stringify({ ...body, userId }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        return res;
      } catch (e) {
        clearTimeout(timeout);
        throw e;
      }
    };

    let res: Response;
    try {
      res = await trySend(serviceUrl);
    } catch (err: any) {
      const isLocalHostAllowed = !process.env.VERCEL && !process.env.AWS_REGION && serviceUrl !== 'http://localhost:5001';
      if (isLocalHostAllowed) {
        try {
          res = await trySend('http://localhost:5001');
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const rawText = await res.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {
        success: false,
        error: res.status === 502 || res.status === 504 || rawText.includes('<!DOCTYPE')
          ? `WhatsApp local worker daemon is offline on port 5001 (Gateway returned ${res.status}). Please start the worker.`
          : `Unexpected worker response (${res.status}): ${rawText.substring(0, 100)}`
      };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    const isOffline = err.name === 'AbortError' || err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed');
    return NextResponse.json(
      {
        success: false,
        error: isOffline
          ? `WhatsApp worker service is unreachable at ${serviceUrl}.`
          : (err.message || 'Unknown network error communicating with WhatsApp worker.'),
        isWorkerOffline: isOffline
      },
      { status: 503 }
    );
  }
}
