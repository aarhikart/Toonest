import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Media Image Resizer - Resize Images for Instagram, Facebook, YouTube & More',
  description:
    'Resize and crop your images for Instagram, Facebook, YouTube, LinkedIn, X, Pinterest and other social platforms with ready-made size presets.',
};

export default function SocialResizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
