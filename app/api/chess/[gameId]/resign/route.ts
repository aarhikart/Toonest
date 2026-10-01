import { NextRequest, NextResponse } from 'next/server';
import { resignGame } from '@/lib/chess/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await req.json().catch(() => ({}));
    const { playerToken } = body;

    if (!playerToken) {
      return NextResponse.json(
        { success: false, error: 'Missing playerToken.' },
        { status: 400 }
      );
    }

    const result = await resignGame({ gameId, playerToken });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to resign.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API /api/chess/[gameId]/resign] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
