import { NextRequest, NextResponse } from 'next/server';
import { createMultiplayerGame } from '@/lib/chess/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const creatorColor = body.creatorColor || 'random';
    const timeControl = typeof body.timeControl === 'number' ? body.timeControl : 600;
    const creatorName = (body.creatorName || '').trim() || 'Player 1';

    const result = await createMultiplayerGame({
      creatorColor,
      timeControl,
      creatorName,
    });

    return NextResponse.json({
      success: true,
      gameId: result.gameId,
      playerToken: result.playerToken,
      assignedColor: result.assignedColor,
    });
  } catch (err: any) {
    console.error('[API /api/chess/create] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create game.' },
      { status: 500 }
    );
  }
}
