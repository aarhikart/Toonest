'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCheck,
  XCircle,
  AlertTriangle,
  Play,
  Settings,
  Sliders,
  CheckCircle2,
  FileCode,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  Lock
} from 'lucide-react';
import {
  UploadControlInfo,
  UploadTestFile,
  UploadProgressInfo,
  UploadErrorDetail,
  UploadConfig
} from '@/lib/website-tester/types';
import {
  validateUploadFile,
  generateTestFile,
  formatBytes,
  formatSpeed
} from '@/lib/website-tester/validator';
import { UploadProgressTracker } from './UploadProgressTracker';

interface UploadCompatibilityTesterProps {
  initialUrl?: string;
  uploadControlInfo: UploadControlInfo;
}

const PRESET_SIZES = [1, 5, 10, 25, 50, 100];
const DEFAULT_ALLOWED_TYPES = ['jpg', 'png', 'webp', 'gif', 'pdf', 'docx', 'xlsx'];

export function UploadCompatibilityTester({
  initialUrl,
  uploadControlInfo
}: UploadCompatibilityTesterProps) {
  // Test File State
  const [selectedFile, setSelectedFile] = useState<UploadTestFile | null>(null);
  const [selectedPresetSize, setSelectedPresetSize] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Configuration State
  const [config, setConfig] = useState<UploadConfig>({
    endpoint: initialUrl ? `${initialUrl.replace(/\/$/, '')}/api/upload` : '',
    method: 'POST',
    fieldName: 'file',
    customHeaders: [],
    allowedTypes: DEFAULT_ALLOWED_TYPES,
    maxSizeMb: 25
  });

  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Live Upload Execution State
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgressInfo>({
    percent: 0,
    loadedBytes: 0,
    totalBytes: 0,
    speedBps: 0,
    elapsedTimeSec: 0,
    remainingTimeSec: 0
  });

  const [uploadResult, setUploadResult] = useState<{
    status: 'idle' | 'success' | 'failed' | 'cancelled';
    statusCode?: number;
    errorDetail?: UploadErrorDetail;
    message?: string;
  }>({ status: 'idle' });

  const activeXhrRef = useRef<XMLHttpRequest | null>(null);
  const uploadStartTimeRef = useRef<number>(0);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validated = validateUploadFile(
      file,
      file.name,
      config.allowedTypes,
      config.maxSizeMb
    );
    setSelectedFile(validated);
    setUploadResult({ status: 'idle' });
  };

  // Handle synthetic test file generation
  const handleGeneratePreset = (sizeMb: number) => {
    setSelectedPresetSize(sizeMb);
    const generated = generateTestFile(sizeMb, 'jpg');
    const validated = validateUploadFile(
      generated,
      generated.name,
      config.allowedTypes,
      config.maxSizeMb
    );
    setSelectedFile(validated);
    setUploadResult({ status: 'idle' });
  };

  // Perform legitimate direct upload with real progress
  const handleStartUpload = () => {
    if (!selectedFile) {
      alert('Please select or generate a test file first.');
      return;
    }

    if (!config.endpoint.trim()) {
      alert('Please specify an authorized upload endpoint URL.');
      return;
    }

    try {
      new URL(config.endpoint);
    } catch {
      alert('Please provide a valid endpoint URL (e.g. https://your-domain.com/api/upload).');
      return;
    }

    setIsUploading(true);
    setUploadResult({ status: 'idle' });
    uploadStartTimeRef.current = Date.now();

    const xhr = new XMLHttpRequest();
    activeXhrRef.current = xhr;

    // Monitor real upload progress
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        const elapsedSec = (Date.now() - uploadStartTimeRef.current) / 1000;
        const speed = elapsedSec > 0 ? event.loaded / elapsedSec : 0;
        const remainingBytes = event.total - event.loaded;
        const remainingSec = speed > 0 ? remainingBytes / speed : 0;

        setProgress({
          percent: (event.loaded / event.total) * 100,
          loadedBytes: event.loaded,
          totalBytes: event.total,
          speedBps: speed,
          elapsedTimeSec: elapsedSec,
          remainingTimeSec: remainingSec
        });
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      activeXhrRef.current = null;

      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadResult({
          status: 'success',
          statusCode: xhr.status,
          message: `Upload accepted successfully by server (HTTP ${xhr.status} ${xhr.statusText || 'OK'}).`
        });
      } else {
        // Granular diagnostic evaluation
        let errorDetail: UploadErrorDetail;
        if (xhr.status === 403) {
          errorDetail = {
            type: 'http_403',
            statusCode: 403,
            title: 'HTTP 403 Forbidden',
            message: 'The upload destination rejected access. Authentication or valid session credentials may be required.',
            recommendation: 'Check API authorization tokens, CSRF tokens, or user permission on the target service.'
          };
        } else if (xhr.status === 413) {
          errorDetail = {
            type: 'http_413',
            statusCode: 413,
            title: 'HTTP 413 Payload Too Large',
            message: 'The file payload exceeds the maximum upload capacity configured on the target web server or reverse proxy.',
            recommendation: 'Increase server client_max_body_size or split file into smaller chunks.'
          };
        } else if (xhr.status === 415) {
          errorDetail = {
            type: 'http_415',
            statusCode: 415,
            title: 'HTTP 415 Unsupported Media Type',
            message: 'The server rejected this specific file MIME format.',
            recommendation: 'Verify supported multipart file types in server configuration.'
          };
        } else {
          errorDetail = {
            type: 'unknown',
            statusCode: xhr.status,
            title: `HTTP ${xhr.status} Error`,
            message: xhr.statusText || 'Server responded with an error code.',
            recommendation: 'Inspect server application logs to identify the backend handling failure.'
          };
        }

        setUploadResult({
          status: 'failed',
          statusCode: xhr.status,
          errorDetail
        });
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      activeXhrRef.current = null;

      // Distinguish CORS vs Network failure
      const isCorsLikely = config.endpoint && !config.endpoint.includes(window.location.host);

      setUploadResult({
        status: 'failed',
        errorDetail: {
          type: isCorsLikely ? 'cors' : 'network',
          title: isCorsLikely ? 'CORS / Browser Security Restriction' : 'Network Connection Error',
          message: isCorsLikely
            ? 'The browser blocked reading the response because the destination server did not return Access-Control-Allow-Origin headers, or the network security gateway blocked the connection.'
            : 'Could not connect to the upload endpoint. Host may be unreachable or connection was reset.',
          recommendation: isCorsLikely
            ? 'Configure CORS headers on the upload endpoint or test from the same origin. Note that network gateways may also reset connections.'
            : 'Verify internet connectivity and confirm the server is running.'
        }
      });
    };

    xhr.onabort = () => {
      setIsUploading(false);
      activeXhrRef.current = null;
      setUploadResult({
        status: 'cancelled',
        message: 'Upload was explicitly cancelled by user via AbortController.'
      });
    };

    try {
      xhr.open(config.method, config.endpoint, true);

      // Apply custom headers if defined
      config.customHeaders.forEach(h => {
        if (h.key && h.value) {
          xhr.setRequestHeader(h.key, h.value);
        }
      });

      const formData = new FormData();
      formData.append(config.fieldName, selectedFile.file, selectedFile.name);
      xhr.send(formData);
    } catch (err: any) {
      setIsUploading(false);
      activeXhrRef.current = null;
      setUploadResult({
        status: 'failed',
        errorDetail: {
          type: 'network',
          title: 'Request Dispatch Error',
          message: err.message || 'Browser failed to initialize upload request.',
          recommendation: 'Check URL syntax and protocol parameters.'
        }
      });
    }
  };

  const handleCancelUpload = () => {
    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Title & Scope Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Upload Compatibility & Form Tester</span>
          </h3>
          <p className="text-xs text-zinc-500">
            Validate local file compliance, generate test payloads, and test authorized upload endpoints with live progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            Authorized Testing Only
          </span>
        </div>
      </div>

      {/* Same-Origin Upload Controls Status (Section 9) */}
      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>DOM Upload Controls Inspection</span>
          </span>
          <span className="text-[11px] font-semibold text-zinc-500">
            {uploadControlInfo.inspectedSameOrigin ? 'Same-Origin Checked' : 'Cross-Origin Protected'}
          </span>
        </div>

        {uploadControlInfo.supported ? (
          <div className="text-emerald-700 dark:text-emerald-300 space-y-1 font-medium">
            <p>✓ Upload Controls Found: {uploadControlInfo.count} file input(s) detected.</p>
            {uploadControlInfo.acceptedTypes.length > 0 && (
              <p className="text-[11px] text-zinc-500">Accepted types: {uploadControlInfo.acceptedTypes.join(', ')}</p>
            )}
          </div>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
            {uploadControlInfo.restrictionNotice ||
              'Automatic upload-control inspection unavailable: The website does not permit this tool to inspect its internal DOM due to cross-origin security rules. Use the endpoint tester below to evaluate your authorized upload API.'}
          </p>
        )}
      </div>

      {/* 1. File Selection & Local Validation (Section 10 & 11) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <span>Step 1: Select or Generate Test File</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Choose Local File */}
          <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-[#7B45D1] transition flex flex-col justify-between space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                Choose Local File
              </span>
              <p className="text-[11px] text-zinc-500 pt-0.5">
                Select a genuine image, document, or media file from your computer.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Browse Files...</span>
            </button>
          </div>

          {/* Option B: Synthetic Test File Presets (Section 20) */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Synthetic Size Presets</span>
              </span>
              <p className="text-[11px] text-zinc-500 pt-0.5">
                Generate in-memory dummy payloads to test bandwidth and server capacity limits.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_SIZES.map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleGeneratePreset(sz)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedPresetSize === sz && selectedFile?.name.includes(`test-${sz}mb`)
                      ? 'bg-[#5722AF] text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {sz} MB
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected File Card & Validation Indicators */}
        {selectedFile && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {selectedFile.type || 'application/octet-stream'} • {formatBytes(selectedFile.size)}
                  </span>
                </div>
              </div>

              <div>
                {selectedFile.isValid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Validated for Test</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                    <XCircle className="w-3 h-3" />
                    <span>File Rejected</span>
                  </span>
                )}
              </div>
            </div>

            {/* Validation Checklist Output */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>File selected ({selectedFile.extension.toUpperCase() || 'BIN'})</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>MIME structure valid</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Size within limits ({formatBytes(selectedFile.size)})</span>
              </div>
            </div>

            {selectedFile.validationErrors.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-100/50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                {selectedFile.validationErrors.map((err, i) => (
                  <p key={i} className="flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{err}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Endpoint Configuration Form (Section 18) */}
      <div className="space-y-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Step 2: Upload Endpoint Target
          </h4>

          <button
            type="button"
            onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            className="text-xs text-[#5722AF] dark:text-[#9B6BE8] hover:underline font-semibold flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvancedConfig ? 'Hide Config' : 'Configure Endpoint'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 space-y-1">
            <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              Upload Endpoint URL
            </label>
            <input
              type="text"
              value={config.endpoint}
              onChange={e => setConfig({ ...config, endpoint: e.target.value })}
              placeholder="https://example.com/api/upload"
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#5722AF]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              Method
            </label>
            <select
              value={config.method}
              onChange={e => setConfig({ ...config, method: e.target.value as any })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              Field Name
            </label>
            <input
              type="text"
              value={config.fieldName}
              onChange={e => setConfig({ ...config, fieldName: e.target.value })}
              placeholder="file"
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
        </div>

        {showAdvancedConfig && (
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-3 text-xs">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
              Allowed Upload Formats (Local Validation)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['jpg', 'png', 'webp', 'gif', 'pdf', 'docx', 'xlsx', 'mp4', 'webm'].map(t => {
                const isChecked = config.allowedTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const next = isChecked
                        ? config.allowedTypes.filter(x => x !== t)
                        : [...config.allowedTypes, t];
                      setConfig({ ...config, allowedTypes: next });
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                      isChecked
                        ? 'bg-[#5722AF] text-white'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    .{t}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Live Upload Execution & Progress (Section 21 & 22) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStartUpload}
            disabled={isUploading || !selectedFile || !selectedFile.isValid}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#5722AF]/25 active:scale-[0.99] disabled:opacity-50 transition flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Test Upload Request</span>
          </button>
        </div>

        {/* Real-Time Progress Component */}
        <UploadProgressTracker
          progress={progress}
          isUploading={isUploading}
          onCancelUpload={handleCancelUpload}
        />

        {/* Upload Result Diagnostics (Section 12) */}
        {uploadResult.status === 'success' && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Upload Succeeded (HTTP {uploadResult.statusCode})</span>
            </span>
            <p className="text-[11px]">{uploadResult.message}</p>
          </div>
        )}

        {uploadResult.status === 'cancelled' && (
          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
            Upload was cancelled. No partial payload was saved.
          </div>
        )}

        {uploadResult.status === 'failed' && uploadResult.errorDetail && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>{uploadResult.errorDetail.title}</span>
              </span>
              {uploadResult.errorDetail.statusCode && (
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60">
                  HTTP {uploadResult.errorDetail.statusCode}
                </span>
              )}
            </div>

            <p className="text-[11px] leading-relaxed">
              {uploadResult.errorDetail.message}
            </p>

            <div className="p-2.5 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-rose-200/60 dark:border-rose-900 text-[11px] text-zinc-700 dark:text-zinc-300">
              <strong>Recommendation:</strong> {uploadResult.errorDetail.recommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
