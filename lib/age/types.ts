export interface DateInput {
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
}

export interface ExactAge {
  years: number;
  months: number;
  days: number;
}

export interface TotalStats {
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface BirthdayInfo {
  nextBirthday: DateInput;
  nextAge: number;
  daysUntil: number;
  previousBirthday: DateInput;
  isBirthdayToday: boolean;
  birthdayWeekday: string;
}

export interface ZodiacInfo {
  sign: string;
  symbol: string;
  element: string;
  dateRange: string;
}

export interface BirthYearInfo {
  isLeapYear: boolean;
  decade: string;
  generation: string;
}

export type Feb29Rule = 'feb28' | 'mar1';

export interface AgeCalculationResult {
  birth: DateInput;
  target: DateInput;
  exactAge: ExactAge;
  totalStats: TotalStats;
  birthday: BirthdayInfo;
  weekday: string;
  zodiac: ZodiacInfo;
  birthYearInfo: BirthYearInfo;
  isCustomDate: boolean;
}

export interface AgeDifferenceResult {
  older: 'person1' | 'person2' | 'same';
  diff: ExactAge;
  totalDays: number;
}

export interface PersonEntry {
  id: string;
  name: string;
  dob: DateInput;
}

export interface AgeHistoryItem {
  id: string;
  timestamp: number;
  dobFormatted: string;
  targetFormatted: string;
  ageFormatted: string;
  dob?: DateInput;
  target?: DateInput;
}

