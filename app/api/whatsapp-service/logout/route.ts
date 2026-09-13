import { NextResponse } from 'next/server';

export async function POST() {
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';
  const serviceSecret = process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';

  try {
    const res = await fetch(`${serviceUrl}/logout`, {
      method: 'POST',
      headers: {
        'x-service-key': serviceSecret
      }
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: true, message: 'Logged out locally (worker unreachable)' },
      { status: 200 }
    );
  }
}
