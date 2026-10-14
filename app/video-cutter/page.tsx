'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { VideoCutterHero } from '@/components/video-cutter/VideoCutterHero';
import { VideoUploadZone } from '@/components/video-cutter/VideoUploadZone';
import { ClipSettingsCard } from '@/components/video-cutter/ClipSettingsCard';
import { CuttingProgressCard } from '@/components/video-cutter/CuttingProgressCard';
import { ResultsDownloadCard } from '@/components/video-cutter/ResultsDownloadCard';
import { VideoCutterFAQ } from '@/components/video-cutter/VideoCutterFAQ';
import { VideoCutterSession, ProcessResult, CuttingProgress } from '@/lib/video-cutter/types';

export default function VideoCutterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Workflow states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [session, setSession] = useState<VideoCutterSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<CuttingProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // File Upload Handler (using XMLHttpRequest for accurate real-time progress)
  const handleFileSelected = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setSession(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/video-cutter/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          setSession(data.session);
        } else {
          setUploadError(data.error || 'Failed to upload video.');
        }
      } catch (err: any) {
        setUploadError('Invalid response from server.');
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadError('Network error uploading video file.');
    };

    xhr.send(formData);
  };

  // Poll progress while cutting
  const startProgressPolling = (sessionId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/video-cutter/progress/${sessionId}`);
        const data = await res.json();
        if (data.success && data.progress) {
          setProgress(data.progress);
          if (data.progress.stage === 'completed' || data.progress.stage === 'error') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        }
      } catch (_) {}
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Ending video upload state
  const [isUploadingEnding, setIsUploadingEnding] = useState(false);
  const [endingError, setEndingError] = useState<string | null>(null);

  // Logo watermark upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const handleUploadEndingVideo = async (file: File) => {
    if (!session) return;
    setIsUploadingEnding(true);
    setEndingError(null);

    const formData = new FormData();
    formData.append('sessionId', session.sessionId);
    formData.append('file', file);

    try {
      const res = await fetch('/api/video-cutter/ending', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload ending video.');
      }
      setSession((prev) => (prev ? { ...prev, endingVideo: data.endingVideo } : null));
    } catch (err: any) {
      setEndingError(err.message || 'Failed to upload ending video.');
    } finally {
      setIsUploadingEnding(false);
    }
  };

  const handleRemoveEndingVideo = async () => {
    if (!session) return;
    try {
      await fetch(`/api/video-cutter/ending?sessionId=${session.sessionId}`, {
        method: 'DELETE',
      });
    } catch (_) {}
    setSession((prev) => (prev ? { ...prev, endingVideo: null } : null));
  };

  const handleUploadLogo = async (file: File) => {
    if (!session) return;
    setIsUploadingLogo(true);
    setLogoError(null);

    const formData = new FormData();
    formData.append('sessionId', session.sessionId);
    formData.append('file', file);

    try {
      const res = await fetch('/api/video-cutter/logo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload logo.');
      }
      setSession((prev) => (prev ? { ...prev, logoImage: data.logo } : null));
    } catch (err: any) {
      setLogoError(err.message || 'Failed to upload logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!session) return;
    try {
      await fetch(`/api/video-cutter/logo?sessionId=${session.sessionId}`, {
        method: 'DELETE',
      });
    } catch (_) {}
    setSession((prev) => (prev ? { ...prev, logoImage: null } : null));
  };

  // Start Cutting Process
  const handleStartCutting = async (
    clipDurationSeconds: number,
    overlayWatermark: boolean = false,
    includeEndingVideo: boolean = false,
    includeLogo: boolean = false
  ) => {
    if (!session) return;

    setIsProcessing(true);
    setResult(null);
    setProgress({
      sessionId: session.sessionId,
      stage: 'cutting',
      percent: 15,
      message: 'Starting cutting process...',
      updatedAt: Date.now(),
    });

    startProgressPolling(session.sessionId);

    try {
      const res = await fetch('/api/video-cutter/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          clipDurationSeconds,
          overlayWatermark,
          includeEndingVideo,
          includeLogo,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cut video into segments.');
      }

      setResult(data.result);
    } catch (err: any) {
      console.error('[VideoCutter Cutting Error]:', err);
      alert(err.message || 'An error occurred during video cutting.');
    } finally {
      setIsProcessing(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  };

  // Reset to initial state
  const handleReset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setSession(null);
    setResult(null);
    setProgress(null);
    setIsProcessing(false);
    setIsUploading(false);
    setUploadError(null);
    setUploadProgress(0);
    setLogoError(null);
    setIsUploadingLogo(false);
    setEndingError(null);
    setIsUploadingEnding(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Video Cutter & ZIP Slicer"
        onOpenHelp={() => {}}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <VideoCutterHero />

        {/* Step 1: Upload Zone (Visible if no video is uploaded, or displays loaded preview) */}
        {!result && !isProcessing && (
          <VideoUploadZone
            onFileSelected={handleFileSelected}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            errorMessage={uploadError}
            session={session}
            onReset={handleReset}
          />
        )}

        {/* Step 2: Configuration & Slicing Schedule (Visible once video is loaded) */}
        {session && !result && !isProcessing && (
          <ClipSettingsCard
            session={session}
            onStartCutting={handleStartCutting}
            isProcessing={isProcessing}
            onUploadEndingVideo={handleUploadEndingVideo}
            onRemoveEndingVideo={handleRemoveEndingVideo}
            isUploadingEnding={isUploadingEnding}
            endingError={endingError}
            onUploadLogo={handleUploadLogo}
            onRemoveLogo={handleRemoveLogo}
            isUploadingLogo={isUploadingLogo}
            logoError={logoError}
          />
        )}

        {/* Step 3: Active Cutting & Zipping Progress */}
        {isProcessing && (
          <CuttingProgressCard progress={progress} />
        )}

        {/* Step 4: Finished Results & ZIP Download */}
        {result && (
          <ResultsDownloadCard
            result={result}
            onReset={handleReset}
          />
        )}

        {/* Informative FAQ */}
        <VideoCutterFAQ />
      </main>

      <Footer />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="video-cutter"
      />
    </div>
  );
}
