import { NextRequest, NextResponse } from 'next/server';
import { normalizeUrl, extractWebDataFromHtml } from '@/lib/web-extractor/extractor';
import { ExtractionResponse } from '@/lib/web-extractor/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body?.url;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid website URL is required.' },
        { status: 400 }
      );
    }

    const targetUrl = normalizeUrl(rawUrl);

    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'The provided URL is malformed.' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const loadTimeMs = Date.now() - startTime;
    const finalUrl = upstreamRes.url || targetUrl;
    const contentType = upstreamRes.headers.get('content-type') || 'text/html';

    const html = await upstreamRes.text();
    const pageSizeBytes = Buffer.byteLength(html, 'utf8');

    const extractedData = extractWebDataFromHtml(html, finalUrl, {
      statusCode: upstreamRes.status,
      statusText: upstreamRes.statusText,
      loadTimeMs,
      pageSizeBytes,
      contentType,
    });

    return NextResponse.json<ExtractionResponse>({
      success: true,
      data: extractedData,
    });
  } catch (err: any) {
    return NextResponse.json<ExtractionResponse>(
      {
        success: false,
        error:
          err?.name === 'AbortError'
            ? 'Request timed out while connecting to the website.'
            : err?.message || 'Failed to extract website data.',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { success: false, error: 'URL query parameter is required.' },
      { status: 400 }
    );
  }

  // Delegate to POST logic
  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: { 'Content-Type': 'application/json' },
    })
  );
}
