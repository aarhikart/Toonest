import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Case Converter - Uppercase, Lowercase & Title Case',
  description:
    'Convert text to uppercase, lowercase, or title case instantly with this free online text case converter.',
  keywords: [
    'text case converter',
    'uppercase converter',
    'lowercase converter',
    'title case converter',
    'capitalize text',
    'sentence case',
    'word counter',
    'text tools online',
    'toolnest',
  ],
  alternates: {
    canonical: '/text-case-converter',
  },
  openGraph: {
    title: 'Text Case Converter - Uppercase, Lowercase & Title Case',
    description:
      'Convert text to uppercase, lowercase, or title case instantly. 100% private, browser-based, with real-time stats and .txt file download.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Text Case Converter - Uppercase, Lowercase & Title Case',
    description:
      'Instant client-side text case converter. Convert text between UPPERCASE, lowercase, and Title Case in your browser.',
  },
};

export default function TextCaseConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
