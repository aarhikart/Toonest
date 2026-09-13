import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const serviceUrl = getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();

  try {
    const res = await fetch(`${serviceUrl}/campaign/status`, {
      headers: { 'x-service-key': serviceSecret }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      isRunning: false,
      total: 0,
      sentCount: 0,
      failedCount: 0,
      logs: []
    });
  }
}

export async function POST(req: NextRequest) {
  const serviceUrl = getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();

  try {
    const body = await req.json();
    const endpoint = body.action === 'stop' ? '/campaign/stop' : '/campaign/start';

    const res = await fetch(`${serviceUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': serviceSecret
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Could not contact persistent campaign engine.' },
      { status: 502 }
    );
  }
}
