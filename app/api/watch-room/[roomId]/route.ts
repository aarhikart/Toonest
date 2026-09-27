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
    const searchParams = req.nextUrl.searchParams;
    const platform = (searchParams.get('platform') as any) || undefined;
    const title = searchParams.get('title') || undefined;
    const host = searchParams.get('host') || undefined;

    // Retrieve or auto-provision room so valid room links NEVER 404
    const room = await WatchRoomManager.getOrCreateRoom(roomId, {
      platform,
      title,
      hostName: host,
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Invalid room code format. Please check your link.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (err: any) {
    console.error('[API /api/watch-room/[roomId]] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving room.' },
      { status: 500 }
    );
  }
}
