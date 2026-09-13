import React from 'react';

export const GSTSEO: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'GST Calculator India',
        operatingSystem: 'All',
        applicationCategory: 'FinanceApplication',
        description:
          'Free online GST Calculator for India. Add or remove GST, calculate CGST, SGST, IGST, discount with GST, and generate multi-item invoice breakdowns dynamically.',
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
            name: 'How do I add GST to a base amount?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Multiply base amount by GST rate percentage and divide by 100. Add this GST amount to your base amount to get the gross total.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I remove GST from an inclusive price?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Use the reverse formula: Base Taxable = (Gross Amount * 100) / (100 + GST Rate). The GST removed is Gross Amount minus Base Taxable.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the difference between CGST, SGST, and IGST?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Intra-state sales are split equally into CGST (Central GST) and SGST (State GST). Inter-state transactions attract IGST (Integrated GST) in full.',
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
