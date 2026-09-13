import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';
  const serviceSecret = process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';

  try {
    const body = await req.json();

    if (!body.to) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number (to) is required.' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${serviceUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': serviceSecret
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    const isOffline = err.name === 'AbortError' || err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed');
    return NextResponse.json(
      {
        success: false,
        error: isOffline
          ? 'Persistent WhatsApp worker daemon is offline or unreachable on port 5001.'
          : (err.message || 'Unknown network error communicating with WhatsApp worker.'),
        isWorkerOffline: isOffline
      },
      { status: 503 }
    );
  }
}
