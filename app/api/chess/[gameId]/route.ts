import { NextRequest, NextResponse } from 'next/server';
import { getOrJoinGame } from '@/lib/chess/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { searchParams } = new URL(req.url);
    const playerToken = searchParams.get('token') || req.headers.get('x-player-token') || undefined;
    const joinName = searchParams.get('name') || undefined;

    const result = await getOrJoinGame(gameId, playerToken, joinName);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Game not found or has expired.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      game: result.game,
      playerColor: result.playerColor,
      newToken: result.newToken,
    });
  } catch (err: any) {
    console.error('[API /api/chess/[gameId]] GET Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
