export type OverallAccessStatus =
  | 'accessible'
  | 'partially-accessible'
  | 'blocked'
  | 'untested';

export type StepState =
  | 'pending'
  | 'running'
  | 'success'
  | 'warning'
  | 'error'
  | 'skipped';

export interface DiagnosticStep {
  id: string;
  label: string;
  state: StepState;
  message?: string;
  durationMs?: number;
}

export interface SecurityGatewayInfo {
  detected: boolean;
  vendor?: string;
  category?: string;
  reason?: string;
  indicators?: string[];
  blockPageSnippet?: string;
}

export interface HttpDiagnosticResult {
  isReachable: boolean;
  statusCode?: number;
  statusText?: string;
  roundTripMs?: number;
  xFrameOptions?: string | null;
  cspFrameAncestors?: string | null;
  server?: string | null;
  canEmbed: boolean;
  embedBlockReason?: string;
  securityGateway: SecurityGatewayInfo;
  rawHeaders?: Record<string, string>;
}

export interface UploadControlInfo {
  supported: boolean;
  count: number;
  acceptedTypes: string[];
  names: string[];
  inspectedSameOrigin: boolean;
  restrictionNotice?: string;
}

export interface UploadTestFile {
  file: File | Blob;
  name: string;
  type: string;
  size: number;
  extension: string;
  isValid: boolean;
  validationErrors: string[];
}

export interface UploadProgressInfo {
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  speedBps: number;
  elapsedTimeSec: number;
  remainingTimeSec: number;
}

export type UploadErrorType =
  | 'network'
  | 'http_403'
  | 'http_413'
  | 'http_415'
  | 'cors'
  | 'security_gateway'
  | 'timeout'
  | 'aborted'
  | 'unknown';

export interface UploadErrorDetail {
  type: UploadErrorType;
  statusCode?: number;
  title: string;
  message: string;
  recommendation: string;
}

export interface UploadConfig {
  endpoint: string;
  method: 'POST' | 'PUT';
  fieldName: string;
  customHeaders: { key: string; value: string }[];
  allowedTypes: string[];
  maxSizeMb: number;
}

export interface BrowserEnvironment {
  browserName: string;
  browserVersion: string;
  engine: string;
  os: string;
  isMobile: boolean;
  cookieEnabled: boolean;
  onLine: boolean;
  supportsFetch: boolean;
  supportsXHRUpload: boolean;
}

export interface FullDiagnosticReport {
  generatedAt: string;
  url: string;
  overallStatus: OverallAccessStatus;
  browser: BrowserEnvironment;
  steps: DiagnosticStep[];
  http: Partial<HttpDiagnosticResult>;
  iframeStatus: {
    canEmbed: boolean;
    reason?: string;
  };
  uploadInspection: UploadControlInfo;
  uploadTest?: {
    attempted: boolean;
    endpoint?: string;
    method?: string;
    fileSizeMb?: number;
    result?: 'success' | 'failed' | 'cancelled';
    error?: UploadErrorDetail;
    speedKbps?: number;
  };
  likelyRootCause: string;
  actionableRecommendations: string[];
}
