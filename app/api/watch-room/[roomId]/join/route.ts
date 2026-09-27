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

    const peerId = body.peerId?.trim() || `peer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const displayName = body.displayName?.trim() || 'Friend';
    const isHost = Boolean(body.isHost);

    const result = WatchRoomManager.joinRoom(roomId, peerId, displayName, isHost);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to join room.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      peerId,
      room: result.room,
    });
  } catch (err: any) {
    console.error('[API /api/watch-room/[roomId]/join] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error joining room.' },
      { status: 500 }
    );
  }
}
