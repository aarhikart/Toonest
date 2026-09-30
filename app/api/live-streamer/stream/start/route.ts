import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import {
  LiveStreamSessionModel,
  ConnectedSocialAccountModel,
  IDestinationConfig,
  StreamTarget,
} from '@/lib/live-streamer/models';

const WORKER_PORT = process.env.STREAMING_WORKER_PORT || '5002';
const WORKER_BASE = `http://localhost:${WORKER_PORT}`;

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    let { streamId, youtubeUrl, target, destinations, scheduledStartTime } = body;

    if (!youtubeUrl || !youtubeUrl.trim()) {
      return NextResponse.json({ success: false, error: 'YouTube Live URL is required' }, { status: 400 });
    }

    if (!target || !['facebook', 'instagram', 'both'].includes(target)) {
      return NextResponse.json({ success: false, error: 'Destination target must be facebook, instagram, or both' }, { status: 400 });
    }

    if (!streamId) {
      streamId = `stream_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // 1. Resolve destination accounts from MongoDB Atlas
    const neededPlatforms = target === 'both' ? ['facebook', 'instagram'] : [target];
    const accounts = await ConnectedSocialAccountModel.find({
      platform: { $in: neededPlatforms },
      isConnected: true,
    }).lean();

    let resolvedDestinations: IDestinationConfig[] = destinations || [];
    if (!resolvedDestinations || resolvedDestinations.length === 0) {
      resolvedDestinations = accounts.map(acc => ({
        platform: acc.platform as 'facebook' | 'instagram',
        rtmpUrl: acc.rtmpUrl,
        streamKey: acc.streamKey,
      }));
    }

    // 2. Automate Live Broadcast Creation for OAuth-Connected Accounts
    for (const dest of resolvedDestinations) {
      const acc = accounts.find(a => a.platform === dest.platform);
      if (acc && acc.accessToken && acc.accountId) {
        // Facebook Auto-Broadcast Creation via Graph API
        if (dest.platform === 'facebook') {
          try {
            const fbRes = await fetch(`https://graph.facebook.com/v19.0/${acc.accountId}/live_videos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'LIVE_NOW',
                title: 'ToolNest Live Broadcast',
                description: 'Streaming live from YouTube via ToolNest',
                access_token: acc.accessToken,
              }),
            });
            const fbData = await fbRes.json();
            if (fbData.secure_stream_url) {
              const parts = fbData.secure_stream_url.split('/');
              dest.streamKey = parts.pop() || dest.streamKey;
              dest.rtmpUrl = parts.join('/') + '/';
              dest.liveVideoId = fbData.id;
            } else if (fbData.error) {
              const errorMsg = fbData.error.error_user_msg || fbData.error.message || 'Meta API live broadcast creation failed.';
              console.warn('[Start Live] Facebook Live API error:', errorMsg);
              if (!dest.streamKey) {
                return NextResponse.json(
                  {
                    success: false,
                    error: `Meta Facebook: ${errorMsg} Please copy your Stream Key from Facebook Live Producer (facebook.com/live/producer) and click "Enter Stream Key" on the Facebook card.`,
                  },
                  { status: 400 }
                );
              }
            }
          } catch (err: any) {
            console.warn('[Start Live] Facebook Live API auto-creation notice:', err.message);
          }
        }

        // Instagram Auto-Broadcast Creation via Instagram Live Media API
        if (dest.platform === 'instagram') {
          try {
            const igRes = await fetch(`https://graph.facebook.com/v19.0/${acc.accountId}/live_media`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                broadcast_type: 'RTMP',
                access_token: acc.accessToken,
              }),
            });
            const igData = await igRes.json();
            if (igData.stream_url && igData.stream_key) {
              dest.rtmpUrl = igData.stream_url;
              dest.streamKey = igData.stream_key;
              dest.liveVideoId = igData.id;
            }
          } catch (err: any) {
            console.warn('[Start Live] Instagram Live API auto-creation notice:', err.message);
          }
        }
      }
    }

    // 3. Validate that endpoints have active Stream Keys or OAuth sessions
    if (target === 'both') {
      const hasFb = resolvedDestinations.some(d => d.platform === 'facebook' && d.streamKey);
      const hasIg = resolvedDestinations.some(d => d.platform === 'instagram' && d.streamKey);
      if (!hasFb || !hasIg) {
        return NextResponse.json(
          {
            success: false,
            error: 'Dual streaming ("Both") requires valid Stream Keys for BOTH Facebook and Instagram. Click "Enter Stream Key" to enter them.',
          },
          { status: 400 }
        );
      }
    } else {
      const hasTarget = resolvedDestinations.some(d => d.platform === target && d.streamKey);
      if (!hasTarget) {
        return NextResponse.json(
          {
            success: false,
            error: `Please enter your ${target === 'facebook' ? 'Facebook' : 'Instagram'} Stream Key by clicking the "Enter Stream Key" button.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Check if this is a scheduled stream
    const scheduledDate = scheduledStartTime ? new Date(scheduledStartTime) : null;
    const isScheduledFuture = scheduledDate && scheduledDate.getTime() > Date.now() + 20000;

    if (isScheduledFuture) {
      const scheduledSession = await LiveStreamSessionModel.findOneAndUpdate(
        { streamId },
        {
          $set: {
            streamId,
            youtubeUrl: youtubeUrl.trim(),
            target: target as StreamTarget,
            destinations: resolvedDestinations,
            scheduledStartTime: scheduledDate,
            status: 'READY',
            logs: [{
              timestamp: new Date(),
              level: 'info',
              message: `Stream scheduled to broadcast on ${scheduledDate.toLocaleString()}`,
            }],
          },
        },
        { upsert: true, new: true }
      ).lean();

      return NextResponse.json({
        success: true,
        streamId,
        scheduled: true,
        scheduledStartTime: scheduledDate,
        status: 'READY',
        message: `Live stream successfully scheduled for ${scheduledDate.toLocaleTimeString()}`,
      });
    }

    // 5. Immediate stream: Check worker daemon availability via HTTP
    let isWorkerReady = false;
    try {
      const healthRes = await fetch(`${WORKER_BASE}/health`, { signal: AbortSignal.timeout(2500) });
      if (healthRes.ok) isWorkerReady = true;
    } catch (_) {}

    if (!isWorkerReady) {
      return NextResponse.json(
        {
          success: false,
          error: `Streaming worker daemon is offline on port ${WORKER_PORT}. Please double-click "start-streaming-worker.bat" or run "npm run streaming:worker" in your project directory.`,
          workerOffline: true,
        },
        { status: 503 }
      );
    }

    // 6. Create session in MongoDB Atlas
    await LiveStreamSessionModel.findOneAndUpdate(
      { streamId },
      {
        $set: {
          streamId,
          youtubeUrl: youtubeUrl.trim(),
          target: target as StreamTarget,
          destinations: resolvedDestinations,
          status: 'STARTING',
          startedAt: new Date(),
          logs: [{
            timestamp: new Date(),
            level: 'info',
            message: `Initiating live broadcast from YouTube to ${target}`,
          }],
        },
      },
      { upsert: true, new: true }
    );

    // 7. Dispatch start to worker daemon
    const workerRes = await fetch(`${WORKER_BASE}/api/stream/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamId,
        youtubeUrl: youtubeUrl.trim(),
        target,
        destinations: resolvedDestinations,
      }),
    });

    const workerData = await workerRes.json();
    if (!workerRes.ok || workerData.error) {
      await LiveStreamSessionModel.updateOne(
        { streamId },
        {
          $set: {
            status: 'ERROR',
            errorMessage: workerData.error || 'Failed to start stream worker',
          },
        }
      );
      return NextResponse.json(
        { success: false, error: workerData.error || 'Streaming worker failed to start process' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      streamId,
      status: 'STARTING',
      sourceTitle: workerData.sourceTitle || 'YouTube Live Source',
      message: 'Live broadcast created & initializing...',
    });
  } catch (error: any) {
    console.error('[API stream/start error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
