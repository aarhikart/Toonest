'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  RotateCcw,
  ExternalLink,
  Copy,
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { SecurityGatewayInfo } from '@/lib/website-tester/types';

interface SecurityGatewayAlertProps {
  securityGateway: SecurityGatewayInfo;
  url: string;
  onTryAgain: () => void;
  onOpenDirectly: () => void;
  onCopyReport: () => void;
}

export function SecurityGatewayAlert({
  securityGateway,
  url,
  onTryAgain,
  onOpenDirectly,
  onCopyReport
}: SecurityGatewayAlertProps) {
  if (!securityGateway.detected) return null;

  return (
    <div className="rounded-2xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 dark:from-rose-950/40 dark:via-zinc-900 dark:to-rose-950/20 p-5 sm:p-6 shadow-md shadow-rose-500/5 space-y-5">
      {/* Header Banner matching Corporate Gateway context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-200/60 dark:border-rose-900/60">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <AlertOctagon className="w-3 h-3" />
              <span>Network Policy Block Detected</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-rose-900 dark:text-rose-100 pt-1">
              Stop! This website is blocked by network security
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              The administrator of this network has restricted access to this destination.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
            {securityGateway.vendor || 'Sophos Web Control'}
          </span>
        </div>
      </div>

      {/* Block Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-rose-200/60 dark:border-rose-900/40">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Detected System</span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-0.5">
            {securityGateway.vendor || 'Sophos Web Control'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-rose-200/60 dark:border-rose-900/40">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Policy Category</span>
          <p className="font-bold text-rose-700 dark:text-rose-300 pt-0.5">
            {securityGateway.category || 'Restricted by Policy'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-rose-200/60 dark:border-rose-900/40">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Enforcement Action</span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100 pt-0.5">
            Blocked by network administrator
          </p>
        </div>
      </div>

      {/* Compliance / Non-Circumvention Statement */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200">
        <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
        <p className="leading-relaxed">
          <strong>Notice:</strong> This application cannot and will not override or bypass network security policies, firewalls, or gateway restrictions. Contact your network administrator if this website is required for work.
        </p>
      </div>

      {/* Actionable Next Steps */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          What you can do:
        </h4>
        <ol className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 list-decimal list-inside leading-relaxed">
          <li><strong>Contact your network administrator:</strong> Provide the target URL and requested category classification.</li>
          <li><strong>Request website review / reclassification:</strong> Submit a request if the destination was miscategorized.</li>
          <li><strong>Request an approved business exception:</strong> If access is essential for business operations.</li>
          <li><strong>Test on an authorized network:</strong> Verify functionality using an approved personal or mobile test connection if appropriate.</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={onTryAgain}
          className="px-4 py-2 rounded-xl bg-[#5722AF] hover:bg-[#461891] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <button
          type="button"
          onClick={onOpenDirectly}
          className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-2"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Directly</span>
        </button>

        <button
          type="button"
          onClick={onCopyReport}
          className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-2"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Diagnostic Report</span>
        </button>
      </div>
    </div>
  );
}
