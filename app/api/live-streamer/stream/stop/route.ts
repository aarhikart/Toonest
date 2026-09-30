import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { LiveStreamSessionModel, ConnectedSocialAccountModel } from '@/lib/live-streamer/models';

const WORKER_PORT = process.env.STREAMING_WORKER_PORT || '5002';
const WORKER_BASE = `http://localhost:${WORKER_PORT}`;

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { streamId } = body;

    if (!streamId) {
      return NextResponse.json({ success: false, error: 'streamId is required' }, { status: 400 });
    }

    // 1. Fetch active session details to end API broadcasts
    const session = await LiveStreamSessionModel.findOne({ streamId });

    if (session && session.destinations) {
      for (const dest of session.destinations) {
        if (dest.liveVideoId) {
          const acc = await ConnectedSocialAccountModel.findOne({ platform: dest.platform });
          if (acc && acc.accessToken) {
            // End Facebook Live Video
            if (dest.platform === 'facebook') {
              try {
                await fetch(`https://graph.facebook.com/v19.0/${dest.liveVideoId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    end_live_video: true,
                    access_token: acc.accessToken,
                  }),
                });
              } catch (e: any) {
                console.warn('[Stop Live] Facebook Live API end notice:', e.message);
              }
            }

            // End Instagram Live Media
            if (dest.platform === 'instagram') {
              try {
                await fetch(`https://graph.facebook.com/v19.0/${dest.liveVideoId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    status: 'END',
                    access_token: acc.accessToken,
                  }),
                });
              } catch (e: any) {
                console.warn('[Stop Live] Instagram Live API end notice:', e.message);
              }
            }
          }
        }
      }
    }

    // 2. Notify worker daemon to terminate FFmpeg process
    let workerNotified = false;
    try {
      const res = await fetch(`${WORKER_BASE}/api/stream/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId }),
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) workerNotified = true;
    } catch (e: any) {
      console.warn('[API stream/stop] Worker daemon unreachable:', e.message);
    }

    // 3. Update MongoDB Atlas session state
    await LiveStreamSessionModel.updateOne(
      { streamId },
      {
        $set: {
          status: 'STOPPED',
          stoppedAt: new Date(),
          'health.status': 'idle',
        },
        $push: {
          logs: {
            timestamp: new Date(),
            level: 'info',
            message: 'Stream stopped and live broadcasts finalized via API.',
          },
        },
      }
    );

    return NextResponse.json({
      success: true,
      streamId,
      status: 'STOPPED',
      workerNotified,
      message: 'Live stream stopped and broadcasts finalized.',
    });
  } catch (error: any) {
    console.error('[API stream/stop error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
