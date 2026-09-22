import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { User, UserQuota, SystemSetting } from '@/lib/mongodb/models';
import { WhatsAppLimitManager, DEFAULT_PLAN_LIMITS, PlanLimitsConfig } from '@/lib/whatsapp-web/limit-manager';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    let username = (body.username || '').toLowerCase().trim();

    if (!username) {
      const sessionUser = await getSessionUser(req);
      if (sessionUser?.username) {
        username = sessionUser.username.toLowerCase().trim();
      }
    }

    if (!username) {
      username = 'default';
    }

    const rawPhone = body.phoneNumber || '';
    const normPhone = WhatsAppLimitManager.normalizePhone(rawPhone);

    // 1. Fetch Plan Limits config from DB
    const setting = await SystemSetting.findOne({ key: 'planLimitsConfig' }).lean() as any;
    let planLimits: PlanLimitsConfig = { ...DEFAULT_PLAN_LIMITS };
    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        planLimits = {
          trial: Number(parsed.trial) || DEFAULT_PLAN_LIMITS.trial,
          '1_month': Number(parsed['1_month']) || DEFAULT_PLAN_LIMITS['1_month'],
          '3_months': Number(parsed['3_months']) || DEFAULT_PLAN_LIMITS['3_months'],
          '6_months': Number(parsed['6_months']) || DEFAULT_PLAN_LIMITS['6_months'],
          resetHours: Number(parsed.resetHours) || DEFAULT_PLAN_LIMITS.resetHours
        };
      } catch (_) {}
    }

    // 2. Determine effective limit and reset window
    const userDoc = await User.findOne({ username }).lean() as any;
    const resolvedLimit = WhatsAppLimitManager.getPlanLimit(
      userDoc?.role,
      userDoc?.subscriptionType,
      userDoc?.planType,
      planLimits
    );
    const limit = typeof body.limit === 'number' && body.limit > 0 ? body.limit : resolvedLimit;
    const resetHours = Number(body.resetHours) || planLimits.resetHours;
    const windowMs = Math.max(1, resetHours) * 3600 * 1000;
    const now = Date.now();

    // 3. Find or create quota document
    let quotaDoc = await UserQuota.findOne({ username });
    if (!quotaDoc) {
      quotaDoc = await UserQuota.create({
        username,
        userId: userDoc?._id || undefined,
        campaignStartedAt: new Date(now),
        resetTime: null,
        sentInWindow: 0,
        deliveredNumbers: [],
        updatedAt: new Date(now)
      });
    }

    // 4. If window expired, reset count while retaining deliveredNumbers
    if (quotaDoc.resetTime && now >= new Date(quotaDoc.resetTime).getTime()) {
      quotaDoc.sentInWindow = 0;
      quotaDoc.resetTime = null;
      quotaDoc.campaignStartedAt = new Date(now);
    } else if (!quotaDoc.campaignStartedAt) {
      quotaDoc.campaignStartedAt = new Date(now);
    }

    // 5. Increment sent count and record phone number
    quotaDoc.sentInWindow = (quotaDoc.sentInWindow || 0) + 1;
    if (!Array.isArray(quotaDoc.deliveredNumbers)) {
      quotaDoc.deliveredNumbers = [];
    }
    if (normPhone && !quotaDoc.deliveredNumbers.includes(normPhone)) {
      quotaDoc.deliveredNumbers.push(normPhone);
    }

    // 6. Check if limit is reached
    const sentInWindow = quotaDoc.sentInWindow;
    const remaining = Math.max(0, limit - sentInWindow);
    const isLimitReached = limit < 999999 && remaining <= 0;

    if (isLimitReached) {
      const baseMs = quotaDoc.campaignStartedAt ? new Date(quotaDoc.campaignStartedAt).getTime() : now;
      let calculatedReset = baseMs + windowMs;
      if (calculatedReset <= now) {
        calculatedReset = now + windowMs;
      }
      quotaDoc.resetTime = new Date(calculatedReset);
    } else {
      quotaDoc.resetTime = null;
    }

    quotaDoc.updatedAt = new Date(now);
    await quotaDoc.save();

    const finalResetMs = quotaDoc.resetTime ? new Date(quotaDoc.resetTime).getTime() : null;
    const isResetTimerActive = Boolean(isLimitReached && finalResetMs && finalResetMs > now);

    return NextResponse.json({
      success: true,
      username,
      limit,
      sentInWindow,
      remaining,
      isLimitReached,
      isResetTimerActive,
      resetTime: isResetTimerActive ? finalResetMs : null,
      campaignStartedAt: quotaDoc.campaignStartedAt ? new Date(quotaDoc.campaignStartedAt).getTime() : null,
      deliveredNumbers: quotaDoc.deliveredNumbers,
      timeRemainingStr: isResetTimerActive && finalResetMs ? WhatsAppLimitManager.formatTimeRemaining(finalResetMs) : '',
      resetTimeFormatted: isResetTimerActive && finalResetMs ? WhatsAppLimitManager.formatResetTime(finalResetMs) : '',
      resetDayFormatted: isResetTimerActive && finalResetMs ? WhatsAppLimitManager.formatResetDay(finalResetMs) : ''
    });
  } catch (err: any) {
    console.error('[UserQuota Record Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
