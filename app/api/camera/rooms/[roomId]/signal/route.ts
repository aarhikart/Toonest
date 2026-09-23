import { NextRequest, NextResponse } from 'next/server';
import { CameraRoomManager, SignalMessage } from '@/lib/camera/rooms';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await req.json().catch(() => ({}));

    if (!body.from || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required signal fields (from, type).' },
        { status: 400 }
      );
    }

    const signal = CameraRoomManager.postSignal(roomId, {
      from: body.from,
      to: body.to,
      type: body.type,
      payload: body.payload
    });

    if (!signal) {
      return NextResponse.json(
        { success: false, error: 'Room not found or expired.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, signalId: signal.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const forPeer = searchParams.get('for') === 'phone' ? 'phone' : 'desktop';
    const afterId = Number(searchParams.get('afterId')) || 0;
    const wait = searchParams.get('wait') === 'true';

    // Immediate check
    let data = CameraRoomManager.getSignals(roomId, forPeer, afterId);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Room not found.' }, { status: 404 });
    }

    // Long poll: if wait requested and no messages yet, wait up to 4.5 seconds for new signals
    if (wait && data.signals.length === 0 && data.roomStatus !== 'expired') {
      const startTime = Date.now();
      while (Date.now() - startTime < 4500) {
        await new Promise(r => setTimeout(r, 200));
        data = CameraRoomManager.getSignals(roomId, forPeer, afterId);
        if (!data || data.signals.length > 0 || data.roomStatus === 'expired') {
          break;
        }
      }
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Room expired or removed.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      signals: data.signals,
      roomStatus: data.roomStatus,
      expiresAt: data.expiresAt,
      timeRemainingMs: data.timeRemainingMs
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
