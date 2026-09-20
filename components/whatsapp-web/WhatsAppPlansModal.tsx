'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Gift,
  ArrowRight,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';

interface WhatsAppPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planType: '1_month' | '3_months' | '6_months') => void;
  onRequestTrial?: () => void;
  isLoggedIn?: boolean;
}

export const WhatsAppPlansModal: React.FC<WhatsAppPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  onRequestTrial,
  isLoggedIn = false
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'trial',
      name: '10-Day Free Trial',
      price: '₹0',
      duration: '10 Days',
      badge: 'Free Trial',
      badgeColor: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
      dailyLimit: '100 / day',
      accounts: '1 Account',
      description: 'Experience all core features before deciding.',
      features: [
        '10 Days complete access',
        'Send photos and PDF files',
        'Customer name tags {name}',
        'Safe anti-ban delay controls',
        'No credit card required'
      ],
      isTrial: true
    },
    {
      id: '1_month',
      name: '1 Month Plan',
      price: '₹317',
      duration: '30 Days',
      badge: 'Starter',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      dailyLimit: '450 / day',
      accounts: '1 Account',
      description: 'Affordable plan for steady monthly outreach.',
      features: [
        'Unlimited* Bulk WhatsApp Messages',
        '450 messages / day limit',
        '1 WhatsApp Account connection',
        'Templates & Contact Import',
        'Realtime Sent / Failed Reports',
        'Personalized {name} messages'
      ],
      planKey: '1_month' as const
    },
    {
      id: '3_months',
      name: '3 Months Plan',
      price: '₹817',
      duration: '90 Days',
      badge: 'Most Popular',
      badgeColor: 'bg-[#5722AF]/15 text-[#5722AF] dark:bg-[#5722AF]/30 dark:text-purple-300 border border-[#5722AF]/30',
      popular: true,
      dailyLimit: '650 / day',
      accounts: '1 Account',
      description: 'Best choice for continuous business growth.',
      features: [
        'Unlimited* Bulk WhatsApp Messages',
        '650 messages / day limit',
        '1 WhatsApp Account connection',
        'Priority WhatsApp Support',
        'Templates & Contact Import',
        'Full Campaign History'
      ],
      planKey: '3_months' as const
    },
    {
      id: '6_months',
      name: '6 Months Plan',
      price: '₹1,217',
      duration: '180 Days',
      badge: 'Best Value',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      dailyLimit: '850 / day',
      accounts: '2 Accounts',
      description: 'Complete power suite with billing and customer tools.',
      features: [
        'Unlimited* Bulk WhatsApp Messages',
        '850 messages / day limit',
        '2 WhatsApp Accounts connection',
        '6-Month Invoicing & WhatsApp Delivery',
        'Advanced Customer Management',
        'Priority WhatsApp Support'
      ],
      planKey: '6_months' as const
    }
  ];

  const comparisonRows = [
    { feature: 'Price', m1: '₹317', m3: '₹817', m6: '₹1,217', highlight: false },
    { feature: 'Plan Duration', m1: '30 Days', m3: '90 Days', m6: '180 Days', highlight: false },
    { feature: 'Bulk WhatsApp Messages', m1: 'Unlimited*', m3: 'Unlimited*', m6: 'Unlimited*', highlight: false },
    { feature: 'Daily Sending Limit', m1: '450 / day', m3: '650 / day', m6: '850 / day', highlight: true },
    { feature: 'WhatsApp Account Connection', m1: '1 Account', m3: '1 Account', m6: '2 Accounts', highlight: true },
    { feature: 'Message Templates', m1: true, m3: true, m6: true, highlight: false },
    { feature: 'Contact Import', m1: true, m3: true, m6: true, highlight: false },
    { feature: 'Bulk Campaigns', m1: true, m3: true, m6: true, highlight: false },
    { feature: 'Campaign History', m1: true, m3: true, m6: true, highlight: false },
    { feature: 'Sent / Failed Reports', m1: true, m3: true, m6: true, highlight: false },
    { feature: 'Personalized Messages', m1: true, m3: true, m6: true, highlight: false },
    { feature: 'Scheduling', m1: false, m3: false, m6: false, highlight: false },
    { feature: '6-Month Billing / Invoice Feature', m1: false, m3: false, m6: true, highlight: true },
    { feature: 'Create Customer Invoices', m1: false, m3: false, m6: true, highlight: false },
    { feature: 'Send Invoice on WhatsApp', m1: false, m3: false, m6: true, highlight: false },
    { feature: 'Invoice History', m1: false, m3: false, m6: true, highlight: false },
    { feature: 'Customer Management', m1: false, m3: false, m6: 'Advanced', highlight: true },
    { feature: 'Priority Support', m1: false, m3: true, m6: true, highlight: false }
  ];

  const handleAction = (planKey?: '1_month' | '3_months' | '6_months', isTrial?: boolean) => {
    onClose();
    if (isTrial) {
      if (onRequestTrial) onRequestTrial();
    } else if (planKey && onSelectPlan) {
      onSelectPlan(planKey);
    }
  };

  const renderCellValue = (val: any) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <Check className="w-3.5 h-3.5" />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
          <X className="w-3.5 h-3.5" />
        </span>
      );
    }
    return <span className="font-semibold text-xs sm:text-sm">{val}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-5 max-h-[92vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5722AF]/10 dark:bg-[#5722AF]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simple, Transparent Pricing</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
              WhatsApp Marketing Plans
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pick the right plan for your business. Fast activation via UPI QR Code.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Switcher */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Comparison Table</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 relative z-10">
          {viewMode === 'cards' ? (
            /* Cards View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((p, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-4 flex flex-col justify-between space-y-4 border transition-all ${
                    p.popular
                      ? 'border-[#5722AF] bg-purple-50/30 dark:bg-purple-950/20 shadow-sm relative ring-1 ring-[#5722AF]/40'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-400">{p.duration}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{p.name}</h4>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">{p.price}</span>
                        <span className="text-xs text-zinc-400">/ {p.duration}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{p.description}</p>
                    </div>

                    {/* Key Metrics Chips */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <div className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                        <div className="text-[9px] text-zinc-400 uppercase font-semibold">Daily Limit</div>
                        <div className="text-[11px] font-extrabold text-[#5722AF] dark:text-purple-300">{p.dailyLimit}</div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                        <div className="text-[9px] text-zinc-400 uppercase font-semibold">Accounts</div>
                        <div className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200">{p.accounts}</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-700/60">
                      {p.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-[11px] text-zinc-700 dark:text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleAction(p.planKey, p.isTrial)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                        p.popular
                          ? 'bg-[#5722AF] hover:bg-[#471a93] text-white'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900'
                      }`}
                    >
                      {p.isTrial ? (
                        <>
                          <Gift className="w-3.5 h-3.5" />
                          <span>Claim Free Trial</span>
                        </>
                      ) : isLoggedIn ? (
                        <>
                          <span>Renew / Choose ({p.price})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Choose Plan ({p.price})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Comparison Table View */
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-3.5 font-bold w-2/5">Feature</th>
                      <th className="p-3.5 text-center font-bold">
                        <div>1 Month</div>
                        <div className="text-base text-[#5722AF] dark:text-purple-300 font-extrabold mt-0.5">₹317</div>
                      </th>
                      <th className="p-3.5 text-center font-bold bg-purple-50/50 dark:bg-purple-950/30 border-x border-purple-200/60 dark:border-purple-900/60">
                        <div className="flex items-center justify-center gap-1">
                          <span>3 Months</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#5722AF] text-white">Popular</span>
                        </div>
                        <div className="text-base text-[#5722AF] dark:text-purple-300 font-extrabold mt-0.5">₹817</div>
                      </th>
                      <th className="p-3.5 text-center font-bold">
                        <div>6 Months</div>
                        <div className="text-base text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5">₹1,217</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {comparisonRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${
                          row.highlight ? 'bg-purple-50/20 dark:bg-purple-950/10 font-semibold' : ''
                        }`}
                      >
                        <td className="p-3.5 font-medium text-zinc-900 dark:text-white">
                          {row.feature}
                        </td>
                        <td className="p-3.5 text-center">
                          {renderCellValue(row.m1)}
                        </td>
                        <td className="p-3.5 text-center bg-purple-50/30 dark:bg-purple-950/20 border-x border-purple-200/40 dark:border-purple-900/40 font-semibold text-zinc-900 dark:text-white">
                          {renderCellValue(row.m3)}
                        </td>
                        <td className="p-3.5 text-center font-semibold text-zinc-900 dark:text-white">
                          {renderCellValue(row.m6)}
                        </td>
                      </tr>
                    ))}
                    {/* Action Row */}
                    <tr className="bg-zinc-50/80 dark:bg-zinc-800/50">
                      <td className="p-3.5 font-bold text-zinc-900 dark:text-white">
                        Action
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleAction('1_month')}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold cursor-pointer"
                        >
                          Select ₹317
                        </button>
                      </td>
                      <td className="p-3 text-center bg-purple-50/40 dark:bg-purple-950/30 border-x border-purple-200/40 dark:border-purple-900/40">
                        <button
                          onClick={() => handleAction('3_months')}
                          className="px-4 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Select ₹817
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleAction('6_months')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Select ₹1,217
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>*Unlimited messaging is subject to daily anti-ban limits &amp; WhatsApp fair usage policy</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAction(undefined, true)}
              className="text-[#5722AF] dark:text-purple-300 font-semibold hover:underline cursor-pointer"
            >
              Need a 10-Day Trial? Click here
            </button>
            <span>•</span>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
