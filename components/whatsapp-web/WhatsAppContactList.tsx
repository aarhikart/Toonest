'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Globe,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertCircle,
  ArrowRightLeft,
  X,
  ClipboardList
} from 'lucide-react';
import { WebContact } from '@/lib/whatsapp-web/types';
import { WhatsAppSenderEngine, POPULAR_COUNTRY_CODES } from '@/lib/whatsapp-web/sender';

interface WhatsAppContactListProps {
  contacts: WebContact[];
  onContactsChange: (contacts: WebContact[]) => void;
  messageTemplate: string;
  onOpenGuide?: () => void;
}

export const WhatsAppContactList: React.FC<WhatsAppContactListProps> = ({
  contacts,
  onContactsChange,
  messageTemplate,
  onOpenGuide
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'csv' | 'sample'>('single');
  const [rawText, setRawText] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedDialCode, setSelectedDialCode] = useState('91'); // Default to India (+91)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleBulkPaste = () => {
    if (!rawText.trim()) return;
    const parsed = WhatsAppSenderEngine.parseRawText(rawText, selectedDialCode);
    if (parsed.length > 0) {
      onContactsChange([...contacts, ...parsed]);
      setRawText('');
      setIsAddModalOpen(false);
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
    setFeedbackMsg(`✓ Added "${newContact.name}" (+${clean}) to audience.`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleLoadSample = () => {
    const sample = WhatsAppSenderEngine.getSampleContacts();
    onContactsChange(sample);
    setIsAddModalOpen(false);
  };

  const handleClearAll = () => {
    if (confirm('Clear all contacts from the audience list?')) {
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
        setIsAddModalOpen(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-gradient-to-br from-white via-white to-zinc-50/80 dark:from-[#131620] dark:via-zinc-900 dark:to-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#5722AF]" />
              Audience Contacts ({contacts.length})
            </h3>
            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                title="View Step 2 Audience Guide"
                className="p-1 rounded-lg text-zinc-400 hover:text-[#5722AF] dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Build your target recipient audience for WhatsApp delivery.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>

          {contacts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
              title="Clear all contacts"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Empty State OR Clean Table */}
      {contacts.length === 0 ? (
        <div className="py-10 px-4 text-center flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20">
          <div className="w-12 h-12 rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            No Audience Contacts Yet
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Click &quot;Add Customer&quot; to enter individual numbers, bulk paste a phone list, or upload a CSV file.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load 3 Samples</span>
            </button>
          </div>
        </div>
      ) : (
        /* Contacts List Table with Horizontal and Vertical Scrolling for Mobile */
        <div className="space-y-1">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-x-auto overflow-y-auto max-h-72 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
            <table className="w-full text-left text-xs min-w-[540px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 backdrop-blur-xs">
                <tr>
                  <th className="py-2.5 px-3 w-10">#</th>
                  <th className="py-2.5 px-3 min-w-[120px]">Name</th>
                  <th className="py-2.5 px-3 min-w-[160px]">WhatsApp Number</th>
                  <th className="py-2.5 px-3 min-w-[110px]">Status</th>
                  <th className="py-2.5 px-3 min-w-[90px] text-right sticky right-0 bg-zinc-50/95 dark:bg-zinc-800/95 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {contacts.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-2 px-3 text-zinc-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">{c.name}</td>
                    <td className="py-2 px-3 font-mono text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {c.phoneNumber}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
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
                    <td className="py-2 px-3 text-right sticky right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-end gap-1.5">
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
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 pt-1">
            <span className="sm:hidden flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-[#5722AF]" />
              Swipe table to view all columns
            </span>
            <span className="hidden sm:inline">Target audience for sequential campaign delivery</span>
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">{contacts.length} total contacts</span>
          </div>
        </div>
      )}

      {/* Classic & Intuitive "Add Customer" Modal Dialog */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#131620] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Add Customers &amp; Audience
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Choose your preferred import method below
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-1.5 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'single'
                    ? 'bg-white dark:bg-zinc-800 text-[#5722AF] dark:text-purple-300 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Single</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'bulk'
                    ? 'bg-white dark:bg-zinc-800 text-[#5722AF] dark:text-purple-300 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Bulk Paste</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('csv')}
                className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'csv'
                    ? 'bg-white dark:bg-zinc-800 text-[#5722AF] dark:text-purple-300 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>CSV Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sample')}
                className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'sample'
                    ? 'bg-white dark:bg-zinc-800 text-[#5722AF] dark:text-purple-300 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sample</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5">
              {/* Tab 1: Single Customer */}
              {activeTab === 'single' && (
                <form onSubmit={handleAddManual} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Customer Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rohan Sharma"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Country &amp; Phone Number
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
                        <Globe className="w-3.5 h-3.5 text-zinc-500" />
                        <select
                          value={selectedDialCode}
                          onChange={e => setSelectedDialCode(e.target.value)}
                          className="bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                        >
                          {POPULAR_COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.dialCode} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                              {c.flag} +{c.dialCode} ({c.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="tel"
                        required
                        placeholder="e.g. 8962048813"
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                        className="flex-1 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
                      />
                    </div>
                    {newPhone && (
                      <p className="text-[11px] text-zinc-400 mt-1.5 font-mono">
                        Formatted destination: +{WhatsAppSenderEngine.cleanPhone(newPhone, selectedDialCode)}
                      </p>
                    )}
                  </div>

                  {feedbackMsg && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{feedbackMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Done
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to List</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Bulk Paste */}
              {activeTab === 'bulk' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Paste Contact List
                    </label>
                    <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
                      <Globe className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-500">Default:</span>
                      <select
                        value={selectedDialCode}
                        onChange={e => setSelectedDialCode(e.target.value)}
                        className="bg-transparent text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                      >
                        {POPULAR_COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.dialCode} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                            {c.flag} +{c.dialCode}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500">
                    Format: <code>Name, 8962048813</code> or simply paste one phone number per line.
                  </p>

                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    placeholder={`Rohan, 8962048813\nPriya, +919876543210\n+919123456789\n8962048813`}
                    className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-zinc-400">
                      {rawText.trim() ? `${rawText.trim().split('\n').filter(l => l.trim()).length} line(s) entered` : 'Enter numbers to import'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkPaste}
                        disabled={!rawText.trim()}
                        className="px-5 py-2 bg-[#5722AF] hover:bg-[#471a93] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Import Numbers</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: CSV Upload */}
              {activeTab === 'csv' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Upload Contacts File (.csv or .txt)
                    </label>
                    <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
                      <Globe className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-500">Default:</span>
                      <select
                        value={selectedDialCode}
                        onChange={e => setSelectedDialCode(e.target.value)}
                        className="bg-transparent text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                      >
                        {POPULAR_COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.dialCode} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                            {c.flag} +{c.dialCode}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-purple-400 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer transition group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Click to choose CSV or TXT file
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-1">
                      Expected columns: Name, Phone Number
                    </span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-500 space-y-1">
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">File format guide:</p>
                    <p>• Plain text with lines like: <code>Rahul, 9876543210</code></p>
                    <p>• Or CSV with columns: <code>Name</code> and <code>Phone</code></p>
                  </div>
                </div>
              )}

              {/* Tab 4: Sample Data */}
              {activeTab === 'sample' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>Instant Demo / Test Audience</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Click below to load 3 verified sample contacts. This allows you to safely test message interpolation, personalization variables, and campaign dispatch without entering real numbers.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Load 3 Sample Contacts</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
