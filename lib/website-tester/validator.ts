import {
  BrowserEnvironment,
  FullDiagnosticReport,
  UploadTestFile
} from './types';

/**
 * Normalizes user-entered URL (e.g. example.com -> https://example.com)
 */
export function normalizeUrl(input: string): string {
  if (!input) return '';
  let trimmed = input.trim();

  // If starts with www. or no protocol, add https://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

/**
 * Validates whether string is a valid HTTP/HTTPS URL
 */
export function isValidUrl(input: string): boolean {
  if (!input) return false;
  try {
    const normalized = normalizeUrl(input);
    const parsed = new URL(normalized);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      Boolean(parsed.hostname) &&
      parsed.hostname.includes('.') &&
      !parsed.hostname.startsWith('.') &&
      !parsed.hostname.endsWith('.')
    );
  } catch {
    return false;
  }
}

/**
 * Detects current browser environment from client-side navigator
 */
export function detectCurrentBrowser(): BrowserEnvironment {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      browserName: 'Server / Unknown',
      browserVersion: 'Unknown',
      engine: 'Unknown',
      os: 'Unknown',
      isMobile: false,
      cookieEnabled: false,
      onLine: true,
      supportsFetch: true,
      supportsXHRUpload: true
    };
  }

  const ua = navigator.userAgent;
  let browserName = 'Browser';
  let browserVersion = 'Unknown';
  let engine = 'Unknown';

  if (/Edg\/([0-9.]+)/.test(ua)) {
    browserName = 'Microsoft Edge';
    browserVersion = RegExp.$1;
    engine = 'Blink';
  } else if (/Chrome\/([0-9.]+)/.test(ua) && !/Edg/.test(ua)) {
    browserName = 'Google Chrome';
    browserVersion = RegExp.$1;
    engine = 'Blink';
  } else if (/Firefox\/([0-9.]+)/.test(ua)) {
    browserName = 'Mozilla Firefox';
    browserVersion = RegExp.$1;
    engine = 'Gecko';
  } else if (/Safari\/([0-9.]+)/.test(ua) && !/Chrome/.test(ua)) {
    browserName = 'Apple Safari';
    const verMatch = ua.match(/Version\/([0-9.]+)/);
    browserVersion = verMatch ? verMatch[1] : RegExp.$1;
    engine = 'WebKit';
  } else if (/OPR\/([0-9.]+)/.test(ua)) {
    browserName = 'Opera';
    browserVersion = RegExp.$1;
    engine = 'Blink';
  }

  let os = 'Unknown OS';
  if (/Windows NT 10.0/.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/.test(ua)) os = 'Windows 8.1';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  return {
    browserName,
    browserVersion: browserVersion.split('.').slice(0, 2).join('.'),
    engine,
    os,
    isMobile,
    cookieEnabled: navigator.cookieEnabled ?? true,
    onLine: navigator.onLine ?? true,
    supportsFetch: typeof fetch === 'function',
    supportsXHRUpload: typeof XMLHttpRequest !== 'undefined' && 'upload' in new XMLHttpRequest()
  };
}

export const detectBrowserCapabilities = detectCurrentBrowser;

/**
 * Validates a file against allowed extensions, mime types, and size boundaries
 */
export function validateUploadFile(
  file: File | Blob,
  fileName: string,
  allowedTypes: string[],
  maxSizeMb: number
): UploadTestFile {
  const size = file.size;
  const extension = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : '';
  const type = file.type || 'application/octet-stream';
  const validationErrors: string[] = [];

  // 1. Empty file check
  if (size === 0) {
    validationErrors.push('File is empty (0 bytes).');
  }

  // 2. Maximum file size check
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (size > maxBytes) {
    const sizeMb = (size / (1024 * 1024)).toFixed(2);
    validationErrors.push(`File size (${sizeMb} MB) exceeds the configured limit of ${maxSizeMb} MB.`);
  }

  // 3. Allowed type check
  if (allowedTypes && allowedTypes.length > 0) {
    const cleanAllowed = allowedTypes.map(t => t.replace(/^\./, '').toLowerCase());
    const isExtAllowed = cleanAllowed.includes(extension);

    // Also check mime prefix if relevant
    const isMimeAllowed = cleanAllowed.some(cat => {
      if (cat === 'jpg' || cat === 'jpeg') return type === 'image/jpeg';
      if (cat === 'png') return type === 'image/png';
      if (cat === 'webp') return type === 'image/webp';
      if (cat === 'gif') return type === 'image/gif';
      if (cat === 'pdf') return type === 'application/pdf';
      if (cat === 'docx') return type.includes('wordprocessingml') || type.includes('msword');
      if (cat === 'xlsx') return type.includes('spreadsheetml') || type.includes('excel');
      if (cat === 'mp4') return type === 'video/mp4';
      if (cat === 'webm') return type === 'video/webm';
      return false;
    });

    if (!isExtAllowed && !isMimeAllowed) {
      validationErrors.push(
        `File extension '.${extension || 'unknown'}' is not accepted. Allowed: ${allowedTypes.join(', ')}`
      );
    }
  }

  return {
    file,
    name: fileName,
    type,
    size,
    extension,
    isValid: validationErrors.length === 0,
    validationErrors
  };
}

/**
 * Generates synthetic in-memory test file without consuming massive memory
 */
export function generateTestFile(sizeMb: number, extension = 'jpg'): File {
  const sizeBytes = Math.round(sizeMb * 1024 * 1024);
  const chunkUnit = 1024 * 64; // 64KB repetitive slice
  const repeats = Math.floor(sizeBytes / chunkUnit);
  const remainder = sizeBytes % chunkUnit;

  const samplePattern = new Uint8Array(chunkUnit);
  for (let i = 0; i < chunkUnit; i++) {
    samplePattern[i] = (i % 256);
  }

  const parts: ArrayBuffer[] = [];
  for (let i = 0; i < repeats; i++) {
    parts.push(samplePattern.buffer.slice(0) as ArrayBuffer);
  }
  if (remainder > 0) {
    parts.push(samplePattern.slice(0, remainder).buffer.slice(0) as ArrayBuffer);
  }

  let mimeType = 'application/octet-stream';
  if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
  else if (extension === 'png') mimeType = 'image/png';
  else if (extension === 'pdf') mimeType = 'application/pdf';
  else if (extension === 'webp') mimeType = 'image/webp';

  const blob = new Blob(parts, { type: mimeType });
  return new File([blob], `test-${sizeMb}mb.${extension}`, { type: mimeType });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatSpeed(bps: number): string {
  if (bps <= 0) return '0 KB/s';
  const kbps = bps / 1024;
  if (kbps >= 1024) {
    return `${(kbps / 1024).toFixed(2)} MB/s`;
  }
  return `${kbps.toFixed(1)} KB/s`;
}

/**
 * Report text exporter
 */
export function generateReportText(report: FullDiagnosticReport): string {
  const divider = '==================================================';
  return [
    divider,
    'TOOLNEST - WEBSITE ACCESS & UPLOAD DIAGNOSTIC REPORT',
    divider,
    `Generated At:    ${new Date(report.generatedAt).toLocaleString()}`,
    `Target URL:      ${report.url}`,
    `Overall Status:  ${report.overallStatus.toUpperCase()}`,
    `Likely Cause:    ${report.likelyRootCause}`,
    '',
    'CLIENT ENVIRONMENT',
    `Browser:         ${report.browser.browserName} ${report.browser.browserVersion}`,
    `Engine / OS:     ${report.browser.engine} on ${report.browser.os} (${report.browser.isMobile ? 'Mobile' : 'Desktop'})`,
    `Online Status:   ${report.browser.onLine ? 'Connected' : 'Offline'}`,
    '',
    'DIAGNOSTIC TEST RESULTS',
    ...report.steps.map(s => `[${s.state.toUpperCase().padEnd(7)}] ${s.label}: ${s.message || ''}`),
    '',
    'HTTP & NETWORK LAYER',
    `HTTP Status:     ${report.http.statusCode ? `${report.http.statusCode} ${report.http.statusText || ''}` : 'Not available'}`,
    `Round-trip:      ${report.http.roundTripMs ? `${report.http.roundTripMs} ms` : 'N/A'}`,
    `X-Frame-Options: ${report.http.xFrameOptions || 'None (Permitted)'}`,
    `CSP Ancestors:   ${report.http.cspFrameAncestors || 'None'}`,
    `Can Embed:       ${report.iframeStatus.canEmbed ? 'YES' : 'NO'} ${report.iframeStatus.reason ? `(${report.iframeStatus.reason})` : ''}`,
    '',
    'SECURITY GATEWAY / FILTER DETECTION',
    `Gateway Block:   ${report.http.securityGateway?.detected ? 'DETECTED' : 'Not Detected'}`,
    ...(report.http.securityGateway?.detected
      ? [
          `Vendor:          ${report.http.securityGateway.vendor || 'Unknown'}`,
          `Category:        ${report.http.securityGateway.category || 'Restricted'}`,
          `Reason:          ${report.http.securityGateway.reason || ''}`,
          ...(report.http.securityGateway.indicators?.map(i => ` - ${i}`) || [])
        ]
      : []),
    '',
    'UPLOAD COMPATIBILITY',
    `Inspection:      ${report.uploadInspection.supported ? 'Found controls' : 'Restricted / Not found'}`,
    `File Inputs:     ${report.uploadInspection.count}`,
    ...(report.uploadTest?.attempted
      ? [
          `Upload Attempt:  ${report.uploadTest.result?.toUpperCase()}`,
          `Endpoint:        ${report.uploadTest.endpoint}`,
          `File Size:       ${report.uploadTest.fileSizeMb} MB`,
          ...(report.uploadTest.error
            ? [`Upload Error:    [${report.uploadTest.error.type}] ${report.uploadTest.error.message}`]
            : [])
        ]
      : ['Upload Attempt:  Not tested']),
    '',
    'ACTIONABLE RECOMMENDATIONS',
    ...report.actionableRecommendations.map((r, i) => `${i + 1}. ${r}`),
    divider,
    'Generated via ToolNest Website Access & Upload Compatibility Tester',
    divider
  ].join('\n');
}

/**
 * Report JSON exporter
 */
export function generateReportJson(report: FullDiagnosticReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Report CSV exporter
 */
export function generateReportCsv(report: FullDiagnosticReport): string {
  const rows: [string, string][] = [
    ['Generated At', report.generatedAt],
    ['Target URL', report.url],
    ['Overall Status', report.overallStatus],
    ['Likely Cause', report.likelyRootCause],
    ['Browser', `${report.browser.browserName} ${report.browser.browserVersion}`],
    ['OS', report.browser.os],
    ['HTTP Status', String(report.http.statusCode || 'N/A')],
    ['Round Trip (ms)', String(report.http.roundTripMs || 'N/A')],
    ['Iframe Embed Permitted', report.iframeStatus.canEmbed ? 'Yes' : 'No'],
    ['Security Gateway Detected', report.http.securityGateway?.detected ? 'Yes' : 'No'],
    ['Security Gateway Vendor', report.http.securityGateway?.vendor || 'None'],
    ['Upload Form Tested', report.uploadTest?.attempted ? 'Yes' : 'No'],
    ['Upload Test Result', report.uploadTest?.result || 'N/A']
  ];

  return ['Parameter,Value', ...rows.map(([k, v]) => `"${k}","${v.replace(/"/g, '""')}"`)].join('\n');
}
