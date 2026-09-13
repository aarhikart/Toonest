import React from 'react';

export function WordCounterSEO() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a word counter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A word counter is an online utility that analyzes text to count words, characters, sentences, paragraphs, and reading time in real-time.',
        },
      },
      {
        '@type': 'Question',
        name: 'How are words counted?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Words are identified as letter and number sequences separated by whitespace and punctuation, with special handling for URLs, decimals, and hyphens.',
        },
      },
      {
        '@type': 'Question',
        name: 'How are characters counted?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The character counter counts all letters, numbers, spaces, punctuation, and Unicode emojis as user-perceived graphemes.',
        },
      },
      {
        '@type': 'Question',
        name: 'How are sentences counted?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sentences are counted using terminal punctuation marks while ignoring decimal numbers, abbreviations like Mr. or Dr., and web URLs.',
        },
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Word Counter - ToolNest',
    url: 'https://toolnest.com/word-counter',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript-enabled browser',
    description:
      'Free online word counter and text statistics tool. Count words, characters, sentences, paragraphs, and reading time instantly in your browser.',
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
