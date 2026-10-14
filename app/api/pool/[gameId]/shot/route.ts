import { NextRequest, NextResponse } from 'next/server';
import { recordPoolShot } from '@/lib/pool/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await req.json().catch(() => ({}));

    const playerToken = body.playerToken || req.headers.get('x-player-token');
    if (!playerToken) {
      return NextResponse.json(
        { success: false, error: 'Player token required.' },
        { status: 401 }
      );
    }

    if (!body.shot) {
      return NextResponse.json(
        { success: false, error: 'Shot parameters required.' },
        { status: 400 }
      );
    }

    const result = await recordPoolShot({
      gameId,
      playerToken,
      shot: body.shot,
      resultingBalls: body.resultingBalls,
      pocketedDelta: body.pocketedDelta,
      nextTurn: body.nextTurn,
      winner: body.winner,
      winnerReason: body.winnerReason,
      player1Group: body.player1Group,
      player2Group: body.player2Group,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      game: result.game,
    });
  } catch (err: any) {
    console.error('[API /api/pool/[gameId]/shot] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to submit shot.' },
      { status: 500 }
    );
  }
}
