import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '8 Ball Pool Multiplayer — Play Online Billiards with Friends or AI | ToolNest',
  description:
    'Play realistic 8-Ball Pool online with real-time multiplayer, spin physics, ghost ball aiming guide, and AI bot opponents. Challenge friends with instant room links.',
  keywords: ['8 ball pool', 'billiards', 'pool game', 'multiplayer pool', 'online pool', 'free pool game'],
  openGraph: {
    title: '8 Ball Pool Multiplayer — ToolNest',
    description: 'Realistic 8-Ball Pool with live multiplayer and physics.',
  },
};

export default function PoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
