import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favicon Generator - Create Website Favicons Online',
  description:
    'Create favicons and website icons from your logo or image. Generate ICO, PNG, Apple Touch, Android and PWA icons in one click.',
};

export default function FaviconGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
