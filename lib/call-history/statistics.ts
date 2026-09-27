import { CallRecord, CallStatistics, ContactSummary } from './types';
import { formatDuration, formatCallDate } from './normalizer';

/**
 * Calculates comprehensive call statistics from an array of CallRecords.
 */
export function calculateCallStatistics(records: CallRecord[]): CallStatistics {
  if (!records || records.length === 0) {
    return {
      totalCalls: 0,
      incomingCalls: 0,
      outgoingCalls: 0,
      missedCalls: 0,
      rejectedCalls: 0,
      declinedCalls: 0,
      blockedCalls: 0,
      totalDurationSeconds: 0,
      totalDurationFormatted: '00:00',
      averageDurationSeconds: 0,
      averageDurationFormatted: '00:00',
      longestCallSeconds: 0,
      longestCallFormatted: '00:00',
      shortestCallSeconds: 0,
      shortestCallFormatted: '00:00',
      uniqueNumbersCount: 0,
      uniqueContactsCount: 0,
    };
  }

  let incoming = 0;
  let outgoing = 0;
  let missed = 0;
  let rejected = 0;
  let declined = 0;
  let blocked = 0;
  let totalDuration = 0;
  let longestCallSec = 0;
  let longestCallRec: CallRecord | undefined = undefined;
  let shortestCallSec = Infinity;

  const uniqueNumbers = new Set<string>();
  const uniqueContacts = new Set<string>();
  let connectedCallsCount = 0;

  for (const r of records) {
    if (r.normalizedNumber) uniqueNumbers.add(r.normalizedNumber);
    if (r.contactName) uniqueContacts.add(r.contactName.trim().toLowerCase());

    switch (r.type) {
      case 'Incoming':
        incoming++;
        break;
      case 'Outgoing':
        outgoing++;
        break;
      case 'Missed':
        missed++;
        break;
      case 'Rejected':
        rejected++;
        break;
      case 'Declined':
        declined++;
        break;
      case 'Blocked':
        blocked++;
        break;
      default:
        break;
    }

    const dur = r.durationSeconds || 0;
    totalDuration += dur;

    if (dur > longestCallSec) {
      longestCallSec = dur;
      longestCallRec = r;
    }

    // Shortest connected call (only consider calls with duration > 0 for meaningful shortest call stat)
    if (dur > 0 && dur < shortestCallSec) {
      shortestCallSec = dur;
    }

    if (dur > 0) {
      connectedCallsCount++;
    }
  }

  const finalShortestSec = shortestCallSec === Infinity ? 0 : shortestCallSec;
  // Calculate average duration across connected calls (or total if none connected)
  const avgSec = connectedCallsCount > 0
    ? Math.round(totalDuration / connectedCallsCount)
    : (records.length > 0 ? Math.round(totalDuration / records.length) : 0);

  return {
    totalCalls: records.length,
    incomingCalls: incoming,
    outgoingCalls: outgoing,
    missedCalls: missed,
    rejectedCalls: rejected,
    declinedCalls: declined,
    blockedCalls: blocked,
    totalDurationSeconds: totalDuration,
    totalDurationFormatted: formatDuration(totalDuration, 'compact'),
    averageDurationSeconds: avgSec,
    averageDurationFormatted: formatDuration(avgSec, 'compact'),
    longestCallSeconds: longestCallSec,
    longestCallFormatted: formatDuration(longestCallSec, 'compact'),
    longestCallRecord: longestCallRec,
    shortestCallSeconds: finalShortestSec,
    shortestCallFormatted: formatDuration(finalShortestSec, 'compact'),
    uniqueNumbersCount: uniqueNumbers.size,
    uniqueContactsCount: uniqueContacts.size,
  };
}

/**
 * Groups and aggregates call records by phone number / contact.
 * Sorted descending by total call volume (Most Contacted).
 */
export function groupCallsByNumber(records: CallRecord[]): ContactSummary[] {
  const map = new Map<string, {
    phoneNumber: string;
    normalizedNumber: string;
    contactName?: string;
    calls: CallRecord[];
    incoming: number;
    outgoing: number;
    missed: number;
    rejected: number;
    totalDuration: number;
    firstCallTs: number;
    lastCallTs: number;
  }>();

  for (const r of records) {
    const key = r.normalizedNumber || r.phoneNumber || 'Unknown';
    let entry = map.get(key);

    if (!entry) {
      entry = {
        phoneNumber: r.phoneNumber,
        normalizedNumber: r.normalizedNumber,
        contactName: r.contactName,
        calls: [],
        incoming: 0,
        outgoing: 0,
        missed: 0,
        rejected: 0,
        totalDuration: 0,
        firstCallTs: r.timestamp,
        lastCallTs: r.timestamp,
      };
      map.set(key, entry);
    }

    // Keep contact name if found in any call
    if (!entry.contactName && r.contactName) {
      entry.contactName = r.contactName;
    }

    entry.calls.push(r);
    entry.totalDuration += r.durationSeconds || 0;

    if (r.type === 'Incoming') entry.incoming++;
    else if (r.type === 'Outgoing') entry.outgoing++;
    else if (r.type === 'Missed') entry.missed++;
    else if (r.type === 'Rejected' || r.type === 'Declined') entry.rejected++;

    if (r.timestamp < entry.firstCallTs) entry.firstCallTs = r.timestamp;
    if (r.timestamp > entry.lastCallTs) entry.lastCallTs = r.timestamp;
  }

  const summaries: ContactSummary[] = [];

  for (const [, val] of map.entries()) {
    const connectedCount = val.calls.filter((c) => c.durationSeconds > 0).length;
    const avgSec = connectedCount > 0 ? Math.round(val.totalDuration / connectedCount) : 0;

    // Sort calls descending within contact
    val.calls.sort((a, b) => b.timestamp - a.timestamp);

    summaries.push({
      phoneNumber: val.phoneNumber,
      normalizedNumber: val.normalizedNumber,
      contactName: val.contactName,
      totalCalls: val.calls.length,
      incoming: val.incoming,
      outgoing: val.outgoing,
      missed: val.missed,
      rejected: val.rejected,
      totalDurationSeconds: val.totalDuration,
      totalDurationFormatted: formatDuration(val.totalDuration, 'compact'),
      averageDurationSeconds: avgSec,
      averageDurationFormatted: formatDuration(avgSec, 'compact'),
      firstCallTimestamp: val.firstCallTs,
      firstCallFormatted: formatCallDate(val.firstCallTs),
      lastCallTimestamp: val.lastCallTs,
      lastCallFormatted: formatCallDate(val.lastCallTs),
      calls: val.calls,
    });
  }

  // Sort by highest total calls
  summaries.sort((a, b) => b.totalCalls - a.totalCalls);

  return summaries;
}

/**
 * Aggregates calls by day for volume trends.
 */
export function groupCallsByDate(records: CallRecord[]): Array<{
  date: string;
  label: string;
  timestamp: number;
  total: number;
  incoming: number;
  outgoing: number;
  missed: number;
}> {
  const map = new Map<string, {
    date: string;
    label: string;
    timestamp: number;
    total: number;
    incoming: number;
    outgoing: number;
    missed: number;
  }>();

  for (const r of records) {
    if (!r.date) continue;
    let item = map.get(r.date);
    if (!item) {
      item = {
        date: r.date,
        label: formatCallDate(r.timestamp),
        timestamp: r.timestamp,
        total: 0,
        incoming: 0,
        outgoing: 0,
        missed: 0,
      };
      map.set(r.date, item);
    }
    item.total++;
    if (r.type === 'Incoming') item.incoming++;
    else if (r.type === 'Outgoing') item.outgoing++;
    else if (r.type === 'Missed') item.missed++;
  }

  // Sort chronologically ascending
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregates calls by hour of the day (0-23) to show peak calling activity.
 */
export function groupCallsByHour(records: CallRecord[]): Array<{
  hour: number;
  label: string;
  total: number;
  incoming: number;
  outgoing: number;
  missed: number;
}> {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const ampm = i >= 12 ? 'PM' : 'AM';
    const displayHour = i % 12 === 0 ? 12 : i % 12;
    return {
      hour: i,
      label: `${displayHour} ${ampm}`,
      total: 0,
      incoming: 0,
      outgoing: 0,
      missed: 0,
    };
  });

  for (const r of records) {
    const d = new Date(r.timestamp);
    const h = d.getHours();
    if (h >= 0 && h < 24) {
      hours[h].total++;
      if (r.type === 'Incoming') hours[h].incoming++;
      else if (r.type === 'Outgoing') hours[h].outgoing++;
      else if (r.type === 'Missed') hours[h].missed++;
    }
  }

  return hours;
}

/**
 * Detects duplicate records based on identical normalized number, timestamp, call type, and duration.
 */
export function detectDuplicates(records: CallRecord[]): {
  duplicateCount: number;
  duplicates: CallRecord[];
  flaggedRecords: CallRecord[];
} {
  const seen = new Set<string>();
  const duplicates: CallRecord[] = [];
  const flaggedRecords: CallRecord[] = [];

  for (const r of records) {
    // Unique fingerprint: normalizedNumber + timestamp + type + durationSeconds
    const fingerprint = `${r.normalizedNumber}|${r.timestamp}|${r.type}|${r.durationSeconds}`;
    if (seen.has(fingerprint)) {
      duplicates.push(r);
      flaggedRecords.push({ ...r, isDuplicate: true });
    } else {
      seen.add(fingerprint);
      flaggedRecords.push({ ...r, isDuplicate: false });
    }
  }

  return {
    duplicateCount: duplicates.length,
    duplicates,
    flaggedRecords,
  };
}

/**
 * Removes duplicate records from the dataset.
 */
export function removeDuplicates(records: CallRecord[]): CallRecord[] {
  const seen = new Set<string>();
  const clean: CallRecord[] = [];

  for (const r of records) {
    const fingerprint = `${r.normalizedNumber}|${r.timestamp}|${r.type}|${r.durationSeconds}`;
    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      clean.push({ ...r, isDuplicate: false });
    }
  }

  return clean;
}
