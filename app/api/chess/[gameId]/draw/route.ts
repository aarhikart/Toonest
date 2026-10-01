import { NextRequest, NextResponse } from 'next/server';
import { handleDraw } from '@/lib/chess/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await req.json().catch(() => ({}));
    const { playerToken, action } = body;

    if (!playerToken || !['offer', 'accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid draw action or missing token.' },
        { status: 400 }
      );
    }

    const result = await handleDraw({ gameId, playerToken, action });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to process draw.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API /api/chess/[gameId]/draw] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
