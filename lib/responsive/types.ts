export type DeviceCategory = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export type Orientation = 'portrait' | 'landscape';

export type TestStatus = 'pass' | 'warning' | 'fail' | 'untested';

export type BrowserTarget =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'ios-safari'
  | 'android-chrome';

export interface DevicePreset {
  id: string;
  name: string;
  category: DeviceCategory;
  width: number;
  height: number;
  dpr: number;
  os: 'android' | 'ios' | 'macos' | 'windows' | 'generic';
  aspectRatio: string;
  popular?: boolean;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface ResponsiveIssueItem {
  id: string;
  label: string;
  category: 'layout' | 'typography' | 'navigation' | 'media' | 'forms';
  checked: boolean;
  notes?: string;
}

export interface AccessibilityCheckItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

export interface DeviceMatrixTest {
  portrait: TestStatus;
  landscape: TestStatus;
}

export interface TestSession {
  id: string;
  url: string;
  timestamp: string;
  deviceStatuses: Record<string, TestStatus>;
  orientationMatrix: Record<string, DeviceMatrixTest>;
  browserChecklist: Record<BrowserTarget, TestStatus>;
  selectedIssues: string[];
  accessibilityChecks: string[];
  notes: string;
  testedViewportsCount: number;
}

export interface TestReportSummary {
  totalTested: number;
  passed: number;
  warnings: number;
  failed: number;
  untested: number;
  categoryBreakdown: Record<DeviceCategory, { passed: number; total: number }>;
}
