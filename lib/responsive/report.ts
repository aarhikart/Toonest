import { TestSession, TestReportSummary, DeviceCategory } from './types';
import { DEVICE_PRESETS } from './devices';

export function calculateReportSummary(session: TestSession): TestReportSummary {
  const statuses = Object.values(session.deviceStatuses);
  let passed = 0;
  let warnings = 0;
  let failed = 0;
  let untested = 0;

  statuses.forEach((st) => {
    if (st === 'pass') passed++;
    else if (st === 'warning') warnings++;
    else if (st === 'fail') failed++;
    else untested++;
  });

  const categoryBreakdown: Record<DeviceCategory, { passed: number; total: number }> = {
    mobile: { passed: 0, total: 0 },
    tablet: { passed: 0, total: 0 },
    laptop: { passed: 0, total: 0 },
    desktop: { passed: 0, total: 0 },
  };

  DEVICE_PRESETS.forEach((preset) => {
    categoryBreakdown[preset.category].total++;
    const st = session.deviceStatuses[preset.id];
    if (st === 'pass') {
      categoryBreakdown[preset.category].passed++;
    }
  });

  return {
    totalTested: passed + warnings + failed,
    passed,
    warnings,
    failed,
    untested: Math.max(0, DEVICE_PRESETS.length - (passed + warnings + failed)),
    categoryBreakdown,
  };
}

export function exportSessionToCSV(session: TestSession): void {
  const rows: string[] = [];
  rows.push('"Device Preset","Category","Dimensions","Orientation","Status","Notes"');

  DEVICE_PRESETS.forEach((preset) => {
    const status = session.deviceStatuses[preset.id] || 'untested';
    const matrix = session.orientationMatrix[preset.id];
    const portraitSt = matrix?.portrait || status;
    const landscapeSt = matrix?.landscape || status;

    rows.push(
      `"${preset.name}","${preset.category}","${preset.width}x${preset.height}","Portrait","${portraitSt}",""`
    );
    rows.push(
      `"${preset.name}","${preset.category}","${preset.height}x${preset.width}","Landscape","${landscapeSt}",""`
    );
  });

  if (session.selectedIssues.length > 0) {
    rows.push('');
    rows.push('"Flagged Responsive Issues"');
    session.selectedIssues.forEach((issue) => {
      rows.push(`"${issue.replace(/"/g, '""')}"`);
    });
  }

  if (session.notes) {
    rows.push('');
    rows.push('"General Notes"');
    rows.push(`"${session.notes.replace(/"/g, '""')}"`);
  }

  const csvString = rows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  let hostname = 'website';
  try {
    hostname = new URL(session.url).hostname;
  } catch {}
  a.href = url;
  a.download = `responsive-test-${hostname}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSessionToJSON(session: TestSession): void {
  const data = {
    ...session,
    summary: calculateReportSummary(session),
    exportedAt: new Date().toISOString(),
  };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  let hostname = 'website';
  try {
    hostname = new URL(session.url).hostname;
  } catch {}
  a.href = url;
  a.download = `responsive-test-${hostname}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
