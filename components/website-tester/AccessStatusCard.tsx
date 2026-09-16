'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Server,
  Layers,
  Copy
} from 'lucide-react';
import { OverallAccessStatus, HttpDiagnosticResult } from '@/lib/website-tester/types';

interface AccessStatusCardProps {
  status: OverallAccessStatus;
  url: string;
  httpResult?: Partial<HttpDiagnosticResult>;
  onOpenDirectly: () => void;
  onOpenReport: () => void;
}

export function AccessStatusCard({
  status,
  url,
  httpResult,
  onOpenDirectly,
  onOpenReport
}: AccessStatusCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'accessible':
        return {
          title: 'Accessible',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          indicator: '✓ Accessible',
          indicatorColor: 'text-emerald-600 dark:text-emerald-400',
          description:
            'The website is reachable from your browser and network environment. Standard web access is functional.'
        };
      case 'partially-accessible':
        return {
          title: 'Partially Accessible',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
          badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          indicator: '⚠ Partially Accessible',
          indicatorColor: 'text-amber-600 dark:text-amber-400',
          description:
            'The website responds, but certain features such as iframe embedding (X-Frame-Options/CSP) or upload inspection are restricted by security policy.'
        };
      case 'blocked':
        return {
          title: 'Blocked / Unavailable',
          icon: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          indicator: '✕ Blocked',
          indicatorColor: 'text-rose-600 dark:text-rose-400',
          description: httpResult?.securityGateway?.detected
            ? `Blocked by intermediate network security policy (${httpResult.securityGateway.vendor || 'Security Gateway'}).`
            : 'The website could not be reached. It may be down, blocked by firewall/DNS, or refusing connections.'
        };
      case 'untested':
      default:
        return {
          title: 'Ready to Test',
          icon: <HelpCircle className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />,
          badgeClass: 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
          indicator: '— Unable to Test',
          indicatorColor: 'text-zinc-500',
          description: 'Enter a valid website URL above and click "Test Website" to run browser & network diagnostics.'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overall Status</span>
          <div className="flex items-center gap-2 pt-0.5">
            <span className={`text-lg sm:text-xl font-black ${badge.indicatorColor}`}>
              {badge.indicator}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {url && status !== 'untested' && (
            <>
              <button
                type="button"
                onClick={onOpenDirectly}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition flex items-center gap-1.5"
                title="Open destination website in a new tab directly"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Directly</span>
              </button>

              <button
                type="button"
                onClick={onOpenReport}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition flex items-center gap-1.5"
                title="View and export diagnostic report"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {badge.description}
      </p>

      {/* Quick Diagnostic Metrics Bar */}
      {status !== 'untested' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">HTTP Status</span>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 pt-0.5">
              {httpResult?.statusCode ? `${httpResult.statusCode} ${httpResult.statusText || ''}` : 'N/A'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Latency</span>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 pt-0.5">
              {httpResult?.roundTripMs ? `${httpResult.roundTripMs} ms` : '—'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Embedding</span>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 pt-0.5">
              {httpResult?.canEmbed ? 'Permitted' : 'Blocked'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Security Gateway</span>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 pt-0.5">
              {httpResult?.securityGateway?.detected ? 'Detected' : 'None'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
