import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const serviceUrl = await getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();
  const userId = getWorkerUserId(req);

  try {
    const body = await req.json();
    const phoneNumbers = body.phoneNumbers;

    if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid phoneNumbers array is required.' },
        { status: 400 }
      );
    }

    const tryCheck = async (url: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);
      try {
        const res = await fetch(`${url}/check-numbers`, {
          method: 'POST',
          headers: getWorkerHeaders(serviceSecret, userId),
          body: JSON.stringify({ phoneNumbers, userId }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        return res;
      } catch (e) {
        clearTimeout(timeout);
        throw e;
      }
    };

    let res: Response;
    try {
      res = await tryCheck(serviceUrl);
    } catch (err: any) {
      const isLocalHostAllowed = !process.env.VERCEL && !process.env.AWS_REGION && serviceUrl !== 'http://localhost:5001';
      if (isLocalHostAllowed) {
        try {
          res = await tryCheck('http://localhost:5001');
        } catch (_) {
          return NextResponse.json({
            success: false,
            connected: false,
            error: 'The server is down. Please try after some time.'
          });
        }
      } else {
        return NextResponse.json({
          success: false,
          connected: false,
          error: 'The server is down. Please try after some time.'
        });
      }
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, connected: false, error: err.message || 'Batch verification failed.' },
      { status: 500 }
    );
  }
}
