import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { WhatsAppCampaignProgress, WhatsAppAudience, Campaign } from '@/lib/mongodb/models';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = getWorkerUserId(req);
    await connectToDatabase();

    // 1. Fetch current progress record from MongoDB
    let dbProgress = await WhatsAppCampaignProgress.findOne({ username: userId }).lean() as any;

    // 2. Try fetching live status from persistent worker
    const serviceUrl = await getWhatsAppServiceUrl(req);
    const serviceSecret = getWhatsAppServiceSecret();

    let workerStatus: any = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${serviceUrl}/campaign/status`, {
        headers: getWorkerHeaders(serviceSecret, userId),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        workerStatus = await res.json();
      }
    } catch (_) {
      // Worker offline or unreachable: fall back to MongoDB state
    }

    // 3. If worker responded, sync worker updates to MongoDB
    if (workerStatus && typeof workerStatus.isRunning === 'boolean') {
      const isNowRunning = workerStatus.isRunning;
      const wasRunning = dbProgress?.isRunning ?? false;

      const updateData: any = {
        isRunning: isNowRunning,
        isPaused: workerStatus.isPaused ?? false,
        status: isNowRunning ? 'running' : (dbProgress?.status === 'running' ? 'completed' : (dbProgress?.status || 'idle')),
        currentIndex: workerStatus.currentIndex ?? dbProgress?.currentIndex ?? 0,
        total: workerStatus.total ?? dbProgress?.total ?? 0,
        sentCount: workerStatus.sentCount ?? dbProgress?.sentCount ?? 0,
        failedCount: workerStatus.failedCount ?? dbProgress?.failedCount ?? 0,
        updatedAt: new Date()
      };

      if (Array.isArray(workerStatus.contacts) && workerStatus.contacts.length > 0) {
        updateData.contacts = workerStatus.contacts;
        // Also update audience contacts in MongoDB
        await WhatsAppAudience.findOneAndUpdate(
          { username: userId },
          { contacts: workerStatus.contacts, updatedAt: new Date() }
        );
      }

      if (Array.isArray(workerStatus.logs)) {
        updateData.logs = workerStatus.logs;
      }

      // If transition from running to finished, mark completed
      if (wasRunning && !isNowRunning) {
        updateData.status = 'completed';
        updateData.completedAt = new Date();

        // Record to campaign history in MongoDB
        try {
          const finalSent = workerStatus.sentCount ?? 0;
          const finalFailed = workerStatus.failedCount ?? 0;
          if (finalSent > 0 || finalFailed > 0) {
            await Campaign.create({
              username: userId,
              businessName: userId,
              campaignName: `Campaign (${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`,
              template: dbProgress?.template || '',
              totalContacts: workerStatus.total || 0,
              successfulMessages: finalSent,
              failedMessages: finalFailed,
              status: 'completed',
              logs: (workerStatus.logs || []).slice(0, 100)
            });
          }
        } catch (histErr) {
          console.warn('[Campaign History Record Error]:', histErr);
        }
      }

      dbProgress = await WhatsAppCampaignProgress.findOneAndUpdate(
        { username: userId },
        updateData,
        { upsert: true, new: true }
      ).lean();
    }

    // 4. Return combined state
    const audienceDoc = await WhatsAppAudience.findOne({ username: userId }).lean() as any;
    const finalContacts = dbProgress?.contacts?.length ? dbProgress.contacts : (audienceDoc?.contacts || []);

    return NextResponse.json({
      success: true,
      isRunning: dbProgress?.isRunning ?? false,
      isPaused: dbProgress?.isPaused ?? false,
      status: dbProgress?.status ?? 'idle',
      total: dbProgress?.total ?? finalContacts.length,
      currentIndex: dbProgress?.currentIndex ?? 0,
      sentCount: dbProgress?.sentCount ?? 0,
      failedCount: dbProgress?.failedCount ?? 0,
      contacts: finalContacts,
      logs: dbProgress?.logs ?? []
    });
  } catch (err: any) {
    console.error('[API Campaign Status Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch campaign status' },
      { status: 500 }
    );
  }
}
