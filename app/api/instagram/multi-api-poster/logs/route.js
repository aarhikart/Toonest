import { addLogListener, getMultiPosterStatus } from '@/lib/automation/multiApiPosterProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send historical logs first
      const status = getMultiPosterStatus();
      if (status.logs && status.logs.length > 0) {
        for (const line of status.logs) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'log', line })}\n\n`));
        }
      }

      // Stream live logs
      const unsubscribe = addLogListener((line) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'log', line })}\n\n`));
        } catch (_) {}
      });

      // Keepalive heartbeat every 15s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (_) {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 15000);

      // Clean up when client disconnects
      return () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
