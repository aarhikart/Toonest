'use client';

import React from 'react';
import {
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Globe,
  Cpu,
  Wifi
} from 'lucide-react';
import { BrowserEnvironment } from '@/lib/website-tester/types';

interface BrowserCompatibilityCardProps {
  browser: BrowserEnvironment;
}

export function BrowserCompatibilityCard({ browser }: BrowserCompatibilityCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            {browser.isMobile ? (
              <Smartphone className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            ) : (
              <Laptop className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            )}
            <span>Current Browser & Client Environment</span>
          </h3>
          <p className="text-xs text-zinc-500">
            Detected from your actual browser user-agent and execution runtime.
          </p>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          <span>Supported</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase">Browser</span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-0.5 truncate">
            {browser.browserName} {browser.browserVersion}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase">Engine / Platform</span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-0.5 truncate">
            {browser.engine} ({browser.os})
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase">Upload Engine</span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-0.5 truncate">
            {browser.supportsXHRUpload ? 'XHR2 Upload (Active)' : 'Unavailable'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase">Network State</span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-0.5 truncate flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${browser.onLine ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
            <span>{browser.onLine ? 'Online' : 'Offline'}</span>
          </p>
        </div>
      </div>

      {/* Notice regarding multi-browser execution */}
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <strong>Browser notice:</strong> Modern browsers enforce distinct security sandboxes. To test Safari-specific WebKit constraints or iOS privacy limits, open this URL directly inside Safari on macOS/iOS.
      </div>
    </div>
  );
}
