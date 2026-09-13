'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  MessageSquare,
  ListFilter,
  BarChart3,
  Settings,
  QrCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { DashboardOverview } from './DashboardOverview';
import { ConnectionManager } from './ConnectionManager';
import { ContactManager } from './ContactManager';
import { CampaignBuilder } from './CampaignBuilder';
import { CampaignTracker } from './CampaignTracker';
import { TemplateManager } from './TemplateManager';
import { MessageLogs } from './MessageLogs';
import { InboxConversation } from './InboxConversation';
import { AnalyticsView } from './AnalyticsView';
import { QrOptInModal } from './QrOptInModal';
import { DashboardStats, WhatsAppAccount, Contact, ContactTag, MessageTemplate, Campaign, WhatsAppMessage } from '@/lib/whatsapp/types';

export const WhatsAppPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // Platform Data States
  const [account, setAccount] = useState<WhatsAppAccount | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [accRes, contRes, tmplRes, cmpRes, msgRes, inbRes] = await Promise.all([
        fetch('/api/whatsapp/account'),
        fetch('/api/whatsapp/contacts'),
        fetch('/api/whatsapp/templates'),
        fetch('/api/whatsapp/campaigns'),
        fetch('/api/whatsapp/messages'),
        fetch('/api/whatsapp/inbox')
      ]);

      const [accData, contData, tmplData, cmpData, msgData, inbData] = await Promise.all([
        accRes.json(),
        contRes.json(),
        tmplRes.json(),
        cmpRes.json(),
        msgRes.json(),
        inbRes.json()
      ]);

      if (accData.account) setAccount(accData.account);
      if (accData.stats) setStats(accData.stats);
      if (contData.contacts) setContacts(contData.contacts);
      if (contData.tags) setTags(contData.tags);
      if (tmplData.templates) setTemplates(tmplData.templates);
      if (cmpData.campaigns) setCampaigns(cmpData.campaigns);
      if (msgData.messages) setMessages(msgData.messages);
      if (inbData.conversations) setConversations(inbData.conversations);
    } catch (err) {
      console.error('Failed to load WhatsApp data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Realtime polling
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'contacts', label: 'Audience & Opt-ins', icon: Users },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'inbox', label: '2-Way Inbox', icon: MessageSquare },
    { id: 'logs', label: 'Message Logs', icon: ListFilter },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Meta API & Webhooks', icon: Settings }
  ];

  if (loading && !account) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#5722AF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Connecting to WhatsApp Cloud Engine...</p>
        </div>
      </div>
    );
  }

  const defaultAccount: WhatsAppAccount = account || {
    id: 'acc_01',
    name: 'ToolNest Enterprise',
    wabaId: '109845729184712',
    appId: '984712039485712',
    businessName: 'ToolNest Technologies',
    timezone: 'America/New_York',
    currency: 'USD',
    qualityRating: 'GREEN',
    messagingLimit: '100,000 / day',
    phoneNumbers: [],
    createdAt: new Date().toISOString()
  };

  const defaultStats: DashboardStats = stats || {
    totalSent: messages.filter(m => m.direction === 'OUTBOUND').length,
    deliveryRate: 98,
    readRate: 85,
    activeCampaigns: campaigns.filter(c => c.status === 'RUNNING').length,
    optedInContacts: contacts.filter(c => c.consentStatus === 'OPTED_IN').length,
    qualityRating: 'GREEN',
    messagingLimit: '100,000 / day',
    recentMessages: messages.slice(0, 8)
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsCreatingCampaign(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Display */}
      {activeTab === 'dashboard' && (
        <DashboardOverview
          stats={defaultStats}
          account={defaultAccount}
          onNavigate={tab => {
            setActiveTab(tab);
            setIsCreatingCampaign(false);
          }}
          onOpenQr={() => setIsQrModalOpen(true)}
        />
      )}

      {activeTab === 'campaigns' && (
        isCreatingCampaign ? (
          <CampaignBuilder
            templates={templates}
            contacts={contacts}
            tags={tags}
            onSuccess={() => {
              setIsCreatingCampaign(false);
              fetchData();
            }}
            onCancel={() => setIsCreatingCampaign(false)}
          />
        ) : (
          <CampaignTracker
            campaigns={campaigns}
            onRefresh={fetchData}
            onNewCampaign={() => setIsCreatingCampaign(true)}
          />
        )
      )}

      {activeTab === 'contacts' && (
        <ContactManager
          contacts={contacts}
          tags={tags}
          onRefresh={fetchData}
          onOpenQr={() => setIsQrModalOpen(true)}
        />
      )}

      {activeTab === 'templates' && (
        <TemplateManager
          templates={templates}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'inbox' && (
        <InboxConversation
          conversations={conversations}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'logs' && (
        <MessageLogs
          messages={messages}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView
          stats={defaultStats}
        />
      )}

      {activeTab === 'settings' && (
        <ConnectionManager
          account={defaultAccount}
          onRefresh={fetchData}
        />
      )}

      {/* Official Opt-in QR Code Modal */}
      <QrOptInModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        phoneNumber="+15557892026"
      />
    </div>
  );
};
