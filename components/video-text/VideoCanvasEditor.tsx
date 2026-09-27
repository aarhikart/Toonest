'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VideoTextSession, BoundingBox } from '@/lib/video-text/types';
import {
  Sparkles,
  ScanText,
  Play,
  Pause,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Sliders,
  Maximize2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface VideoCanvasEditorProps {
  session: VideoTextSession;
  boxes: BoundingBox[];
  onBoxesChange: (boxes: BoundingBox[]) => void;
}

export function VideoCanvasEditor({ session, boxes, onBoxesChange }: VideoCanvasEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(session.duration || 1);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [detectionNotice, setDetectionNotice] = useState<string | null>(null);

  // Sync video time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || session.duration || 1);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Convert click coordinates on container to video native pixels
  const getNativeCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current || !videoRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;

      const scaleX = session.width / rect.width;
      const scaleY = session.height / rect.height;

      return {
        x: Math.round(clickX * scaleX),
        y: Math.round(clickY * scaleY),
      };
    },
    [session.width, session.height]
  );

  // Auto OCR Text Detection on current frame
  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setDetectionNotice(null);
    try {
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }

      const res = await fetch('/api/video-text/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          timestamp: currentTime,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to detect text on frame.');
      }

      const detected: BoundingBox[] = data.boxes || [];
      if (detected.length === 0) {
        setDetectionNotice(
          'No high-confidence text detected on this exact frame. You can draw a box manually over the text below.'
        );
      } else {
        // Merge with existing boxes
        onBoxesChange([...boxes, ...detected]);
        setDetectionNotice(`Detected ${detected.length} text region(s)!`);
      }
    } catch (err: any) {
      setDetectionNotice(err.message || 'Error running text detection.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Manual box drawing handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const coords = getNativeCoords(e.clientX, e.clientY);
    setDrawStart(coords);
    setDrawCurrent(coords);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !drawStart) return;
    const coords = getNativeCoords(e.clientX, e.clientY);
    setDrawCurrent(coords);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !drawStart || !drawCurrent) return;

    const x = Math.min(drawStart.x, drawCurrent.x);
    const y = Math.min(drawStart.y, drawCurrent.y);
    const width = Math.abs(drawCurrent.x - drawStart.x);
    const height = Math.abs(drawCurrent.y - drawStart.y);

    if (width > 5 && height > 5) {
      const newBox: BoundingBox = {
        id: crypto.randomUUID(),
        text: 'Custom Selection',
        x,
        y,
        width,
        height,
      };
      onBoxesChange([...boxes, newBox]);
    }

    setDrawStart(null);
    setDrawCurrent(null);
    setIsDrawing(false);
  };

  const removeBox = (id: string) => {
    onBoxesChange(boxes.filter((b) => b.id !== id));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Step 1: Locate & Select Text
          </span>
          <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            Video Frame & Text Detection
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isDetecting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ScanText className="w-3.5 h-3.5" />
            )}
            <span>Auto-Detect Text (OCR)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDrawing(!isDrawing)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isDrawing
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isDrawing ? 'Drawing Active (Click & Drag)' : 'Draw Box Manually'}</span>
          </button>
        </div>
      </div>

      {detectionNotice && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{detectionNotice}</span>
        </div>
      )}

      {/* Main Video Screen with Canvas Bounding Box Overlay */}
      <div className="space-y-3">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video select-none border border-zinc-800 shadow-md ${
            isDrawing ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          <video
            ref={videoRef}
            src={`/api/video-text/preview/${session.sessionId}`}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-contain pointer-events-none"
            playsInline
          />

          {/* Render Active Bounding Boxes */}
          {containerRef.current &&
            boxes.map((b) => {
              const rect = containerRef.current!.getBoundingClientRect();
              const left = (b.x / session.width) * rect.width;
              const top = (b.y / session.height) * rect.height;
              const width = (b.width / session.width) * rect.width;
              const height = (b.height / session.height) * rect.height;

              return (
                <div
                  key={b.id}
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  className="absolute border-2 border-indigo-500 bg-indigo-500/25 rounded-md flex items-start justify-between p-1 shadow-md group transition-all"
                >
                  <span className="text-[10px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded shadow-xs truncate max-w-[120px]">
                    {b.text || 'Selected Text'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBox(b.id);
                    }}
                    className="w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center justify-center cursor-pointer shadow-xs ml-1"
                    title="Remove Box"
                  >
                    ×
                  </button>
                </div>
              );
            })}

          {/* Render Active Drawing Rectangle */}
          {isDrawing && drawStart && drawCurrent && containerRef.current && (
            (() => {
              const rect = containerRef.current.getBoundingClientRect();
              const x = Math.min(drawStart.x, drawCurrent.x);
              const y = Math.min(drawStart.y, drawCurrent.y);
              const w = Math.abs(drawCurrent.x - drawStart.x);
              const h = Math.abs(drawCurrent.y - drawStart.y);

              const left = (x / session.width) * rect.width;
              const top = (y / session.height) * rect.height;
              const width = (w / session.width) * rect.width;
              const height = (h / session.height) * rect.height;

              return (
                <div
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  className="absolute border-2 border-dashed border-amber-400 bg-amber-400/20 pointer-events-none"
                />
              );
            })()
          )}
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div className="max-w-3xl mx-auto flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-2xs hover:bg-zinc-100 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 min-w-[45px]">
            {currentTime.toFixed(1)}s
          </span>

          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-indigo-600 cursor-pointer"
          />

          <span className="text-xs font-mono text-zinc-400 min-w-[45px]">
            {duration.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Selected Text Regions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
          <span>Active Text Regions to Remove ({boxes.length})</span>
          {boxes.length > 0 && (
            <button
              type="button"
              onClick={() => onBoxesChange([])}
              className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {boxes.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-500">
            No text boxes selected yet. Pause on the frame where the text appears and click{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">"Auto-Detect Text"</strong> or{' '}
            <strong className="text-amber-600 dark:text-amber-400">"Draw Box Manually"</strong> to select the waistband text.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {boxes.map((b, idx) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs"
              >
                <div className="truncate mr-2">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    #{idx + 1}: {b.text || 'Selected Region'}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    [{b.x}, {b.y}] • {b.width}×{b.height}px
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeBox(b.id)}
                  className="w-6 h-6 text-zinc-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                  title="Delete box"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
