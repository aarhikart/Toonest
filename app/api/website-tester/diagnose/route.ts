import { NextRequest, NextResponse } from 'next/server';
import { validateUrlForSSRF } from '@/lib/website-tester/ssrf';
import { HttpDiagnosticResult, SecurityGatewayInfo } from '@/lib/website-tester/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Target URL is required.' },
        { status: 400 }
      );
    }

    // 1. Strict SSRF Protection Check
    const ssrfCheck = await validateUrlForSSRF(url);
    if (!ssrfCheck.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: ssrfCheck.error || 'The requested URL failed security and SSRF verification.',
          isBlockedBySSRF: true
        },
        { status: 403 }
      );
    }

    const targetUrl = ssrfCheck.normalizedUrl || url;
    const startTime = Date.now();

    // 2. Perform outbound diagnostic request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ToolNest-AccessTester/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: controller.signal,
        redirect: 'follow',
        cache: 'no-store'
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      const isTimeout = fetchErr.name === 'AbortError';
      return NextResponse.json({
        success: true,
        data: {
          isReachable: false,
          roundTripMs: Date.now() - startTime,
          canEmbed: false,
          embedBlockReason: isTimeout ? 'Request timed out after 8000ms.' : fetchErr.message || 'Connection failed.',
          securityGateway: {
            detected: false
          }
        } as HttpDiagnosticResult
      });
    }

    clearTimeout(timeoutId);
    const roundTripMs = Date.now() - startTime;

    // 3. Inspect headers for frame restrictions
    const xFrameOptions = response.headers.get('x-frame-options');
    const csp = response.headers.get('content-security-policy');
    const server = response.headers.get('server');

    let canEmbed = true;
    let embedBlockReason = '';

    if (xFrameOptions) {
      const upperXFO = xFrameOptions.toUpperCase();
      if (upperXFO.includes('DENY')) {
        canEmbed = false;
        embedBlockReason = 'Blocked by X-Frame-Options: DENY header';
      } else if (upperXFO.includes('SAMEORIGIN')) {
        canEmbed = false;
        embedBlockReason = 'Blocked by X-Frame-Options: SAMEORIGIN header';
      }
    }

    if (csp && csp.toLowerCase().includes('frame-ancestors')) {
      const match = csp.match(/frame-ancestors\s+([^;]+)/i);
      const directive = match ? match[1].trim() : 'specified';
      if (!directive.includes('*') && !directive.includes('https:')) {
        canEmbed = false;
        embedBlockReason = `Blocked by CSP directive: frame-ancestors ${directive}`;
      }
    }

    // 4. Inspect body for Security Gateway / Sophos / Firewall signatures
    let htmlSnippet = '';
    try {
      // Read at most 64KB to avoid memory bloat
      const rawText = await response.text();
      htmlSnippet = rawText.slice(0, 65536);
    } catch {
      // Non-fatal if body read fails
    }

    const securityGateway = detectSecurityGateway(response, htmlSnippet);

    const safeHeaders: Record<string, string> = {};
    const relevantHeaders = [
      'content-type',
      'content-length',
      'x-frame-options',
      'content-security-policy',
      'server',
      'via',
      'x-cache'
    ];
    for (const h of relevantHeaders) {
      const val = response.headers.get(h);
      if (val) safeHeaders[h] = val;
    }

    const result: HttpDiagnosticResult = {
      isReachable: true,
      statusCode: response.status,
      statusText: response.statusText,
      roundTripMs,
      xFrameOptions,
      cspFrameAncestors: csp && csp.toLowerCase().includes('frame-ancestors') ? csp : null,
      server,
      canEmbed,
      embedBlockReason: embedBlockReason || undefined,
      securityGateway,
      rawHeaders: safeHeaders
    };

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Server diagnostic execution error.'
      },
      { status: 500 }
    );
  }
}

/**
 * Analyzes response headers and HTML content to identify security gateway block pages
 * such as Sophos Web Control, Fortinet, Palo Alto, Zscaler, or Cisco Umbrella.
 */
function detectSecurityGateway(response: Response, html: string): SecurityGatewayInfo {
  const lowerHtml = html.toLowerCase();
  const headersStr = Array.from(response.headers.entries())
    .map(([k, v]) => `${k.toLowerCase()}: ${v.toLowerCase()}`)
    .join('\n');

  const indicators: string[] = [];

  // Check for Sophos specifically
  const isSophos =
    lowerHtml.includes('sophos') ||
    headersStr.includes('sophos') ||
    lowerHtml.includes('sophos web control') ||
    (lowerHtml.includes('this website is blocked') && lowerHtml.includes('administrator of this network'));

  if (isSophos) {
    indicators.push('Sophos signature detected');
    if (lowerHtml.includes('this website is blocked')) indicators.push('Block page headline: "This website is blocked"');
    if (lowerHtml.includes('administrator of this network')) indicators.push('Notice: "The administrator of this network has restricted access"');

    // Extract category if present
    let category = 'Restricted by Policy';
    const categoryMatch = html.match(/categorized as\s+["']?([^<"'\n]+)/i) ||
      html.match(/Category:\s*<[^>]+>([^<]+)/i) ||
      html.match(/Category:\s*([^<\n]+)/i);

    if (categoryMatch && categoryMatch[1]) {
      category = categoryMatch[1].trim();
      indicators.push(`Category: ${category}`);
    }

    return {
      detected: true,
      vendor: 'Sophos Web Control',
      category,
      reason: 'The administrator of this network has restricted access based on web security policy.',
      indicators,
      blockPageSnippet: 'Stop! This website is blocked. The administrator of this network has restricted access.'
    };
  }

  // Fortinet / FortiGuard
  if (lowerHtml.includes('fortinet') || lowerHtml.includes('fortigate') || lowerHtml.includes('fortiguard')) {
    return {
      detected: true,
      vendor: 'Fortinet FortiGate Web Filter',
      category: 'Web Filter Block',
      reason: 'Access denied by FortiGate network security policy.',
      indicators: ['Fortinet gateway signature matched']
    };
  }

  // Palo Alto Networks
  if (lowerHtml.includes('palo alto networks') || lowerHtml.includes('pan-os url filtering')) {
    return {
      detected: true,
      vendor: 'Palo Alto Networks Next-Gen Firewall',
      category: 'URL Filtering Block',
      reason: 'The URL is blocked in accordance with corporate security policy.',
      indicators: ['Palo Alto Networks signature matched']
    };
  }

  // Zscaler
  if (lowerHtml.includes('zscaler') || headersStr.includes('zscaler')) {
    return {
      detected: true,
      vendor: 'Zscaler Cloud Firewall',
      category: 'Zscaler Security Policy',
      reason: 'Destination blocked by enterprise security gateway.',
      indicators: ['Zscaler cloud filter signature matched']
    };
  }

  // Generic block page pattern check
  const genericBlockPatterns = [
    'this website is blocked',
    'access denied by network policy',
    'web site is blocked by administrator',
    'restricted access to this page',
    'content filter has blocked',
    'network access policy restriction'
  ];

  for (const pattern of genericBlockPatterns) {
    if (lowerHtml.includes(pattern)) {
      return {
        detected: true,
        vendor: 'Corporate Network Security Gateway',
        category: 'Policy Restriction',
        reason: 'The requested website appears to be blocked by an intermediate network security system.',
        indicators: [`Matched filter phrase: "${pattern}"`]
      };
    }
  }

  return {
    detected: false
  };
}
