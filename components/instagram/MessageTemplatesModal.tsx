'use client';

import React, { useState } from 'react';
import { MessageTemplate } from '@/lib/instagram/types';
import { X, Plus, Trash2, Check, LayoutTemplate } from 'lucide-react';

interface MessageTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  onSaveTemplates: (templates: MessageTemplate[]) => void;
  onSelectTemplate: (content: string) => void;
  onShowToast: (msg: string) => void;
}

export const MessageTemplatesModal: React.FC<MessageTemplatesModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSaveTemplates,
  onSelectTemplate,
  onShowToast,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) return;

    const newTmpl: MessageTemplate = {
      id: `tmpl_${Date.now()}`,
      name: newName.trim(),
      content: newContent.trim(),
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...templates, newTmpl];
    onSaveTemplates(updated);
    setNewName('');
    setNewContent('');
    setIsCreating(false);
    onShowToast(`Created template: "${newTmpl.name}"`);
  };

  const handleDelete = (id: string, name: string) => {
    if (templates.length <= 1) {
      onShowToast('You must keep at least one template');
      return;
    }
    const updated = templates.filter((t) => t.id !== id);
    onSaveTemplates(updated);
    onShowToast(`Deleted template: "${name}"`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8]">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Message Templates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save and reuse message formats across campaigns
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates List */}
        <div className="space-y-3">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {tmpl.name}
                  </span>
                  {tmpl.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-[#5722AF] dark:text-purple-300">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(tmpl.content);
                      onClose();
                      onShowToast(`Applied template: "${tmpl.name}"`);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#5722AF] text-white text-xs font-bold hover:bg-[#481c91] transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Use</span>
                  </button>
                  {!tmpl.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDelete(tmpl.id, tmpl.name)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                {tmpl.content}
              </p>
            </div>
          ))}
        </div>

        {/* Add New Template Section */}
        {isCreating ? (
          <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-3">
            <div className="font-bold text-xs text-[#5722AF] dark:text-purple-300 uppercase tracking-wider">
              Create New Template
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Template Name
              </label>
              <input
                type="text"
                placeholder="e.g. VIP Promo or Follow-up"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#5722AF] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Message Content
              </label>
              <textarea
                rows={3}
                placeholder="Enter template message text..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#5722AF] outline-none"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#5722AF] hover:bg-[#481c91] rounded-xl transition-colors shadow-xs"
              >
                Save Template
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800/60 text-[#5722AF] dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Template</span>
          </button>
        )}
      </div>
    </div>
  );
};
