import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { WhatsAppAudience, WhatsAppCampaignProgress, UserQuota } from '@/lib/mongodb/models';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = (body?.userId && typeof body.userId === 'string' && body.userId.trim() !== 'default')
      ? body.userId.trim().toLowerCase()
      : getWorkerUserId(req);
    await connectToDatabase();

    // 1. Reset all contacts in WhatsAppAudience to PENDING without deleting them
    const audience = await WhatsAppAudience.findOne({ username: userId });
    let resetContacts: any[] = [];
    if (audience && Array.isArray(audience.contacts)) {
      audience.contacts = audience.contacts.map((c: any) => ({
        id: c.id,
        name: c.name,
        phoneNumber: c.phoneNumber,
        status: 'PENDING',
        sentAt: undefined,
        error: undefined
      }));
      audience.updatedAt = new Date();
      await audience.save();
      resetContacts = audience.contacts;
    }

    // 2. Clear deliveredNumbers in UserQuota so deduplication allows re-sending
    await UserQuota.findOneAndUpdate(
      { username: userId },
      { deliveredNumbers: [], updatedAt: new Date() }
    );

    // 3. Reset campaign progress record
    await WhatsAppCampaignProgress.findOneAndUpdate(
      { username: userId },
      {
        isRunning: false,
        isPaused: false,
        status: 'idle',
        currentIndex: 0,
        sentCount: 0,
        failedCount: 0,
        contacts: resetContacts,
        logs: [],
        updatedAt: new Date()
      },
      { upsert: true }
    );

    // 4. Reset worker campaign state if reachable
    try {
      const serviceUrl = await getWhatsAppServiceUrl(req);
      const serviceSecret = getWhatsAppServiceSecret();
      await fetch(`${serviceUrl}/campaign/stop`, {
        method: 'POST',
        headers: getWorkerHeaders(serviceSecret, userId),
        body: JSON.stringify({ userId })
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Campaign progress and contact statuses reset to PENDING. You can now re-send to all contacts.',
      contacts: resetContacts
    });
  } catch (err: any) {
    console.error('[API Campaign Reset Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to reset campaign' },
      { status: 500 }
    );
  }
}
