import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const serviceUrl = getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();

  try {
    const res = await fetch(`${serviceUrl}/logout`, {
      method: 'POST',
      headers: getWorkerHeaders(serviceSecret)
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
