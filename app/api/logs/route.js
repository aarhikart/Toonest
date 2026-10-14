import { getLogs, subscribeToLogs } from '@/lib/automation/processManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') || null;

  const encoder = new TextEncoder();
  let cleanupListener = null;
  let heartbeatTimer = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial historical logs from memory ring buffer
      try {
        const initialLogs = getLogs(accountId, 150);
        for (const log of initialLogs) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(log)}\n\n`));
        }
      } catch (err) {
        console.error('[LogsRoute] Error sending initial logs:', err);
      }

      // 2. Subscribe to new real-time log broadcasts
      cleanupListener = subscribeToLogs((logEntry) => {
        if (!accountId || logEntry.accountId === accountId) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(logEntry)}\n\n`));
          } catch (_) {}
        }
      });

      // 3. Keep connection active with 15s heartbeat
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (_) {}
      }, 15000);
    },
    cancel() {
      if (cleanupListener) cleanupListener();
      if (heartbeatTimer) clearInterval(heartbeatTimer);
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
