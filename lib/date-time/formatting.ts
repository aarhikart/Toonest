import { DateInput, TimeInput, TimeFormat, PrecisionMode } from './types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatDateDMY(date: DateInput): string {
  const d = String(date.day).padStart(2, '0');
  const m = String(date.month).padStart(2, '0');
  const y = String(date.year);
  return `${d}/${m}/${y}`;
}

export function formatDateLong(date: DateInput): string {
  const monthName = MONTH_NAMES[date.month - 1] || 'Month';
  return `${date.day} ${monthName} ${date.year}`;
}

export function formatISODate(date: DateInput): string {
  const y = String(date.year).padStart(4, '0');
  const m = String(date.month).padStart(2, '0');
  const d = String(date.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(str: string): DateInput | null {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

export function formatTime(
  time: TimeInput,
  format: TimeFormat = '24h',
  includeSeconds: boolean = true,
  includeMs: boolean = false
): string {
  const m = String(time.minutes).padStart(2, '0');
  const s = String(time.seconds).padStart(2, '0');
  const ms = time.milliseconds !== undefined ? String(time.milliseconds).padStart(3, '0') : '000';

  if (format === '12h') {
    const h = String(time.hours).padStart(2, '0');
    const ampm = time.ampm || (time.hours >= 12 ? 'PM' : 'AM');
    let out = `${h}:${m}`;
    if (includeSeconds) out += `:${s}`;
    if (includeMs) out += `.${ms}`;
    return `${out} ${ampm}`;
  }

  const h = String(time.hours).padStart(2, '0');
  let out = `${h}:${m}`;
  if (includeSeconds) out += `:${s}`;
  if (includeMs) out += `.${ms}`;
  return out;
}

export function parseISOTime(str: string): TimeInput | null {
  if (!str) return null;
  // supports 'HH:MM', 'HH:MM:SS', 'HH:MM:SS.mmm'
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?$/;
  const match = str.trim().match(timeRegex);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  const milliseconds = match[4] ? parseInt(match[4].padEnd(3, '0'), 10) : 0;

  return {
    hours,
    minutes,
    seconds,
    milliseconds,
  };
}

export function formatWithCommas(val: number): string {
  if (isNaN(val)) return '0';
  return val.toLocaleString('en-US');
}

export function formatDecimalWithPrecision(
  num: number,
  precision: PrecisionMode
): string {
  if (isNaN(num)) return '0';
  if (precision === 'auto') {
    // Up to 4 decimals, removing trailing zeros
    const rounded = Math.round(num * 10000) / 10000;
    return rounded.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }

  const digits = parseInt(precision, 10);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
