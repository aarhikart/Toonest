'use client';

import React, { useState } from 'react';
import { Contact, ContactTag } from '@/lib/whatsapp/types';
import {
  Users,
  Search,
  Upload,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  FileSpreadsheet,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

interface ContactManagerProps {
  contacts: Contact[];
  tags: ContactTag[];
  onRefresh: () => void;
  onOpenQr: () => void;
}

export const ContactManager: React.FC<ContactManagerProps> = ({ contacts, tags, onRefresh, onOpenQr }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // New Contact form
  const [newPhone, setNewPhone] = useState('');
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedNewTags, setSelectedNewTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // CSV Import form
  const [csvContent, setCsvContent] = useState('');
  const [csvTags, setCsvTags] = useState<string[]>([]);
  const [csvResult, setCsvResult] = useState<any>(null);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch =
      (c.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm);

    const matchesTag = selectedTag === 'ALL' || c.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/whatsapp/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: newPhone,
          firstName: newFirst,
          lastName: newLast,
          email: newEmail,
          tags: selectedNewTags,
          consentStatus: 'OPTED_IN',
          optInSource: 'Admin Dashboard Entry'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to save contact');
        return;
      }

      setShowAddModal(false);
      setNewPhone('');
      setNewFirst('');
      setNewLast('');
      setNewEmail('');
      setSelectedNewTags([]);
      onRefresh();
    } catch {
      setFormError('Network request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvImport = async () => {
    if (!csvContent.trim()) return;
    setIsSubmitting(true);
    setCsvResult(null);

    try {
      const res = await fetch('/api/whatsapp/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvText: csvContent,
          tags: csvTags
        })
      });

      const data = await res.json();
      setCsvResult(data);
      if (data.success) {
        onRefresh();
      }
    } catch {
      setCsvResult({ success: false, error: 'Import request failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleConsent = async (phoneNumber: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'OPTED_IN' ? 'OPTED_OUT' : 'OPTED_IN';
    await fetch('/api/whatsapp/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle_consent',
        phoneNumber,
        status: nextStatus
      })
    });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    await fetch(`/api/whatsapp/contacts?id=${id}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Audience &amp; Opt-in Management</h2>
          <p className="text-xs text-zinc-500">
            {contacts.length} total contacts • {contacts.filter(c => c.consentStatus === 'OPTED_IN').length} opted-in • {contacts.filter(c => c.consentStatus === 'OPTED_OUT').length} suppressed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenQr}
            className="px-3.5 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition"
          >
            Opt-in QR Code
          </button>
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            Bulk CSV Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name or +E.164 phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedTag('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              selectedTag === 'ALL'
                ? 'bg-[#5722AF] text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            All Contacts
          </button>
          {tags.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTag(t.name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                selectedTag === t.name
                  ? 'bg-[#5722AF] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold">Phone (E.164)</th>
                <th className="py-3 px-4 font-semibold">Consent Status</th>
                <th className="py-3 px-4 font-semibold">Opt-in Source</th>
                <th className="py-3 px-4 font-semibold">Tags</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70 text-zinc-700 dark:text-zinc-300">
              {filteredContacts.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                    <div>{c.firstName} {c.lastName}</div>
                    {c.email && <div className="text-[11px] text-zinc-400">{c.email}</div>}
                  </td>
                  <td className="py-3 px-4 font-mono">{c.phoneNumber}</td>
                  <td className="py-3 px-4">
                    {c.consentStatus === 'OPTED_IN' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <ShieldCheck className="w-3 h-3" /> Opted In
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                        <ShieldAlert className="w-3 h-3" /> Suppressed (Opted Out)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-500">{c.optInSource || 'Website'}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t, idx) => (
                        <span key={idx} className="bg-purple-50 text-[#5722AF] dark:bg-purple-950/50 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleConsent(c.phoneNumber, c.consentStatus)}
                        className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#5722AF] hover:underline"
                        title="Toggle consent status"
                      >
                        {c.consentStatus === 'OPTED_IN' ? 'Mark Opt-Out' : 'Restore Opt-In'}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 transition"
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
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Add WhatsApp Contact</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Phone Number (E.164 format with country code) *
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+12025550192 or +919876543210"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newFirst}
                    onChange={e => setNewFirst(e.target.value)}
                    placeholder="John"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newLast}
                    onChange={e => setNewLast(e.target.value)}
                    placeholder="Doe"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Assign Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => {
                    const isSelected = selectedNewTags.includes(t.name);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedNewTags(selectedNewTags.filter(name => name !== t.name));
                          } else {
                            setSelectedNewTags([...selectedNewTags, t.name]);
                          }
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                          isSelected
                            ? 'bg-[#5722AF] text-white border-[#5722AF]'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs text-zinc-500">
                Contact will be recorded as <strong>Opted-In</strong> by administrator authorization.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#5722AF]" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Bulk Import Contacts (CSV)</h3>
              </div>
              <button onClick={() => setShowCsvModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-500">
                Paste your CSV content below. Header must include <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Phone</code> and optionally <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">First Name</code>, <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Last Name</code>, <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Email</code>, <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Tags</code>.
              </p>

              <div>
                <textarea
                  rows={6}
                  value={csvContent}
                  onChange={e => setCsvContent(e.target.value)}
                  placeholder={`phone,firstName,lastName,email,tags\n+12025550192,John,Doe,john@example.com,VIP Customers;Developers\n+442079460192,Jane,Smith,jane@example.com,Product Leads`}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
                />
              </div>

              {csvResult && (
                <div className={`p-3 rounded-xl text-xs ${
                  csvResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {csvResult.success ? (
                    <div>
                      Successfully imported <strong>{csvResult.importedCount}</strong> contacts.
                      {csvResult.errors?.length > 0 && (
                        <div className="mt-1 text-[11px] text-amber-700">
                          {csvResult.errors.length} rows skipped due to invalid formats.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>Error: {csvResult.error}</div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Close
                </button>
                <button
                  onClick={handleCsvImport}
                  disabled={isSubmitting || !csvContent.trim()}
                  className="px-4 py-2 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold"
                >
                  {isSubmitting ? 'Importing...' : 'Parse & Import CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
