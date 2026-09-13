import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instagram DM Assistant - Manual Direct Message Workflow Manager | ToolNest',
  description:
    'Free, secure, in-browser manual Instagram DM assistant. Import username lists, clean Instagram URLs, prepare reusable message templates, and track outreach progress with zero credentials stored.',
  keywords: [
    'instagram dm assistant',
    'instagram direct message manager',
    'manual instagram outreach',
    'instagram dm workflow',
    'instagram username list manager',
    'instagram csv dm list',
    'instagram dm template tool',
    'toolnest',
  ],
  openGraph: {
    title: 'Instagram DM Assistant - Manual Direct Message Workflow Manager',
    description:
      'Private, client-side Instagram DM assistant. Manage username lists, prepare message templates, and streamline manual messaging without bots or storing passwords.',
    type: 'website',
  },
};

export default function InstagramDMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
