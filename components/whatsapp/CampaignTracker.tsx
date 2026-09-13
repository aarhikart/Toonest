'use client';

import React, { useState } from 'react';
import { Campaign, CampaignRecipient } from '@/lib/whatsapp/types';
import { Play, Pause, CheckCircle2, Clock, Users, ArrowUpRight, RefreshCw, X } from 'lucide-react';

interface CampaignTrackerProps {
  campaigns: Campaign[];
  onRefresh: () => void;
  onNewCampaign: () => void;
}

export const CampaignTracker: React.FC<CampaignTrackerProps> = ({ campaigns, onRefresh, onNewCampaign }) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/whatsapp/campaigns?id=${campaignId}`);
      const data = await res.json();
      setRecipients(data.recipients || []);
    } catch {
      setRecipients([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Campaigns &amp; Broadcast Dispatcher</h2>
          <p className="text-xs text-zinc-500">Live delivery telemetry, rate-limited queuing and recipient progression</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onNewCampaign}
            className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            Create Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Campaign Name</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Template</th>
                <th className="py-3 px-4 font-semibold">Audience</th>
                <th className="py-3 px-4 font-semibold">Delivery Progress</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70 text-zinc-700 dark:text-zinc-300">
              {campaigns.map(cmp => {
                const total = cmp.totalRecipients || 1;
                const sentPct = Math.round((cmp.sentCount / total) * 100);
                const deliveredPct = Math.round((cmp.deliveredCount / total) * 100);
                const readPct = Math.round((cmp.readCount / total) * 100);

                return (
                  <tr key={cmp.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <div>{cmp.name}</div>
                      {cmp.description && <div className="text-[11px] text-zinc-400 line-clamp-1">{cmp.description}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        cmp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        cmp.status === 'RUNNING' ? 'bg-purple-100 text-[#5722AF] animate-pulse' :
                        cmp.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {cmp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {cmp.templateName}
                    </td>
                    <td className="py-3 px-4">
                      {cmp.totalRecipients} recipients
                    </td>
                    <td className="py-3 px-4 w-48">
                      <div className="space-y-1">
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                          <div style={{ width: `${readPct}%` }} className="bg-blue-500 h-full" title="Read" />
                          <div style={{ width: `${Math.max(0, deliveredPct - readPct)}%` }} className="bg-emerald-500 h-full" title="Delivered" />
                          <div style={{ width: `${Math.max(0, sentPct - deliveredPct)}%` }} className="bg-purple-400 h-full" title="Sent" />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Sent: {cmp.sentCount}</span>
                          <span>Delivered: {cmp.deliveredCount}</span>
                          <span>Read: {cmp.readCount}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(cmp.id)}
                        className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 transition"
                      >
                        Recipients
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipient Details Modal */}
      {selectedCampaignId && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedCampaign.name}</h3>
                <p className="text-xs text-zinc-500">Live Recipient Dispatch Telemetry</p>
              </div>
              <button onClick={() => setSelectedCampaignId(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {loadingDetails ? (
                <div className="p-8 text-center text-xs text-zinc-500">Loading recipient events...</div>
              ) : recipients.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">No recipient dispatches recorded yet.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    <tr>
                      <th className="py-2.5 px-3">Recipient</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {recipients.map(r => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">{r.contactName}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{r.phoneNumber}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.status === 'READ' ? 'bg-blue-100 text-blue-800' :
                            r.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'SENT' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-zinc-400">
                          {r.readAt ? new Date(r.readAt).toLocaleTimeString() :
                           r.deliveredAt ? new Date(r.deliveredAt).toLocaleTimeString() :
                           r.sentAt ? new Date(r.sentAt).toLocaleTimeString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
