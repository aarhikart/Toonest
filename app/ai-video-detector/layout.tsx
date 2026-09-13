import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Video Detector - Detect AI-Generated Videos Online',
  description:
    'Detect AI-generated videos online. Analyze video files and URLs for synthetic visual artifacts, temporal inconsistencies and deepfake signatures.',
  keywords: [
    'ai video detector',
    'deepfake detector',
    'detect ai video',
    'sora detector',
    'runway detector',
    'synthetic media forensics',
    'temporal artifact analysis',
    'video manipulation detector',
    'toolnest',
  ],
  alternates: {
    canonical: '/ai-video-detector',
  },
  openGraph: {
    title: 'AI Video Detector - Detect AI-Generated Videos Online',
    description:
      'Detect AI-generated videos online. Analyze video files and URLs for synthetic visual artifacts, temporal inconsistencies and deepfake signatures.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video Detector - Detect AI-Generated Videos Online',
    description:
      'Analyze video files and URLs for synthetic visual artifacts, temporal inconsistencies and deepfake signatures.',
  },
};

export default function AIVideoDetectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
