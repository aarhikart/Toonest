'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { VideoInputTabs } from './VideoInputTabs';
import { VideoUploader } from './VideoUploader';
import { VideoUrlInput } from './VideoUrlInput';
import { VideoPreviewCard } from './VideoPreviewCard';
import { AnalysisProgress } from './AnalysisProgress';
import { DetectionResultCard } from './DetectionResultCard';
import { DetectorHistory } from './DetectorHistory';
import {
  VideoMetadata,
  VideoAnalysisResult,
  VideoHistoryItem,
} from '@/lib/ai-video/types';
import { AlertCircle, History } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'toolnest_ai_video_history';

export const AIVideoDetector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');

  // Input states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [clientMetadata, setClientMetadata] = useState<Partial<VideoMetadata>>({});

  // Workflow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);

  // History state
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveHistoryItem = useCallback((item: VideoHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 20); // Keep last 20
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  // Cleanup object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  // Handle File Selection
  const handleFileSelect = (file: File) => {
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoSrc(objectUrl);
    setVideoUrl('');
    setError(null);
    setResult(null);
  };

  // Handle URL Selection
  const handleUrlSubmit = (url: string) => {
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }
    setSelectedFile(null);
    setVideoUrl(url);
    setVideoSrc(url);
    setError(null);
    setResult(null);
  };

  // Metadata received from <video> element
  const handleMetadataLoaded = (meta: Partial<VideoMetadata>) => {
    setClientMetadata((prev) => ({
      ...prev,
      ...meta,
    }));
  };

  // Full reset to fresh state
  const handleReset = () => {
    if (videoSrc && videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }
    setSelectedFile(null);
    setVideoUrl('');
    setVideoSrc(null);
    setClientMetadata({});
    setIsAnalyzing(false);
    setError(null);
    setResult(null);
  };

  // Run Analysis via API
  const handleAnalyze = async (meta?: VideoMetadata) => {
    setIsAnalyzing(true);
    setError(null);

    const mergedMetadata = {
      ...clientMetadata,
      ...(meta || {}),
    };

    try {
      let res: Response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('video', selectedFile);
        formData.append(
          'clientMetadata',
          JSON.stringify({
            ...mergedMetadata,
            filename: selectedFile.name,
            sizeBytes: selectedFile.size,
            mimeType: selectedFile.type,
          })
        );

        res = await fetch('/api/ai-video/analyze', {
          method: 'POST',
          body: formData,
        });
      } else if (videoUrl) {
        res = await fetch('/api/ai-video/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'url',
            url: videoUrl,
            clientMetadata: mergedMetadata,
          }),
        });
      } else {
        throw new Error('Please select a video file or enter a valid video URL.');
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Video analysis failed. Please try again.');
      }

      setResult(data);

      // Save to local history
      const title =
        selectedFile?.name ||
        (videoUrl
          ? videoUrl.split('/').pop()?.split('?')[0] || videoUrl
          : 'Video Analysis');

      saveHistoryItem({
        id: `analysis_${Date.now()}`,
        timestamp: Date.now(),
        title,
        verdict: data.verdict,
        confidence: data.confidence,
        duration: data.video.duration || mergedMetadata.duration,
        isUrl: activeTab === 'url',
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Action Header / Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Media Forensics & AI Detection
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
        >
          <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          History {history.length > 0 && `(${history.length})`}
        </button>
      </div>

      {/* If Result exists, show the Results Card */}
      {result ? (
        <DetectionResultCard
          result={result}
          videoSrc={videoSrc || undefined}
          onReset={handleReset}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      ) : (
        /* Otherwise, show Input Flow (Tabs -> Uploader/URL -> Preview -> Progress) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-purple-950/5 p-6 sm:p-8 space-y-6 transition-all">
          {/* Input Method Switcher */}
          {!videoSrc && (
            <VideoInputTabs activeTab={activeTab} onSelectTab={setActiveTab} />
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-800 dark:text-rose-300 text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Analysis Notice</p>
                <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Analysis In-Flight Progress */}
          {isAnalyzing ? (
            <AnalysisProgress />
          ) : videoSrc ? (
            /* Media Ready: Preview Card */
            <VideoPreviewCard
              videoSrc={videoSrc}
              filename={
                selectedFile?.name ||
                (videoUrl
                  ? videoUrl.split('/').pop()?.split('?')[0] || 'video.mp4'
                  : 'video.mp4')
              }
              fileSize={selectedFile?.size}
              onAnalyze={(meta) => handleAnalyze(meta)}
              onRemove={handleReset}
              isLoading={isAnalyzing}
            />
          ) : (
            /* Initial Selection: Upload vs URL */
            <div>
              {activeTab === 'upload' ? (
                <VideoUploader
                  onVideoSelected={handleFileSelect}
                  isLoading={isAnalyzing}
                />
              ) : (
                <VideoUrlInput
                  onUrlSubmit={handleUrlSubmit}
                  isLoading={isAnalyzing}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Local History Drawer */}
      <DetectorHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onClearHistory={clearHistory}
      />
    </div>
  );
};
