import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GST Calculator - Calculate Goods and Services Tax Online (India)',
  description:
    'Free online GST Calculator for India. Calculate GST inclusive and exclusive amounts, CGST, SGST, IGST, discount with GST, and multi-item invoice breakdowns dynamically.',
  keywords: [
    'gst calculator',
    'online gst calculator',
    'gst calculation india',
    'add gst calculator',
    'remove gst calculator',
    'reverse gst calculator',
    'cgst sgst calculator',
    'igst calculator',
    'gst invoice calculator',
    'discount gst calculator',
    'toolnest',
  ],
  alternates: {
    canonical: '/gst-calculator',
  },
  openGraph: {
    title: 'GST Calculator - Calculate Goods and Services Tax Online (India)',
    description:
      'Accurate, free online GST calculator for India. Add or remove GST, calculate CGST, SGST, IGST, discount, and multi-item invoices.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'GST Calculator - Calculate Goods and Services Tax Online (India)',
    description:
      'Calculate GST inclusive and exclusive amounts, CGST, SGST, IGST, and invoice totals instantly.',
  },
};

export default function GSTCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
