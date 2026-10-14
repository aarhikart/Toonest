import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instagram Multi-Account Direct API Poster — ToolNest',
  description:
    'Directly publish Video Reels (.mp4) and Photos across multiple Instagram accounts via high-speed headless HTTP Direct API with safe human-like pacing and auto-rotation.',
  keywords: [
    'instagram multi account poster',
    'instagram direct api reels',
    'instagram auto poster',
    'instagram reels publisher',
    'instagram api toolnest',
  ],
};

export default function MultiAccountPosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
