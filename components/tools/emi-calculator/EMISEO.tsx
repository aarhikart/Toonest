import React from 'react';

export const EMISEO: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'EMI Calculator India',
        operatingSystem: 'All',
        applicationCategory: 'FinanceApplication',
        description:
          'Free online EMI Calculator for Home, Personal, Car, and Education loans in India. Calculate monthly EMI, total interest, full amortization schedules, and prepayment savings with pure reducing-balance formula.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How is reducing-balance EMI calculated?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'EMI = [P x r x (1 + r)^n] / [(1 + r)^n - 1], where P is principal, r is monthly interest rate, and n is loan tenure in months.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does part prepayment reduce loan tenure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Part prepayments directly reduce the unpaid principal balance, preventing future monthly interest compounding and reducing the number of months needed to pay off the loan.',
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
