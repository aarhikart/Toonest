import { CallRecord, CallType, DateFilterOption } from './types';
import { normalizePhoneNumber } from './normalizer';

/**
 * Searches call records by phone number or contact name.
 */
export function searchCalls(records: CallRecord[], query: string): CallRecord[] {
  if (!query || !query.trim()) return records;

  const q = query.trim().toLowerCase();
  const normalizedQuery = normalizePhoneNumber(q);

  return records.filter((r) => {
    // 1. Check contact name
    if (r.contactName && r.contactName.toLowerCase().includes(q)) {
      return true;
    }
    // 2. Check raw phone number
    if (r.phoneNumber && r.phoneNumber.toLowerCase().includes(q)) {
      return true;
    }
    // 3. Check normalized digits
    if (normalizedQuery && r.normalizedNumber && r.normalizedNumber.includes(normalizedQuery)) {
      return true;
    }
    return false;
  });
}

/**
 * Filters call records by date preset or custom range.
 */
export function filterCallsByDate(
  records: CallRecord[],
  filterOption: DateFilterOption,
  customRange?: { start?: string; end?: string }
): CallRecord[] {
  if (filterOption === 'all') return records;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  switch (filterOption) {
    case 'today':
      return records.filter((r) => r.timestamp >= todayStart);

    case 'yesterday': {
      const yesterdayStart = todayStart - oneDayMs;
      return records.filter((r) => r.timestamp >= yesterdayStart && r.timestamp < todayStart);
    }

    case 'last7': {
      const sevenDaysAgo = todayStart - 7 * oneDayMs;
      return records.filter((r) => r.timestamp >= sevenDaysAgo);
    }

    case 'last30': {
      const thirtyDaysAgo = todayStart - 30 * oneDayMs;
      return records.filter((r) => r.timestamp >= thirtyDaysAgo);
    }

    case 'thisMonth': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return records.filter((r) => r.timestamp >= monthStart);
    }

    case 'lastMonth': {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return records.filter((r) => r.timestamp >= lastMonthStart && r.timestamp < thisMonthStart);
    }

    case 'custom': {
      if (!customRange) return records;
      let startTs = 0;
      let endTs = Infinity;

      if (customRange.start) {
        startTs = new Date(`${customRange.start}T00:00:00`).getTime() || 0;
      }
      if (customRange.end) {
        endTs = new Date(`${customRange.end}T23:59:59.999`).getTime() || Infinity;
      }
      return records.filter((r) => r.timestamp >= startTs && r.timestamp <= endTs);
    }

    default:
      return records;
  }
}

/**
 * Filters call records by call type (Incoming, Outgoing, Missed, etc.).
 */
export function filterCallsByType(records: CallRecord[], selectedType: string): CallRecord[] {
  if (!selectedType || selectedType === 'ALL') return records;
  return records.filter((r) => r.type.toLowerCase() === selectedType.toLowerCase());
}

/**
 * Filters call records by duration bracket.
 */
export function filterCallsByDuration(records: CallRecord[], durationFilter: string): CallRecord[] {
  if (!durationFilter || durationFilter === 'all') return records;

  switch (durationFilter) {
    case 'zero':
      return records.filter((r) => r.durationSeconds === 0);
    case 'under1m':
      return records.filter((r) => r.durationSeconds > 0 && r.durationSeconds < 60);
    case '1to5m':
      return records.filter((r) => r.durationSeconds >= 60 && r.durationSeconds <= 300);
    case '5to15m':
      return records.filter((r) => r.durationSeconds > 300 && r.durationSeconds <= 900);
    case 'over15m':
      return records.filter((r) => r.durationSeconds > 900);
    default:
      return records;
  }
}

/**
 * Sorts call records by selected column and order.
 */
export function sortCalls(
  records: CallRecord[],
  sortBy: 'date' | 'duration' | 'number' | 'contact' | 'type',
  sortOrder: 'asc' | 'desc'
): CallRecord[] {
  const sorted = [...records];
  const mult = sortOrder === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return (a.timestamp - b.timestamp) * mult;
      case 'duration':
        return (a.durationSeconds - b.durationSeconds) * mult;
      case 'contact': {
        const nameA = (a.contactName || a.phoneNumber).toLowerCase();
        const nameB = (b.contactName || b.phoneNumber).toLowerCase();
        return nameA.localeCompare(nameB) * mult;
      }
      case 'number':
        return a.normalizedNumber.localeCompare(b.normalizedNumber) * mult;
      case 'type':
        return a.type.localeCompare(b.type) * mult;
      default:
        return 0;
    }
  });

  return sorted;
}
