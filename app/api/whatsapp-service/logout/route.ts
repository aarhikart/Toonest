import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const serviceUrl = getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();
  const userId = getWorkerUserId(req);

  try {
    const res = await fetch(`${serviceUrl}/logout`, {
      method: 'POST',
      headers: getWorkerHeaders(serviceSecret, userId)
    });

    const rawText = await res.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { success: true, message: 'Logged out' };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: true, message: 'Logged out locally (worker unreachable)' },
      { status: 200 }
    );
  }
}
