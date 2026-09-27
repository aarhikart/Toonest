import * as XLSX from 'xlsx';
import {
  CallRecord,
  ColumnMapping,
  ParsedFileResult,
} from './types';
import {
  normalizePhoneNumber,
  normalizeCallType,
  parseCallDuration,
  parseCallDateTime,
  formatDuration,
} from './normalizer';

/**
 * Parses raw CSV string respecting quoted fields and auto-detecting delimiters (, ; \t |).
 */
export function parseCsvText(csvText: string): { headers: string[]; rows: any[] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Detect delimiter from first non-empty line
  const firstLine = lines[0];
  const delimiters = [',', '\t', ';', '|'];
  let chosenDelim = ',';
  let maxCount = -1;

  for (const d of delimiters) {
    const count = (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      chosenDelim = d;
    }
  }

  // Helper to split a line considering double quotes
  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === chosenDelim && !inQuotes) {
        values.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    values.push(cur.trim());
    return values;
  };

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map((h, i) => h || `Column_${i + 1}`);

  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const lineValues = parseLine(lines[i]);
    if (lineValues.length === 0 || (lineValues.length === 1 && !lineValues[0])) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = lineValues[colIdx] || '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Parses Excel (.xlsx, .xls) files using SheetJS in browser.
 */
export function parseExcelBuffer(buffer: ArrayBuffer): { headers: string[]; rows: any[] } {
  try {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { headers: [], rows: [] };
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

    if (!rawData || rawData.length === 0) {
      return { headers: [], rows: [] };
    }

    // First row as headers
    const headerRow = rawData[0] || [];
    const headers = headerRow.map((h, i) => (h ? String(h).trim() : `Column_${i + 1}`));

    const rows: any[] = [];
    for (let i = 1; i < rawData.length; i++) {
      const rowArr = rawData[i];
      if (!rowArr || rowArr.length === 0) continue;

      const rowObj: Record<string, any> = {};
      headers.forEach((h, colIdx) => {
        rowObj[h] = rowArr[colIdx] !== undefined ? rowArr[colIdx] : '';
      });
      rows.push(rowObj);
    }

    return { headers, rows };
  } catch (err) {
    console.error('Failed to parse Excel buffer:', err);
    throw new Error('Unable to read this Excel file. Ensure it is a valid .xlsx or .xls spreadsheet.');
  }
}

/**
 * Parses JSON call log exports.
 * Accepts array of objects or wrapped object { calls: [...] } or { records: [...] }.
 */
export function parseJsonText(jsonText: string): { headers: string[]; rows: any[] } {
  const parsed = JSON.parse(jsonText);
  let arrayData: any[] = [];

  if (Array.isArray(parsed)) {
    arrayData = parsed;
  } else if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.calls)) arrayData = parsed.calls;
    else if (Array.isArray(parsed.records)) arrayData = parsed.records;
    else if (Array.isArray(parsed.data)) arrayData = parsed.data;
    else if (Array.isArray(parsed.history)) arrayData = parsed.history;
    else {
      // Find first property that is an array
      for (const key of Object.keys(parsed)) {
        if (Array.isArray(parsed[key])) {
          arrayData = parsed[key];
          break;
        }
      }
    }
  }

  if (arrayData.length === 0) {
    return { headers: [], rows: [] };
  }

  // Derive unique headers from objects
  const headerSet = new Set<string>();
  arrayData.forEach((item) => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach((k) => headerSet.add(k));
    }
  });

  const headers = Array.from(headerSet);
  return { headers, rows: arrayData };
}

/**
 * Parses pasted multi-line call records with or without header.
 * Example:
 *   26/09/2026 10:32, +91XXXXXXXXXX, Incoming, 02:31
 *   26/09/2026 11:15, +91XXXXXXXXXX, Rahul, Outgoing, 05:42
 */
export function parsePastedText(text: string): { headers: string[]; rows: any[] } {
  const trimmed = text.trim();
  if (!trimmed) return { headers: [], rows: [] };

  // If looks like JSON
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      return parseJsonText(trimmed);
    } catch {
      // Fallback to CSV
    }
  }

  return parseCsvText(trimmed);
}

/**
 * Automatically maps column headers by scoring matching keywords against header names.
 */
export function autoDetectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    phoneNumber: '',
    contactName: '',
    date: '',
    time: '',
    dateTime: '',
    type: '',
    duration: '',
  };

  const cleanHeaders = headers.map((h) => ({
    original: h,
    normalized: h.toLowerCase().replace(/[^a-z0-9]/g, ''),
  }));

  const findBest = (patterns: string[]): string => {
    for (const pat of patterns) {
      const match = cleanHeaders.find((h) => h.normalized === pat || h.normalized.includes(pat));
      if (match) return match.original;
    }
    return '';
  };

  // Phone number aliases
  mapping.phoneNumber = findBest([
    'phonenumber',
    'phone',
    'number',
    'mobile',
    'mobilenumber',
    'caller',
    'dialednumber',
    'destination',
    'recipient',
    'msisdn',
  ]);

  // Contact name aliases
  mapping.contactName = findBest([
    'contactname',
    'name',
    'contact',
    'callername',
    'displayname',
    'person',
  ]);

  // Call type aliases
  mapping.type = findBest([
    'calltype',
    'type',
    'direction',
    'callstatus',
    'status',
    'action',
  ]);

  // Duration aliases
  mapping.duration = findBest([
    'durationseconds',
    'durationsec',
    'callduration',
    'duration',
    'length',
    'durationmin',
    'time',
  ]);

  // Combined datetime or separate date & time
  const dateTimeCandidate = findBest([
    'datetime',
    'calltime',
    'timestamp',
    'calldatetime',
    'starttime',
    'createdat',
  ]);

  const dateCandidate = findBest(['calldate', 'date', 'day']);
  const timeCandidate = findBest(['time', 'timeofcall', 'hour']);

  if (dateTimeCandidate && (!dateCandidate || dateTimeCandidate === dateCandidate)) {
    mapping.dateTime = dateTimeCandidate;
  } else {
    mapping.date = dateCandidate || dateTimeCandidate;
    mapping.time = timeCandidate;
  }

  return mapping;
}

/**
 * Applies selected or auto-detected column mappings to generate standardized CallRecord items.
 */
export function applyColumnMapping(rows: any[], mapping: ColumnMapping): CallRecord[] {
  const records: CallRecord[] = [];

  rows.forEach((row, idx) => {
    // 1. Phone number
    const rawPhone = row[mapping.phoneNumber];
    const phone = rawPhone !== undefined ? String(rawPhone).trim() : '';
    if (!phone) return; // Skip empty rows

    // 2. Contact Name
    const contact = mapping.contactName && row[mapping.contactName]
      ? String(row[mapping.contactName]).trim()
      : undefined;

    // 3. Call Type
    const rawType = mapping.type ? row[mapping.type] : 'Unknown';
    const type = normalizeCallType(rawType);

    // 4. Duration
    const rawDuration = mapping.duration ? row[mapping.duration] : 0;
    const durationSeconds = parseCallDuration(rawDuration);

    // 5. Date & Time
    let dateVal: any = '';
    let timeVal: any = '';

    if (mapping.dateTime && row[mapping.dateTime]) {
      dateVal = row[mapping.dateTime];
    } else {
      dateVal = mapping.date ? row[mapping.date] : '';
      timeVal = mapping.time ? row[mapping.time] : '';
    }

    const { date, time, timestamp } = parseCallDateTime(dateVal, timeVal);

    records.push({
      id: `call_${idx + 1}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      phoneNumber: phone,
      normalizedNumber: normalizePhoneNumber(phone),
      contactName: contact,
      date,
      time,
      timestamp,
      type,
      durationSeconds,
      durationFormatted: formatDuration(durationSeconds, 'clock'),
      rawRow: row,
    });
  });

  // Sort descending by timestamp by default (newest calls first)
  records.sort((a, b) => b.timestamp - a.timestamp);

  return records;
}
