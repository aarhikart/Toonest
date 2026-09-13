'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ReadingSpeedSettings } from '@/lib/text/types';
import { getFullTextStatistics } from '@/lib/text/text-statistics';

import { TextEditor } from './TextEditor';
import { StatisticsGrid } from './StatisticsGrid';
import { ReadingSettingsModal } from './ReadingSettingsModal';

const STORAGE_SETTINGS_KEY = 'toolnest_reading_settings';

const DEFAULT_SETTINGS: ReadingSpeedSettings = {
  readingWpm: 200,
  speakingWpm: 130,
};

export function WordCounter() {
  const [text, setText] = useState('');
  const [settings, setSettings] = useState<ReadingSpeedSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSaveSettings = (newSettings: ReadingSpeedSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch {
      // Ignore
    }
  };

  // Real-time Text Statistics
  const stats = useMemo(() => {
    return getFullTextStatistics(text, settings);
  }, [text, settings]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + C: Copy text
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        if (text) {
          navigator.clipboard.writeText(text);
        }
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Large Text Editor Area */}
      <TextEditor
        value={text}
        onChange={setText}
        onOpenSettings={() => setIsSettingsOpen(true)}
        wordCount={stats.words}
      />

      {/* 2. Real-Time Statistics Dashboard Grid */}
      <StatisticsGrid stats={stats} />

      {/* Settings Modal */}
      <ReadingSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
