import { NextRequest, NextResponse } from 'next/server';
import { CameraRoomManager } from '@/lib/camera/rooms';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = CameraRoomManager.getRoom(roomId);

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found.' }, { status: 404 });
    }

    const now = Date.now();
    const isExpired = now >= room.expiresAt;

    return NextResponse.json({
      success: true,
      roomId: room.roomId,
      requiresPin: Boolean(room.pin),
      status: isExpired ? 'expired' : room.status,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
      timeRemainingMs: Math.max(0, room.expiresAt - now),
      hasPhonePeer: Boolean(room.phonePeer)
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
