import { NextRequest, NextResponse } from 'next/server';
import { getCuttingProgress } from '@/lib/video-cutter/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const progress = getCuttingProgress(sessionId);

    if (!progress) {
      return NextResponse.json({
        success: true,
        progress: {
          sessionId,
          stage: 'idle',
          percent: 0,
          message: 'Waiting...',
          updatedAt: Date.now(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch progress.' },
      { status: 500 }
    );
  }
}
