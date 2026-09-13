import { NextRequest, NextResponse } from 'next/server';
import { fetchReelMetadata } from '@/lib/instagram/downloader';
import { isValidInstagramReelUrl } from '@/lib/instagram/validator';
import { ReelApiResponse } from '@/lib/instagram/types';

// In-memory rate limiting: 20 requests per minute per IP
const ipRequests = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequests.get(ip);

  if (!entry || now > entry.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + 60 * 1000 });
    return true;
  }

  if (entry.count >= 20) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse<ReelApiResponse>> {
  try {
    // 1. Rate Limiting Check
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please wait a minute before trying again.',
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body.url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid Instagram Reel URL.',
          code: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    const targetUrl = body.url.trim();
    if (!isValidInstagramReelUrl(targetUrl)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Please enter a valid Instagram Reel URL (e.g., https://www.instagram.com/reel/...).',
          code: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    // 3. Resolve Media
    const result = await fetchReelMetadata(targetUrl);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('API Error in /api/instagram/reel:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected server error occurred while retrieving the Reel. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
