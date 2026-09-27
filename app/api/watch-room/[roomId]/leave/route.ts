import { NextRequest, NextResponse } from 'next/server';
import { WatchRoomManager } from '@/lib/watch-room/rooms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await req.json().catch(() => ({}));
    const peerId = body.peerId;

    if (!peerId) {
      return NextResponse.json(
        { success: false, error: 'Missing peerId.' },
        { status: 400 }
      );
    }

    const success = WatchRoomManager.leaveRoom(roomId, peerId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('[API /api/watch-room/[roomId]/leave] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error leaving room.' },
      { status: 500 }
    );
  }
}
