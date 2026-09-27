import { NextRequest, NextResponse } from 'next/server';
import { cleanupSession } from '@/lib/video-metadata/storage';
import { clearCleaningProgress } from '@/lib/video-metadata/ffmpeg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
  }

  cleanupSession(id);
  clearCleaningProgress(id);

  return NextResponse.json({ success: true, message: 'Session cleaned up.' });
}
