'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  ChevronDown,
  HelpCircle,
  QrCode,
  Users,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I connect my WhatsApp account?',
    answer:
      'In Step 1, open WhatsApp on your phone, tap Settings (or the 3 dots) > Linked Devices > Link a Device, and scan the QR code on your screen. You can also connect using your phone number to receive an 8-digit pairing code.'
  },
  {
    question: 'How does this keep my WhatsApp account safe?',
    answer:
      'The platform protects your number in three ways: (1) Safe Delay: Pauses naturally between 7 and 60 seconds between each message, just like a human typing; (2) Personalized Names: Adding tags like {name} makes every message unique; and (3) Controlled Sending: Messages are sent smoothly one by one to prevent your number from getting flagged.'
  },
  {
    question: 'Can multiple users or team members use this at the same time?',
    answer:
      'Yes! Every user account is completely private and separate. When you log in, only your own WhatsApp is connected, your customer list stays in your account, and other users can never see or access your messages.'
  },
  {
    question: 'Can I attach photos or documents to my messages?',
    answer:
      'Yes! You can attach JPG, PNG images, or PDF documents. Large photos are automatically compressed before sending so they deliver quickly and reliably to your customers.'
  },
  {
    question: 'Can I pause or stop sending while a campaign is running?',
    answer:
      'Yes. In Step 4, you can click Pause at any time to take a break or make changes, and click Resume or Stop whenever you are ready.'
  },
  {
    question: 'Are my customer phone numbers private and secure?',
    answer:
      'Yes, 100% private. Your customer contacts and message templates are stored locally on your own computer and browser. We never share, sell, or upload your contacts to any third parties.'
  }
];

export function WhatsAppInfoSections() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const steps = [
    {
      num: '01',
      title: 'Connect WhatsApp',
      desc: 'Scan the QR code with WhatsApp on your phone (Linked Devices) or connect using your phone number.',
      icon: <QrCode className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
    },
    {
      num: '02',
      title: 'Add Customer Numbers',
      desc: 'Add numbers one by one, paste a list from Excel or WhatsApp, or upload a CSV file.',
      icon: <Users className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
    },
    {
      num: '03',
      title: 'Write Message & Photo',
      desc: 'Write your message, add {name} to include customer names automatically, and attach photos or PDFs.',
      icon: <Sparkles className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
    },
    {
      num: '04',
      title: 'Send Safely',
      desc: 'Click Start Sending! Messages are delivered one by one with safe pauses between each message.',
      icon: <Send className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
    }
  ];

  return (
    <div className="space-y-16 pt-8">
      {/* 1. How It Works Section */}
      <section id="how-it-works" className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-purple-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Easy 4-Step Process</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Follow these 4 simple steps to connect, write, and safely send WhatsApp messages to your customers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white dark:bg-zinc-900/90 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-[#5722AF]/40 transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="text-xl font-black text-zinc-300 dark:text-zinc-700 group-hover:text-[#5722AF] dark:group-hover:text-[#9B6BE8] transition-colors font-mono">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Privacy & Security Section */}
      <section id="privacy-section" className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5722AF]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0 border border-[#5722AF]/20">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  <span>100% Private &amp; Secure</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                  Privacy &amp; Data Security
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Your WhatsApp account, customer phone numbers, and messages are completely private and stay in your control.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div className="flex items-start gap-2.5">
                <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-zinc-900 dark:text-white block mb-0.5">Private User Accounts</strong>
                  Each user gets their own dedicated session. No other user can ever see your WhatsApp, contacts, or messages.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-zinc-900 dark:text-white block mb-0.5">Safe on Your Computer</strong>
                  Your customer contacts and message drafts are stored safely on your own computer and browser.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-zinc-900 dark:text-white block mb-0.5">Direct Message Delivery</strong>
                  Messages are sent directly from your WhatsApp to your customer without any third-party middleman.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Frequently Asked Questions (FAQ) Section */}
      <section id="faq-section" className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-purple-300 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Common Inquiries</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Everything you need to know about connecting, account safety, and sending messages.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={"w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 " + (isOpen ? "rotate-180 text-[#5722AF] dark:text-[#9B6BE8]" : "")}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
