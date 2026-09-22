import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { SystemSetting, User } from '@/lib/mongodb/models';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

import { PlanLimitsConfig, DEFAULT_PLAN_LIMITS } from '@/lib/whatsapp-web/limit-manager';
export type { PlanLimitsConfig };
export { DEFAULT_PLAN_LIMITS };

const SETTING_KEY = 'planLimitsConfig';

// GET: Fetch current plan limits and reset window hours
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const setting = await SystemSetting.findOne({ key: SETTING_KEY }).lean() as any;
    let config: PlanLimitsConfig = { ...DEFAULT_PLAN_LIMITS };

    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        config = {
          trial: Number(parsed.trial) || DEFAULT_PLAN_LIMITS.trial,
          '1_month': Number(parsed['1_month']) || DEFAULT_PLAN_LIMITS['1_month'],
          '3_months': Number(parsed['3_months']) || DEFAULT_PLAN_LIMITS['3_months'],
          '6_months': Number(parsed['6_months']) || DEFAULT_PLAN_LIMITS['6_months'],
          resetHours: Number(parsed.resetHours) || DEFAULT_PLAN_LIMITS.resetHours
        };
      } catch (parseErr) {
        console.warn('[PlanLimits GET] Failed to parse config JSON, using defaults:', parseErr);
      }
    }

    return NextResponse.json({
      success: true,
      limits: config,
      updatedAt: setting?.updatedAt || null
    });
  } catch (err: any) {
    console.error('[PlanLimits GET Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message, limits: DEFAULT_PLAN_LIMITS },
      { status: 500 }
    );
  }
}

// PUT / POST: Admin updates plan limits and reset window
export async function PUT(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { trial, '1_month': oneMonth, '3_months': threeMonths, '6_months': sixMonths, resetHours } = body;

    const newConfig: PlanLimitsConfig = {
      trial: Math.max(1, Number(trial) || DEFAULT_PLAN_LIMITS.trial),
      '1_month': Math.max(1, Number(oneMonth) || DEFAULT_PLAN_LIMITS['1_month']),
      '3_months': Math.max(1, Number(threeMonths) || DEFAULT_PLAN_LIMITS['3_months']),
      '6_months': Math.max(1, Number(sixMonths) || DEFAULT_PLAN_LIMITS['6_months']),
      resetHours: Math.max(1, Math.min(168, Number(resetHours) || DEFAULT_PLAN_LIMITS.resetHours)) // between 1h and 7 days
    };

    await connectToDatabase();

    const updated = await SystemSetting.findOneAndUpdate(
      { key: SETTING_KEY },
      { value: JSON.stringify(newConfig), updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Plan message limits and reset window updated successfully.',
      limits: newConfig,
      updatedAt: updated.updatedAt
    });
  } catch (err: any) {
    console.error('[PlanLimits PUT Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update plan limits.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
