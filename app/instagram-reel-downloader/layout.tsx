import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instagram Reel Downloader - Download Reels Online',
  description:
    'Download publicly accessible Instagram Reels quickly with a simple, mobile-friendly Reel downloader. Save high-quality MP4 videos with audio directly to your device.',
  keywords: [
    'instagram reel downloader',
    'download instagram reels',
    'instagram video downloader',
    'save instagram reels',
    'instagram reel mp4',
    'download reels online',
    'toolnest',
  ],
  openGraph: {
    title: 'Instagram Reel Downloader - Download Reels Online',
    description:
      'Fast, simple, and mobile-friendly Instagram Reel downloader. Download public Reels as high-definition MP4 files with audio.',
    type: 'website',
  },
};

export default function InstagramReelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
