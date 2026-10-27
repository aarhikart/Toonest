import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'WhatsApp Marketing & Web Automation — ToolNest',
  description: 'Send bulk WhatsApp marketing campaigns with rich link previews, media attachments, and automated anti-ban protection.',
  openGraph: {
    title: 'ToolNest WhatsApp Marketing — Fast & Secure Message Automation',
    description: 'Grow your business with ToolNest WhatsApp Web automation. Send messages with clickable rich links and media.',
    url: 'https://toonest.vercel.app/whatsapp-marketing',
    siteName: 'ToolNest',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolNest WhatsApp Marketing — Fast & Secure Message Automation',
    description: 'Send messages with clickable rich links and media using ToolNest.',
  },
};

export default function WhatsAppMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
