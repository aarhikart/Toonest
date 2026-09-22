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
      if (!res.ok && res.status >= 500 && serviceUrl !== 'http://localhost:5001') {
        res = await tryRequest('http://localhost:5001');
      }
    } catch (err) {
      if (serviceUrl !== 'http://localhost:5001') {
        res = await tryRequest('http://localhost:5001');
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
          ? `WhatsApp local worker daemon is offline on port 5001 (Gateway returned ${res.status}).`
          : `Unexpected worker response (${res.status}): ${rawText.substring(0, 100)}`
      };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to connect to WhatsApp worker at ${serviceUrl}. (Error: ${err.message || 'Connection failed'})`
      },
      { status: 502 }
    );
  }
}
