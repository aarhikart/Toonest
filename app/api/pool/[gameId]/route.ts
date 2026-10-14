import { NextRequest, NextResponse } from 'next/server';
import { getOrJoinPoolGame } from '@/lib/pool/gameService';

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
    const joinName = searchParams.get('name') || 'Vivid Reindeer';

    const result = await getOrJoinPoolGame(gameId, playerToken, joinName);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Game room not found or has expired.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      game: result.game,
      playerRole: result.playerRole,
      newToken: result.newToken,
    });
  } catch (err: any) {
    console.error('[API /api/pool/[gameId]] GET Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
