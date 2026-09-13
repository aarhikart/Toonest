import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const serviceUrl = getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();

  try {
    const body = await req.json();

    if (!body.to) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number (to) is required.' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

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
          ? `WhatsApp worker service is unreachable at ${serviceUrl}.`
          : (err.message || 'Unknown network error communicating with WhatsApp worker.'),
        isWorkerOffline: isOffline
      },
      { status: 503 }
    );
  }
}
