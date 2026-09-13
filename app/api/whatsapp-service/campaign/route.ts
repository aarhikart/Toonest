import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';
  const serviceSecret = process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';

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
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';
  const serviceSecret = process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';

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
