import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { UserQuota } from '@/lib/mongodb/models';
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

    const now = new Date();
    let quotaDoc = await UserQuota.findOne({ username });

    if (!quotaDoc) {
      quotaDoc = await UserQuota.create({
        username,
        campaignStartedAt: now,
        resetTime: null,
        sentInWindow: 0,
        deliveredNumbers: [],
        updatedAt: now
      });
    } else {
      // If previous reset window expired, clear window count and reset anchor
      if (quotaDoc.resetTime && now.getTime() >= new Date(quotaDoc.resetTime).getTime()) {
        quotaDoc.sentInWindow = 0;
        quotaDoc.resetTime = null;
        quotaDoc.campaignStartedAt = now;
      } else if (!quotaDoc.campaignStartedAt) {
        quotaDoc.campaignStartedAt = now;
      }
      quotaDoc.updatedAt = now;
      await quotaDoc.save();
    }

    return NextResponse.json({
      success: true,
      campaignStartedAt: quotaDoc.campaignStartedAt ? new Date(quotaDoc.campaignStartedAt).getTime() : null,
      sentInWindow: quotaDoc.sentInWindow || 0
    });
  } catch (err: any) {
    console.error('[UserQuota Start Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
