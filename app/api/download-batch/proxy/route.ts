import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  // Decode HTML entities commonly found in parsed attributes
  url = url
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return url;
}

function sanitizeDownloadFilename(name?: string | null): string {
  if (!name) return 'video.mp4';
  let cleaned = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim();
  cleaned = cleaned.replace(/[\\/:*?"<>|\r\n\t]/g, '_');
  cleaned = cleaned.replace(/\s+/g, '_').replace(/_+/g, '_');
  if (cleaned.length > 100) cleaned = cleaned.substring(0, 100);
  if (!cleaned.toLowerCase().endsWith('.mp4') && !cleaned.toLowerCase().endsWith('.webm') && !cleaned.toLowerCase().endsWith('.mov')) {
    cleaned = `${cleaned}.mp4`;
  }
  return cleaned;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'video.mp4';

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing video URL parameter.' }, { status: 400 });
    }

    const videoUrl = cleanUrl(rawUrl);

    let parsed: URL;
    try {
      parsed = new URL(videoUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: 'Invalid URL protocol.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Malformed video URL.' }, { status: 400 });
    }

    // Set appropriate referer based on hostname
    let referer = 'https://www.pinterest.com/';
    if (parsed.hostname.includes('instagram.com')) {
      referer = 'https://www.instagram.com/';
    } else if (parsed.hostname.includes('tiktok.com')) {
      referer = 'https://www.tiktok.com/';
    }

    const upstreamRes = await fetch(videoUrl, {
      keepalive: true,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': referer,
        'Accept': 'video/mp4,video/*,*/*;q=0.9',
      },
      signal: AbortSignal.timeout(20000), // 20s timeout per video
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: `Upstream CDN returned ${upstreamRes.status} ${upstreamRes.statusText}` },
        { status: upstreamRes.status }
      );
    }

    const contentType = upstreamRes.headers.get('content-type') || 'video/mp4';
    const contentLength = upstreamRes.headers.get('content-length');
    const safeFilename = sanitizeDownloadFilename(filename);

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, immutable');
    headers.set('Connection', 'keep-alive');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    if (!upstreamRes.body) {
      return NextResponse.json({ error: 'Empty upstream body.' }, { status: 502 });
    }

    return new Response(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('[VideoProxy] Error proxying video:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to proxy video stream.' },
      { status: 500 }
    );
  }
}
