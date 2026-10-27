import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { WhatsAppCampaignProgress } from '@/lib/mongodb/models';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = (body?.userId && typeof body.userId === 'string' && body.userId.trim() !== 'default')
      ? body.userId.trim().toLowerCase()
      : getWorkerUserId(req);

    await connectToDatabase();

    const serviceUrl = await getWhatsAppServiceUrl(req);
    const serviceSecret = getWhatsAppServiceSecret();

    let isPaused = false;
    try {
      const res = await fetch(`${serviceUrl}/campaign/pause`, {
        method: 'POST',
        headers: getWorkerHeaders(serviceSecret, userId),
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        isPaused = data.isPaused ?? false;
      }
    } catch (_) {}

    const updated = await WhatsAppCampaignProgress.findOneAndUpdate(
      { username: userId },
      { isPaused, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      isPaused: updated?.isPaused ?? isPaused
    });
  } catch (err: any) {
    console.error('[API Campaign Pause Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to pause campaign' },
      { status: 500 }
    );
  }
}
