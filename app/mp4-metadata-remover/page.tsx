'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { VideoUploader } from '@/components/video-text/VideoUploader';
import { VideoCanvasEditor } from '@/components/video-text/VideoCanvasEditor';
import { RemovalOptionsCard } from '@/components/video-text/RemovalOptionsCard';
import { ProcessedResultCard } from '@/components/video-text/ProcessedResultCard';
import { VideoTextSession, BoundingBox, RemovalOptions, ProcessResult } from '@/lib/video-text/types';
import { Sparkles, ScanText, RefreshCw, AlertCircle, Palette, Zap, ShieldCheck } from 'lucide-react';

export default function VideoTextRemoverPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [session, setSession] = useState<VideoTextSession | null>(null);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  // Handle Video Upload
  const handleFileSelected = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    setSession(null);
    setBoxes([]);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/video-text/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload and analyze video.');
      }

      setSession(data.session);
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Error uploading video.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Text Removal Process
  const handleStartProcess = async (options: RemovalOptions) => {
    if (!session) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/video-text/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          options,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process text removal on video.');
      }

      setResult(data.result);
    } catch (err: any) {
      console.error('Process error:', err);
      setErrorMessage(err.message || 'Error processing text removal.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSession(null);
    setBoxes([]);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Video Text & Logo Remover"
        onOpenHelp={() => {}}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="mp4-metadata-remover"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Title & Badge Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold ring-1 ring-indigo-500/20">
            <ScanText className="w-3.5 h-3.5" />
            <span>AI OCR Text & Logo Eradication Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Video Text & Logo Remover
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Automatically detect and cleanly erase brand names, text on clothing, or watermarks across your entire video.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero Audio Loss</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              <span>Matching Fabric Patch</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Smart Delogo Inpainting</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-200 flex items-start gap-3 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-600 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: Upload Zone (Initial State) */}
        {!session && !result && (
          <VideoUploader
            onFileSelected={handleFileSelected}
            isUploading={isUploading}
            errorMessage={errorMessage}
          />
        )}

        {/* STEP 2: Interactive Frame Editor & Removal Options */}
        {session && !result && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Video Info Header */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {session.originalFilename}
                </span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-500">{session.width}×{session.height}</span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-500">{session.formattedDuration}</span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-500">{session.fps} FPS</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Another Video</span>
              </button>
            </div>

            {/* Video Canvas & Frame Scrubber */}
            <VideoCanvasEditor
              session={session}
              boxes={boxes}
              onBoxesChange={setBoxes}
            />

            {/* Removal Method Selector & Process Button */}
            <RemovalOptionsCard
              boxes={boxes}
              onStartProcess={handleStartProcess}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* STEP 3: Processed Result & Download */}
        {result && (
          <ProcessedResultCard
            result={result}
            onReset={handleReset}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
