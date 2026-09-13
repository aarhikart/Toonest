import { DateInput } from './types';

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

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Checks if a given year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

/**
 * Returns the number of days in a specific month of a specific year.
 * month is 1-indexed (1 = January, 12 = December).
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 31;
  return new Date(year, month, 0).getDate();
}

/**
 * Validates whether a day, month, and year form a real, valid calendar date.
 */
export function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1000 || year > 9999) return false;
  if (month < 1 || month > 12) return false;
  const maxDays = getDaysInMonth(year, month);
  return day >= 1 && day <= maxDays;
}

/**
 * Converts DateInput to JavaScript Date object at local midnight.
 */
export function dateInputToDate(d: DateInput): Date {
  return new Date(d.year, d.month - 1, d.day, 0, 0, 0, 0);
}

/**
 * Returns today's date in local system time.
 */
export function getTodayDateInput(): DateInput {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

/**
 * Compares two dates: returns negative if a < b, positive if a > b, 0 if equal.
 */
export function compareDates(a: DateInput, b: DateInput): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/**
 * Formats a DateInput as DD/MM/YYYY (standard in India, UK, etc.).
 */
export function formatDateDMY(date: DateInput): string {
  const day = String(date.day).padStart(2, '0');
  const month = String(date.month).padStart(2, '0');
  return `${day}/${month}/${date.year}`;
}

/**
 * Formats a DateInput as "15 August 1995".
 */
export function formatDateLong(date: DateInput): string {
  const monthName = MONTH_NAMES[date.month - 1] || '';
  return `${date.day} ${monthName} ${date.year}`;
}

/**
 * Formats a DateInput into ISO format YYYY-MM-DD.
 */
export function formatISODate(date: DateInput): string {
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');
  return `${date.year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD string into DateInput.
 */
export function parseISODate(iso: string): DateInput | null {
  if (!iso || typeof iso !== 'string') return null;
  const parts = iso.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (!isValidDate(year, month, day)) return null;
  return { year, month, day };
}

/**
 * Returns the weekday name (e.g. "Tuesday") for a given date.
 */
export function getDayOfWeekName(date: DateInput): string {
  const jsDate = dateInputToDate(date);
  return WEEKDAY_NAMES[jsDate.getDay()] || '';
}

/**
 * Formats a number with thousands commas.
 */
export function formatWithCommas(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}
