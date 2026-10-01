import { NextRequest } from 'next/server';
import { subscribeToGameEvents } from '@/lib/chess/gameService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  let unsubscribe: (() => void) | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Initial connection established message
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Subscribe to real-time events for this game
      unsubscribe = subscribeToGameEvents(gameId, (event) => {
        try {
          const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (e) {
          // Stream might be closed
        }
      });

      // Keep-alive ping every 15s to keep connection open through proxies/NAT
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 15000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
