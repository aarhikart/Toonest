import {
  DateInput,
  CalendarDifference,
  TotalDateUnits,
  BusinessDaysResult,
  DateDiffResult,
  WeekendRule,
  AddSubtractDateParams,
  AddSubtractDateResult,
} from './types';

export function isLeapYear(year: number): boolean {
  if (year % 4 !== 0) return false;
  if (year % 100 !== 0) return true;
  return year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  switch (month) {
    case 1: // Jan
    case 3: // Mar
    case 5: // May
    case 7: // Jul
    case 8: // Aug
    case 10: // Oct
    case 12: // Dec
      return 31;
    case 4: // Apr
    case 6: // Jun
    case 9: // Sep
    case 11: // Nov
      return 30;
    case 2: // Feb
      return isLeapYear(year) ? 29 : 28;
    default:
      return 31;
  }
}

export function isValidDate(year: number, month: number, day: number): boolean {
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 1 || year > 9999) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  const maxDays = getDaysInMonth(year, month);
  return day <= maxDays;
}

export function compareDates(a: DateInput, b: DateInput): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

export function getTodayDateInput(): DateInput {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

export function getDayOfWeek(date: DateInput): number {
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day));
  return d.getUTCDay();
}

export function getDayOfWeekName(date: DateInput): string {
  const names = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return names[getDayOfWeek(date)];
}

export function calculateCalendarDifference(
  start: DateInput,
  end: DateInput
): CalendarDifference {
  let years = end.year - start.year;
  let months = end.month - start.month;
  let days = end.day - start.day;

  if (days < 0) {
    months -= 1;
    let prevMonth = end.month - 1;
    let prevYear = end.year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    if (start.day > daysInPrevMonth) {
      days = end.day;
    } else {
      days += daysInPrevMonth;
    }
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
  };
}

export function calculateTotalDays(
  start: DateInput,
  end: DateInput,
  isInclusive: boolean = false
): number {
  const ms1 = Date.UTC(start.year, start.month - 1, start.day);
  const ms2 = Date.UTC(end.year, end.month - 1, end.day);
  const diffDays = Math.round(Math.abs(ms2 - ms1) / 86400000);
  return isInclusive ? diffDays + 1 : diffDays;
}

export function calculateTotalUnits(totalDays: number): TotalDateUnits {
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  const hours = totalDays * 24;
  const minutes = hours * 60;
  const seconds = minutes * 60;
  // Approximate months (average 30.4375 days per month)
  const approxMonths =
    totalDays === 0 ? 0 : Math.round((totalDays / 30.4375) * 10) / 10;

  return {
    days: totalDays,
    weeks,
    remainingDays,
    hours,
    minutes,
    seconds,
    approxMonths,
  };
}

function isWeekend(dayOfWeek: number, rule: WeekendRule): boolean {
  switch (rule) {
    case 'fri_sat':
      return dayOfWeek === 5 || dayOfWeek === 6;
    case 'sun_only':
      return dayOfWeek === 0;
    case 'sat_sun':
    default:
      return dayOfWeek === 0 || dayOfWeek === 6;
  }
}

export function calculateBusinessAndWeekendDays(
  start: DateInput,
  end: DateInput,
  isInclusive: boolean,
  weekendRule: WeekendRule = 'sat_sun',
  holidays: string[] = []
): BusinessDaysResult {
  const isReversed = compareDates(start, end) > 0;
  const startDate = isReversed ? end : start;
  const endDate = isReversed ? start : end;

  const totalDays = calculateTotalDays(startDate, endDate, isInclusive);

  if (totalDays === 0) {
    return {
      totalDays: 0,
      businessDays: 0,
      weekendDays: 0,
      holidayDays: 0,
    };
  }

  const holidaySet = new Set(holidays);

  let businessDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;

  // We iterate through each 24-hour day in the span
  const current = new Date(
    Date.UTC(startDate.year, startDate.month - 1, startDate.day)
  );

  for (let i = 0; i < totalDays; i++) {
    const y = current.getUTCFullYear();
    const m = current.getUTCMonth() + 1;
    const d = current.getUTCDate();
    const isoString = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = current.getUTCDay();

    const weekend = isWeekend(dow, weekendRule);
    const isHoliday = holidaySet.has(isoString);

    if (isHoliday && !weekend) {
      holidayDays++;
    } else if (weekend) {
      weekendDays++;
    } else {
      businessDays++;
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return {
    totalDays,
    businessDays,
    weekendDays,
    holidayDays,
  };
}

export function calculateFullDateDiff(
  start: DateInput,
  end: DateInput,
  isInclusive: boolean = false,
  weekendRule: WeekendRule = 'sat_sun',
  holidays: string[] = []
): DateDiffResult {
  const isReversed = compareDates(start, end) > 0;
  const d1 = isReversed ? end : start;
  const d2 = isReversed ? start : end;

  // In inclusive mode, calendar difference represents the span covering both dates (inclusive = +1 day on the end date)
  let effectiveEnd = d2;
  if (isInclusive) {
    const endPlusOne = addToDate(d2, { days: 1 });
    effectiveEnd = endPlusOne.date;
  }

  const calendarDiff = calculateCalendarDifference(d1, effectiveEnd);
  const totalDays = calculateTotalDays(d1, d2, isInclusive);
  const totalUnits = calculateTotalUnits(totalDays);
  const businessDays = calculateBusinessAndWeekendDays(
    d1,
    d2,
    isInclusive,
    weekendRule,
    holidays
  );

  return {
    start,
    end,
    calendarDiff,
    totalUnits,
    businessDays,
    isInclusive,
    isReversed,
  };
}

export function addToDate(
  start: DateInput,
  params: AddSubtractDateParams
): AddSubtractDateResult {
  const yearsToAdd = params.years || 0;
  const monthsToAdd = params.months || 0;
  const weeksToAdd = params.weeks || 0;
  const daysToAdd = params.days || 0;
  const hoursToAdd = params.hours || 0;
  const minutesToAdd = params.minutes || 0;
  const secondsToAdd = params.seconds || 0;

  // 1. Add years and months
  let newYear = start.year + yearsToAdd;
  let newMonth = start.month + monthsToAdd;

  while (newMonth > 12) {
    newMonth -= 12;
    newYear += 1;
  }
  while (newMonth < 1) {
    newMonth += 12;
    newYear -= 1;
  }

  // Clamp day to max days in new month
  const maxDays = getDaysInMonth(newYear, newMonth);
  const clampedDay = Math.min(start.day, maxDays);

  // 2. Add weeks, days, hours, minutes, seconds via UTC timestamp
  const dateObj = new Date(
    Date.UTC(
      newYear,
      newMonth - 1,
      clampedDay,
      hoursToAdd,
      minutesToAdd,
      secondsToAdd
    )
  );

  const totalExtraDays = weeksToAdd * 7 + daysToAdd;
  dateObj.setUTCDate(dateObj.getUTCDate() + totalExtraDays);

  const finalDate: DateInput = {
    year: dateObj.getUTCFullYear(),
    month: dateObj.getUTCMonth() + 1,
    day: dateObj.getUTCDate(),
  };

  const hasTime = hoursToAdd !== 0 || minutesToAdd !== 0 || secondsToAdd !== 0;

  return {
    date: finalDate,
    time: hasTime
      ? {
          hours: dateObj.getUTCHours(),
          minutes: dateObj.getUTCMinutes(),
          seconds: dateObj.getUTCSeconds(),
        }
      : undefined,
    weekday: getDayOfWeekName(finalDate),
  };
}

export function subtractFromDate(
  start: DateInput,
  params: AddSubtractDateParams
): AddSubtractDateResult {
  return addToDate(start, {
    years: -(params.years || 0),
    months: -(params.months || 0),
    weeks: -(params.weeks || 0),
    days: -(params.days || 0),
    hours: -(params.hours || 0),
    minutes: -(params.minutes || 0),
    seconds: -(params.seconds || 0),
  });
}
