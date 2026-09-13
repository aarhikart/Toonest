import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instagram Auto Commenter & User Tag Assistant | Anti-Ban Script Generator | ToolNest',
  description:
    'Free, in-browser Instagram auto-commenter script generator. Tag lists of users with randomized Spintax messages, zero-width unicode hash randomizer, and smart batch pauses to prevent Instagram action blocks.',
  keywords: [
    'instagram auto commenter',
    'instagram comment bot script',
    'instagram tag users in comment',
    'instagram auto comment script',
    'instagram spintax comment generator',
    'instagram anti ban comment tool',
    'instagram comment helper',
    'toolnest',
  ],
  openGraph: {
    title: 'Instagram Auto Commenter & User Tag Assistant | ToolNest',
    description:
      'Generate safe, anti-ban browser console scripts to automatically tag users and post randomized Spintax comments on Instagram posts and reels.',
    type: 'website',
  },
};

export default function InstagramAutoCommenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
