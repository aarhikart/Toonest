'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  ClipboardList,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileCode,
  ArrowRight,
  RefreshCw,
  Info,
  Sliders,
} from 'lucide-react';
import {
  parseCsvText,
  parseExcelBuffer,
  parseJsonText,
  parsePastedText,
  autoDetectColumns,
  applyColumnMapping,
} from '@/lib/call-history/parser';
import { CallRecord, ColumnMapping, ParsedFileResult } from '@/lib/call-history/types';
import { generateSampleCallHistory } from '@/lib/call-history/sampleData';

interface ImportPanelProps {
  onRecordsLoaded: (records: CallRecord[], sourceName: string) => void;
  onRequestColumnMapping: (result: ParsedFileResult) => void;
  isLoading?: boolean;
}

export function ImportPanel({
  onRecordsLoaded,
  onRequestColumnMapping,
  isLoading = false,
}: ImportPanelProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'account'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle uploaded file (CSV, XLSX, JSON)
  const handleFile = async (file: File) => {
    if (!file) return;
    setParseError(null);
    setIsProcessing(true);

    try {
      const fileName = file.name.toLowerCase();
      let headers: string[] = [];
      let rows: any[] = [];

      if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        const text = await file.text();
        const parsed = parseCsvText(text);
        headers = parsed.headers;
        rows = parsed.rows;
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const parsed = parseExcelBuffer(buffer);
        headers = parsed.headers;
        rows = parsed.rows;
      } else if (fileName.endsWith('.json')) {
        const text = await file.text();
        const parsed = parseJsonText(text);
        headers = parsed.headers;
        rows = parsed.rows;
      } else {
        throw new Error('Unsupported file format. Please upload a .CSV, .XLSX, .XLS, or .JSON file.');
      }

      if (rows.length === 0) {
        throw new Error('No data rows found in the uploaded file.');
      }

      const autoMapping = autoDetectColumns(headers);
      const isAutoMatched = Boolean(autoMapping.phoneNumber && (autoMapping.date || autoMapping.dateTime));

      if (isAutoMatched) {
        const records = applyColumnMapping(rows, autoMapping);
        if (records.length === 0) {
          throw new Error('Unable to extract valid call records from this file.');
        }
        onRecordsLoaded(records, file.name);
      } else {
        // Prompt user to map columns
        onRequestColumnMapping({
          headers,
          rows,
          autoMapping,
          isAutoMatched: false,
          fileName: file.name,
          fileSize: file.size,
        });
      }
    } catch (err: any) {
      console.error('File import error:', err);
      setParseError(err.message || 'Failed to parse file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle pasted text records
  const handleParsePasted = () => {
    if (!pastedText.trim()) {
      setParseError('Please paste your call history records before parsing.');
      return;
    }
    setParseError(null);
    setIsProcessing(true);

    try {
      const parsed = parsePastedText(pastedText);
      if (parsed.rows.length === 0) {
        throw new Error('No valid records found in the pasted text. Check the format.');
      }

      const autoMapping = autoDetectColumns(parsed.headers);
      const isAutoMatched = Boolean(autoMapping.phoneNumber && (autoMapping.date || autoMapping.dateTime));

      if (isAutoMatched) {
        const records = applyColumnMapping(parsed.rows, autoMapping);
        if (records.length === 0) {
          throw new Error('Could not convert lines into valid call records.');
        }
        onRecordsLoaded(records, 'Pasted Records');
        setPastedText('');
      } else {
        onRequestColumnMapping({
          headers: parsed.headers,
          rows: parsed.rows,
          autoMapping,
          isAutoMatched: false,
          fileName: 'Pasted Call Log',
          fileSize: pastedText.length,
        });
      }
    } catch (err: any) {
      console.error('Paste parse error:', err);
      setParseError(err.message || 'Failed to parse pasted text.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load sample demo data
  const handleLoadSample = () => {
    setParseError(null);
    const demoRecords = generateSampleCallHistory();
    onRecordsLoaded(demoRecords, 'Demo Dataset (Sample Call Log)');
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
      {/* Top Header & Option Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Provide Call History Data</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#B68BFF]">
              3 Input Methods
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Choose how to load your authorized call logs into the analyzer
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-[#5722AF] text-[#5722AF] dark:text-purple-300 hover:text-white border border-[#5722AF]/20 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          title="Quickly test the tool with realistic sample call records"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Demo Call History</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl p-1 bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 max-w-lg">
        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            setParseError(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('paste');
            setParseError(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'paste'
              ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Paste Records</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('account');
            setParseError(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'account'
              ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Connect Account</span>
        </button>
      </div>

      {/* Parse Error Display */}
      {parseError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <div className="flex-1 font-medium">{parseError}</div>
          <button
            onClick={() => setParseError(null)}
            className="text-rose-400 hover:text-rose-600 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Option A: Upload File */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-[#5722AF] dark:hover:border-[#9B6BE8] rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-900/30 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center mx-auto mb-3.5 group-hover:scale-105 transition-transform shadow-xs">
              {isProcessing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 mb-1">
              {isProcessing ? 'Processing File...' : 'Choose or drop your Call History file'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-3">
              Supports <strong>CSV</strong>, <strong>XLSX</strong>, <strong>XLS</strong>, and <strong>JSON</strong> call exports.
            </p>

            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
              <span>Example columns: Date, Time, Phone Number, Type, Duration</span>
            </div>
          </div>
        </div>
      )}

      {/* Option B: Paste Call Records */}
      {activeTab === 'paste' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-zinc-800 dark:text-zinc-200">
                Paste your call history records below:
              </label>
              <button
                type="button"
                onClick={() =>
                  setPastedText(
                    `Date, Time, Phone Number, Contact Name, Type, Duration\n26/09/2026, 10:32, +91 98765 43210, Rahul Sharma, Incoming, 02:31\n26/09/2026, 11:15, +91 98765 43210, Rahul Sharma, Outgoing, 05:42\n26/09/2026, 12:40, +91 98111 22334, Priya Patel, Incoming, 04:05\n26/09/2026, 13:10, +91 98999 11223, Unknown, Missed, 00:00\n26/09/2026, 14:05, +91 94000 12345, Mom, Incoming, 10:20`
                  )
                }
                className="text-[11px] text-[#5722AF] dark:text-[#B68BFF] hover:underline font-semibold cursor-pointer"
              >
                Insert sample text
              </button>
            </div>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={`26/09/2026 10:32, +919876543210, Rahul, Incoming, 02:31\n26/09/2026 11:15, +919876543210, Rahul, Outgoing, 05:42`}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Auto-detects comma, tab, semicolon, and pipe separation.
            </span>
            <button
              type="button"
              disabled={isProcessing || !pastedText.trim()}
              onClick={handleParsePasted}
              className="px-5 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#682BC9] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <span>Parse & Analyze Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Option C: Authorized Account Connection */}
      {activeTab === 'account' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-4 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              No telecom provider integration is configured.
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              To connect via OAuth or official telecom provider API, an enterprise provider gateway is required.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-xs text-[#5722AF] dark:text-purple-300 text-left flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              You can upload your own call-history export file (CSV, XLSX, JSON) instead, or paste your records directly in the tabs above.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5722AF] hover:bg-[#682BC9] transition-colors shadow-xs"
          >
            Switch to File Upload
          </button>
        </div>
      )}
    </div>
  );
}
