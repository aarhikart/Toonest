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

    if (!body.to) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number (to) is required.' },
        { status: 400 }
      );
    }

    const trySend = async (url: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const res = await fetch(`${url}/send`, {
          method: 'POST',
          headers: getWorkerHeaders(serviceSecret, userId),
          body: JSON.stringify({ ...body, userId }),
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
      res = await trySend(serviceUrl);
    } catch (err: any) {
      const isLocalHostAllowed = !process.env.VERCEL && !process.env.AWS_REGION && serviceUrl !== 'http://localhost:5001';
      if (isLocalHostAllowed) {
        try {
          res = await trySend('http://localhost:5001');
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const rawText = await res.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {
        success: false,
        error: res.status === 502 || res.status === 504 || rawText.includes('<!DOCTYPE')
          ? `WhatsApp local worker daemon is offline on port 5001 (Gateway returned ${res.status}). Please start the worker.`
          : `Unexpected worker response (${res.status}): ${rawText.substring(0, 100)}`
      };
    }
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
