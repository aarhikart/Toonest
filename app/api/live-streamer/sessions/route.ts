import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { LiveStreamSessionModel } from '@/lib/live-streamer/models';

export async function GET() {
  try {
    await connectToDatabase();
    const sessions = await LiveStreamSessionModel.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('streamId youtubeUrl sourceTitle target status scheduledStartTime startedAt stoppedAt createdAt')
      .lean();

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    console.error('[API sessions GET error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
