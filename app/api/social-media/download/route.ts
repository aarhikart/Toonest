import { NextRequest, NextResponse } from 'next/server';
import {
  socialMediaManager,
  detectPlatform,
  isAllowedMediaCdn,
} from '@/lib/social-media';
import { checkRateLimit } from '@/lib/instagram/rateLimiter';
import { recordInstagramDownload } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/social-media/download
 * Analyzes and returns downloadable media information for Instagram, Pinterest, and YouTube.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (20 requests per minute)
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

    // 2. Validate Request Payload
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
        { success: false, error: 'A valid social media video URL is required.' },
        { status: 400 }
      );
    }

    // 3. Platform Detection
    const platform = detectPlatform(rawUrl);
    if (!platform) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Unsupported or invalid URL. Supported platforms: Instagram (Reels/Posts), Pinterest (Pins), and YouTube (Videos/Shorts).',
        },
        { status: 400 }
      );
    }

    // 4. Retrieve Media
    const media = await socialMediaManager.fetchMedia(rawUrl);

    if (!media || !media.downloadUrl) {
      if (platform === 'instagram') {
        await recordInstagramDownload({
          sourceUrl: rawUrl,
          mediaType: null,
          status: 'FAILED',
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: `Could not retrieve media from this ${platform} link. Please ensure it is publicly accessible and not private or restricted.`,
        },
        { status: 404 }
      );
    }

    // 5. Record Success (if Instagram)
    if (platform === 'instagram') {
      await recordInstagramDownload({
        sourceUrl: rawUrl,
        mediaType: media.type,
        status: 'SUCCESS',
      });
    }

    return NextResponse.json(
      {
        success: true,
        media,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(rate.remaining),
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/social-media/download] POST error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred while processing the download request.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/social-media/download
 * Unified streaming proxy:
 * - For YouTube: Streams the locally cached/downloaded MP4 file.
 * - For Instagram / Pinterest: Streams the remote CDN media with required Referer/headers.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const mediaUrl = searchParams.get('url');
    const videoId = searchParams.get('id');
    const isInline = searchParams.get('inline') === '1';
    const requestedName = searchParams.get('filename') || 'social-media-video.mp4';

    const safeFilename =
      requestedName.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 100) || 'social-media-video.mp4';

    // Case A: YouTube Local Cache Streaming
    if (platform === 'youtube' && videoId) {
      const filePath = await socialMediaManager.youtube.getOrDownloadVideoFile(videoId);
      if (!filePath || !fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: 'YouTube video stream could not be generated. Please try again.' },
          { status: 502 }
        );
      }

      const fileStat = fs.statSync(filePath);
      const rangeHeader = req.headers.get('range');

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1;
        const chunkSize = end - start + 1;
        const rangeStream = fs.createReadStream(filePath, { start, end });

        const webStream = new ReadableStream({
          start(controller) {
            rangeStream.on('data', (chunk) => controller.enqueue(chunk));
            rangeStream.on('end', () => controller.close());
            rangeStream.on('error', (err) => controller.error(err));
          },
          cancel() {
            rangeStream.destroy();
          },
        });

        const headers = new Headers();
        headers.set('Content-Type', 'video/mp4');
        headers.set('Content-Range', `bytes ${start}-${end}/${fileStat.size}`);
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Content-Length', String(chunkSize));
        headers.set('Content-Disposition', isInline ? 'inline' : `attachment; filename="${safeFilename}"`);
        headers.set('Cache-Control', 'private, max-age=86400');

        return new NextResponse(webStream as any, {
          status: 206,
          headers,
        });
      }

      const fileStream = fs.createReadStream(filePath);
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        },
      });

      const headers = new Headers();
      headers.set('Content-Type', 'video/mp4');
      headers.set('Content-Disposition', isInline ? 'inline' : `attachment; filename="${safeFilename}"`);
      headers.set('Content-Length', String(fileStat.size));
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Cache-Control', 'private, max-age=86400');

      return new NextResponse(webStream as any, {
        status: 200,
        headers,
      });
    }

    // Case B: Remote CDN Streaming (Instagram, Pinterest, etc.)
    if (!mediaUrl) {
      return NextResponse.json(
        { error: 'Missing media URL parameter.' },
        { status: 400 }
      );
    }

    // Strict SSRF check
    if (!isAllowedMediaCdn(mediaUrl)) {
      return NextResponse.json(
        { error: 'Forbidden media host. Only verified social media CDN endpoints are permitted.' },
        { status: 403 }
      );
    }

    // Choose appropriate Referer header
    let referer = 'https://www.instagram.com/';
    if (mediaUrl.includes('pinimg.com') || mediaUrl.includes('pinterest.')) {
      referer = 'https://www.pinterest.com/';
    } else if (mediaUrl.includes('googlevideo.com') || mediaUrl.includes('youtube.')) {
      referer = 'https://www.youtube.com/';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const upstreamRes = await fetch(mediaUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: referer,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstreamRes.ok || !upstreamRes.body) {
      return NextResponse.json(
        { error: 'Failed to retrieve media stream from upstream provider.' },
        { status: 502 }
      );
    }

    const contentType =
      upstreamRes.headers.get('content-type') ||
      (safeFilename.endsWith('.jpg') ? 'image/jpeg' : 'video/mp4');
    const contentLength = upstreamRes.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', isInline ? 'inline' : `attachment; filename="${safeFilename}"`);
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    headers.set('Cache-Control', 'private, no-transform, max-age=86400');

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('[API /api/social-media/download] GET error:', err);
    return NextResponse.json(
      { error: 'Internal streaming error occurred while downloading media.' },
      { status: 500 }
    );
  }
}
