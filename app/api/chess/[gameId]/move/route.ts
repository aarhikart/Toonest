import { NextRequest, NextResponse } from 'next/server';
import { makeServerMove } from '@/lib/chess/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await req.json().catch(() => ({}));
    const { playerToken, from, to, promotion } = body;

    if (!playerToken || !from || !to) {
      return NextResponse.json(
        { success: false, error: 'Missing required move fields (token, from, to).' },
        { status: 400 }
      );
    }

    const result = await makeServerMove({
      gameId,
      playerToken,
      from,
      to,
      promotion,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Move rejected.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      game: result.game,
    });
  } catch (err: any) {
    console.error('[API /api/chess/[gameId]/move] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error making move.' },
      { status: 500 }
    );
  }
}
