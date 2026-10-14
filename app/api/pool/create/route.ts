import { NextRequest, NextResponse } from 'next/server';
import { createMultiplayerPoolGame } from '@/lib/pool/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const creatorName = body.creatorName || 'Interactive Fiddler';
    const timeControl = typeof body.timeControl === 'number' ? body.timeControl : 30;

    const result = await createMultiplayerPoolGame({
      creatorName,
      timeControl,
    });

    return NextResponse.json({
      success: true,
      gameId: result.gameId,
      playerToken: result.playerToken,
    });
  } catch (err: any) {
    console.error('[API /api/pool/create] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create game room.' },
      { status: 500 }
    );
  }
}
