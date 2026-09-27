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

    const fromPeerId = body.fromPeerId;
    const toPeerId = body.toPeerId || 'all';
    const type = body.type;
    const payload = body.payload;

    if (!fromPeerId || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing fromPeerId or signal type.' },
        { status: 400 }
      );
    }

    const signal = WatchRoomManager.postSignal(roomId, {
      fromPeerId,
      toPeerId,
      type,
      payload,
    });

    if (!signal) {
      return NextResponse.json(
        { success: false, error: 'Failed to post signal. Room may be closed or non-existent.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      signalId: signal.id,
    });
  } catch (err: any) {
    console.error('[API /api/watch-room/[roomId]/signal] POST Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error posting signal.' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { searchParams } = new URL(req.url);
    const peerId = searchParams.get('peerId');
    const afterId = parseInt(searchParams.get('afterId') || '0', 10);

    if (!peerId) {
      return NextResponse.json(
        { success: false, error: 'Missing peerId parameter.' },
        { status: 400 }
      );
    }

    const result = WatchRoomManager.getSignals(roomId, peerId, afterId);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Room not found or expired.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      signals: result.signals,
      room: result.room,
    });
  } catch (err: any) {
    console.error('[API /api/watch-room/[roomId]/signal] GET Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving signals.' },
      { status: 500 }
    );
  }
}
