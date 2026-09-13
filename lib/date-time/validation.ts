import { DateInput, TimeInput, TimeFormat, MidnightMode } from './types';
import { isValidDate, compareDates } from './dateCalculations';
import { timeToMilliseconds } from './timeCalculations';

export function validateDate(date: DateInput): { isValid: boolean; error?: string } {
  if (!date) return { isValid: false, error: 'Please enter a date.' };
  if (isNaN(date.year) || isNaN(date.month) || isNaN(date.day)) {
    return { isValid: false, error: 'Incomplete date values.' };
  }
  if (!isValidDate(date.year, date.month, date.day)) {
    return { isValid: false, error: 'Invalid calendar date (e.g. check days in month or leap year).' };
  }
  return { isValid: true };
}

export function validateTime(
  time: TimeInput,
  format: TimeFormat
): { isValid: boolean; error?: string } {
  if (!time) return { isValid: false, error: 'Please enter a time.' };
  const h = time.hours;
  const m = time.minutes;
  const s = time.seconds;

  if (isNaN(h) || isNaN(m) || isNaN(s)) {
    return { isValid: false, error: 'Incomplete time values.' };
  }

  if (format === '12h') {
    if (h < 1 || h > 12) {
      return { isValid: false, error: 'Hours must be between 1 and 12 in 12-hour format.' };
    }
    if (!time.ampm || (time.ampm !== 'AM' && time.ampm !== 'PM')) {
      return { isValid: false, error: 'Please specify AM or PM.' };
    }
  } else {
    if (h < 0 || h > 23) {
      return { isValid: false, error: 'Hours must be between 0 and 23 in 24-hour format.' };
    }
  }

  if (m < 0 || m > 59) {
    return { isValid: false, error: 'Minutes must be between 0 and 59.' };
  }
  if (s < 0 || s > 59) {
    return { isValid: false, error: 'Seconds must be between 0 and 59.' };
  }

  return { isValid: true };
}

export function validateDateRange(
  start: DateInput,
  end: DateInput
): { isValid: boolean; isReversed: boolean; isSame: boolean; error?: string } {
  const v1 = validateDate(start);
  if (!v1.isValid) return { isValid: false, isReversed: false, isSame: false, error: v1.error };
  const v2 = validateDate(end);
  if (!v2.isValid) return { isValid: false, isReversed: false, isSame: false, error: v2.error };

  const cmp = compareDates(start, end);
  return {
    isValid: true,
    isReversed: cmp > 0,
    isSame: cmp === 0,
  };
}

export function validateTimeRange(
  start: TimeInput,
  end: TimeInput,
  format: TimeFormat,
  midnightMode: MidnightMode
): { isValid: boolean; isMidnightCrossed: boolean; isSame: boolean; error?: string } {
  const v1 = validateTime(start, format);
  if (!v1.isValid) return { isValid: false, isMidnightCrossed: false, isSame: false, error: v1.error };
  const v2 = validateTime(end, format);
  if (!v2.isValid) return { isValid: false, isMidnightCrossed: false, isSame: false, error: v2.error };

  const msStart = timeToMilliseconds(start, format);
  const msEnd = timeToMilliseconds(end, format);

  const isSame = msStart === msEnd;
  const isMidnightCrossed =
    midnightMode === 'next_day' || (midnightMode === 'auto' && msEnd < msStart);

  return {
    isValid: true,
    isMidnightCrossed,
    isSame,
  };
}
