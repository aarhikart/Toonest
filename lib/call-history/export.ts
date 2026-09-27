import * as XLSX from 'xlsx';
import { CallRecord } from './types';

/**
 * Downloads call records as a clean CSV file in browser.
 */
export function exportToCsv(records: CallRecord[], fileName: string = 'call_history_export.csv'): void {
  if (!records || records.length === 0) return;

  const headers = ['Date', 'Time', 'Phone Number', 'Contact Name', 'Call Type', 'Duration (Seconds)', 'Duration (Formatted)'];
  const rows = records.map((r) => [
    `"${r.date}"`,
    `"${r.time}"`,
    `"${r.phoneNumber}"`,
    `"${(r.contactName || '').replace(/"/g, '""')}"`,
    `"${r.type}"`,
    r.durationSeconds,
    `"${r.durationFormatted}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, fileName);
}

/**
 * Downloads call records as formatted JSON file in browser.
 */
export function exportToJson(records: CallRecord[], fileName: string = 'call_history_export.json'): void {
  if (!records || records.length === 0) return;

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    totalRecords: records.length,
    records: records.map((r) => ({
      id: r.id,
      date: r.date,
      time: r.time,
      timestamp: r.timestamp,
      phoneNumber: r.phoneNumber,
      normalizedNumber: r.normalizedNumber,
      contactName: r.contactName || null,
      type: r.type,
      durationSeconds: r.durationSeconds,
      durationFormatted: r.durationFormatted,
    })),
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  triggerDownload(blob, fileName);
}

/**
 * Downloads call records as an Excel (.xlsx) file in browser.
 */
export function exportToExcel(records: CallRecord[], fileName: string = 'call_history_export.xlsx'): void {
  if (!records || records.length === 0) return;

  const data = records.map((r) => ({
    Date: r.date,
    Time: r.time,
    'Phone Number': r.phoneNumber,
    'Contact Name': r.contactName || '',
    'Call Type': r.type,
    'Duration (Seconds)': r.durationSeconds,
    'Duration': r.durationFormatted,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Call History');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, fileName);
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
