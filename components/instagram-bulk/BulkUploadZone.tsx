'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileCode, Clipboard, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { BulkParseResult, parseInstagramBulkHtml } from '@/lib/instagram/bulkHtmlParser';

interface BulkUploadZoneProps {
  onParsed: (result: BulkParseResult, filename: string) => void;
  isLoading?: boolean;
}

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reels List (Sample)</title>
</head>
<body>
  <div class="container">
    <h1>Reels List</h1>
    <div class="reel-item">
      <div class="title"><b>#1</b>
Follow for more motivation 🚀🧠
.
.
#motivation #explorepage #viral #reels</div>
      <a class="link" href="https://www.instagram.com/green.faction/reel/DeLuyMGT7IG/" target="_blank">https://www.instagram.com/green.faction/reel/DeLuyMGT7IG/</a>
    </div>
    <div class="reel-item">
      <div class="title"><b>#2</b>
Dont be a baddy 👿
Follow for more motivation 🚀🧠
.
.
#motivation #explorepage #viral #reels</div>
      <a class="link" href="https://www.instagram.com/green.faction/reel/Dd30JrGT-mN/" target="_blank">https://www.instagram.com/green.faction/reel/Dd30JrGT-mN/</a>
    </div>
  </div>
</body>
</html>`;

export function BulkUploadZone({ onParsed, isLoading = false }: BulkUploadZoneProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processContent = (content: string, filename: string) => {
    setError(null);
    try {
      const result = parseInstagramBulkHtml(content);
      if (result.items.length === 0) {
        setError('No Instagram Reel links found in this file. Ensure it contains instagram.com/reel/ links.');
        return;
      }
      onParsed(result, filename);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse file.');
    }
  };

  const handleFile = (file: File) => {
    if (!file) return;
    const isHtml =
      file.type.includes('html') ||
      file.name.toLowerCase().endsWith('.html') ||
      file.name.toLowerCase().endsWith('.htm') ||
      file.name.toLowerCase().endsWith('.txt');

    if (!isHtml) {
      setError('Please upload a valid .html, .htm, or .txt file containing Reel links.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      processContent(content, file.name);
    };
    reader.onerror = () => {
      setError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) {
      setError('Please paste HTML code or Instagram reel URLs.');
      return;
    }
    processContent(pasteText, 'pasted_reels_list.html');
  };

  const handleLoadSample = () => {
    processContent(SAMPLE_HTML, 'sample_reels_list.html');
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm transition-colors">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload HTML File
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'paste'
                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Paste HTML / Code
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample HTML
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Upload Dropzone */}
      {activeTab === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 scale-[0.99]'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-sky-400 dark:hover:border-sky-600 bg-zinc-50/50 dark:bg-zinc-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-inner">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Drop your Reels HTML file here
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-4">
            Supports HTML files with reels lists, title captions (<code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs text-sky-600 dark:text-sky-300">.title</code>), and direct reel links.
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            Browse File
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your reels HTML document or a list of Instagram reel links here..."
            rows={8}
            className="w-full p-4 rounded-xl font-mono text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setPasteText('')}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handlePasteSubmit}
              disabled={isLoading || !pasteText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white shadow-sm transition-all"
            >
              <FileCode className="w-4 h-4" />
              Parse & Load Reels
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
