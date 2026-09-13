import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EMI Calculator - Calculate Loan EMI Online (Home, Car, Personal)',
  description:
    'Free online EMI Calculator for Home, Personal, Car, and Education loans in India. Calculate monthly EMI, total interest, amortization schedules, and prepayment savings with reducing balance formula.',
  keywords: [
    'emi calculator',
    'loan emi calculator',
    'home loan emi calculator',
    'personal loan emi calculator',
    'car loan emi calculator',
    'loan amortization schedule',
    'prepayment calculator',
    'reducing balance emi',
    'loan interest calculator',
    'toolnest',
  ],
  alternates: {
    canonical: '/emi-calculator',
  },
  openGraph: {
    title: 'EMI Calculator - Calculate Loan EMI Online (Home, Car, Personal)',
    description:
      'Free, accurate online EMI calculator with reducing-balance formula, amortization schedules, and prepayment planning.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'EMI Calculator - Calculate Loan EMI Online (Home, Car, Personal)',
    description:
      'Calculate loan EMI, view amortization schedules, and calculate prepayment savings instantly.',
  },
};

export default function EMICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
