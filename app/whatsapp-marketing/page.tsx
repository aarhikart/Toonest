'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  QrCode,
  Smartphone,
  CheckCircle2,
  Users,
  Send,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sliders,
  HelpCircle,
  Radio,
  Server
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import { WhatsAppWebConnect } from '@/components/whatsapp-web/WhatsAppWebConnect';
import { WhatsAppContactList } from '@/components/whatsapp-web/WhatsAppContactList';
import { WhatsAppMessageComposer, MediaAttachment } from '@/components/whatsapp-web/WhatsAppMessageComposer';
import { WhatsAppAutoSender } from '@/components/whatsapp-web/WhatsAppAutoSender';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';
import { WhatsAppSenderEngine } from '@/lib/whatsapp-web/sender';
import { WhatsAppWebSession, WebContact } from '@/lib/whatsapp-web/types';

export default function WhatsAppMarketingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Connection Session (Persistent across reloads & Vercel)
  const [session, setSession] = useState<WhatsAppWebSession>({
    connected: false,
    method: 'QR'
  });

  // Audience Contacts
  const [contacts, setContacts] = useState<WebContact[]>([]);

  // Message & Delay State
  const [messageTemplate, setMessageTemplate] = useState<string>(
    'Hi {name}! 🎉 We are excited to announce our exclusive annual offer. Reply to this message to claim your code!'
  );
  const [delaySeconds, setDelaySeconds] = useState<number>(3);

  // Media Attachment State (Image / Document)
  const [media, setMedia] = useState<MediaAttachment | null>(null);

  // Initialize from persistent storage
  useEffect(() => {
    const loadedSession = WhatsAppSessionManager.getSession();
    setSession(loadedSession);

    try {
      const savedContacts = localStorage.getItem('toolnest_wa_contacts_v1');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      } else {
        setContacts(WhatsAppSenderEngine.getSampleContacts());
      }

      const savedTmpl = localStorage.getItem('toolnest_wa_template_v1');
      if (savedTmpl) {
        setMessageTemplate(savedTmpl);
      }
    } catch {
      setContacts(WhatsAppSenderEngine.getSampleContacts());
    }
  }, []);

  const handleContactsChange = (newContacts: WebContact[]) => {
    setContacts(newContacts);
    try {
      localStorage.setItem('toolnest_wa_contacts_v1', JSON.stringify(newContacts));
    } catch {}
  };

  const handleMessageChange = (newMsg: string) => {
    setMessageTemplate(newMsg);
    try {
      localStorage.setItem('toolnest_wa_template_v1', newMsg);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="WhatsApp Marketing Platform"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="whatsapp-marketing"
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-400 dark:text-zinc-500">Business &amp; Marketing</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-zinc-900 dark:text-white">WhatsApp Web Bulk Sender</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5722AF]/10 dark:bg-[#5722AF]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-purple-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              Real WhatsApp Multi-Device Session &bull; Persistent Architecture
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              WhatsApp Bulk Message &amp; Media Campaign Manager
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Connect via <strong>WhatsApp Web QR Code</strong> or <strong>8-Digit Pairing Code</strong>. Add contacts, attach images or PDF documents, compose personalized messages with <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">{"{name}"}</code> and <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">{"{phone}"}</code>, and dispatch sequentially with safe rate-limited intervals.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Real Multi-Device Session Link</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Image &amp; PDF Attachments Support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Persistent on Vercel &amp; Cloud</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Real WhatsApp Web Connection */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5722AF] dark:text-purple-400">
            <span className="w-5 h-5 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-[10px]">1</span>
            Authentication &bull; Scan QR Code or Link with Phone Number
          </div>
          <WhatsAppWebConnect
            session={session}
            onSessionChange={setSession}
          />
        </section>

        {/* Step 2 & 3: Audience Numbers & Message Composer with Media */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5722AF] dark:text-purple-400">
              <span className="w-5 h-5 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-[10px]">2</span>
              Audience &amp; Phone Numbers
            </div>
            <WhatsAppContactList
              contacts={contacts}
              onContactsChange={handleContactsChange}
              messageTemplate={messageTemplate}
            />
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5722AF] dark:text-purple-400">
              <span className="w-5 h-5 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-[10px]">3</span>
              Message Template, Dynamic Tags &amp; Media
            </div>
            <WhatsAppMessageComposer
              message={messageTemplate}
              onMessageChange={handleMessageChange}
              delaySeconds={delaySeconds}
              onDelayChange={setDelaySeconds}
              media={media}
              onMediaChange={setMedia}
              previewContact={contacts[0]}
            />
          </section>
        </div>

        {/* Step 4: Sequential Campaign Dispatcher */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5722AF] dark:text-purple-400">
            <span className="w-5 h-5 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-[10px]">4</span>
            Sequential Auto-Sender Campaign Engine
          </div>
          <WhatsAppAutoSender
            session={session}
            contacts={contacts}
            onContactsUpdate={handleContactsChange}
            messageTemplate={messageTemplate}
            delaySeconds={delaySeconds}
            media={media}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
