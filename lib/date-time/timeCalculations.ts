import {
  TimeInput,
  DateTimeInput,
  TimeFormat,
  MidnightMode,
  TimeDiffResult,
  DateTimeDiffResult,
  AddSubtractTimeResult,
} from './types';

export function normalizeHoursTo24(hours: number, ampm?: 'AM' | 'PM'): number {
  if (!ampm) {
    return Math.max(0, Math.min(23, hours));
  }
  let h = hours % 12;
  if (ampm === 'PM') {
    h += 12;
  }
  return h;
}

export function timeToMilliseconds(
  time: TimeInput,
  format: TimeFormat = '24h'
): number {
  const hours24 =
    format === '12h'
      ? normalizeHoursTo24(time.hours, time.ampm)
      : Math.max(0, Math.min(23, time.hours));

  const minutes = Math.max(0, Math.min(59, time.minutes || 0));
  const seconds = Math.max(0, Math.min(59, time.seconds || 0));
  const ms = Math.max(0, Math.min(999, time.milliseconds || 0));

  return (hours24 * 3600 + minutes * 60 + seconds) * 1000 + ms;
}

export function millisecondsToTime(
  ms: number,
  targetFormat: TimeFormat = '24h'
): TimeInput {
  const normalizedMs = ((ms % 86400000) + 86400000) % 86400000;
  const totalSeconds = Math.floor(normalizedMs / 1000);
  const milliseconds = normalizedMs % 1000;

  const hours24 = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (targetFormat === '12h') {
    const ampm: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return {
      hours: hours12,
      minutes,
      seconds,
      milliseconds,
      ampm,
    };
  }

  return {
    hours: hours24,
    minutes,
    seconds,
    milliseconds,
  };
}

export function calculateTimeDifference(
  start: TimeInput,
  end: TimeInput,
  midnightMode: MidnightMode = 'auto',
  format: TimeFormat = '24h'
): TimeDiffResult {
  const msStart = timeToMilliseconds(start, format);
  const msEnd = timeToMilliseconds(end, format);

  let diffMs = msEnd - msStart;
  let crossedMidnight = false;
  let days = 0;

  if (midnightMode === 'next_day') {
    diffMs += 86400000;
    crossedMidnight = true;
    days = 1;
  } else if (midnightMode === 'auto') {
    if (diffMs < 0) {
      diffMs += 86400000;
      crossedMidnight = true;
      days = 1;
    }
  } else if (midnightMode === 'same_day') {
    if (diffMs < 0) {
      diffMs = Math.abs(diffMs);
    }
  }

  const totalMilliseconds = diffMs;
  const totalSeconds = Math.round((diffMs / 1000) * 1000) / 1000;
  const totalMinutes = Math.round((diffMs / 60000) * 1000) / 1000;
  const totalHours = Math.round((diffMs / 3600000) * 10000) / 10000;

  const hours = Math.floor(diffMs / 3600000);
  const remainderAfterHours = diffMs % 3600000;
  const minutes = Math.floor(remainderAfterHours / 60000);
  const remainderAfterMinutes = remainderAfterHours % 60000;
  const seconds = Math.floor(remainderAfterMinutes / 1000);
  const milliseconds = remainderAfterMinutes % 1000;

  return {
    hours,
    minutes,
    seconds,
    milliseconds,
    totalHours,
    totalMinutes,
    totalSeconds,
    totalMilliseconds,
    crossedMidnight,
    days,
  };
}

export function calculateDateTimeDifference(
  start: DateTimeInput,
  end: DateTimeInput,
  format: TimeFormat = '24h'
): DateTimeDiffResult {
  const msStart =
    Date.UTC(start.date.year, start.date.month - 1, start.date.day) +
    timeToMilliseconds(start.time, format);

  const msEnd =
    Date.UTC(end.date.year, end.date.month - 1, end.date.day) +
    timeToMilliseconds(end.time, format);

  const isReversed = msStart > msEnd;
  const diffMs = Math.abs(msEnd - msStart);

  const days = Math.floor(diffMs / 86400000);
  const remainderDays = diffMs % 86400000;
  const hours = Math.floor(remainderDays / 3600000);
  const remainderHours = remainderDays % 3600000;
  const minutes = Math.floor(remainderHours / 60000);
  const seconds = Math.floor((remainderHours % 60000) / 1000);

  const totalHours = Math.round((diffMs / 3600000) * 1000) / 1000;
  const totalMinutes = Math.round((diffMs / 60000) * 100) / 100;
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    start,
    end,
    days,
    hours,
    minutes,
    seconds,
    totalHours,
    totalMinutes,
    totalSeconds,
    isReversed,
  };
}

export function addToTime(
  start: TimeInput,
  add: { hours?: number; minutes?: number; seconds?: number },
  format: TimeFormat = '24h'
): AddSubtractTimeResult {
  const startMs = timeToMilliseconds(start, format);
  const addMs =
    ((add.hours || 0) * 3600 + (add.minutes || 0) * 60 + (add.seconds || 0)) *
    1000;

  const totalMs = startMs + addMs;
  let dayRollover = 0;

  if (totalMs >= 86400000) {
    dayRollover = Math.floor(totalMs / 86400000);
  } else if (totalMs < 0) {
    dayRollover = Math.floor(totalMs / 86400000); // will be negative
  }

  const finalTime = millisecondsToTime(totalMs, format);

  return {
    time: finalTime,
    dayRollover,
  };
}

export function subtractFromTime(
  start: TimeInput,
  sub: { hours?: number; minutes?: number; seconds?: number },
  format: TimeFormat = '24h'
): AddSubtractTimeResult {
  return addToTime(
    start,
    {
      hours: -(sub.hours || 0),
      minutes: -(sub.minutes || 0),
      seconds: -(sub.seconds || 0),
    },
    format
  );
}
