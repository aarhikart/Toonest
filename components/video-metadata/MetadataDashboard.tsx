'use client';

import React, { useState } from 'react';
import { ParsedMetadata } from '@/lib/video-metadata/types';
import {
  FileVideo,
  Monitor,
  Volume2,
  AlertTriangle,
  Info,
  Code,
  Tag,
  ChevronDown,
  ChevronUp,
  X,
  Copy,
  Check,
  MapPin,
  Camera,
  Smartphone,
  Calendar,
  Layers,
  Clock,
} from 'lucide-react';

interface MetadataDashboardProps {
  metadata: ParsedMetadata;
}

export function MetadataDashboard({ metadata }: MetadataDashboardProps) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const { fileInfo, videoStream, audioStream, removableTags, sensitiveHighlights } = metadata;

  const copyRawJson = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata.rawFfprobeJson, null, 2)).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    });
  };

  const getSensitiveIcon = (category: string) => {
    switch (category) {
      case 'location':
        return <MapPin className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'camera':
        return <Camera className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'device':
        return <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'creation_time':
        return <Calendar className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'software':
        return <Layers className="w-4 h-4 text-blue-500 shrink-0" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Sensitive Privacy Metadata Alert Banner */}
      {sensitiveHighlights.length > 0 ? (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
              Privacy-Sensitive Metadata Detected ({sensitiveHighlights.length} items)
            </h3>
          </div>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mb-4">
            This video contains metadata tags that can expose geographic location, physical recording hardware, or timestamps.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sensitiveHighlights.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/90 dark:bg-zinc-900/80 border border-amber-200/80 dark:border-amber-900/60 p-3 rounded-2xl flex items-start gap-2.5 shadow-2xs"
              >
                {getSensitiveIcon(item.category)}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={item.value}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-4 flex items-center gap-3">
          <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs text-emerald-800 dark:text-emerald-200">
            No obvious GPS or hardware tags found in standard container atoms. You can still remove general descriptive tags and timestamps.
          </div>
        </div>
      )}

      {/* 2. Technical Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* File Information */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <FileVideo className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              File Information
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 dark:text-zinc-400">Filename:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]" title={fileInfo.filename}>
                {fileInfo.filename}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 dark:text-zinc-400">File Size:</span>
              <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                {fileInfo.formattedSize}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 dark:text-zinc-400">Duration:</span>
              <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                {fileInfo.formattedDuration}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 dark:text-zinc-400">Bitrate:</span>
              <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                {fileInfo.formattedBitrate}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 dark:text-zinc-400">Container:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {fileInfo.container}
              </span>
            </div>
          </div>
        </div>

        {/* Video Information */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Monitor className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Video Stream
            </h4>
          </div>
          {videoStream ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Codec:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {videoStream.codec}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Resolution:</span>
                <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  {videoStream.resolution}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Frame Rate:</span>
                <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  {videoStream.frameRate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Pixel Format:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {videoStream.pixelFormat}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Color Primaries:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {videoStream.colorPrimaries}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 py-4 text-center">No video stream detected</div>
          )}
        </div>

        {/* Audio Information */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Volume2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Audio Stream
            </h4>
          </div>
          {audioStream ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Audio Codec:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {audioStream.codec}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Sample Rate:</span>
                <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  {audioStream.sampleRate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Channels:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {audioStream.channels} ({audioStream.channelLayout})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Bitrate:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {audioStream.bitrate || 'Dynamic'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Language:</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {audioStream.language || 'Undetermined'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 py-4 text-center">No audio track (Silent video)</div>
          )}
        </div>
      </div>

      {/* 3. Removable / Descriptive Metadata Tags Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Removable Metadata Tags ({removableTags.length} detected)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRawJson(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              <span>View Raw FFprobe Data</span>
            </button>
          </div>
        </div>

        {removableTags.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-400">
            No removable container tags found in this video.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2 px-3">Metadata Tag</th>
                  <th className="py-2 px-3">Raw Key</th>
                  <th className="py-2 px-3">Value</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                {(showAllTags ? removableTags : removableTags.slice(0, 8)).map((tag, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      {tag.isSensitive && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      <span>{tag.label}</span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">{tag.key}</td>
                    <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-100 font-semibold max-w-xs truncate" title={tag.value}>
                      {tag.value}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {tag.isSensitive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Sensitive
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          Removable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {removableTags.length > 8 && (
              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8] hover:underline"
                >
                  <span>{showAllTags ? 'Show fewer tags' : `Show all ${removableTags.length} tags`}</span>
                  {showAllTags ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raw FFprobe Data Modal */}
      {showRawJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#5722AF]" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Raw FFprobe JSON Data
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyRawJson}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setShowRawJson(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-950/60 rounded-b-3xl">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(metadata.rawFfprobeJson, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
