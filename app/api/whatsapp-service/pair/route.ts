import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const serviceUrl = getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();

  try {
    const body = await req.json();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${serviceUrl}/pair`, {
      method: 'POST',
      headers: getWorkerHeaders(serviceSecret),
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to connect to WhatsApp worker at ${serviceUrl}. (Error: ${err.message || 'Connection failed'})`
      },
      { status: 502 }
    );
  }
}
