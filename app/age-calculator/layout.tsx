import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Age Calculator - Calculate Your Exact Age in Years, Months, and Days',
  description:
    'Calculate your exact age in years, months, days, total hours, minutes, and seconds. Find your next birthday, zodiac sign, birth day of week, and age difference online.',
  keywords: [
    'age calculator',
    'exact age calculator',
    'chronological age calculator',
    'calculate age online',
    'age in days',
    'age in months',
    'birthday countdown',
    'next birthday calculator',
    'age difference calculator',
    'zodiac sign by birthdate',
    'birth weekday finder',
    'toolnest',
  ],
  alternates: {
    canonical: '/age-calculator',
  },
  openGraph: {
    title: 'Age Calculator - Calculate Your Exact Age Online | ToolNest',
    description:
      'Free, private online Age Calculator. Calculate your exact chronological age in years, months, days, total hours, minutes, and seconds with birthday countdowns.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Age Calculator - Calculate Your Exact Age Online',
    description:
      'Calculate your exact chronological age in years, months, days, total hours, minutes, and seconds with zero server tracking.',
  },
};

export default function AgeCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
