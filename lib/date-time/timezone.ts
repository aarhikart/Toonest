import { TimezoneInfo, TimezoneDiffResult } from './types';

export const COMMON_TIMEZONES: TimezoneInfo[] = [
  {
    name: 'UTC',
    label: 'UTC (Coordinated Universal Time)',
    city: 'Universal',
    offsetString: 'UTC+0:00',
  },
  {
    name: 'America/New_York',
    label: 'New York (EDT/EST, UTC-4/-5)',
    city: 'New York',
    offsetString: 'UTC-5:00',
  },
  {
    name: 'America/Chicago',
    label: 'Chicago (CDT/CST, UTC-5/-6)',
    city: 'Chicago',
    offsetString: 'UTC-6:00',
  },
  {
    name: 'America/Denver',
    label: 'Denver (MDT/MST, UTC-6/-7)',
    city: 'Denver',
    offsetString: 'UTC-7:00',
  },
  {
    name: 'America/Los_Angeles',
    label: 'Los Angeles (PDT/PST, UTC-7/-8)',
    city: 'Los Angeles',
    offsetString: 'UTC-8:00',
  },
  {
    name: 'Europe/London',
    label: 'London (GMT/BST, UTC+0/+1)',
    city: 'London',
    offsetString: 'UTC+0:00',
  },
  {
    name: 'Europe/Paris',
    label: 'Paris (CET/CEST, UTC+1/+2)',
    city: 'Paris',
    offsetString: 'UTC+1:00',
  },
  {
    name: 'Europe/Berlin',
    label: 'Berlin (CET/CEST, UTC+1/+2)',
    city: 'Berlin',
    offsetString: 'UTC+1:00',
  },
  {
    name: 'Asia/Dubai',
    label: 'Dubai (GST, UTC+4)',
    city: 'Dubai',
    offsetString: 'UTC+4:00',
  },
  {
    name: 'Asia/Kolkata',
    label: 'India / Mumbai (IST, UTC+5:30)',
    city: 'Mumbai',
    offsetString: 'UTC+5:30',
  },
  {
    name: 'Asia/Singapore',
    label: 'Singapore (SGT, UTC+8)',
    city: 'Singapore',
    offsetString: 'UTC+8:00',
  },
  {
    name: 'Asia/Tokyo',
    label: 'Tokyo (JST, UTC+9)',
    city: 'Tokyo',
    offsetString: 'UTC+9:00',
  },
  {
    name: 'Australia/Sydney',
    label: 'Sydney (AEST/AEDT, UTC+10/+11)',
    city: 'Sydney',
    offsetString: 'UTC+10:00',
  },
  {
    name: 'Pacific/Auckland',
    label: 'Auckland (NZST/NZDT, UTC+12/+13)',
    city: 'Auckland',
    offsetString: 'UTC+12:00',
  },
];

function getTimePartsInTimezone(date: Date, timeZone: string) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const map: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = parseInt(part.value, 10);
      }
    }
    return {
      year: map.year || 2026,
      month: map.month || 1,
      day: map.day || 1,
      hour: map.hour === 24 ? 0 : map.hour || 0,
      minute: map.minute || 0,
      second: map.second || 0,
    };
  } catch {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
    };
  }
}

export function formatTimeInTimezone(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toISOString().substring(11, 19);
  }
}

export function calculateTimeZoneDifference(
  tz1: string,
  tz2: string,
  referenceDate: Date = new Date()
): TimezoneDiffResult {
  const p1 = getTimePartsInTimezone(referenceDate, tz1);
  const p2 = getTimePartsInTimezone(referenceDate, tz2);

  const ms1 = Date.UTC(p1.year, p1.month - 1, p1.day, p1.hour, p1.minute, p1.second);
  const ms2 = Date.UTC(p2.year, p2.month - 1, p2.day, p2.hour, p2.minute, p2.second);

  const diffMs = ms2 - ms1;
  const totalDiffMinutes = Math.round(diffMs / 60000);

  const direction: 'ahead' | 'behind' | 'same' =
    totalDiffMinutes > 0 ? 'ahead' : totalDiffMinutes < 0 ? 'behind' : 'same';

  const absMinutes = Math.abs(totalDiffMinutes);
  const hoursDiff = Math.floor(absMinutes / 60);
  const minutesDiff = absMinutes % 60;

  const time1 = formatTimeInTimezone(referenceDate, tz1);
  const time2 = formatTimeInTimezone(referenceDate, tz2);

  const city2 = tz2.split('/').pop()?.replace(/_/g, ' ') || tz2;
  const city1 = tz1.split('/').pop()?.replace(/_/g, ' ') || tz1;

  let description = `${city2} is the same time as ${city1}.`;
  if (direction !== 'same') {
    const hoursStr = hoursDiff > 0 ? `${hoursDiff} hour${hoursDiff === 1 ? '' : 's'}` : '';
    const minsStr = minutesDiff > 0 ? `${minutesDiff} minute${minutesDiff === 1 ? '' : 's'}` : '';
    const connector = hoursStr && minsStr ? ' and ' : '';
    const diffStr = `${hoursStr}${connector}${minsStr}`.trim();
    description = `${city2} is ${diffStr} ${direction} of ${city1}.`;
  }

  return {
    tz1,
    tz2,
    time1,
    time2,
    hoursDiff,
    minutesDiff,
    direction,
    description,
  };
}
