export type CallType =
  | 'Incoming'
  | 'Outgoing'
  | 'Missed'
  | 'Rejected'
  | 'Declined'
  | 'Blocked'
  | 'Unknown';

export interface CallRecord {
  id: string;
  phoneNumber: string;
  normalizedNumber: string;
  contactName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or HH:mm:ss
  timestamp: number; // Unix timestamp in ms
  type: CallType;
  durationSeconds: number;
  durationFormatted: string;
  isDuplicate?: boolean;
  rawRow?: Record<string, any>;
}

export interface CallStatistics {
  totalCalls: number;
  incomingCalls: number;
  outgoingCalls: number;
  missedCalls: number;
  rejectedCalls: number;
  declinedCalls: number;
  blockedCalls: number;
  totalDurationSeconds: number;
  totalDurationFormatted: string;
  averageDurationSeconds: number;
  averageDurationFormatted: string;
  longestCallSeconds: number;
  longestCallFormatted: string;
  longestCallRecord?: CallRecord;
  shortestCallSeconds: number;
  shortestCallFormatted: string;
  uniqueNumbersCount: number;
  uniqueContactsCount: number;
}

export interface ContactSummary {
  phoneNumber: string;
  normalizedNumber: string;
  contactName?: string;
  totalCalls: number;
  incoming: number;
  outgoing: number;
  missed: number;
  rejected: number;
  totalDurationSeconds: number;
  totalDurationFormatted: string;
  averageDurationSeconds: number;
  averageDurationFormatted: string;
  firstCallTimestamp: number;
  firstCallFormatted: string;
  lastCallTimestamp: number;
  lastCallFormatted: string;
  calls: CallRecord[];
}

export type DateFilterOption =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

export interface ColumnMapping {
  phoneNumber: string;
  contactName?: string;
  date?: string;
  time?: string;
  dateTime?: string;
  type: string;
  duration: string;
}

export interface ParsedFileResult {
  headers: string[];
  rows: any[];
  autoMapping: ColumnMapping;
  isAutoMatched: boolean;
  fileName: string;
  fileSize: number;
}
