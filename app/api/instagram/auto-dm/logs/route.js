import { addLogListener } from '@/lib/automation/autoDmProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  let cleanup = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send connection ping
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            id: `sse-init-${Date.now()}`,
            timestamp: new Date().toTimeString().split(' ')[0],
            type: 'system',
            message: 'SSE Stream Connected',
          })}\n\n`
        )
      );

      cleanup = addLogListener((entry) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(entry)}\n\n`));
        } catch (_) {}
      });
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
