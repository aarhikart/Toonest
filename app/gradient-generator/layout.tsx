import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gradient Generator - Create Beautiful CSS Gradients Online',
  description:
    'Create beautiful CSS gradients online. Generate linear, radial and conic gradients, customize colors and stops, preview designs, and copy ready-to-use CSS.',
  keywords: [
    'gradient generator',
    'css gradient generator',
    'linear gradient',
    'radial gradient',
    'conic gradient',
    'repeating gradient',
    'css gradient background',
    'gradient color stops',
    'gradient text generator',
    'gradient image export',
    'tailwind gradient generator',
  ],
  openGraph: {
    title: 'Gradient Generator - Create Beautiful CSS Gradients Online',
    description:
      'Create beautiful CSS gradients online. Generate linear, radial and conic gradients, customize colors and stops, preview designs, and copy ready-to-use CSS.',
    type: 'website',
  },
};

export default function GradientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
