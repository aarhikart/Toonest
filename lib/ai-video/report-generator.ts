import { VideoAnalysisResult } from './types';

/**
 * Generates a clean human-readable text report from the video analysis result.
 */
export function generateTextReport(result: VideoAnalysisResult): string {
  const dateStr = new Date(result.analyzedAt).toUTCString();
  const verdictFormatted =
    result.verdict === 'likely_ai'
      ? 'LIKELY AI-GENERATED'
      : result.verdict === 'likely_real'
      ? 'LIKELY AUTHENTIC'
      : result.verdict === 'possibly_manipulated'
      ? 'POSSIBLY MANIPULATED'
      : 'INCONCLUSIVE';

  const lines: string[] = [
    '============================================================',
    '             AI VIDEO DETECTION ANALYSIS REPORT             ',
    '============================================================',
    '',
    `Analysis Date: ${dateStr}`,
    `Detection Engine: ${result.engineName || 'Standard Neural Pipeline'}`,
    `Engine Status: ${result.isEngineConfigured ? 'Active Provider' : 'Unconfigured Local Mode'}`,
    '',
    '------------------------------------------------------------',
    '1. PRIMARY ASSESSMENT',
    '------------------------------------------------------------',
    `Verdict: ${verdictFormatted}`,
    `Confidence Score: ${result.confidence}%`,
    '',
    '------------------------------------------------------------',
    '2. VIDEO SPECIFICATIONS',
    '------------------------------------------------------------',
    `File / Source: ${result.video.filename || 'Direct Media'}`,
    `Format: ${result.video.format || 'Unknown'}`,
    `Resolution: ${result.video.width} x ${result.video.height}`,
    `Duration: ${result.video.duration ? `${result.video.duration}s` : 'Unknown'}`,
    `Audio Track: ${result.video.hasAudio ? 'Detected' : 'No Audio'}`,
    result.video.fps ? `Frame Rate: ${result.video.fps} FPS` : '',
    '',
  ];

  if (result.scores) {
    lines.push(
      '------------------------------------------------------------',
      '3. SIGNAL BREAKDOWN',
      '------------------------------------------------------------',
      `Visual Analysis:   ${result.scores.visual ?? 'N/A'}%`,
      `Temporal Analysis: ${result.scores.temporal ?? 'N/A'}%`,
      `Audio Analysis:    ${result.scores.audio ?? 'N/A'}%`,
      `Metadata Signals:  ${result.scores.metadata ?? 'N/A'}%`,
      ''
    );
  }

  if (result.signals && result.signals.length > 0) {
    lines.push(
      '------------------------------------------------------------',
      '4. IDENTIFIED SIGNALS & ARTIFACTS',
      '------------------------------------------------------------'
    );
    result.signals.forEach((sig, idx) => {
      const ts =
        typeof sig.timestamp === 'number'
          ? `[${Math.floor(sig.timestamp / 60)}:${String(sig.timestamp % 60).padStart(2, '0')}] `
          : '';
      lines.push(`${idx + 1}. ${ts}(${sig.type.toUpperCase()} - ${sig.severity.toUpperCase()}): ${sig.description}`);
    });
    lines.push('');
  }

  lines.push(
    '------------------------------------------------------------',
    '5. LIMITATIONS & RESPONSIBLE USE',
    '------------------------------------------------------------',
    ...result.limitations.map((l) => `- ${l}`),
    '',
    'IMPORTANT DISCLAIMER:',
    result.disclaimer,
    'This report represents an automated probabilistic assessment and is not',
    'definitive proof of authenticity. It must not be used as the sole basis for',
    'accusations, legal decisions, or employment determinations.',
    '============================================================'
  );

  return lines.filter((l) => l !== '').join('\n');
}

/**
 * Generates structured JSON report.
 */
export function generateJsonReport(result: VideoAnalysisResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Client-side download trigger for exported analysis report.
 */
export function downloadReport(
  result: VideoAnalysisResult,
  format: 'txt' | 'json' = 'txt'
): void {
  const content =
    format === 'json' ? generateJsonReport(result) : generateTextReport(result);
  const mimeType = format === 'json' ? 'application/json' : 'text/plain;charset=utf-8';
  const filename = `ai-video-detection-report-${Date.now()}.${format}`;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
