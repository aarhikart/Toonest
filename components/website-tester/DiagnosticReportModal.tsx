'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Code, Table, ShieldAlert, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { FullDiagnosticReport } from '@/lib/website-tester/types';
import { generateReportText, generateReportJson, generateReportCsv } from '@/lib/website-tester/validator';

interface DiagnosticReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullDiagnosticReport | null;
}

export function DiagnosticReportModal({ isOpen, onClose, report }: DiagnosticReportModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'formatted' | 'txt' | 'json' | 'csv'>('formatted');

  if (!isOpen || !report) return null;

  const handleCopy = () => {
    let content = '';
    if (activeTab === 'json') {
      content = generateReportJson(report);
    } else if (activeTab === 'csv') {
      content = generateReportCsv(report);
    } else {
      content = generateReportText(report);
    }

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (format: 'txt' | 'json' | 'csv') => {
    let content = '';
    let mimeType = 'text/plain';
    let ext = format;

    if (format === 'json') {
      content = generateReportJson(report);
      mimeType = 'application/json';
    } else if (format === 'csv') {
      content = generateReportCsv(report);
      mimeType = 'text/csv';
    } else {
      content = generateReportText(report);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeHost = report.url.replace(/[^a-z0-9]/gi, '_').slice(0, 30);
    a.href = url;
    a.download = `toolnest-diagnostic-${safeHost}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accessible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Accessible
          </span>
        );
      case 'partially-accessible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Partially Accessible
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5" /> Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
            Unable to Test
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Diagnostic Audit Report
              </h2>
              {getStatusBadge(report.overallStatus)}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-lg">
              Target: <span className="font-mono">{report.url}</span> • Generated {new Date(report.generatedAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors shadow-sm"
              title="Copy current tab format to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action / Format Tabs Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('formatted')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'formatted'
                  ? 'bg-white dark:bg-zinc-800 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Formatted Summary
            </button>
            <button
              onClick={() => setActiveTab('txt')}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'txt'
                  ? 'bg-white dark:bg-zinc-800 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> TXT
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'json'
                  ? 'bg-white dark:bg-zinc-800 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> JSON
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'csv'
                  ? 'bg-white dark:bg-zinc-800 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> CSV
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px] hidden sm:inline">Export:</span>
            <button
              onClick={() => downloadFile('txt')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <Download className="w-3 h-3" /> .TXT
            </button>
            <button
              onClick={() => downloadFile('json')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <Download className="w-3 h-3" /> .JSON
            </button>
            <button
              onClick={() => downloadFile('csv')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <Download className="w-3 h-3" /> .CSV
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'formatted' && (
            <div className="space-y-6">
              {/* Root Cause Banner */}
              <div className="p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Primary Diagnosis & Likely Root Cause
                </div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {report.likelyRootCause}
                </div>
              </div>

              {/* Security Gateway Alert if detected */}
              {report.http.securityGateway?.detected && (
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold text-sm mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    Security Gateway / Web Filter Interception Detected
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">Vendor: </span>
                      <span className="font-semibold">{report.http.securityGateway.vendor || 'Corporate Security Proxy'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400">Category: </span>
                      <span className="font-semibold">{report.http.securityGateway.category || 'Restricted Policy'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnostic Stepper Results */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                  Verification Sequence
                </h3>
                <div className="space-y-2">
                  {report.steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-start justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 text-xs"
                    >
                      <div className="flex-1 pr-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {step.label}
                        </div>
                        {step.message && (
                          <div className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {step.message}
                          </div>
                        )}
                      </div>
                      <span
                        className={`font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded ${
                          step.state === 'success'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : step.state === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            : step.state === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {step.state}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Network & HTTP Telemetry
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">HTTP Status:</span>
                      <span className="font-mono font-medium">
                        {report.http.statusCode ? `${report.http.statusCode} ${report.http.statusText || ''}` : 'No direct response'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">Round-trip Latency:</span>
                      <span className="font-mono font-medium">{report.http.roundTripMs ? `${report.http.roundTripMs} ms` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">X-Frame-Options:</span>
                      <span className="font-mono font-medium truncate max-w-[180px]">{report.http.xFrameOptions || 'None'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500 dark:text-zinc-400">CSP Ancestors:</span>
                      <span className="font-mono font-medium truncate max-w-[180px]">{report.http.cspFrameAncestors || 'None'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Client & Upload Readiness
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">Browser Client:</span>
                      <span className="font-medium">{report.browser.browserName} {report.browser.browserVersion}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">Platform:</span>
                      <span className="font-medium">{report.browser.os}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 dark:text-zinc-400">File Upload UI Found:</span>
                      <span className="font-medium">{report.uploadInspection.supported ? `Yes (${report.uploadInspection.count} inputs)` : 'None detected'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500 dark:text-zinc-400">Active Upload Test:</span>
                      <span className="font-medium">{report.uploadTest?.attempted ? report.uploadTest.result?.toUpperCase() : 'Not executed'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                  Legitimate Resolution Steps
                </h3>
                <div className="space-y-2">
                  {report.actionableRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-800 dark:text-zinc-200"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5722AF]/10 dark:bg-[#5722AF]/30 text-[#5722AF] dark:text-[#9B6BE8] font-bold flex items-center justify-center text-[10px]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'txt' && (
            <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto border border-zinc-800">
              {generateReportText(report)}
            </pre>
          )}

          {activeTab === 'json' && (
            <pre className="p-4 bg-zinc-900 text-emerald-400 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto border border-zinc-800">
              {generateReportJson(report)}
            </pre>
          )}

          {activeTab === 'csv' && (
            <pre className="p-4 bg-zinc-900 text-sky-400 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto border border-zinc-800">
              {generateReportCsv(report)}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Enterprise-grade audit report • Generated strictly without proxy bypasses</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
