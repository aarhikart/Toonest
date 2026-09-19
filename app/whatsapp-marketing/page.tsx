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
  ShieldCheck,
  Zap,
  Sliders,
  HelpCircle,
  Radio,
  Server,
  Loader2
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppWebConnect } from '@/components/whatsapp-web/WhatsAppWebConnect';
import { WhatsAppContactList } from '@/components/whatsapp-web/WhatsAppContactList';
import { WhatsAppMessageComposer, MediaAttachment } from '@/components/whatsapp-web/WhatsAppMessageComposer';
import { WhatsAppAutoSender } from '@/components/whatsapp-web/WhatsAppAutoSender';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';
import { WhatsAppSenderEngine } from '@/lib/whatsapp-web/sender';
import { WhatsAppWebSession, WebContact } from '@/lib/whatsapp-web/types';
import { WhatsAppAuthModal } from '@/components/whatsapp-web/WhatsAppAuthModal';
import { WhatsAppAdminDashboard } from '@/components/whatsapp-web/WhatsAppAdminDashboard';
import { WhatsAppUserBar } from '@/components/whatsapp-web/WhatsAppUserBar';
import { WhatsAppStepGuideModal } from '@/components/whatsapp-web/WhatsAppStepGuideModal';
import { WhatsAppInfoSections } from '@/components/whatsapp-web/WhatsAppInfoSections';

interface CurrentUser {
  id: string;
  username: string;
  businessName: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  status: string;
}

export default function WhatsAppMarketingPage() {
  const [activeGuideStep, setActiveGuideStep] = useState<number | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [adminViewMode, setAdminViewMode] = useState<'admin_center' | 'sender_studio'>('admin_center');

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
  const [delaySeconds, setDelaySeconds] = useState<number>(7);

  // Media Attachment State (Image / Document)
  const [media, setMedia] = useState<MediaAttachment | null>(null);

  // Fetch current authenticated user session
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        const username = data.user.username.toLowerCase();
        WhatsAppSessionManager.setUserId(username);
        const userSession = WhatsAppSessionManager.getSession(username);
        setSession(userSession);

        try {
          const savedContacts = localStorage.getItem(`toolnest_wa_contacts_${username}`);
          if (savedContacts) {
            setContacts(JSON.parse(savedContacts));
          } else {
            setContacts(WhatsAppSenderEngine.getSampleContacts());
          }

          const savedTmpl = localStorage.getItem(`toolnest_wa_template_${username}`);
          if (savedTmpl) {
            setMessageTemplate(savedTmpl);
          }
        } catch {
          setContacts(WhatsAppSenderEngine.getSampleContacts());
        }

        // If user, keep them in sender studio; if admin, start at admin center
        if (data.user.role === 'admin') {
          setAdminViewMode('admin_center');
        } else {
          setAdminViewMode('sender_studio');
        }
      } else {
        setCurrentUser(null);
        WhatsAppSessionManager.setUserId('default');
        setSession({ connected: false, method: 'QR' });
      }
    } catch {
      setCurrentUser(null);
      WhatsAppSessionManager.setUserId('default');
      setSession({ connected: false, method: 'QR' });
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Initialize from persistent storage & auth + default to dark theme on /whatsapp-marketing
  useEffect(() => {
    checkAuth();
    try {
      const storedTheme = localStorage.getItem('toolnest_theme');
      if (storedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    const username = currentUser?.username?.toLowerCase();
    if (username) {
      WhatsAppSessionManager.clearSession(username);
    }
    WhatsAppSessionManager.setUserId('default');
    document.cookie = 'toolnest_wa_user_id=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setCurrentUser(null);
    setSession({ connected: false, method: 'QR' });
    setAdminViewMode('admin_center');
  };

  const handleContactsChange = (newContacts: WebContact[]) => {
    setContacts(newContacts);
    try {
      const username = currentUser?.username?.toLowerCase() || 'default';
      localStorage.setItem(`toolnest_wa_contacts_${username}`, JSON.stringify(newContacts));
    } catch {}
  };

  const handleMessageChange = (newMsg: string) => {
    setMessageTemplate(newMsg);
    try {
      const username = currentUser?.username?.toLowerCase() || 'default';
      localStorage.setItem(`toolnest_wa_template_${username}`, newMsg);
    } catch {}
  };

  const handleClearBrowserData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all stored browser data?\n\nThis will clear:\n• Active WhatsApp Worker Session (forces fresh QR code)\n• Saved Worker Gateway URLs\n• All Audience Contacts in localStorage\n• Message Templates & Drafts\n• Saved Session Cookies\n\nThe page will reset cleanly with a brand new QR Code.'
    );

    if (!confirmed) return;

    try {
      // 1. Tell backend worker to logout and wipe session files
      const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
      const headers: Record<string, string> = {};
      if (savedWorkerUrl) headers['x-worker-url'] = savedWorkerUrl;

      await fetch('/api/whatsapp-service/logout', {
        method: 'POST',
        headers
      }).catch(() => {});

      // 2. Clear all toolnest WhatsApp localStorage keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('toolnest_wa_') || key.includes('whatsapp') || key.includes('wa_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // Explicitly delete known keys
      localStorage.removeItem('toolnest_wa_worker_url');
      localStorage.removeItem('toolnest_wa_contacts_v1');
      localStorage.removeItem('toolnest_wa_template_v1');
      localStorage.removeItem('toolnest_wa_session');
      localStorage.removeItem('toolnest_wa_session_v1');
      localStorage.removeItem('toolnest_wa_delay');

      // 2. Clear sessionStorage
      sessionStorage.clear();

      // 3. Clear cookie
      document.cookie = 'toolnest_wa_worker_url=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // 4. Reset component state
      setContacts([]);
      setMessageTemplate('Hi {name}! 🎉 Welcome to ToolNest.');
      setMedia(null);
      setSession({ connected: false, method: 'QR' });

      alert('All stored browser data, saved URLs, and contacts have been cleared successfully!');
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to clear browser data:', err);
      alert('Error clearing browser data: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="WhatsApp Marketing Platform"
        hideBrowseTools={true}
        onOpenHelp={() => setActiveGuideStep(1)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Auth Loading State */}
        {isAuthLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#5722AF] mx-auto" />
            <p className="text-xs text-zinc-500">Checking authentication status...</p>
          </div>
        ) : !currentUser ? (
          /* View A: Unauthenticated -> Show Login Form (Admin / User) */
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-purple-300 inline-block">
                Secure WhatsApp Marketing
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                Sign in to WhatsApp Marketing Portal
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Log in as an Administrator to manage client accounts and campaigns, or as a User to dispatch marketing messages.
              </p>
            </div>

            <WhatsAppAuthModal
              onLoginSuccess={user => {
                setCurrentUser(user);
                const username = user.username.toLowerCase();
                WhatsAppSessionManager.setUserId(username);
                const userSession = WhatsAppSessionManager.getSession(username);
                setSession(userSession);

                try {
                  const savedContacts = localStorage.getItem(`toolnest_wa_contacts_${username}`);
                  if (savedContacts) {
                    setContacts(JSON.parse(savedContacts));
                  } else {
                    setContacts(WhatsAppSenderEngine.getSampleContacts());
                  }

                  const savedTmpl = localStorage.getItem(`toolnest_wa_template_${username}`);
                  if (savedTmpl) {
                    setMessageTemplate(savedTmpl);
                  }
                } catch {}

                if (user.role === 'admin') {
                  setAdminViewMode('admin_center');
                } else {
                  setAdminViewMode('sender_studio');
                }
              }}
            />
          </div>
        ) : currentUser.role === 'admin' && adminViewMode === 'admin_center' ? (
          /* View B: Admin Dashboard */
          <WhatsAppAdminDashboard
            onLogout={handleLogout}
            onOpenSenderStudio={() => setAdminViewMode('sender_studio')}
          />
        ) : (
          /* View C: User WhatsApp Sender Studio (Also accessible by Admin in studio mode) */
          <div className="space-y-8">
            {/* Logged in User Bar */}
            <WhatsAppUserBar
              user={currentUser}
              onLogout={handleLogout}
              onOpenAdminCenter={
                currentUser.role === 'admin' ? () => setAdminViewMode('admin_center') : undefined
              }
            />

            {/* Hero Section */}
            <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#5722AF]/10 dark:bg-[#5722AF]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-purple-300 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>WhatsApp Web Bulk Messaging</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Campaign &amp; Message Studio
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    Connect WhatsApp, import contacts, compose personalized templates with media, and dispatch campaigns safely.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveGuideStep(1)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#5722AF] hover:bg-[#481c93] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Interactive 4-Step Guide</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 1: Real WhatsApp Web Connection */}
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5722AF] dark:text-purple-400">
                  <span className="w-5 h-5 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Authentication &bull; Link WhatsApp Device</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGuideStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#5722AF] dark:text-zinc-400 dark:hover:text-purple-300 font-medium transition cursor-pointer"
                  title="View Step 1 guide"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Step 1 Guide</span>
                </button>
              </div>
              <WhatsAppWebConnect
                session={session}
                onSessionChange={setSession}
                onOpenGuide={() => setActiveGuideStep(1)}
                userId={currentUser?.username?.toLowerCase()}
              />
            </section>

            {/* Step 2 & 3: Audience Numbers & Message Composer with Media */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5722AF] dark:text-purple-400">
                    <span className="w-5 h-5 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Audience &bull; Contact List</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveGuideStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#5722AF] dark:text-zinc-400 dark:hover:text-purple-300 font-medium transition cursor-pointer"
                    title="View Step 2 guide"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Step 2 Guide</span>
                  </button>
                </div>
                <WhatsAppContactList
                  contacts={contacts}
                  onContactsChange={handleContactsChange}
                  messageTemplate={messageTemplate}
                  onOpenGuide={() => setActiveGuideStep(2)}
                />
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5722AF] dark:text-purple-400">
                    <span className="w-5 h-5 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Message &bull; Template &amp; Media</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveGuideStep(3)}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#5722AF] dark:text-zinc-400 dark:hover:text-purple-300 font-medium transition cursor-pointer"
                    title="View Step 3 guide"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Step 3 Guide</span>
                  </button>
                </div>
                <WhatsAppMessageComposer
                  message={messageTemplate}
                  onMessageChange={handleMessageChange}
                  delaySeconds={delaySeconds}
                  onDelayChange={setDelaySeconds}
                  media={media}
                  onMediaChange={setMedia}
                  previewContact={contacts[0]}
                  onOpenGuide={() => setActiveGuideStep(3)}
                />
              </section>
            </div>

            {/* Step 4: Sequential Campaign Dispatcher */}
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5722AF] dark:text-purple-400">
                  <span className="w-5 h-5 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Campaign &bull; Dispatch Engine</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGuideStep(4)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#5722AF] dark:text-zinc-400 dark:hover:text-purple-300 font-medium transition cursor-pointer"
                  title="View Step 4 guide"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Step 4 Guide</span>
                </button>
              </div>
              <WhatsAppAutoSender
                session={session}
                contacts={contacts}
                onContactsUpdate={handleContactsChange}
                messageTemplate={messageTemplate}
                delaySeconds={delaySeconds}
                media={media}
                onOpenGuide={() => setActiveGuideStep(4)}
                userId={currentUser?.username?.toLowerCase()}
              />
            </section>
          </div>
        )}

        {/* Dedicated WhatsApp Marketing Guide, Privacy & FAQ Sections */}
        <WhatsAppInfoSections />

        {/* Interactive 4-Step Guide Modal */}
        <WhatsAppStepGuideModal
          step={activeGuideStep}
          onClose={() => setActiveGuideStep(null)}
          onSelectStep={setActiveGuideStep}
        />
      </main>

      <Footer hideToolsList={true} />
    </div>
  );
}
