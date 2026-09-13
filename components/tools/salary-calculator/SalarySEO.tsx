import React from 'react';

export const SalarySEO: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Salary Calculator India (CTC to In-Hand)',
        operatingSystem: 'All',
        applicationCategory: 'FinanceApplication',
        description:
          'Free online Salary Calculator for India. Convert annual CTC to monthly in-hand take-home salary with accurate PF, Gratuity, Professional Tax, and New vs Old Tax Regime comparison for FY 2026-27.',
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
            name: 'How do I calculate monthly in-hand salary from CTC in India?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Monthly In-Hand = Gross Monthly Salary minus Employee PF, Professional Tax, and Income Tax (TDS). Gross Salary is CTC minus Employer PF and Gratuity.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the standard deduction in FY 2026-27?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The standard deduction for salaried individuals is ₹75,000 under the New Tax Regime and ₹50,000 under the Old Tax Regime.',
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
