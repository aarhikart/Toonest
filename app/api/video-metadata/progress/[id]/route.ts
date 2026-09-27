import { NextRequest, NextResponse } from 'next/server';
import { getCleaningProgress } from '@/lib/video-metadata/ffmpeg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
  }

  const progress = getCleaningProgress(id);
  if (!progress) {
    return NextResponse.json({
      sessionId: id,
      status: 'idle',
      percent: 0,
      currentTimeSeconds: 0,
      totalDurationSeconds: 0,
      speed: '0x',
      fps: '0',
    });
  }

  return NextResponse.json(progress);
}
