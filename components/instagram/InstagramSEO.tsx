'use client';

import React from 'react';
import { HelpCircle, Layers, CheckCircle2, ShieldCheck, FileSpreadsheet, Lock } from 'lucide-react';

export const InstagramSEO: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Instagram DM Manual Messaging Assistant',
        operatingSystem: 'All',
        applicationCategory: 'BusinessApplication',
        description:
          'Free, secure, browser-based Instagram DM workflow manager. Import lists of usernames, normalize URLs, prepare reusable direct message templates, and track outreach progress without storing Instagram credentials.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Does this Instagram DM Assistant send messages automatically?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. The assistant operates strictly as an in-browser workflow manager. It helps you organize usernames, prepares and copies your message to the clipboard, and opens user profiles. You retain 100% manual control over pasting and sending each message on Instagram.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does the tool require my Instagram password or login cookies?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Never. The application requires zero login credentials, passwords, or session tokens. All campaign data and lists are saved locally inside your browser storage.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I import usernames from a CSV spreadsheet?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. You can paste lists of usernames or drag and drop any standard CSV or TXT file. The tool automatically detects username columns, strips @ symbols, extracts handles from full Instagram URLs, and removes duplicate entries.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does the tool prevent accidental duplicate messaging?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'During import, the tool analyzes all entered handles, normalizes casing and URL formats, and removes duplicates with an instant count notification. Once marked as Sent, users are clearly flagged in your campaign list.',
            },
          },
        ],
      },
    ],
  };

  const faqs = [
    {
      q: 'Does this tool automatically send messages on Instagram?',
      a: 'No. ToolNest Instagram DM Assistant is strictly a manual workflow organizer. It prepares your message, copies it to your clipboard with one click, and opens each profile. The actual send interaction is performed manually by you on Instagram to comply with community policies.',
    },
    {
      q: 'Do I need to enter my Instagram username or password?',
      a: 'No! ToolNest never requests, stores, or transmits your Instagram password, authentication cookies, or session tokens. Everything is processed 100% locally inside your web browser memory and localStorage.',
    },
    {
      q: 'Can I import full Instagram profile URLs?',
      a: 'Yes. Whether you enter "@username", "username", "https://instagram.com/username", or "instagram.com/username/?igsh=...", our parser automatically cleans and normalizes it into a valid Instagram handle.',
    },
    {
      q: 'What formats can I upload via CSV?',
      a: 'You can upload standard CSV spreadsheets with a column named "username", "handle", or "instagram", or plain TXT files with one username per line. The file is read client-side and never uploaded to any remote server.',
    },
    {
      q: 'How many messages should I send per day to stay safe?',
      a: 'To maintain good standing with Instagram, keep your messaging pacing natural. Avoid sending repetitive unsolicited messages to unknown accounts. Instagram may apply temporary rate limits if accounts send too many direct messages in a short timeframe.',
    },
    {
      q: 'Can I export my outreach progress?',
      a: 'Yes. At any point, you can click "Export CSV" to download an organized spreadsheet containing each profile handle, status (Sent, Pending, Skipped, Invalid), sent timestamp, and message content.',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 5-Step Workflow Guide */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              How the Manual Instagram DM Workflow Operates
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              A streamlined 5-step process designed for fast, organized, and compliant outreach
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#5722AF] text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Import Usernames</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Paste 100+ handles or upload a CSV file. Automatic cleaning strips URLs, @ symbols, and duplicates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#5722AF] text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Prepare Message</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Compose your outreach message or select from pre-saved templates like Movie Promotion or Collaboration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#5722AF] text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Copy & Open</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Click &quot;Copy Message & Open Profile&quot; to copy the text to your clipboard and open the user profile in a new tab.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#5722AF] text-white font-bold flex items-center justify-center text-xs">
              4
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Manual Send</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              On Instagram, open the Message composer, paste your clipboard text, review recipient details, and click Send.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#5722AF] text-white font-bold flex items-center justify-center text-xs">
              5
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Mark & Next</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Return to ToolNest and click &quot;Message Sent&quot;. The tool automatically queues the next pending username.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Key information on manual messaging, privacy, and safety
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-1.5"
            >
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
