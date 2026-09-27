import { NextRequest, NextResponse } from 'next/server';
import {
  isValidInstagramUrl,
  extractInstagramShortcode,
  cleanInstagramUrl,
  isAllowedCdnUrl,
} from '@/lib/instagram/validator';
import { instagramProvider } from '@/lib/instagram/provider';
import { checkRateLimit } from '@/lib/instagram/rateLimiter';
import { recordInstagramDownload } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/instagram/download
 * Retrieves media information exclusively from publicly accessible content and permitted sources.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check (20 requests per minute per IP)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous';

    const rate = checkRateLimit(ip, 20, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit reached. Please wait ${rate.resetInSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.resetInSeconds),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Parse and Validate Request Payload
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const rawUrl = body?.url;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Instagram URL is required.' },
        { status: 400 }
      );
    }

    // 3. Strict Domain & Path Validation (SSRF guard: only instagram.com / www.instagram.com /reel/ or /p/)
    if (!isValidInstagramUrl(rawUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Instagram URL. Only public Instagram Post (/p/) or Reel (/reel/) URLs are supported.',
        },
        { status: 400 }
      );
    }

    const shortcode = extractInstagramShortcode(rawUrl);
    if (!shortcode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not extract a valid Instagram media identifier from the provided URL.',
        },
        { status: 400 }
      );
    }

    const cleanedUrl = cleanInstagramUrl(rawUrl);

    // 4. Retrieve Media Information via Provider Abstraction
    const media = await instagramProvider.fetchMedia(cleanedUrl, shortcode);

    if (!media || !media.downloadUrl) {
      // Record failed attempt in Prisma
      await recordInstagramDownload({
        sourceUrl: cleanedUrl,
        mediaType: null,
        status: 'FAILED',
      });

      return NextResponse.json(
        {
          success: false,
          error:
            'This Instagram content cannot be retrieved automatically. Please use publicly accessible content or an authorized API/source.',
        },
        { status: 404 }
      );
    }

    // 5. Record Successful Request in Prisma
    await recordInstagramDownload({
      sourceUrl: cleanedUrl,
      mediaType: media.type,
      status: 'SUCCESS',
    });

    // 6. Return Normalized Media Response
    return NextResponse.json(
      {
        success: true,
        media: {
          type: media.type,
          thumbnail: media.thumbnail,
          downloadUrl: media.downloadUrl,
          sourceUrl: media.sourceUrl,
          creator: media.creator,
          caption: media.caption,
          filename: media.filename || `instagram_${shortcode}.${media.type === 'video' ? 'mp4' : 'jpg'}`,
        },
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(rate.remaining),
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/instagram/download] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred while processing the request.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/instagram/download
 * Secure streaming proxy that downloads remote media attachment directly to client disk.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('url');
    const requestedName = searchParams.get('filename') || 'instagram-media.mp4';

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
      requestedName.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 100) || 'instagram-media.mp4';

    // Fetch the remote media stream with 20s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const upstreamRes = await fetch(mediaUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://www.instagram.com/',
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

    const contentType =
      upstreamRes.headers.get('content-type') ||
      (safeFilename.endsWith('.jpg') ? 'image/jpeg' : 'video/mp4');
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
  } catch (err: any) {
    console.error('Download stream proxy error:', err);
    return NextResponse.json(
      { error: 'Internal streaming error occurred while downloading media.' },
      { status: 500 }
    );
  }
}
