import { NextRequest, NextResponse } from 'next/server';
import { WatchRoomManager } from '@/lib/watch-room/rooms';
import { StreamingPlatform } from '@/lib/watch-room/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roomId = body.roomId?.trim();
    const hostName = body.hostName?.trim() || 'Host';
    const hostPeerId = body.hostPeerId?.trim() || `host_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const platform = (body.platform as StreamingPlatform) || 'other';
    const title = body.title?.trim();

    const room = await WatchRoomManager.createRoom({
      roomId,
      hostName,
      hostPeerId,
      platform,
      title,
    });

    return NextResponse.json({
      success: true,
      roomId: room.roomId,
      hostPeerId: room.hostPeerId,
      room,
    });
  } catch (err: any) {
    console.error('[API /api/watch-room/create] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create watch room.' },
      { status: 500 }
    );
  }
}
