'use client';

import React, { useState } from 'react';
import { Code2, Copy, Check, Download } from 'lucide-react';
import { ExtractedWebData } from '@/lib/web-extractor/types';

interface ExtractedSourceTabProps {
  data: ExtractedWebData;
}

export const ExtractedSourceTab: React.FC<ExtractedSourceTabProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.rawHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([data.rawHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.domain}-source.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Code2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Raw HTML Source: <strong>{(data.pageSizeBytes / 1024).toFixed(1)} KB</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied HTML!' : 'Copy Code'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .html</span>
          </button>
        </div>
      </div>

      <pre className="p-4 rounded-2xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto border border-zinc-800 max-h-[600px] leading-relaxed select-all">
        {data.rawHtml}
      </pre>
    </div>
  );
};
