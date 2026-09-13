'use client';

import React, { useState } from 'react';
import { MessageTemplate } from '@/lib/whatsapp/types';
import { FileText, PlusCircle, CheckCircle, Smartphone, X, AlertCircle } from 'lucide-react';

interface TemplateManagerProps {
  templates: MessageTemplate[];
  onRefresh: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('MARKETING');
  const [headerText, setHeaderText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const buttons = buttonText ? [{ type: 'URL' as const, text: buttonText, url: buttonUrl || 'https://toolnest.com' }] : [];

      const res = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, '_'),
          category,
          language: 'en_US',
          headerType: headerText ? 'TEXT' : 'NONE',
          headerText: headerText || undefined,
          bodyText,
          footerText: footerText || undefined,
          buttons
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.errors?.join(', ') || data.error || 'Failed to register template');
        return;
      }

      setShowCreateModal(false);
      setName('');
      setHeaderText('');
      setBodyText('');
      setFooterText('');
      setButtonText('');
      setButtonUrl('');
      onRefresh();
    } catch {
      setErrorMsg('Network request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Meta Message Templates</h2>
          <p className="text-xs text-zinc-500">Official pre-approved message formats for outbound business notifications</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Create Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map(t => (
          <div key={t.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between hover:border-[#5722AF]/50 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-[#5722AF] dark:bg-purple-950 dark:text-purple-300">
                  {t.category}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {t.status}
                </span>
              </div>

              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 font-mono">{t.name}</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Language: {t.language}</p>

              {/* Chat Bubble Rendering */}
              <div className="mt-4 p-3.5 bg-[#efeae2]/60 dark:bg-[#121b22]/70 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                {t.headerText && (
                  <div className="font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-700/60 pb-1">
                    {t.headerText}
                  </div>
                )}
                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed text-[11px]">
                  {t.bodyText}
                </p>
                {t.footerText && (
                  <div className="text-[10px] text-zinc-400">
                    {t.footerText}
                  </div>
                )}
                {t.buttons && t.buttons.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60 space-y-1">
                    {t.buttons.map((b, idx) => (
                      <div key={idx} className="bg-white dark:bg-zinc-800 py-1 px-2 rounded text-center text-[10px] font-semibold text-[#5722AF]">
                        {b.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-[11px] text-zinc-400">
              <span>Placeholders: {t.variables.length > 0 ? t.variables.map(v => `{{${v}}}`).join(', ') : 'None'}</span>
              <span>Created {new Date(t.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Create WhatsApp Message Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Template Name (lowercase, numbers &amp; underscores only) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. order_dispatch_update"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="MARKETING">MARKETING (Promotions, updates, announcements)</option>
                  <option value="UTILITY">UTILITY (Order confirmations, billing, account alerts)</option>
                  <option value="AUTHENTICATION">AUTHENTICATION (OTP, verification codes)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Header Text (Optional)</label>
                <input
                  type="text"
                  value={headerText}
                  onChange={e => setHeaderText(e.target.value)}
                  placeholder="e.g. Special Offer For You"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Body Text (Use {"{{1}}"}, {"{{2}}"} for dynamic variables) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={bodyText}
                  onChange={e => setBodyText(e.target.value)}
                  placeholder="Hi {{1}}, thank you for your order #{{2}}! It is now being dispatched."
                  className="w-full text-xs p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Footer Text (Optional)</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={e => setFooterText(e.target.value)}
                  placeholder="e.g. Reply STOP to opt out"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">CTA Button Text (Optional)</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={e => setButtonText(e.target.value)}
                    placeholder="e.g. Track Order"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">CTA URL</label>
                  <input
                    type="url"
                    value={buttonUrl}
                    onChange={e => setButtonUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold"
                >
                  {isSubmitting ? 'Submitting...' : 'Register Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
