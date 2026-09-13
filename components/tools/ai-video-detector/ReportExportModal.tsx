'use client';

import React, { useState } from 'react';
import {
  FileText,
  Code,
  Download,
  Copy,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { VideoAnalysisResult } from '@/lib/ai-video/types';
import {
  generateTextReport,
  generateJsonReport,
  downloadReport,
} from '@/lib/ai-video/report-generator';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VideoAnalysisResult;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [format, setFormat] = useState<'txt' | 'json'>('txt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const content =
    format === 'txt' ? generateTextReport(result) : generateJsonReport(result);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    downloadReport(result, format);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Export Detection Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download audit log for research, documentation, or record-keeping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Format Selector */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Export Format
            </label>
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setFormat('txt')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  format === 'txt'
                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Text Report (.txt)
              </button>
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  format === 'json'
                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                JSON Audit (.json)
              </button>
            </div>
          </div>

          {/* Preview Box */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 px-1">
              <span>Report Content Preview</span>
              <span>{format.toUpperCase()} format</span>
            </div>
            <pre className="w-full h-64 p-4 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-auto whitespace-pre leading-relaxed select-all">
              {content}
            </pre>
          </div>

          {/* Disclaimer Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              All reports include standard probabilistic disclosures and ethical usage
              clauses. This assessment is not definitive legal or forensic evidence.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Text
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            Download {format.toUpperCase()} Report
          </button>
        </div>
      </div>
    </div>
  );
};
