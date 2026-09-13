'use client';

import React from 'react';
import { VideoMetadata } from '@/lib/ai-video/types';
import { FileCode, Info } from 'lucide-react';

interface VideoMetadataTableProps {
  metadata: VideoMetadata;
}

export function VideoMetadataTable({ metadata }: VideoMetadataTableProps) {
  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const rows = [
    { label: 'Container Format', value: metadata.format || 'MP4' },
    { label: 'Codec', value: metadata.codec || 'H.264 / AVC' },
    {
      label: 'Resolution',
      value: metadata.width && metadata.height ? `${metadata.width} × ${metadata.height}` : '1920 × 1080',
    },
    { label: 'Frame Rate', value: metadata.fps ? `${metadata.fps} FPS` : '30 FPS' },
    { label: 'Duration', value: metadata.duration ? `${metadata.duration}s` : 'Unknown' },
    { label: 'Audio Stream', value: metadata.hasAudio ? 'Present (Stereo/Mono)' : 'No Audio Track' },
    { label: 'File Size', value: formatBytes(metadata.sizeBytes) },
  ];

  return (
    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
        <FileCode className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
        <span>Extracted Container & Stream Metadata</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {rows.map((r, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60"
          >
            <div className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
              {r.label}
            </div>
            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono truncate mt-0.5">
              {r.value}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5 leading-snug">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <span>
          <strong>Advisory:</strong> Container metadata can be stripped, re-encoded, or altered by editing suites and social networks. It is useful context but should not be treated as proof of AI generation.
        </span>
      </div>
    </div>
  );
}
