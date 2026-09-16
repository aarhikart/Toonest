'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ShieldAlert,
  Layers,
  Server,
  FileCheck,
  Maximize2,
  Lock,
  WifiOff,
  AlertTriangle,
  Code
} from 'lucide-react';

interface CauseItem {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
  explanation: string;
  howToFix: string;
}

const CAUSES: CauseItem[] = [
  {
    id: 'network-block',
    title: 'Website is blocked by the network',
    shortDesc: 'Gateway, firewall, or DNS security policy prevents connection',
    icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
    explanation:
      'Corporate filters (like Sophos Web Control, Fortinet, or Cisco Umbrella) intercept connections before they leave the perimeter. Upload packets never reach the server.',
    howToFix: 'Contact your network administrator to request reclassification or verify using an authorized connection.'
  },
  {
    id: 'iframe-embedding',
    title: 'Website blocks iframe embedding',
    shortDesc: 'X-Frame-Options or CSP frame-ancestors prevents previewing',
    icon: <Layers className="w-4 h-4 text-amber-500" />,
    explanation:
      'The destination sends security headers telling browsers not to render the page inside another domain. This does not necessarily mean uploads are broken, but prevents third-party embedding.',
    howToFix: 'Open the website directly in a separate browser tab to interact with its native upload controls.'
  },
  {
    id: 'upload-endpoint',
    title: 'Upload endpoint is unavailable',
    shortDesc: 'Target API route returns 404, 500, or connection refused',
    icon: <Server className="w-4 h-4 text-orange-500" />,
    explanation:
      'The backend handling file uploads might be down, misrouted behind a reverse proxy, or the designated upload URL route does not exist.',
    howToFix: 'Check backend server logs, verify route configuration in API Gateway / Nginx, and ensure the upload service is active.'
  },
  {
    id: 'file-type',
    title: 'File type is not accepted',
    shortDesc: 'HTTP 415 or client-side accept attribute validation rejection',
    icon: <FileCheck className="w-4 h-4 text-indigo-500" />,
    explanation:
      'Servers often validate file extension and magic byte signatures. If an unexpected format (e.g. .exe instead of .png) is uploaded, the server rejects it with HTTP 415 Unsupported Media Type.',
    howToFix: 'Convert the file to a standard permitted format (JPEG, PNG, WebP, PDF) matching the endpoint schema.'
  },
  {
    id: 'file-size',
    title: 'File exceeds maximum size',
    shortDesc: 'HTTP 413 Payload Too Large or proxy buffer overrun',
    icon: <Maximize2 className="w-4 h-4 text-purple-500" />,
    explanation:
      'Web servers, reverse proxies (like Nginx client_max_body_size), or cloud providers (AWS CloudFront, Cloudflare 100MB ceiling) terminate the upload stream when file size surpasses the limit.',
    howToFix: 'Increase reverse proxy size limits, compress files before upload, or adopt chunked multipart uploads.'
  },
  {
    id: 'cors-policy',
    title: 'Browser security policy (CORS)',
    shortDesc: 'Cross-origin request blocked by browser security sandbox',
    icon: <Lock className="w-4 h-4 text-blue-500" />,
    explanation:
      'When testing an upload endpoint on a different domain, browsers send a preflight (OPTIONS) request. If the server does not send Access-Control-Allow-Origin headers, the browser blocks the response.',
    howToFix: 'Configure CORS headers on the destination server, or test from the same origin as the frontend.'
  },
  {
    id: 'auth-required',
    title: 'Authentication is required',
    shortDesc: 'HTTP 401 Unauthorized or HTTP 403 Forbidden',
    icon: <Lock className="w-4 h-4 text-amber-500" />,
    explanation:
      'The upload endpoint requires an active session cookie, API bearer token, or CSRF token that was not included in the test request.',
    howToFix: 'Provide appropriate authorization headers or log in to the destination service prior to testing.'
  },
  {
    id: 'network-connection',
    title: 'Network connection problem',
    shortDesc: 'Packet loss, client offline state, or TCP reset',
    icon: <WifiOff className="w-4 h-4 text-zinc-500" />,
    explanation:
      'Uploads transmit significant outbound bandwidth. Unstable Wi-Fi, low mobile signal, or ISP timeouts can drop the connection midway.',
    howToFix: 'Verify local internet stability, test smaller file sizes, or implement upload retry logic.'
  },
  {
    id: 'client-js-error',
    title: 'Website-side JavaScript error',
    shortDesc: 'Client-side script exception prevents form submission',
    icon: <Code className="w-4 h-4 text-emerald-500" />,
    explanation:
      'A runtime bug in the frontend code (e.g. unhandled promise rejection, React state crash, or missing form handler) prevents the upload request from being fired.',
    howToFix: 'Open Developer Tools (F12) -> Console tab on the target site to inspect client-side JavaScript stack traces.'
  }
];

export function UploadTroubleshootingPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Why Is Upload Not Working?</span>
          </h3>
          <p className="text-xs text-zinc-500">
            Troubleshooting reference for identifying the root cause of website file upload failures.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {CAUSES.map(item => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="w-full p-3 text-left flex items-center justify-between gap-3 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {item.shortDesc}
                    </p>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    isExpanded ? 'rotate-180 text-[#5722AF] dark:text-[#9B6BE8]' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 text-xs border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/50">
                  <div className="space-y-1 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <strong className="text-zinc-800 dark:text-zinc-200 block">Explanation:</strong>
                    <p>{item.explanation}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border border-[#5722AF]/15 text-[#5722AF] dark:text-purple-300 text-[11px] leading-relaxed">
                    <strong>Remediation:</strong> {item.howToFix}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
