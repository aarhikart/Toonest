import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { User, UserQuota, SystemSetting } from '@/lib/mongodb/models';
import { WhatsAppLimitManager, DEFAULT_PLAN_LIMITS, PlanLimitsConfig } from '@/lib/whatsapp-web/limit-manager';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;
    let username = (searchParams.get('username') || '').toLowerCase().trim();

    // If username is not provided, try to extract from session
    if (!username) {
      const sessionUser = await getSessionUser(req);
      if (sessionUser?.username) {
        username = sessionUser.username.toLowerCase().trim();
      }
    }

    if (!username) {
      username = 'default';
    }

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

    // 2. Fetch User account to determine plan and role
    const userDoc = await User.findOne({ username }).lean() as any;
    const resolvedLimit = WhatsAppLimitManager.getPlanLimit(
      userDoc?.role,
      userDoc?.subscriptionType,
      userDoc?.planType,
      planLimits
    );
    const paramLimit = Number(searchParams.get('limit'));
    const userLimit = paramLimit > 0 ? paramLimit : resolvedLimit;

    const resetHours = Number(searchParams.get('resetHours')) || planLimits.resetHours;
    const windowMs = Math.max(1, resetHours) * 3600 * 1000;
    const now = Date.now();

    // 3. Find or create UserQuota document
    let quotaDoc = await UserQuota.findOne({ username });
    if (!quotaDoc) {
      quotaDoc = await UserQuota.create({
        username,
        userId: userDoc?._id || undefined,
        campaignStartedAt: null,
        resetTime: null,
        sentInWindow: 0,
        deliveredNumbers: [],
        updatedAt: new Date()
      });
    }

    let modified = false;

    // 4. Check if reset window has expired
    if (quotaDoc.resetTime && now >= new Date(quotaDoc.resetTime).getTime()) {
      quotaDoc.campaignStartedAt = null;
      quotaDoc.resetTime = null;
      quotaDoc.sentInWindow = 0;
      modified = true;
    }

    const sentInWindow = Math.max(0, quotaDoc.sentInWindow || 0);
    const remaining = Math.max(0, userLimit - sentInWindow);
    const isLimitReached = userLimit < 999999 && remaining <= 0;

    // 5. If limit is reached, ensure resetTime is set
    const currentResetTimeMs = quotaDoc.resetTime ? new Date(quotaDoc.resetTime).getTime() : null;
    if (isLimitReached && !currentResetTimeMs) {
      const baseMs = quotaDoc.campaignStartedAt ? new Date(quotaDoc.campaignStartedAt).getTime() : now;
      let calculatedReset = baseMs + windowMs;
      if (calculatedReset <= now) {
        calculatedReset = now + windowMs;
      }
      quotaDoc.resetTime = new Date(calculatedReset);
      modified = true;
    } else if (!isLimitReached && currentResetTimeMs) {
      quotaDoc.resetTime = null;
      modified = true;
    }

    if (modified) {
      quotaDoc.updatedAt = new Date();
      await quotaDoc.save();
    }

    const finalResetMs = quotaDoc.resetTime ? new Date(quotaDoc.resetTime).getTime() : null;
    const isResetTimerActive = Boolean(isLimitReached && finalResetMs && finalResetMs > now);
    const deliveredNumbers = Array.isArray(quotaDoc.deliveredNumbers) ? quotaDoc.deliveredNumbers : [];

    return NextResponse.json({
      success: true,
      username,
      limit: userLimit,
      sentInWindow,
      remaining,
      isLimitReached,
      isResetTimerActive,
      resetTime: isResetTimerActive ? finalResetMs : null,
      campaignStartedAt: quotaDoc.campaignStartedAt ? new Date(quotaDoc.campaignStartedAt).getTime() : null,
      deliveredNumbers,
      timeRemainingStr: isResetTimerActive && finalResetMs ? WhatsAppLimitManager.formatTimeRemaining(finalResetMs) : '',
      resetTimeFormatted: isResetTimerActive && finalResetMs ? WhatsAppLimitManager.formatResetTime(finalResetMs) : '',
      resetDayFormatted: isResetTimerActive && finalResetMs ? WhatsAppLimitManager.formatResetDay(finalResetMs) : ''
    });
  } catch (err: any) {
    console.error('[UserQuota GET Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
