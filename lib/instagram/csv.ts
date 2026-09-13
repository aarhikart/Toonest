import { Campaign } from './types';
import { cleanUsername } from './username';

/**
 * Parses user input from a CSV file content.
 * Automatically identifies headers such as 'username', 'user', 'handle', 'instagram', 'profile'.
 */
export function parseCSVUsers(csvContent: string): { usernames: string[]; error?: string } {
  if (!csvContent || csvContent.trim().length === 0) {
    return { usernames: [], error: 'CSV file is empty' };
  }

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { usernames: [], error: 'No readable data rows found in CSV' };
  }

  // Parse header line if present
  const firstLineTokens = splitCSVRow(lines[0]);
  let targetColIndex = 0;
  let startIndex = 0;

  const headerCandidates = ['username', 'user', 'handle', 'instagram', 'insta', 'profile', 'id', 'account'];
  const foundCol = firstLineTokens.findIndex((token) =>
    headerCandidates.includes(token.toLowerCase().replace(/[^a-z]/g, ''))
  );

  if (foundCol !== -1) {
    targetColIndex = foundCol;
    startIndex = 1; // skip header row
  } else {
    // If first row looks like an actual username, treat line 0 as data
    targetColIndex = 0;
    startIndex = 0;
  }

  const extracted: string[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const rowTokens = splitCSVRow(lines[i]);
    if (rowTokens.length > targetColIndex) {
      const rawVal = rowTokens[targetColIndex];
      const cleaned = cleanUsername(rawVal);
      if (cleaned) {
        extracted.push(cleaned);
      }
    }
  }

  return { usernames: extracted };
}

/**
 * Splits a CSV row respecting double quotes and commas.
 */
function splitCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Exports campaign data to a downloadable CSV file.
 */
export function exportCampaignCSV(campaign: Campaign): void {
  const headers = ['#', 'Username', 'Status', 'Profile URL', 'Sent Date', 'Message Content', 'Notes / Errors'];

  const rows = campaign.users.map((user, idx) => {
    const sentDateStr = user.sentAt ? new Date(user.sentAt).toLocaleString() : '';
    const messageContent = user.status === 'sent' ? campaign.activeMessage : '';
    const notes = user.errorReason || user.notes || '';

    return [
      idx + 1,
      `"${user.username}"`,
      `"${user.status}"`,
      `"${user.profileUrl}"`,
      `"${sentDateStr}"`,
      `"${messageContent.replace(/"/g, '""')}"`,
      `"${notes.replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvString = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeCampaignName = campaign.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'campaign';
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `instagram_dm_${safeCampaignName}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
