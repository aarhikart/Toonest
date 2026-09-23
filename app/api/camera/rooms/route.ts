import { NextRequest, NextResponse } from 'next/server';
import { CameraRoomManager } from '@/lib/camera/rooms';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const expirationMinutes = Number(body.expirationMinutes) || 10;
    const requirePin = Boolean(body.requirePin);
    const customPin = typeof body.customPin === 'string' && body.customPin.trim() ? body.customPin.trim() : undefined;

    const room = CameraRoomManager.createRoom({
      expirationMinutes,
      requirePin,
      customPin
    });

    // Auto-join desktop creator
    CameraRoomManager.joinRoom(room.roomId, 'desktop');

    return NextResponse.json({
      success: true,
      roomId: room.roomId,
      pin: room.pin,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
      durationMinutes: room.durationMinutes,
      status: room.status
    });
  } catch (err: any) {
    console.error('[Create Room Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
