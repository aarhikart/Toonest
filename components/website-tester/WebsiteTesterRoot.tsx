'use client';

import React, { useState, useEffect } from 'react';
import { UrlInputBar } from './UrlInputBar';
import { AccessStatusCard } from './AccessStatusCard';
import { DiagnosticStepper } from './DiagnosticStepper';
import { SecurityGatewayAlert } from './SecurityGatewayAlert';
import { WebsitePreviewFrame } from './WebsitePreviewFrame';
import { BrowserCompatibilityCard } from './BrowserCompatibilityCard';
import { UploadCompatibilityTester } from './UploadCompatibilityTester';
import { UploadTroubleshootingPanel } from './UploadTroubleshootingPanel';
import { DiagnosticReportModal } from './DiagnosticReportModal';
import {
  OverallAccessStatus,
  DiagnosticStep,
  HttpDiagnosticResult,
  BrowserEnvironment,
  UploadControlInfo,
  FullDiagnosticReport
} from '@/lib/website-tester/types';
import {
  normalizeUrl,
  isValidUrl,
  detectBrowserCapabilities
} from '@/lib/website-tester/validator';
import { FileText, ShieldCheck, Activity, Terminal, Monitor, Upload, Layers } from 'lucide-react';

const INITIAL_STEPS: DiagnosticStep[] = [
  {
    id: 'step-url',
    label: 'URL Format & Protocol Validation',
    state: 'pending',
    message: 'Awaiting URL entry'
  },
  {
    id: 'step-network',
    label: 'Client Network & Host Reachability',
    state: 'pending',
    message: 'Tests client-to-host connectivity without relaying'
  },
  {
    id: 'step-http',
    label: 'HTTP Status & Security Header Analysis',
    state: 'pending',
    message: 'Inspects HTTP status code, latency, and firewall signatures'
  },
  {
    id: 'step-browser',
    label: 'Client Browser & Runtime Environment',
    state: 'pending',
    message: 'Evaluates client upload API and fetch capabilities'
  },
  {
    id: 'step-iframe',
    label: 'Iframe Embeddability Verification',
    state: 'pending',
    message: 'Evaluates X-Frame-Options and CSP frame-ancestors'
  },
  {
    id: 'step-upload',
    label: 'File Upload Control Detection',
    state: 'pending',
    message: 'Scans target landing page for multipart form controls'
  }
];

export function WebsiteTesterRoot() {
  const [url, setUrl] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [overallStatus, setOverallStatus] = useState<OverallAccessStatus>('untested');
  const [steps, setSteps] = useState<DiagnosticStep[]>(INITIAL_STEPS);
  const [httpResult, setHttpResult] = useState<Partial<HttpDiagnosticResult> | null>(null);
  const [uploadInfo, setUploadInfo] = useState<UploadControlInfo>({
    supported: false,
    count: 0,
    acceptedTypes: [],
    names: [],
    inspectedSameOrigin: false,
    restrictionNotice: 'Test landing page to detect file upload form controls.'
  });
  const [browserInfo, setBrowserInfo] = useState<BrowserEnvironment>({
    browserName: 'Unknown',
    browserVersion: '',
    engine: 'Unknown',
    os: 'Unknown',
    isMobile: false,
    cookieEnabled: true,
    onLine: true,
    supportsFetch: true,
    supportsXHRUpload: true
  });
  const [report, setReport] = useState<FullDiagnosticReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [workspaceView, setWorkspaceView] = useState<'preview' | 'split' | 'diagnostics' | 'upload'>('preview');

  // Detect browser environment on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBrowserInfo(detectBrowserCapabilities());
    }
  }, []);

  const handleClear = () => {
    setUrl('');
    setIsTesting(false);
    setOverallStatus('untested');
    setSteps(INITIAL_STEPS);
    setHttpResult(null);
    setUploadInfo({
      supported: false,
      count: 0,
      acceptedTypes: [],
      names: [],
      inspectedSameOrigin: false,
      restrictionNotice: 'Test landing page to detect file upload form controls.'
    });
    setReport(null);
  };

  const handleOpenDirectly = () => {
    if (!url) return;
    const normalized = normalizeUrl(url);
    window.open(normalized, '_blank', 'noopener,noreferrer');
  };

  const runDiagnostic = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    setIsTesting(true);
    const normalized = normalizeUrl(targetUrl);
    setUrl(normalized);

    // Reset steps state
    const currentSteps: DiagnosticStep[] = INITIAL_STEPS.map(s => ({
      ...s,
      state: 'pending',
      message: undefined
    }));
    setSteps([...currentSteps]);
    setHttpResult(null);

    // 1. Step: URL Validation
    currentSteps[0] = { ...currentSteps[0], state: 'running', message: 'Validating URL syntax...' };
    setSteps([...currentSteps]);

    if (!isValidUrl(normalized)) {
      currentSteps[0] = {
        ...currentSteps[0],
        state: 'error',
        message: 'Invalid URL format or unsupported protocol (must be http:// or https://).'
      };
      currentSteps[1] = { ...currentSteps[1], state: 'skipped' };
      currentSteps[2] = { ...currentSteps[2], state: 'skipped' };
      currentSteps[3] = { ...currentSteps[3], state: 'skipped' };
      currentSteps[4] = { ...currentSteps[4], state: 'skipped' };
      currentSteps[5] = { ...currentSteps[5], state: 'skipped' };
      setSteps([...currentSteps]);
      setOverallStatus('blocked');
      setIsTesting(false);
      return;
    }

    try {
      const parsedUrl = new URL(normalized);
      currentSteps[0] = {
        ...currentSteps[0],
        state: 'success',
        message: `Valid ${parsedUrl.protocol.replace(':', '').toUpperCase()} URL on host: ${parsedUrl.hostname}`
      };
      setSteps([...currentSteps]);
    } catch {
      currentSteps[0] = { ...currentSteps[0], state: 'error', message: 'Malformed URL.' };
      setSteps([...currentSteps]);
      setIsTesting(false);
      return;
    }

    // 2. Step: Client-side probe & Network Reachability
    currentSteps[1] = {
      ...currentSteps[1],
      state: 'running',
      message: 'Probing client-to-host network connectivity...'
    };
    setSteps([...currentSteps]);

    let clientReachable = false;
    let clientErrorText = '';
    const abortCtrl = new AbortController();
    const probeTimeout = setTimeout(() => abortCtrl.abort(), 7000);

    try {
      // Browser-side no-cors fetch to verify whether the host is reachable from user's current connection
      await fetch(normalized, {
        mode: 'no-cors',
        signal: abortCtrl.signal,
        cache: 'no-cache'
      });
      clearTimeout(probeTimeout);
      clientReachable = true;
      currentSteps[1] = {
        ...currentSteps[1],
        state: 'success',
        message: 'Direct network connection from your browser succeeded (opaque response received).'
      };
    } catch (err: any) {
      clearTimeout(probeTimeout);
      clientErrorText = err.name === 'AbortError' ? 'Connection timed out (7s)' : err.message || 'Failed to fetch';
      currentSteps[1] = {
        ...currentSteps[1],
        state: 'warning',
        message: `Client direct probe returned: ${clientErrorText}. Verifying via server assisted probe...`
      };
    }
    setSteps([...currentSteps]);

    // 3. Step: Server-side Assisted Diagnostic (/api/website-tester/diagnose)
    currentSteps[2] = {
      ...currentSteps[2],
      state: 'running',
      message: 'Querying HTTP headers, status code, and gateway signatures...'
    };
    setSteps([...currentSteps]);

    let diagData: any = null;

    try {
      const resp = await fetch('/api/website-tester/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized })
      });

      diagData = await resp.json();
    } catch (err: any) {
      diagData = {
        success: false,
        error: `Diagnostic probe failed: ${err.message}`
      };
    }

    // 4. Evaluate Server Assisted Response
    let finalHttp: Partial<HttpDiagnosticResult> = {
      isReachable: clientReachable,
      canEmbed: false,
      securityGateway: { detected: false }
    };

    if (diagData && diagData.success && diagData.http) {
      finalHttp = diagData.http;
      setHttpResult(finalHttp);

      // Check security gateway
      if (finalHttp.securityGateway?.detected) {
        currentSteps[2] = {
          ...currentSteps[2],
          state: 'error',
          message: `${finalHttp.securityGateway.vendor || 'Security Gateway'} block intercepted request (${finalHttp.securityGateway.category || 'Policy restriction'}).`
        };
      } else if (finalHttp.statusCode) {
        if (finalHttp.statusCode >= 200 && finalHttp.statusCode < 400) {
          currentSteps[2] = {
            ...currentSteps[2],
            state: 'success',
            message: `HTTP ${finalHttp.statusCode} ${finalHttp.statusText || 'OK'} (${finalHttp.roundTripMs} ms)`
          };
        } else if (finalHttp.statusCode === 401 || finalHttp.statusCode === 403) {
          currentSteps[2] = {
            ...currentSteps[2],
            state: 'warning',
            message: `HTTP ${finalHttp.statusCode} ${finalHttp.statusText || 'Forbidden'} - Access denied by server authentication.`
          };
        } else {
          currentSteps[2] = {
            ...currentSteps[2],
            state: 'error',
            message: `HTTP ${finalHttp.statusCode} ${finalHttp.statusText || 'Server Error'}`
          };
        }
      } else {
        currentSteps[2] = {
          ...currentSteps[2],
          state: 'error',
          message: 'Server unreachable or DNS lookup failed.'
        };
      }
    } else {
      // Diagnostic API returned an error (e.g. SSRF blocked or network failure)
      currentSteps[2] = {
        ...currentSteps[2],
        state: 'error',
        message: diagData?.error || 'Failed to complete server diagnostic probe.'
      };
    }
    setSteps([...currentSteps]);

    // 5. Step: Browser Capability Assessment
    currentSteps[3] = {
      ...currentSteps[3],
      state: 'running',
      message: 'Evaluating local browser API compatibility...'
    };
    setSteps([...currentSteps]);

    const activeBrowser = detectBrowserCapabilities();
    setBrowserInfo(activeBrowser);

    if (activeBrowser.supportsFetch && activeBrowser.supportsXHRUpload) {
      currentSteps[3] = {
        ...currentSteps[3],
        state: 'success',
        message: `${activeBrowser.browserName} ${activeBrowser.browserVersion} supports Fetch API and XMLHttpRequest upload progress tracking.`
      };
    } else {
      currentSteps[3] = {
        ...currentSteps[3],
        state: 'warning',
        message: 'Browser has partial upload API support. Some upload tracking features may be limited.'
      };
    }
    setSteps([...currentSteps]);

    // 6. Step: Iframe Embeddability Verification
    currentSteps[4] = {
      ...currentSteps[4],
      state: 'running',
      message: 'Checking X-Frame-Options and CSP frame-ancestors...'
    };
    setSteps([...currentSteps]);

    if (finalHttp.canEmbed) {
      currentSteps[4] = {
        ...currentSteps[4],
        state: 'success',
        message: 'No iframe blocking headers detected. Direct embedding permitted.'
      };
    } else {
      currentSteps[4] = {
        ...currentSteps[4],
        state: 'warning',
        message: finalHttp.embedBlockReason || 'Embedding blocked by X-Frame-Options or CSP frame-ancestors. Direct browser navigation is required.'
      };
    }
    setSteps([...currentSteps]);

    // 7. Step: File Upload Control Detection
    currentSteps[5] = {
      ...currentSteps[5],
      state: 'running',
      message: 'Scanning landing page markup for upload form controls...'
    };
    setSteps([...currentSteps]);

    let detectedUploadInfo: UploadControlInfo = {
      supported: false,
      count: 0,
      acceptedTypes: [],
      names: [],
      inspectedSameOrigin: false,
      restrictionNotice: 'No standard HTML file inputs detected on the main landing page.'
    };

    if (diagData && diagData.uploadInspection) {
      detectedUploadInfo = diagData.uploadInspection;
      setUploadInfo(detectedUploadInfo);
      if (detectedUploadInfo.supported && detectedUploadInfo.count > 0) {
        currentSteps[5] = {
          ...currentSteps[5],
          state: 'success',
          message: `Found ${detectedUploadInfo.count} standard file upload input element(s) on target landing page.`
        };
      } else {
        currentSteps[5] = {
          ...detectedUploadInfo.restrictionNotice ? { ...currentSteps[5], state: 'warning', message: detectedUploadInfo.restrictionNotice } : { ...currentSteps[5], state: 'skipped', message: 'No standard file input elements discovered on landing page.' }
        };
      }
    } else {
      currentSteps[5] = {
        ...currentSteps[5],
        state: 'skipped',
        message: 'Upload form scan could not be executed on target page.'
      };
    }
    setSteps([...currentSteps]);

    // 8. Determine Overall Verdict & Likely Root Cause
    let calculatedStatus: OverallAccessStatus = 'accessible';
    let rootCause = '';
    const recommendations: string[] = [];

    if (finalHttp.securityGateway?.detected) {
      calculatedStatus = 'blocked';
      rootCause = `${finalHttp.securityGateway.vendor || 'Corporate Security'} Gateway / Web Filter Interception. Block category: ${finalHttp.securityGateway.category || 'Restricted Policy'}.`;
      recommendations.push(
        'Submit a formal URL reclassification request to your organization network administrator.',
        'Verify if your device requires an authorized enterprise VPN or corporate proxy PAC profile.',
        'Review the category indicator tags in your internal IT acceptable use policy.'
      );
    } else if (diagData?.error && diagData.error.includes('SSRF')) {
      calculatedStatus = 'blocked';
      rootCause = 'Security Guard: Target resolves to a private, loopback, or cloud-metadata IP address.';
      recommendations.push('Only public internet websites can be tested with the assisted diagnostic engine.');
    } else if (!finalHttp.isReachable && !clientReachable) {
      calculatedStatus = 'blocked';
      rootCause = 'Target host is unreachable from both the browser and server probe (DNS resolution failed or host offline).';
      recommendations.push(
        'Check that the domain name is spelled correctly and has active public DNS records.',
        'Verify your local internet connection.',
        'Test whether the web server port 80/443 is open and listening.'
      );
    } else if (finalHttp.statusCode && finalHttp.statusCode >= 500) {
      calculatedStatus = 'blocked';
      rootCause = `Destination server returned HTTP ${finalHttp.statusCode} ${finalHttp.statusText || 'Server Error'}.`;
      recommendations.push(
        'Inspect origin server application logs and gateway timeout settings (Nginx, Cloudflare, Apache).',
        'Verify backend database connectivity and health checks.'
      );
    } else if (finalHttp.statusCode && (finalHttp.statusCode === 401 || finalHttp.statusCode === 403)) {
      calculatedStatus = 'partially-accessible';
      rootCause = `Destination server rejected access with HTTP ${finalHttp.statusCode} (${finalHttp.statusText || 'Forbidden/Unauthorized'}).`;
      recommendations.push(
        'The website requires login credentials, API authentication, or token cookies.',
        'Check if an IP restriction (WAF / IP allowlist) or Cloudflare Bot Management blocked the automated check.'
      );
    } else if (!finalHttp.canEmbed) {
      calculatedStatus = 'partially-accessible';
      rootCause = 'Website is directly accessible, but embedding in iframes is blocked by X-Frame-Options or CSP frame-ancestors.';
      recommendations.push(
        'Use the "Open Directly in New Tab" button to interact with this website.',
        'If you are the website owner, adjust the X-Frame-Options or Content-Security-Policy header if iframe embedding is intended.'
      );
    } else {
      calculatedStatus = 'accessible';
      rootCause = 'Website is accessible directly with standard HTTP response codes and reachable network routing.';
      recommendations.push(
        'Site is fully accessible in the current environment.',
        'To verify file uploads, configure endpoint parameters in the Upload Tester panel below.'
      );
    }

    setOverallStatus(calculatedStatus);

    // 9. Compile Full Report
    const compiledReport: FullDiagnosticReport = {
      generatedAt: new Date().toISOString(),
      url: normalized,
      overallStatus: calculatedStatus,
      browser: activeBrowser,
      steps: currentSteps,
      http: finalHttp,
      iframeStatus: {
        canEmbed: Boolean(finalHttp.canEmbed),
        reason: finalHttp.embedBlockReason
      },
      uploadInspection: detectedUploadInfo,
      likelyRootCause: rootCause,
      actionableRecommendations: recommendations
    };

    setReport(compiledReport);
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Top URL Input Bar */}
      <UrlInputBar
        url={url}
        onChangeUrl={setUrl}
        onRunTest={runDiagnostic}
        isLoading={isTesting}
        onClear={handleClear}
      />

      {/* Main Status Verdict Banner */}
      {overallStatus !== 'untested' && (
        <AccessStatusCard
          status={overallStatus}
          url={url}
          httpResult={httpResult || undefined}
          onOpenDirectly={handleOpenDirectly}
          onOpenReport={() => setIsReportModalOpen(true)}
        />
      )}

      {/* Security Gateway / Sophos Interception Alert */}
      {httpResult?.securityGateway?.detected && (
        <SecurityGatewayAlert
          securityGateway={httpResult.securityGateway}
          url={url}
          onTryAgain={() => runDiagnostic(url)}
          onOpenDirectly={handleOpenDirectly}
          onCopyReport={() => setIsReportModalOpen(true)}
        />
      )}

      {/* Workspace View Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
          <button
            type="button"
            onClick={() => setWorkspaceView('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              workspaceView === 'preview'
                ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Live Website Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceView('diagnostics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              workspaceView === 'diagnostics'
                ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnostics & Security</span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceView('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              workspaceView === 'upload'
                ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Tester</span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceView('split')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              workspaceView === 'split'
                ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
        </div>

        {report && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8] hover:underline inline-flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> Full Audit Report
          </button>
        )}
      </div>

      {/* Main Workspace Layout */}
      {workspaceView === 'preview' && (
        <div className="w-full">
          <WebsitePreviewFrame
            url={url}
            canEmbed={httpResult ? httpResult.canEmbed : undefined}
            embedBlockReason={httpResult?.embedBlockReason}
            onOpenDirectly={handleOpenDirectly}
          />
        </div>
      )}

      {workspaceView === 'diagnostics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Diagnostic Execution Sequence
                  </h3>
                </div>
              </div>
              <DiagnosticStepper steps={steps} isLoading={isTesting} />
            </div>
            <BrowserCompatibilityCard browser={browserInfo} />
          </div>
          <div className="lg:col-span-5">
            <UploadTroubleshootingPanel />
          </div>
        </div>
      )}

      {workspaceView === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <UploadCompatibilityTester
              initialUrl={url}
              uploadControlInfo={uploadInfo}
            />
          </div>
          <div className="lg:col-span-5">
            <UploadTroubleshootingPanel />
          </div>
        </div>
      )}

      {workspaceView === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Diagnostics & Environment (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Diagnostic Execution Sequence
                  </h3>
                </div>
              </div>
              <DiagnosticStepper steps={steps} isLoading={isTesting} />
            </div>
            <BrowserCompatibilityCard browser={browserInfo} />
            <UploadTroubleshootingPanel />
          </div>

          {/* Right Column: Interactive Preview & Upload Compatibility (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <WebsitePreviewFrame
              url={url}
              canEmbed={httpResult ? httpResult.canEmbed : undefined}
              embedBlockReason={httpResult?.embedBlockReason}
              onOpenDirectly={handleOpenDirectly}
            />
            <UploadCompatibilityTester
              initialUrl={url}
              uploadControlInfo={uploadInfo}
            />
          </div>
        </div>
      )}

      {/* Diagnostic Report Export Modal */}
      <DiagnosticReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={report}
      />
    </div>
  );
}
