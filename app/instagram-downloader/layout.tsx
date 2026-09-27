import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Media Video Downloader — Instagram, Pinterest & YouTube | ToolNest',
  description:
    'Download public videos, reels, pins, and shorts from Instagram, Pinterest, and YouTube in high-definition MP4. Fast, free, and privacy-respecting.',
};

export default function InstagramDownloaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
