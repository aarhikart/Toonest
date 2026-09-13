import {
  DateInput,
  ExactAge,
  TotalStats,
  BirthdayInfo,
  ZodiacInfo,
  BirthYearInfo,
  Feb29Rule,
  AgeCalculationResult,
  AgeDifferenceResult,
} from './types';
import {
  isLeapYear,
  getDaysInMonth,
  dateInputToDate,
  compareDates,
  getDayOfWeekName,
} from './dates';

/**
 * Calculates exact calendar-based age (Years, Months, Days).
 */
export function calculateExactAge(
  birth: DateInput,
  target: DateInput
): ExactAge {
  let years = target.year - birth.year;
  let months = target.month - birth.month;
  let days = target.day - birth.day;

  if (days < 0) {
    const prevMonth = target.month === 1 ? 12 : target.month - 1;
    const prevYear = target.month === 1 ? target.year - 1 : target.year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    if (birth.day > daysInPrevMonth) {
      // Month cap rule (e.g. Jan 31 -> Mar 1)
      days = target.day;
    } else {
      days += daysInPrevMonth;
    }
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
  };
}

/**
 * Calculates total elapsed time in various units.
 */
export function calculateTotalUnits(
  birth: DateInput,
  target: DateInput
): TotalStats {
  const bDate = dateInputToDate(birth);
  const tDate = dateInputToDate(target);
  const diffMs = Math.max(0, tDate.getTime() - bDate.getTime());

  const totalDays = Math.round(diffMs / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const exact = calculateExactAge(birth, target);
  const totalMonths = exact.years * 12 + exact.months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalSeconds = totalMinutes * 60;

  return {
    months: totalMonths,
    weeks: totalWeeks,
    days: totalDays,
    hours: totalHours,
    minutes: totalMinutes,
    seconds: totalSeconds,
  };
}

/**
 * Resolves birthday date for a specific year, respecting February 29 leap day rules.
 */
export function getBirthdayForYear(
  birth: DateInput,
  year: number,
  feb29Rule: Feb29Rule = 'feb28'
): DateInput {
  if (birth.month === 2 && birth.day === 29) {
    if (isLeapYear(year)) {
      return { year, month: 2, day: 29 };
    }
    return feb29Rule === 'mar1'
      ? { year, month: 3, day: 1 }
      : { year, month: 2, day: 28 };
  }
  return { year, month: birth.month, day: birth.day };
}

/**
 * Calculates next and previous birthdays, remaining days, and birthday today status.
 */
export function calculateBirthdayInfo(
  birth: DateInput,
  target: DateInput,
  feb29Rule: Feb29Rule = 'feb28'
): BirthdayInfo {
  const thisYearBday = getBirthdayForYear(birth, target.year, feb29Rule);
  const cmp = compareDates(target, thisYearBday);

  let nextBirthday: DateInput;
  let previousBirthday: DateInput;
  let isBirthdayToday = false;

  if (cmp === 0) {
    // Today is their birthday!
    isBirthdayToday = true;
    previousBirthday = thisYearBday;
    nextBirthday = getBirthdayForYear(birth, target.year + 1, feb29Rule);
  } else if (cmp < 0) {
    // Birthday is still to come this year
    nextBirthday = thisYearBday;
    previousBirthday = getBirthdayForYear(birth, target.year - 1, feb29Rule);
  } else {
    // Birthday already passed this year
    previousBirthday = thisYearBday;
    nextBirthday = getBirthdayForYear(birth, target.year + 1, feb29Rule);
  }

  const targetDate = dateInputToDate(target);
  const nextBDate = dateInputToDate(nextBirthday);
  const daysUntil = isBirthdayToday
    ? 0
    : Math.max(0, Math.round((nextBDate.getTime() - targetDate.getTime()) / 86400000));

  const nextAge = nextBirthday.year - birth.year;
  const birthdayWeekday = getDayOfWeekName(nextBirthday);

  return {
    nextBirthday,
    nextAge,
    daysUntil,
    previousBirthday,
    isBirthdayToday,
    birthdayWeekday,
  };
}

/**
 * Returns Western Zodiac sign details based on month and day.
 */
export function getZodiacSign(month: number, day: number): ZodiacInfo {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { sign: 'Aries', symbol: '♈', element: 'Fire', dateRange: 'Mar 21 - Apr 19' };
  }
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { sign: 'Taurus', symbol: '♉', element: 'Earth', dateRange: 'Apr 20 - May 20' };
  }
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { sign: 'Gemini', symbol: '♊', element: 'Air', dateRange: 'May 21 - Jun 20' };
  }
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { sign: 'Cancer', symbol: '♋', element: 'Water', dateRange: 'Jun 21 - Jul 22' };
  }
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { sign: 'Leo', symbol: '♌', element: 'Fire', dateRange: 'Jul 23 - Aug 22' };
  }
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { sign: 'Virgo', symbol: '♍', element: 'Earth', dateRange: 'Aug 23 - Sep 22' };
  }
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { sign: 'Libra', symbol: '♎', element: 'Air', dateRange: 'Sep 23 - Oct 22' };
  }
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { sign: 'Scorpio', symbol: '♏', element: 'Water', dateRange: 'Oct 23 - Nov 21' };
  }
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { sign: 'Sagittarius', symbol: '♐', element: 'Fire', dateRange: 'Nov 22 - Dec 21' };
  }
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { sign: 'Capricorn', symbol: '♑', element: 'Earth', dateRange: 'Dec 22 - Jan 19' };
  }
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { sign: 'Aquarius', symbol: '♒', element: 'Air', dateRange: 'Jan 20 - Feb 18' };
  }
  return { sign: 'Pisces', symbol: '♓', element: 'Water', dateRange: 'Feb 19 - Mar 20' };
}

/**
 * Returns birth year demographic and leap year info.
 */
export function getBirthYearInfo(year: number): BirthYearInfo {
  const leap = isLeapYear(year);
  const decade = `${Math.floor(year / 10) * 10}s`;

  let generation = 'Custom Generation';
  if (year >= 2013 && year <= 2025) generation = 'Generation Alpha';
  else if (year >= 1997 && year <= 2012) generation = 'Generation Z';
  else if (year >= 1981 && year <= 1996) generation = 'Millennials (Gen Y)';
  else if (year >= 1965 && year <= 1980) generation = 'Generation X';
  else if (year >= 1946 && year <= 1964) generation = 'Baby Boomers';
  else if (year >= 1928 && year <= 1945) generation = 'Silent Generation';
  else if (year < 1928) generation = 'Greatest Generation';

  return {
    isLeapYear: leap,
    decade,
    generation,
  };
}

/**
 * Calculates age difference between two people.
 */
export function calculateAgeDifference(
  p1: DateInput,
  p2: DateInput
): AgeDifferenceResult {
  const cmp = compareDates(p1, p2);

  if (cmp === 0) {
    return {
      older: 'same',
      diff: { years: 0, months: 0, days: 0 },
      totalDays: 0,
    };
  }

  const p1Date = dateInputToDate(p1);
  const p2Date = dateInputToDate(p2);
  const totalDays = Math.round(Math.abs(p1Date.getTime() - p2Date.getTime()) / 86400000);

  if (cmp < 0) {
    // p1 born earlier -> p1 is older
    const diff = calculateExactAge(p1, p2);
    return { older: 'person1', diff, totalDays };
  } else {
    // p2 born earlier -> p2 is older
    const diff = calculateExactAge(p2, p1);
    return { older: 'person2', diff, totalDays };
  }
}

/**
 * Full combined age calculation for display.
 */
export function calculateFullAge(
  birth: DateInput,
  target: DateInput,
  feb29Rule: Feb29Rule = 'feb28',
  isCustomDate = false
): AgeCalculationResult {
  const exactAge = calculateExactAge(birth, target);
  const totalStats = calculateTotalUnits(birth, target);
  const birthday = calculateBirthdayInfo(birth, target, feb29Rule);
  const weekday = getDayOfWeekName(birth);
  const zodiac = getZodiacSign(birth.month, birth.day);
  const birthYearInfo = getBirthYearInfo(birth.year);

  return {
    birth,
    target,
    exactAge,
    totalStats,
    birthday,
    weekday,
    zodiac,
    birthYearInfo,
    isCustomDate,
  };
}
