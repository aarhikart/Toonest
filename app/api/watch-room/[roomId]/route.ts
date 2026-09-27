import { NextRequest, NextResponse } from 'next/server';
import { WatchRoomManager } from '@/lib/watch-room/rooms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = WatchRoomManager.getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Watch Room not found. Please verify the link or code.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room: WatchRoomManager.serializeRoom(room),
    });
  } catch (err: any) {
    console.error('[API /api/watch-room/[roomId]] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving room.' },
      { status: 500 }
    );
  }
}
