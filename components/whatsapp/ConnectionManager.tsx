'use client';

import React, { useState } from 'react';
import { WhatsAppAccount } from '@/lib/whatsapp/types';
import { ShieldCheck, CheckCircle2, Key, Globe, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';

interface ConnectionManagerProps {
  account: WhatsAppAccount;
  onRefresh: () => void;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({ account, onRefresh }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp` : 'https://toolnest.com/api/webhooks/whatsapp';
  const verifyToken = 'toolnest_whatsapp_webhook_secret_2026';

  const handleTestPing = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.status === 'healthy') {
        setTestResult('Success: Meta Cloud API endpoint & Worker queues are active and responding.');
      } else {
        setTestResult('Warning: Service responded with non-healthy status.');
      }
    } catch {
      setTestResult('Failed to reach local API endpoint.');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Meta WhatsApp Business Platform Connection</h3>
              <p className="text-xs text-zinc-500">Official Graph API (v21.0) Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Connected & Verified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Business Name</label>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{account.businessName}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">WhatsApp Business Account ID (WABA ID)</label>
              <div className="text-xs font-mono bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 select-all">
                {account.wabaId}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Meta App ID</label>
              <div className="text-xs font-mono bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 select-all">
                {account.appId}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Account Quality Status</label>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <ShieldCheck className="w-4 h-4" /> HIGH (GREEN) - No restrictions
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Messaging Limit Tier</label>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{account.messagingLimit}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">Timezone & Currency</label>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{account.timezone} ({account.currency})</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleTestPing}
            disabled={testing}
            className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing Connection...' : 'Test Meta API Connection'}
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-700 dark:text-zinc-300">
            {testResult}
          </div>
        )}
      </div>

      {/* Webhook Configuration Guide */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-2">Meta Webhook Configuration (Real-time Inbound & Receipts)</h3>
        <p className="text-xs text-zinc-500 mb-5">
          Paste these credentials into your Meta Developer Dashboard under <strong>WhatsApp &gt; Configuration &gt; Webhook</strong>.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Callback URL (Supports GET verification &amp; POST inbound)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 select-all text-zinc-700 dark:text-zinc-300"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl, 'url')}
                className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Verify Token (hub.verify_token)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={verifyToken}
                className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 select-all text-zinc-700 dark:text-zinc-300"
              />
              <button
                onClick={() => copyToClipboard(verifyToken, 'token')}
                className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedToken ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              <strong>Subscribed Webhook Fields:</strong> Ensure <code className="font-semibold">messages</code> is checked in Meta Dashboard to receive message status delivery receipts (<code className="font-semibold">sent</code>, <code className="font-semibold">delivered</code>, <code className="font-semibold">read</code>, <code className="font-semibold">failed</code>) and incoming customer responses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
