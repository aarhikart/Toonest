import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Percentage Calculator - Calculate Percentages Online',
  description:
    'Free online percentage calculator for percentage increase, decrease, change, discounts, tax, tips, profit, loss and more. Calculate percentages quickly and accurately.',
  keywords: [
    'percentage calculator',
    'percentage increase calculator',
    'percentage decrease calculator',
    'percentage change calculator',
    'discount calculator',
    'tax calculator',
    'tip calculator',
    'profit and loss calculator',
    'percentage difference',
    'calculate percentage online',
    'toolnest',
  ],
  alternates: {
    canonical: '/percentage-calculator',
  },
  openGraph: {
    title: 'Percentage Calculator - Calculate Percentages Online',
    description:
      'Free online percentage calculator for percentage increase, decrease, change, discounts, tax, tips, profit, loss and more. Calculate percentages quickly and accurately.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Percentage Calculator - Calculate Percentages Online',
    description:
      'Calculate percentages, increases, decreases, discounts, taxes, tips, and profit/loss in real-time.',
  },
};

export default function PercentageCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
