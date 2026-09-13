import { CaseMode } from './types';

/**
 * Generates and downloads a .txt file locally in the user's browser.
 * Zero server interaction.
 */
export function downloadTextFile(text: string, mode: CaseMode): void {
  if (!text) return;

  const prefix =
    mode === 'uppercase'
      ? 'uppercase-text'
      : mode === 'lowercase'
      ? 'lowercase-text'
      : 'title-case-text';

  const filename = `${prefix}.txt`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
