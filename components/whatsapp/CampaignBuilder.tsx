'use client';

import React, { useState } from 'react';
import { Campaign, MessageTemplate, Contact, ContactTag } from '@/lib/whatsapp/types';
import { Send, Calendar, Check, AlertCircle, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { ContactService } from '@/lib/whatsapp/contacts';
import { TemplateService } from '@/lib/whatsapp/templates';

interface CampaignBuilderProps {
  templates: MessageTemplate[];
  contacts: Contact[];
  tags: ContactTag[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({
  templates,
  contacts,
  tags,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [variableMapping, setVariableMapping] = useState<Record<string, string>>({ '1': 'firstName', '2': 'metadata.discount' });
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const eligibleContacts = ContactService.filterEligibleRecipients(contacts, selectedTags);
  const suppressedCount = contacts.filter(c => c.consentStatus === 'OPTED_OUT').length;

  const handleLaunch = async () => {
    if (!policyAgreed) {
      setErrorMsg('You must agree to the WhatsApp Business Policy regarding verified recipient opt-in.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/whatsapp/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          templateId: selectedTemplate.id,
          senderPhoneNumberId: 'phone_id_9928374',
          targetTags: selectedTags,
          scheduledAt: isScheduled ? scheduledAt : undefined,
          variableMapping
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to dispatch campaign');
        return;
      }

      onSuccess();
    } catch {
      setErrorMsg('Network error while dispatching campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
      {/* Wizard Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Create WhatsApp Campaign</h2>
          <p className="text-xs text-zinc-500">Step {step} of 4: {
            step === 1 ? 'Campaign Details' :
            step === 2 ? 'Select Meta Approved Template' :
            step === 3 ? 'Target Audience & Personalization' : 'Review & Policy Compliance'
          }</p>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`w-8 h-2 rounded-full transition ${
                s <= step ? 'bg-[#5722AF]' : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. VIP Fall Promo 2026"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Internal Description / Goal
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe campaign objectives..."
                className="w-full text-xs p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={e => setIsScheduled(e.target.checked)}
                  className="rounded text-[#5722AF] focus:ring-[#5722AF]"
                />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Schedule for a future date/time
                </span>
              </label>

              {isScheduled && (
                <div>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Campaign will automatically queue when scheduled time arrives.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select Template */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Select Approved WhatsApp Template
              </label>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {templates.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedTemplate?.id === t.id
                        ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/15'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{t.name}</div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {t.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">Category: {t.category} • Lang: {t.language}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Smartphone Preview */}
            <div className="bg-zinc-100 dark:bg-zinc-800/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col justify-center items-center">
              <div className="w-72 bg-[#efeae2] dark:bg-[#121b22] rounded-2xl shadow-xl p-3 border border-zinc-300 dark:border-zinc-700">
                <div className="bg-white dark:bg-[#1f2c34] rounded-xl p-3 shadow-xs space-y-2 text-zinc-900 dark:text-zinc-100 text-xs">
                  {selectedTemplate?.headerText && (
                    <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200 border-b pb-1">
                      {selectedTemplate.headerText}
                    </div>
                  )}
                  <p className="text-xs leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300">
                    {selectedTemplate?.bodyText}
                  </p>
                  {selectedTemplate?.footerText && (
                    <div className="text-[10px] text-zinc-400">
                      {selectedTemplate.footerText}
                    </div>
                  )}
                </div>
                {selectedTemplate?.buttons && selectedTemplate.buttons.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedTemplate.buttons.map((b, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#1f2c34] py-1.5 px-3 rounded-lg text-center text-xs font-semibold text-[#5722AF] dark:text-purple-300 shadow-xs">
                        {b.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 mt-3">WhatsApp Cloud API Bubble Rendering</span>
            </div>
          </div>
        )}

        {/* Step 3: Audience & Variables */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Target Tags (Recipients will be strictly filtered to opted-in users with these tags)
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => {
                  const isChecked = selectedTags.includes(t.name);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedTags(selectedTags.filter(item => item !== t.name));
                        } else {
                          setSelectedTags([...selectedTags, t.name]);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition ${
                        isChecked
                          ? 'bg-[#5722AF] text-white border-[#5722AF]'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs flex items-center justify-between">
                <span>Eligible Opted-In Recipients: <strong>{eligibleContacts.length}</strong></span>
                <span className="text-zinc-500">({suppressedCount} opted-out contacts automatically excluded)</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Personalization Variable Mapping
              </h4>
              <div className="space-y-3">
                {selectedTemplate?.variables.map(v => (
                  <div key={v} className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold w-14 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-center">
                      {"{{" + v + "}}"}
                    </span>
                    <select
                      value={variableMapping[v] || 'firstName'}
                      onChange={e => setVariableMapping({ ...variableMapping, [v]: e.target.value })}
                      className="text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="firstName">Contact: First Name</option>
                      <option value="lastName">Contact: Last Name</option>
                      <option value="phoneNumber">Contact: Phone Number</option>
                      <option value="metadata.discount">Metadata: Discount Code</option>
                      <option value="metadata.company">Metadata: Company Name</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Compliance */}
        {step === 4 && (
          <div className="space-y-6 max-w-xl">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Campaign Name:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{name || 'Untitled Campaign'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Template:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedTemplate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Audience:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{eligibleContacts.length} verified opted-in recipients</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Schedule:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{isScheduled ? scheduledAt : 'Immediate Dispatch'}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs text-emerald-900 dark:text-emerald-200">
                    Official WhatsApp Policy Compliance Pledge
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                    By launching this campaign, you certify that each recipient explicitly consented to receive WhatsApp messages from your brand. Any automated opt-out keywords (STOP) will be immediately honored.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyAgreed}
                  onChange={e => setPolicyAgreed(e.target.checked)}
                  className="rounded text-[#5722AF] focus:ring-[#5722AF]"
                />
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  I confirm all recipients have explicitly opted in.
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <button
          onClick={step === 1 ? onCancel : () => setStep(step - 1)}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 4 ? (
          <button
            onClick={() => {
              if (step === 1 && !name.trim()) {
                setErrorMsg('Please provide a campaign name.');
                return;
              }
              setErrorMsg('');
              setStep(step + 1);
            }}
            className="px-5 py-2.5 bg-[#5722AF] hover:bg-[#471a93] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleLaunch}
            disabled={isSubmitting || !policyAgreed}
            className="px-6 py-2.5 bg-[#5722AF] hover:bg-[#471a93] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? 'Dispatching...' : isScheduled ? 'Schedule Campaign' : 'Launch Broadcast Now'}
          </button>
        )}
      </div>
    </div>
  );
};
