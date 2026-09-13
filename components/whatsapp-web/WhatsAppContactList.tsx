'use client';

import React, { useState } from 'react';
import {
  Users,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Globe,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { WebContact } from '@/lib/whatsapp-web/types';
import { WhatsAppSenderEngine, POPULAR_COUNTRY_CODES } from '@/lib/whatsapp-web/sender';

interface WhatsAppContactListProps {
  contacts: WebContact[];
  onContactsChange: (contacts: WebContact[]) => void;
  messageTemplate: string;
}

export const WhatsAppContactList: React.FC<WhatsAppContactListProps> = ({
  contacts,
  onContactsChange,
  messageTemplate
}) => {
  const [rawText, setRawText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedDialCode, setSelectedDialCode] = useState('91'); // Default to India (+91)

  const handleBulkPaste = () => {
    if (!rawText.trim()) return;
    const parsed = WhatsAppSenderEngine.parseRawText(rawText, selectedDialCode);
    if (parsed.length > 0) {
      onContactsChange([...contacts, ...parsed]);
      setRawText('');
      setShowPasteBox(false);
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;
    const clean = WhatsAppSenderEngine.cleanPhone(newPhone, selectedDialCode);
    const newContact: WebContact = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newName.trim() || `Contact ${contacts.length + 1}`,
      phoneNumber: clean,
      status: 'PENDING'
    };
    onContactsChange([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
  };

  const handleLoadSample = () => {
    const sample = WhatsAppSenderEngine.getSampleContacts();
    onContactsChange(sample);
  };

  const handleClearAll = () => {
    if (confirm('Clear all contacts from the list?')) {
      onContactsChange([]);
    }
  };

  const handleRemove = (id: string) => {
    onContactsChange(contacts.filter(c => c.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (text) {
        const parsed = WhatsAppSenderEngine.parseRawText(text, selectedDialCode);
        onContactsChange([...contacts, ...parsed]);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#5722AF]" />
            Audience &amp; Phone Numbers ({contacts.length})
          </h3>
          <p className="text-xs text-zinc-500">Paste numbers, upload CSV, or add individually.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Country Dial Code Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={selectedDialCode}
              onChange={e => setSelectedDialCode(e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
              title="Default Country Code for 10-digit numbers"
            >
              {POPULAR_COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.dialCode} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {c.flag} +{c.dialCode} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="px-3 py-1.5 bg-[#5722AF]/10 hover:bg-[#5722AF]/20 text-[#5722AF] dark:text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {showPasteBox ? 'Close' : 'Bulk Paste'}
          </button>

          <label className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            CSV Upload
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>

          {contacts.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 text-zinc-400 hover:text-rose-600 transition"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Paste Box */}
      {showPasteBox && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Paste Numbers (e.g. &quot;Name, 8962048813&quot; or one number per line)
            </label>
            <span className="text-[11px] text-zinc-400">
              10-digit numbers will use default prefix <strong>+{selectedDialCode}</strong>
            </span>
          </div>
          <textarea
            rows={4}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder={`Rohan, 8962048813\nPriya, +919876543210\n+919123456789\n8962048813`}
            className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPasteBox(false)}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkPaste}
              className="px-4 py-1.5 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Import Numbers
            </button>
          </div>
        </div>
      )}

      {/* Add Single Contact Form */}
      <form onSubmit={handleAddManual} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Contact Name (optional)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
        />
        <div className="flex-1 flex gap-1.5">
          <input
            type="text"
            placeholder={`Phone Number (e.g. 8962048813 or +${selectedDialCode}...)`}
            value={newPhone}
            onChange={e => setNewPhone(e.target.value)}
            className="flex-1 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </form>

      {/* Contacts List Table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            No contacts added yet. Click &quot;Bulk Paste&quot;, &quot;CSV Upload&quot;, or &quot;Load Sample&quot; to begin.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">WhatsApp Number</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {contacts.map((c, idx) => (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2 px-3 text-zinc-400 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-zinc-800 dark:text-zinc-200">{c.name}</td>
                  <td className="py-2 px-3 font-mono text-zinc-600 dark:text-zinc-300">
                    {c.phoneNumber}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'SENT'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : c.status === 'SENDING'
                          ? 'bg-purple-100 text-[#5722AF] animate-pulse dark:bg-purple-950 dark:text-purple-300'
                          : c.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {c.status === 'SENT' && <CheckCircle2 className="w-3 h-3" />}
                      {c.status === 'SENDING' && <Clock className="w-3 h-3" />}
                      {c.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Direct WhatsApp Web link for testing or manual send */}
                      <a
                        href={WhatsAppSenderEngine.getDirectWhatsAppWebUrl(
                          c.phoneNumber,
                          WhatsAppSenderEngine.interpolate(messageTemplate, c)
                        )}
                        target="_blank"
                        rel="noreferrer"
                        title="Open direct chat in WhatsApp Web"
                        className="p-1 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleRemove(c.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded transition"
                        title="Remove contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
