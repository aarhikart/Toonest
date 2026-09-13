export interface DateInput {
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
}

export interface TimeInput {
  hours: number; // 0 - 23 (24h) or 1 - 12 (12h)
  minutes: number; // 0 - 59
  seconds: number; // 0 - 59
  milliseconds?: number; // 0 - 999
  ampm?: 'AM' | 'PM';
}

export interface DateTimeInput {
  date: DateInput;
  time: TimeInput;
}

export type TimeFormat = '12h' | '24h';
export type MidnightMode = 'same_day' | 'next_day' | 'auto';
export type CountingMode = 'exclusive' | 'inclusive';
export type WeekendRule = 'sat_sun' | 'fri_sat' | 'sun_only';
export type PrecisionMode = 'auto' | '0' | '1' | '2' | '3' | '4';

export interface CalendarDifference {
  years: number;
  months: number;
  days: number;
}

export interface TotalDateUnits {
  days: number;
  weeks: number;
  remainingDays: number;
  hours: number;
  minutes: number;
  seconds: number;
  approxMonths: number;
}

export interface BusinessDaysResult {
  totalDays: number;
  businessDays: number;
  weekendDays: number;
  holidayDays: number;
}

export interface DateDiffResult {
  start: DateInput;
  end: DateInput;
  calendarDiff: CalendarDifference;
  totalUnits: TotalDateUnits;
  businessDays: BusinessDaysResult;
  isInclusive: boolean;
  isReversed: boolean;
}

export interface TimeDiffResult {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  totalMilliseconds: number;
  crossedMidnight: boolean;
  days: number;
}

export interface DateTimeDiffResult {
  start: DateTimeInput;
  end: DateTimeInput;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  isReversed: boolean;
}

export interface AddSubtractDateParams {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface AddSubtractDateResult {
  date: DateInput;
  time?: TimeInput;
  weekday: string;
}

export interface AddSubtractTimeResult {
  time: TimeInput;
  dayRollover: number; // 0: same day, 1: next day, -1: previous day
}

export interface TimezoneInfo {
  name: string;
  label: string;
  city: string;
  offsetString: string;
}

export interface TimezoneDiffResult {
  tz1: string;
  tz2: string;
  time1: string;
  time2: string;
  hoursDiff: number;
  minutesDiff: number;
  direction: 'ahead' | 'behind' | 'same';
  description: string;
}

export interface DateTimeHistoryItem {
  id: string;
  timestamp: number;
  type: 'date' | 'time' | 'datetime';
  title: string;
  startFormatted: string;
  endFormatted: string;
  resultFormatted: string;
  details?: Record<string, string | number>;
}
