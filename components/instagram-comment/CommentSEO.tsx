'use client';

import React from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

export const CommentSEO: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Instagram Auto Commenter & User Tag Assistant',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    description: 'Free in-browser Instagram auto-commenter script generator with Spintax syntax support and advanced anti-ban batch rest protection.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-10 text-slate-700 dark:text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Explainer */}
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          How to Safely Auto-Comment &amp; Tag Users on Instagram Posts
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
          Automating comments on Instagram posts or reels is a popular strategy for marketing, giveaways, and content promotion. However, Instagram enforces strict automated spam-detection algorithms that temporarily block accounts after just 5 or 6 comments if they look robotic. This tool uses proven anti-detection engineering to keep your outreach safe and compliant.
        </p>
      </div>

      {/* 3 Pillars of Anti-Ban Engineering */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            1. Spintax &amp; Text Rotation
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Meta algorithms flag accounts that send repetitive identical text like <em>&ldquo;MovieMela link in bio&rdquo;</em>. By using Spintax syntax (e.g. <code>{'{check this out|must watch}'}</code>), each comment becomes an entirely fresh phrase.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            2. Smart Batch Breaks
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Real humans comment in short bursts, then pause. Our script pauses for 60 seconds every 4 comments, successfully resetting Instagram&apos;s sliding-window spam counter and preventing the 5&ndash;6 comment block.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            3. Invisible Unicode Jitter
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Injects invisible zero-width unicode characters (<code>\u200B</code>) into the string. To human viewers, the comment reads normally; to Instagram&apos;s MD5/SHA hash comparison, every comment has an entirely unique signature.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Do I need to give you my Instagram password?
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              No. ToolNest never asks for or stores Instagram passwords, API keys, or cookies. The script runs entirely in your own browser under your own logged-in session.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Why was my previous code getting blocked after 5 or 6 comments?
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Instagram limits rapid continuous actions from the same IP/account. If you comment continuously every 8–10 seconds with the same message, Instagram flags your account for tag-spam. Using our Smart Batch Rest (pausing 60s every 4 comments) prevents this trigger.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">
              What is the ideal delay between comments?
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              We recommend 15 to 25 seconds between comments, combined with a 60-second rest break every 4 comments. This strikes the best balance between speed and account safety.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
