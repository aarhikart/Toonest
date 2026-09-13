'use client';

import React, { useState } from 'react';
import { WhatsAppMessage, Contact } from '@/lib/whatsapp/types';
import { Send, CheckCheck, Check, Clock, User, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface InboxProps {
  conversations: Array<{
    contactId?: string;
    contactName: string;
    phoneNumber: string;
    consentStatus: string;
    lastMessage: string;
    lastTimestamp: string;
    unreadCount: number;
    messages: WhatsAppMessage[];
  }>;
  onRefresh: () => void;
}

export const InboxConversation: React.FC<InboxProps> = ({ conversations, onRefresh }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const activeConv = conversations[selectedIdx] || conversations[0];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    setSending(true);

    try {
      await fetch('/api/whatsapp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeConv.phoneNumber,
          text: replyText,
          contactId: activeConv.contactId
        })
      });

      setReplyText('');
      onRefresh();
    } catch {
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const quickReplies = [
    'Hello! How can our support team assist you today?',
    'Thank you for reaching out! We are processing your request now.',
    'I have updated your account information as requested.'
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden h-[640px] flex flex-col md:flex-row">
      {/* Left Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Customer Conversations</h3>
          <p className="text-[11px] text-zinc-500">2-Way Live WhatsApp Messaging</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {conversations.map((conv, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                selectedIdx === idx
                  ? 'bg-purple-50/80 dark:bg-purple-950/40 border-l-4 border-[#5722AF]'
                  : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5722AF] to-[#9B6BE8] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {conv.contactName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {conv.contactName}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{conv.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Chat Panel */}
      {activeConv ? (
        <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a]">
          {/* Chat Header */}
          <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-[#5722AF] flex items-center justify-center font-bold text-sm">
                {activeConv.contactName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  {activeConv.contactName}
                  {activeConv.consentStatus === 'OPTED_IN' ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      Opted-in
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold">
                      Opted-out
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 font-mono">{activeConv.phoneNumber}</div>
              </div>
            </div>

            <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              24h Service Window Active
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConv.messages.map(m => {
              const isOut = m.direction === 'OUTBOUND';
              return (
                <div key={m.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-2xl shadow-xs text-xs ${
                    isOut
                      ? 'bg-[#5722AF] text-white rounded-tr-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-xs border border-zinc-200 dark:border-zinc-700'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
                    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isOut ? 'text-purple-200' : 'text-zinc-400'
                    }`}>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isOut && (
                        m.status === 'READ' ? <CheckCheck className="w-3 h-3 text-cyan-300" /> :
                        m.status === 'DELIVERED' ? <CheckCheck className="w-3 h-3 text-purple-200" /> :
                        <Check className="w-3 h-3 text-purple-200" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canned Quick Replies */}
          <div className="px-4 py-2 bg-white/70 dark:bg-zinc-900/70 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-[#5722AF]" /> Quick:
            </span>
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                onClick={() => setReplyText(qr)}
                className="text-[11px] px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-50 hover:text-[#5722AF] text-zinc-700 dark:text-zinc-300 rounded-lg whitespace-nowrap transition"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Chat Reply Form */}
          <form onSubmit={handleSendReply} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type WhatsApp message..."
              className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="px-5 py-2.5 bg-[#5722AF] hover:bg-[#471a93] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-zinc-400">
          Select a conversation to inspect chat history.
        </div>
      )}
    </div>
  );
};
