import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Box Shadow Generator - Create CSS Shadows Online',
  description:
    'Create beautiful CSS box shadows visually. Customize multi-layer shadows, blur, spread, offsets, inset shadows, and export clean CSS, Tailwind, and SCSS code.',
  keywords: [
    'css box shadow generator',
    'box shadow',
    'css shadows',
    'multi-layer shadow',
    'tailwind box shadow',
    'inset shadow generator',
    'css drop shadow',
    'web design tool',
    'toolnest',
  ],
  openGraph: {
    title: 'Box Shadow Generator - Create CSS Shadows Online',
    description:
      'Visually build and customize multi-layer CSS box shadows. Export clean CSS, Tailwind classes, and high-res images.',
    type: 'website',
  },
};

export default function BoxShadowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
