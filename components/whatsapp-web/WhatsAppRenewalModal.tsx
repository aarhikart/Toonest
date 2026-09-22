'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowRight,
  User,
  CreditCard
} from 'lucide-react';
import { PlanLimitsConfig, DEFAULT_PLAN_LIMITS } from '@/lib/whatsapp-web/limit-manager';

interface WhatsAppRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
    businessName: string;
    phoneNumber?: string;
  };
  initialPlan?: '1_month' | '3_months' | '6_months';
  onRenewalSubmitted?: () => void;
  planLimits?: PlanLimitsConfig;
}

export const WhatsAppRenewalModal: React.FC<WhatsAppRenewalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialPlan = '1_month',
  onRenewalSubmitted,
  planLimits
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'1_month' | '3_months' | '6_months'>(initialPlan);
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [limits, setLimits] = useState<PlanLimitsConfig>(planLimits || DEFAULT_PLAN_LIMITS);

  useEffect(() => {
    if (planLimits) {
      setLimits(planLimits);
    } else if (isOpen) {
      fetch('/api/whatsapp/plan-limits')
        .then(r => r.json())
        .then(data => {
          if (data.success && data.limits) setLimits(data.limits);
        })
        .catch(() => {});
    }
  }, [planLimits, isOpen]);

  const UPI_ID = 'hiteshhppatidarhak106-1@oksbi';
  const PAYEE_NAME = 'ToolNest';

  const planPrices: Record<'1_month' | '3_months' | '6_months', { amount: number; label: string; days: string; limit: string }> = {
    '1_month': { amount: 317, label: '1 Month Plan', days: '30 Days', limit: `${limits['1_month']}/day` },
    '3_months': { amount: 817, label: '3 Months Plan', days: '90 Days', limit: `${limits['3_months']}/day` },
    '6_months': { amount: 1217, label: '6 Months Plan', days: '180 Days', limit: `${limits['6_months']}/day (2 Accounts)` }
  };

  useEffect(() => {
    if (initialPlan) setSelectedPlan(initialPlan);
  }, [initialPlan]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPlan = planPrices[selectedPlan];
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${currentPlan.amount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiDeepLink)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!transactionId.trim()) {
      setErrorMsg('Please enter the UPI Transaction ID / UTR number from your payment app.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subscriptions/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
          transactionId: transactionId.trim(),
          username: currentUser.username
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit renewal request.');
      }

      setIsSuccess(true);
      if (onRenewalSubmitted) onRenewalSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error submitting renewal request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-5 max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#5722AF]/10 dark:bg-[#5722AF]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-purple-300 text-xs font-semibold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Plan Renewal &amp; Payment</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mt-1">
              Renew Your WhatsApp Plan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pay via any UPI App (GPay, PhonePe, Paytm) and submit your Transaction ID.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              Renewal Request Submitted!
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Your payment verification has been sent to the Admin. Once verified, your {currentPlan.label} will be activated and you will receive a WhatsApp confirmation.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 relative z-10 text-xs sm:text-sm">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Logged in User Indicator */}
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-400">Account:</span>
                <span className="font-semibold text-zinc-900 dark:text-white font-mono">
                  @{currentUser.username}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">{currentUser.businessName}</span>
            </div>

            {/* Step 1: Select Plan */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                1. Select Plan Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1_month', '3_months', '6_months'] as const).map(pKey => {
                  const p = planPrices[pKey];
                  const isSelected = selectedPlan === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => setSelectedPlan(pKey)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        isSelected
                          ? 'border-[#5722AF] bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-[#5722AF] text-[#5722AF] dark:text-purple-300'
                          : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{p.label}</div>
                      <div className="text-base font-extrabold mt-0.5">₹{p.amount}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{p.days}</div>
                      <div className="text-[9px] font-semibold text-[#5722AF] dark:text-purple-300 mt-0.5">{p.limit}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Pay via QR / UPI */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  2. Scan QR Code &amp; Pay ₹{currentPlan.amount}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Instant UPI
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                {/* QR Code */}
                <div className="w-28 h-28 p-1.5 bg-white rounded-xl border border-zinc-200 shadow-2xs shrink-0 flex items-center justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    className="w-full h-full object-contain rounded-md"
                    loading="lazy"
                  />
                </div>

                {/* UPI ID Details */}
                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div>
                    <div className="text-[11px] text-zinc-400">UPI ID</div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                      <code className="text-xs font-mono font-bold text-zinc-900 dark:text-white bg-zinc-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md">
                        {UPI_ID}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Open GPay, PhonePe, or Paytm, scan the QR code, pay <strong>₹{currentPlan.amount}</strong>, then copy the 12-digit UPI Reference / UTR Number.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Transaction ID Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                3. Enter UPI Transaction ID / UTR Number
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder="e.g. 426810982341 (12 digits)"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#5722AF]"
              />
              <p className="text-[10px] text-zinc-400">
                You can find the UTR / Transaction ID in your UPI app payment history.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5722AF] hover:bg-[#471a93] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Renewal for ₹{currentPlan.amount}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
