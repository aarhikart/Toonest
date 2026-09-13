import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSS Border Radius Generator - Create Rounded Corners Online',
  description:
    'Create custom CSS border-radius values online. Adjust all four corners, create elliptical and asymmetric shapes, preview them live, and copy ready-to-use CSS.',
  keywords: [
    'css border radius generator',
    'border radius',
    'border radius generator',
    'elliptical border radius',
    'tailwind border radius',
    'css rounded corners',
    'blob generator',
    'pill button css',
    'toolnest',
  ],
  openGraph: {
    title: 'CSS Border Radius Generator - Create Rounded Corners Online',
    description:
      'Visually customize all four corners, generate elliptical shapes and fluid blobs, preview them in real-time, and copy clean CSS or Tailwind classes.',
    type: 'website',
  },
};

export default function BorderRadiusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
