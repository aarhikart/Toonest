import { NextRequest, NextResponse } from 'next/server';
import { isAllowedCdnUrl } from '@/lib/instagram/validator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('url');
    const requestedName = searchParams.get('filename') || 'instagram-reel.mp4';

    if (!mediaUrl) {
      return NextResponse.json(
        { error: 'Missing media URL parameter.' },
        { status: 400 }
      );
    }

    // SSRF Check: Strictly enforce approved Instagram/Meta CDN domains
    if (!isAllowedCdnUrl(mediaUrl)) {
      return NextResponse.json(
        { error: 'Forbidden media host. Only approved Instagram CDN URLs are allowed.' },
        { status: 403 }
      );
    }

    const safeFilename =
      requestedName.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 100) || 'instagram-reel.mp4';

    // Fetch the remote media stream
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const upstreamRes = await fetch(mediaUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstreamRes.ok || !upstreamRes.body) {
      return NextResponse.json(
        { error: 'Failed to retrieve media stream from provider.' },
        { status: 502 }
      );
    }

    const contentType = upstreamRes.headers.get('content-type') || 'video/mp4';
    const contentLength = upstreamRes.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    headers.set('Cache-Control', 'private, no-transform, max-age=86400');

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('Download stream proxy error:', err);
    return NextResponse.json(
      { error: 'Internal streaming error occurred while downloading media.' },
      { status: 500 }
    );
  }
}
