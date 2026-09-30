import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { LiveStreamSessionModel } from '@/lib/live-streamer/models';

const WORKER_PORT = process.env.STREAMING_WORKER_PORT || '5002';
const WORKER_BASE = `http://localhost:${WORKER_PORT}`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let streamId = searchParams.get('streamId');

    await connectToDatabase();

    // If streamId not passed, find the most recent session
    if (!streamId) {
      const latest = await LiveStreamSessionModel.findOne({})
        .sort({ createdAt: -1 })
        .lean();
      if (latest) {
        streamId = latest.streamId;
      }
    }

    // Check worker status
    let workerOnline = false;
    let workerData: any = null;

    try {
      const healthRes = await fetch(`${WORKER_BASE}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      if (healthRes.ok) {
        workerOnline = true;
        if (streamId) {
          const statusRes = await fetch(`${WORKER_BASE}/api/stream/status/${streamId}`, {
            signal: AbortSignal.timeout(2000),
          });
          if (statusRes.ok) {
            workerData = await statusRes.json();
          }
        }
      }
    } catch (e) {
      workerOnline = false;
    }

    if (!streamId) {
      return NextResponse.json({
        success: true,
        session: null,
        workerOnline,
        message: 'No stream sessions found.',
      });
    }

    // Query session from MongoDB Atlas
    const dbSession = await LiveStreamSessionModel.findOne({ streamId }).lean();

    if (!dbSession && !workerData) {
      return NextResponse.json(
        { success: false, error: 'Stream session not found', workerOnline },
        { status: 404 }
      );
    }

    // Combine worker live metrics with DB record
    const status = workerData?.status || dbSession?.status || 'READY';
    const health = workerData?.health || dbSession?.health || {
      status: 'idle',
      fps: 0,
      bitrate: '0kbits/s',
      duration: '00:00:00',
      speed: '0x',
      droppedFrames: 0,
    };
    const logs = workerData?.logs || dbSession?.logs || [];
    const sourceTitle = workerData?.sourceTitle || dbSession?.sourceTitle || 'YouTube Live Source';

    return NextResponse.json({
      success: true,
      workerOnline,
      session: {
        streamId,
        youtubeUrl: dbSession?.youtubeUrl || '',
        sourceTitle,
        target: dbSession?.target || 'both',
        destinations: dbSession?.destinations || [],
        scheduledStartTime: dbSession?.scheduledStartTime || null,
        status,
        health,
        startedAt: dbSession?.startedAt || null,
        stoppedAt: dbSession?.stoppedAt || null,
        errorMessage: dbSession?.errorMessage || '',
        logs,
      },
    });
  } catch (error: any) {
    console.error('[API stream/status error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
