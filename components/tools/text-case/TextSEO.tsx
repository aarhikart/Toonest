import React from 'react';

export function TextSEO() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a text case converter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A text case converter transforms the capitalization style of text between uppercase, lowercase, and title case instantly in your browser.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does uppercase mean?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Uppercase converts all letters to capital characters (e.g. HELLO WORLD) while preserving numbers, punctuation, and line breaks.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does lowercase mean?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lowercase converts all letters to small characters (e.g. hello world) while preserving numbers and formatting.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is title case?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Title case capitalizes the first letter of major words while keeping minor words like a, an, the, and in lowercase.',
        },
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Text Case Converter - ToolNest',
    url: 'https://toolnest.com/text-case-converter',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript-enabled browser',
    description:
      'Free client-side text case converter tool. Convert text to uppercase, lowercase, or title case instantly with character counts and .txt download.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
