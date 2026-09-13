import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Date Difference Calculator - Calculate Date & Time Difference',
  description:
    'Calculate the exact difference between two dates or times in years, months, weeks, days, hours, minutes and seconds. Also calculate business days and time differences across midnight.',
  keywords: [
    'date difference calculator',
    'time difference calculator',
    'date calculator',
    'days between dates',
    'calculate business days',
    'working days calculator',
    'hours between two times',
    'time duration calculator',
    'midnight crossing time calculator',
    'timezone difference',
    'toolnest',
  ],
  alternates: {
    canonical: '/date-time-difference-calculator',
  },
  openGraph: {
    title: 'Date Difference Calculator - Calculate Date & Time Difference | ToolNest',
    description:
      'Calculate the exact difference between two dates or times in years, months, weeks, days, hours, minutes, and seconds. Includes business days and midnight crossing.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Date Difference Calculator - Calculate Date & Time Difference',
    description:
      'Calculate exact calendar duration, elapsed days, working business days, and time differences in your browser.',
  },
};

export default function DateTimeDifferenceCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
