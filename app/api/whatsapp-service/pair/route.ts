import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const serviceUrl = await getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();
  const userId = getWorkerUserId(req);

  try {
    const body = await req.json().catch(() => ({}));

    const tryRequest = async (url: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const res = await fetch(`${url}/pair`, {
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
      res = await tryRequest(serviceUrl);
    } catch (err: any) {
      const isLocalHostAllowed = !process.env.VERCEL && !process.env.AWS_REGION && serviceUrl !== 'http://localhost:5001';
      if (isLocalHostAllowed) {
        try {
          res = await tryRequest('http://localhost:5001');
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
          ? `WhatsApp Worker Gateway is currently offline or unreachable at ${serviceUrl} (${res.status}). Please start the WhatsApp system on your laptop.`
          : `Unexpected worker response (${res.status}): ${rawText.substring(0, 100)}`
      };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Unable to connect to WhatsApp worker at ${serviceUrl}. Please verify your laptop is running START_WHATSAPP_SYSTEM.bat.`
      },
      { status: 502 }
    );
  }
}
