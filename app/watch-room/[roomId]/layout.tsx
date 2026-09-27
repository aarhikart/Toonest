import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Virtual Cinema Watch Room — Watch Together | ToolNest',
  description:
    'Join a real-time virtual cinema room to watch movies, series, and video streams together with friends.',
};

export default function WatchRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
