'use client';

import React, { useState } from 'react';
import { WhatsAppMessage } from '@/lib/whatsapp/types';
import { Send, RefreshCw, Filter, Search, CheckCheck, Check, Clock, AlertCircle } from 'lucide-react';

interface MessageLogsProps {
  messages: WhatsAppMessage[];
  onRefresh: () => void;
}

export const MessageLogs: React.FC<MessageLogsProps> = ({ messages, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'OUTBOUND' | 'INBOUND'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Single test send modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [testPhone, setTestPhone] = useState('+12025550143');
  const [testText, setTestText] = useState('Hello! This is an official WhatsApp test message from ToolNest.');
  const [sending, setSending] = useState(false);

  const filtered = messages.filter(m => {
    const matchesSearch =
      m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.to.includes(searchTerm) ||
      m.from.includes(searchTerm);

    const matchesDirection = directionFilter === 'ALL' || m.direction === directionFilter;
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesDirection && matchesStatus;
  });

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch('/api/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testPhone,
          text: testText
        })
      });
      setShowSendModal(false);
      onRefresh();
    } catch {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Message Audit Logs &amp; Delivery Tracking</h2>
          <p className="text-xs text-zinc-500">Full lifecycle telemetry with Meta Cloud API delivery receipts</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            Send Single Test Message
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search content or phone number..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={directionFilter}
            onChange={e => setDirectionFilter(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <option value="ALL">All Directions</option>
            <option value="OUTBOUND">Outbound</option>
            <option value="INBOUND">Inbound</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="READ">Read</option>
            <option value="DELIVERED">Delivered</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
              <tr>
                <th className="py-3 px-4 font-semibold">Direction</th>
                <th className="py-3 px-4 font-semibold">Recipient / Sender</th>
                <th className="py-3 px-4 font-semibold">Message Content</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.direction === 'OUTBOUND' ? 'bg-purple-100 text-[#5722AF]' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {m.direction}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="text-zinc-900 dark:text-zinc-100 font-sans font-medium">{m.contactName}</div>
                    <div className="text-[11px] text-zinc-400">{m.direction === 'OUTBOUND' ? m.to : m.from}</div>
                  </td>
                  <td className="py-3 px-4 max-w-md">
                    <p className="line-clamp-2 text-zinc-700 dark:text-zinc-300">{m.content}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      m.status === 'READ' ? 'bg-blue-100 text-blue-700' :
                      m.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                      m.status === 'SENT' ? 'bg-zinc-100 text-zinc-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {m.status === 'READ' && <CheckCheck className="w-3.5 h-3.5 text-blue-600" />}
                      {m.status === 'DELIVERED' && <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      {m.status === 'SENT' && <Check className="w-3.5 h-3.5 text-zinc-500" />}
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400 text-[11px]">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Test Message Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Send Direct WhatsApp Message</h3>
              <button onClick={() => setShowSendModal(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
            </div>

            <form onSubmit={handleSendTestMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Recipient Phone (+E.164)</label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={testText}
                  onChange={e => setTestText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs text-zinc-500">
                Note: Non-template freeform text is permitted when responding within customer 24-hour service windows.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
