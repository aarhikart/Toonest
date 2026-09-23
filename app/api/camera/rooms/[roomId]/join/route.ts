import { NextRequest, NextResponse } from 'next/server';
import { CameraRoomManager } from '@/lib/camera/rooms';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await req.json().catch(() => ({}));
    const peerType = body.peerType === 'desktop' ? 'desktop' : 'phone';
    const pin = typeof body.pin === 'string' ? body.pin : undefined;

    const result = CameraRoomManager.joinRoom(roomId, peerType, pin);

    if (!result.success || !result.room) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to join room.' },
        { status: 400 }
      );
    }

    const room = result.room;
    return NextResponse.json({
      success: true,
      roomId: room.roomId,
      peerType,
      status: room.status,
      expiresAt: room.expiresAt,
      timeRemainingMs: Math.max(0, room.expiresAt - Date.now())
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
