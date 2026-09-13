import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salary Calculator - In-Hand & Take-Home Pay from CTC (FY 2026-27)',
  description:
    'Free online Salary Calculator for India. Convert annual CTC to monthly in-hand take-home salary with accurate PF, Gratuity, Professional Tax, and New vs Old Tax Regime comparison for FY 2026-27.',
  keywords: [
    'salary calculator',
    'in hand salary calculator',
    'ctc to in hand calculator',
    'take home salary calculator',
    'new tax regime vs old tax regime',
    'epf calculator',
    'gratuity in ctc',
    'salary hike calculator',
    'income tax calculator 2026',
    'toolnest',
  ],
  alternates: {
    canonical: '/salary-calculator',
  },
  openGraph: {
    title: 'Salary Calculator - In-Hand & Take-Home Pay from CTC (FY 2026-27)',
    description:
      'Accurate online salary calculator for India. Convert CTC to in-hand monthly salary with itemized breakdown and New vs Old Tax Regime analysis.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Salary Calculator - In-Hand & Take-Home Pay from CTC (FY 2026-27)',
    description:
      'Convert CTC to monthly take-home salary and compare New vs Old Tax Regimes.',
  },
};

export default function SalaryCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
