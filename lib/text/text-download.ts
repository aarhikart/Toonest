/**
 * Triggers a direct client-side download of a .txt file.
 */
export function downloadTextAsFile(
  text: string,
  filename = 'word-counter-text.txt'
): void {
  if (!text) return;

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
