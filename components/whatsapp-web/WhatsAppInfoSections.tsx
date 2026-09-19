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
      'In Step 1, you can either scan the displayed QR Code directly using WhatsApp on your phone (Settings > Linked Devices > Link a Device), or switch to Phone Number Pairing to receive an instant 8-digit pairing code. Both methods establish a direct, official multi-device session.'
  },
  {
    question: 'How does the platform protect my account from getting banned?',
    answer:
      'We incorporate strict anti-ban guardrails: (1) Customizable delay intervals (recommended 5 to 15 seconds) between messages to emulate human rhythm; (2) Dynamic name and phone personalization tags ({name}, {phone}) so every outgoing message has a unique payload; and (3) Built-in rate limiting to prevent spam flagging.'
  },
  {
    question: 'Can multiple users share the same Worker Gateway URL at the same time?',
    answer:
      'Yes! The platform includes full multi-tenant session isolation. Each user is assigned an isolated session ID on their browser. When multiple users connect to the same Gateway URL, their WhatsApp logins, QR codes, and campaigns run in separate isolated contexts without any session crosstalk.'
  },
  {
    question: 'What media files can I attach, and is there a size limit?',
    answer:
      'You can attach JPEG and PNG images or PDF documents. To ensure rapid delivery and prevent cloud payload limit errors, images are automatically optimized and compressed client-side directly in your browser before transmission.'
  },
  {
    question: 'Can I pause, resume, or cancel a campaign while it is running?',
    answer:
      'Yes. In Step 4 (Sequential Auto-Sender), you have instant Pause, Resume, and Stop controls. You can pause the campaign at any moment, review live telemetry, and resume whenever you are ready.'
  },
  {
    question: 'Where is my audience contact list stored?',
    answer:
      'Your audience lists and message templates are saved locally on your device in your browser\'s localStorage. They are never exported or sold to third parties, preserving full confidentiality for your business contacts.'
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
      title: 'Link WhatsApp Device',
      desc: 'Scan the secure QR Code or enter your phone number for an 8-digit pairing code via WhatsApp Linked Devices.',
      icon: <QrCode className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
    },
    {
      num: '02',
      title: 'Import Audience Contacts',
      desc: 'Upload a CSV spreadsheet or paste phone numbers with names. Automatic country code prefixes ensure accurate routing.',
      icon: <Users className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
    },
    {
      num: '03',
      title: 'Personalize & Attach Media',
      desc: 'Compose your message with {name} and {phone} tags. Attach images or documents with browser auto-compression.',
      icon: <Sparkles className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
    },
    {
      num: '04',
      title: 'Automated Safe Dispatch',
      desc: 'Run sequential campaign dispatching with configurable anti-ban delay timing and real-time live telemetry.',
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
              <span>Step-by-Step Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Follow 4 simple steps to connect, compose, and safely dispatch bulk WhatsApp messages to your audience.
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
                  <span>Enterprise Session Privacy</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                  Privacy &amp; Data Security
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Your WhatsApp session, contact phone numbers, and messages are guarded by rigorous multi-tenant security architecture.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div className="flex items-start gap-2.5">
                <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-zinc-900 dark:text-white block mb-0.5">Multi-Tenant Isolation</strong>
                  Each account runs in a dedicated sandboxed session. Users never share credentials or WhatsApp connections.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-zinc-900 dark:text-white block mb-0.5">Local Device Storage</strong>
                  Audience lists and custom templates are stored locally in your browser's encrypted cache.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-zinc-900 dark:text-white block mb-0.5">Direct Protocol Dispatch</strong>
                  Messages are sent directly through official multi-device web sockets without third-party tracking.
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
              Everything you need to know about connecting, anti-ban safety, and bulk message dispatching.
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
