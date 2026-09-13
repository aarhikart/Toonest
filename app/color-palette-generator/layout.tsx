import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Palette Generator - Create Beautiful Color Palettes Online',
  description:
    'Generate beautiful color palettes online. Create random, complementary, monochromatic, analogous and custom color schemes with HEX, RGB and HSL values.',
  keywords: [
    'color palette generator',
    'color scheme generator',
    'hex color palette',
    'complementary colors',
    'analogous color palette',
    'monochromatic color scheme',
    'tailwind color generator',
    'wcag color contrast checker',
    'css gradient generator',
    'color picker tool',
  ],
  openGraph: {
    title: 'Color Palette Generator - Create Beautiful Color Palettes Online',
    description:
      'Generate beautiful color palettes online. Create random, complementary, monochromatic, analogous and custom color schemes with HEX, RGB and HSL values.',
    type: 'website',
  },
};

export default function ColorPaletteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
