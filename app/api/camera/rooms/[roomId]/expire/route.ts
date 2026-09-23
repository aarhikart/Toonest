import { NextRequest, NextResponse } from 'next/server';
import { CameraRoomManager } from '@/lib/camera/rooms';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const success = CameraRoomManager.expireRoom(roomId);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
