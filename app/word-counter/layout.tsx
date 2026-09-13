import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word Counter - Count Words, Characters & Sentences',
  description:
    'Free online word counter that counts words, characters, sentences, paragraphs, lines, and estimated reading time instantly.',
  keywords: [
    'word counter',
    'character counter',
    'sentence counter',
    'paragraph counter',
    'line counter',
    'reading time calculator',
    'words per sentence',
    'text analyzer',
    'toolnest',
  ],
  alternates: {
    canonical: '/word-counter',
  },
  openGraph: {
    title: 'Word Counter - Count Words, Characters & Sentences',
    description:
      'Free online word counter that counts words, characters, sentences, paragraphs, lines, and estimated reading time instantly in your browser.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Word Counter - Count Words, Characters & Sentences',
    description:
      'Instant client-side word and character counter. Check words, characters, sentences, paragraphs, and reading time in real-time.',
  },
};

export default function WordCounterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
