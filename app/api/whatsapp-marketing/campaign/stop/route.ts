import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { WhatsAppCampaignProgress } from '@/lib/mongodb/models';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = getWorkerUserId(req);
    await connectToDatabase();

    // 1. Tell worker to stop
    const serviceUrl = await getWhatsAppServiceUrl(req);
    const serviceSecret = getWhatsAppServiceSecret();

    try {
      await fetch(`${serviceUrl}/campaign/stop`, {
        method: 'POST',
        headers: getWorkerHeaders(serviceSecret, userId),
        body: JSON.stringify({ userId })
      });
    } catch (_) {}

    // 2. Update MongoDB progress record
    await WhatsAppCampaignProgress.findOneAndUpdate(
      { username: userId },
      {
        isRunning: false,
        isPaused: false,
        status: 'stopped',
        updatedAt: new Date()
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Campaign stopped successfully'
    });
  } catch (err: any) {
    console.error('[API Campaign Stop Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to stop campaign' },
      { status: 500 }
    );
  }
}
