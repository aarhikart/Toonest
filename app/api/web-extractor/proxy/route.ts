import { NextRequest, NextResponse } from 'next/server';
import { normalizeUrl } from '@/lib/web-extractor/extractor';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrlParam = searchParams.get('url');
    const enableEruda = searchParams.get('devtools') === 'true';

    if (!targetUrlParam) {
      return new NextResponse(
        '<html><body style="font-family:sans-serif;padding:2rem;color:#888;text-align:center;"><h3>No URL specified.</h3><p>Provide a valid URL to preview.</p></body></html>',
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const targetUrl = normalizeUrl(targetUrlParam);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return new NextResponse(
        '<html><body style="font-family:sans-serif;padding:2rem;color:#e11d48;text-align:center;"><h3>Invalid URL format.</h3></body></html>',
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // Abort controller with 20s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = upstreamRes.headers.get('content-type') || '';
    
    // If not HTML (e.g. image, pdf, binary), stream directly
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      const blob = await upstreamRes.arrayBuffer();
      return new NextResponse(blob, {
        status: upstreamRes.status,
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    let html = await upstreamRes.text();
    const finalUrl = upstreamRes.url || targetUrl;

    // 1. Inject <base href="..."> so all relative styles, images, and scripts load correctly
    const baseTag = `<base href="${finalUrl}" target="_blank" />`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (m) => `${m}\n    ${baseTag}`);
    } else {
      html = `${baseTag}\n${html}`;
    }

    // 2. Neutralize frame-busting scripts (e.g. top.location = self.location)
    html = html
      .replace(/top\.location/gi, '/* frame-bust blocked */ window._top_location')
      .replace(/parent\.location/gi, '/* frame-bust blocked */ window._parent_location')
      .replace(/window\.top\b/gi, 'window.self');

    // 3. Inject ToolNest Interactive Console Interceptor & Bridge
    const consoleBridgeScript = `
    <script>
      (function() {
        try {
          window.__TOOLNEST_IN_PAGE_VIEWER__ = true;

          // Helper to serialize objects safely
          function serialize(item) {
            if (item === null) return 'null';
            if (item === undefined) return 'undefined';
            if (typeof item === 'function') return item.toString();
            if (item instanceof Error) return item.stack || item.message || String(item);
            if (typeof item === 'object') {
              try {
                return JSON.stringify(item, null, 2);
              } catch(e) {
                return Object.prototype.toString.call(item);
              }
            }
            return String(item);
          }

          function postLog(level, args) {
            try {
              var messages = Array.prototype.slice.call(args).map(serialize);
              window.parent.postMessage({
                type: 'TOOLNEST_CONSOLE_MSG',
                level: level,
                messages: messages,
                timestamp: new Date().toLocaleTimeString()
              }, '*');
            } catch(e) {}
          }

          // Hook native console methods
          var origLog = console.log;
          var origInfo = console.info;
          var origWarn = console.warn;
          var origError = console.error;

          console.log = function() {
            if (origLog) origLog.apply(console, arguments);
            postLog('log', arguments);
          };

          console.info = function() {
            if (origInfo) origInfo.apply(console, arguments);
            postLog('info', arguments);
          };

          console.warn = function() {
            if (origWarn) origWarn.apply(console, arguments);
            postLog('warn', arguments);
          };

          console.error = function() {
            if (origError) origError.apply(console, arguments);
            postLog('error', arguments);
          };

          // Capture global errors
          window.addEventListener('error', function(e) {
            postLog('error', [(e.message || 'Script Error') + ' (' + (e.filename || 'inline') + ':' + (e.lineno || 0) + ')']);
          });

          window.addEventListener('unhandledrejection', function(e) {
            postLog('error', ['Unhandled Promise Rejection: ' + (e.reason ? (e.reason.message || e.reason) : 'unknown')]);
          });

          // Send initial ready signal
          window.parent.postMessage({
            type: 'TOOLNEST_FRAME_READY',
            url: window.location.href,
            title: document.title
          }, '*');

          // Listen for evaluation commands from ToolNest Console
          window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'TOOLNEST_EVAL_COMMAND') {
              var code = event.data.code;
              var cmdId = event.data.id;
              try {
                // Execute code in window context
                var evalResult = window.eval(code);
                var formatted = serialize(evalResult);
                window.parent.postMessage({
                  type: 'TOOLNEST_EVAL_RESULT',
                  id: cmdId,
                  status: 'success',
                  result: formatted
                }, '*');
              } catch(err) {
                window.parent.postMessage({
                  type: 'TOOLNEST_EVAL_RESULT',
                  id: cmdId,
                  status: 'error',
                  result: err.toString()
                }, '*');
              }
            }
          });
        } catch(err) {}
      })();
    </script>
    `;

    // 4. Optional In-Page Eruda DevTools Suite
    const erudaScript = enableEruda ? `
    <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
    <script>
      try {
        eruda.init({
          tool: ['console', 'elements', 'network', 'resource', 'info', 'snippets']
        });
      } catch(e) {}
    </script>
    ` : '';

    html = html.replace(/<\/head>/i, `${consoleBridgeScript}\n${erudaScript}\n</head>`);

    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    return new NextResponse(html, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to fetch website';
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:3rem;background:#0f172a;color:#cbd5e1;text-align:center;">
        <div style="max-width:500px;margin:0 auto;background:#1e293b;padding:2rem;border-radius:1rem;border:1px solid #334155;">
          <h3 style="color:#f43f5e;margin-top:0;">Failed to Load Website Inside Frame</h3>
          <p style="font-size:14px;line-height:1.5;">${msg}</p>
          <p style="font-size:12px;color:#94a3b8;">The target website might be blocking automated requests or taking too long to respond.</p>
        </div>
      </body></html>`,
      { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
