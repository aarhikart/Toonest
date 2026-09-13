'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { InstagramHero } from '@/components/instagram/InstagramHero';
import { ReelUrlInputCard } from '@/components/instagram/ReelUrlInputCard';
import { ReelResultCard } from '@/components/instagram/ReelResultCard';
import { RecentReelsHistory } from '@/components/instagram/RecentReelsHistory';
import { ReelHowItWorks } from '@/components/instagram/ReelHowItWorks';
import { ReelFeatures } from '@/components/instagram/ReelFeatures';
import { SupportedUrlsCard } from '@/components/instagram/SupportedUrlsCard';
import { LegalResponsibleNotice } from '@/components/instagram/LegalResponsibleNotice';
import { ReelDownloaderSEO } from '@/components/instagram/ReelDownloaderSEO';
import { InstagramFAQ } from '@/components/instagram/InstagramFAQ';

import {
  ReelMetadata,
  ReelApiResponse,
  SavedReelItem,
} from '@/lib/instagram/types';
import { Check } from 'lucide-react';

const STORAGE_HISTORY_KEY = 'toolnest_recent_reels';

export default function InstagramReelDownloaderPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reel, setReel] = useState<ReelMetadata | null>(null);
  const [history, setHistory] = useState<SavedReelItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  // 1. Load History on Mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load history from localStorage:', err);
    }
  }, []);

  // 2. Persist History when updated
  const saveHistory = (items: SavedReelItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save history to localStorage:', err);
    }
  };

  const handleFetchReel = async (targetUrl?: string) => {
    const urlToFetch = (targetUrl || url).trim();
    if (!urlToFetch) {
      setError('Please paste an Instagram Reel URL to begin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReel(null);

    try {
      const res = await fetch('/api/instagram/reel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const data: ReelApiResponse = await res.json();

      if (!res.ok || !data.success || !data.reel) {
        setError(
          data.error ||
            'Could not retrieve media for this Reel. Please verify that the account is public and accessible.'
        );
        return;
      }

      setReel(data.reel);
      if (data.reel.isRestricted) {
        showToast('Reel details & cover retrieved!');
      } else {
        showToast('Reel ready for download!');
      }
    } catch (err) {
      console.error('Fetch reel error:', err);
      setError('Unable to connect to the lookup service. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Record into history when a download begins
  const handleDownloadStarted = (item: ReelMetadata) => {
    const historyEntry: SavedReelItem = {
      id: item.id || `reel-${Date.now()}`,
      url: item.url,
      creator: item.creator,
      thumbnail: item.thumbnail,
      caption: item.caption,
      downloadedAt: Date.now(),
    };

    const nextHistory = [
      historyEntry,
      ...history.filter((h) => h.id !== historyEntry.id),
    ].slice(0, 20);

    saveHistory(nextHistory);
  };

  const handleReset = () => {
    setUrl('');
    setReel(null);
    setError(null);
  };

  const handleRemoveHistoryItem = (id: string) => {
    const filtered = history.filter((h) => h.id !== id);
    saveHistory(filtered);
    showToast('Removed from history');
  };

  const handleClearHistory = () => {
    saveHistory([]);
    showToast('Recent downloads cleared');
  };

  const handleSelectFromHistory = (historyUrl: string) => {
    setUrl(historyUrl);
    handleFetchReel(historyUrl);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0B0C10] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Navigation */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => {}}
        activeToolName="Instagram Reel Downloader"
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="instagram-reel-downloader"
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-900/90 dark:bg-white/95 text-white dark:text-gray-900 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* Compact Hero */}
        <InstagramHero />

        {/* Primary Input Card */}
        <ReelUrlInputCard
          url={url}
          onChangeUrl={setUrl}
          onSubmit={() => handleFetchReel()}
          isLoading={isLoading}
          error={error}
        />

        {/* Result Card (When fetched) */}
        {reel && (
          <ReelResultCard
            reel={reel}
            onReset={handleReset}
            onDownloadStarted={handleDownloadStarted}
          />
        )}

        {/* Recent Downloads History */}
        <RecentReelsHistory
          history={history}
          onSelectReel={handleSelectFromHistory}
          onRemoveItem={handleRemoveHistoryItem}
          onClearHistory={handleClearHistory}
        />

        {/* How It Works Steps */}
        <ReelHowItWorks />

        {/* Feature Grid */}
        <ReelFeatures />

        {/* Supported Link Formats */}
        <SupportedUrlsCard />

        {/* Legal / Responsible Use Notice */}
        <LegalResponsibleNotice />

        {/* SEO Educational Guide */}
        <ReelDownloaderSEO />

        {/* FAQ Accordion */}
        <InstagramFAQ />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
