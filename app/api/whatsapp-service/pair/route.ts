import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';
  const serviceSecret = process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';

  try {
    const body = await req.json();
    const res = await fetch(`${serviceUrl}/pair`, {
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
      {
        success: false,
        error: `Failed to connect to persistent WhatsApp worker at ${serviceUrl}. Ensure worker is running.`
      },
      { status: 502 }
    );
  }
}
