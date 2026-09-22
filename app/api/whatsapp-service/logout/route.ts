import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const serviceUrl = await getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();
  const userId = getWorkerUserId(req);

  try {
    let res: Response;
    try {
      res = await fetch(`${serviceUrl}/logout`, {
        method: 'POST',
        headers: getWorkerHeaders(serviceSecret, userId),
        signal: AbortSignal.timeout(6000)
      });
    } catch (e: any) {
      const isLocalHostAllowed = !process.env.VERCEL && !process.env.AWS_REGION && serviceUrl !== 'http://localhost:5001';
      if (isLocalHostAllowed) {
        try {
          res = await fetch('http://localhost:5001/logout', {
            method: 'POST',
            headers: getWorkerHeaders(serviceSecret, userId),
            signal: AbortSignal.timeout(6000)
          });
        } catch {
          throw e;
        }
      } else {
        throw e;
      }
    }

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
      { success: true, message: 'Logged out locally' },
      { status: 200 }
    );
  }
}
