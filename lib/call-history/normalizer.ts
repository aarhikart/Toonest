import { CallType } from './types';

/**
 * Normalizes phone numbers for accurate grouping and searching while preserving country codes.
 * Examples:
 *   "+91 98765 43210" -> "+919876543210"
 *   "098765 43210"   -> "09876543210"
 *   "(123) 456-7890" -> "1234567890"
 */
export function normalizePhoneNumber(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return '';
  const str = String(raw).trim();
  if (!str) return '';

  const hasLeadingPlus = str.startsWith('+');
  const digitsOnly = str.replace(/\D/g, '');

  if (!digitsOnly) return str;
  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Formats a phone number nicely for UI display
 */
export function formatPhoneNumberForDisplay(phone: string): string {
  if (!phone) return 'Unknown Number';
  const clean = phone.trim();

  // If Indian 10-digit number with +91
  if (clean.startsWith('+91') && clean.length === 13) {
    return `+91 ${clean.slice(3, 8)} ${clean.slice(8)}`;
  }
  // Standard 10-digit number
  if (clean.length === 10 && /^\d+$/.test(clean)) {
    return `${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  // US/Canada 10-digit with +1
  if (clean.startsWith('+1') && clean.length === 12) {
    return `+1 (${clean.slice(2, 5)}) ${clean.slice(5, 8)}-${clean.slice(8)}`;
  }

  return clean;
}

/**
 * Maps raw carrier/log call direction or status string into standard CallType.
 */
export function normalizeCallType(raw: any): CallType {
  if (raw === null || raw === undefined) return 'Unknown';
  const val = String(raw).trim().toLowerCase();

  // Android standard call log type integers:
  // 1: INCOMING_TYPE, 2: OUTGOING_TYPE, 3: MISSED_TYPE, 4: VOICEMAIL_TYPE, 5: REJECTED_TYPE, 6: BLOCKED_TYPE
  if (val === '1') return 'Incoming';
  if (val === '2') return 'Outgoing';
  if (val === '3') return 'Missed';
  if (val === '5') return 'Rejected';
  if (val === '6') return 'Blocked';

  if (
    val.includes('in') ||
    val.includes('received') ||
    val.includes('dialed_in') ||
    val.includes('answered')
  ) {
    return 'Incoming';
  }

  if (
    val.includes('out') ||
    val.includes('placed') ||
    val.includes('dialed') ||
    val.includes('sent')
  ) {
    return 'Outgoing';
  }

  if (val.includes('miss') || val.includes('unanswered') || val.includes('no answer')) {
    return 'Missed';
  }

  if (val.includes('reject')) {
    return 'Rejected';
  }

  if (val.includes('decline') || val.includes('busy') || val.includes('cancelled') || val.includes('canceled')) {
    return 'Declined';
  }

  if (val.includes('block') || val.includes('blacklist') || val.includes('spam')) {
    return 'Blocked';
  }

  return 'Unknown';
}

/**
 * Parses raw duration into total seconds integer.
 * Supports:
 *   - Numbers (e.g. 151)
 *   - MM:SS (e.g. "02:31" -> 151)
 *   - HH:MM:SS (e.g. "01:15:30" -> 4530)
 *   - Textual formats (e.g. "2m 31s", "1h 5m", "45 secs")
 */
export function parseCallDuration(raw: any): number {
  if (raw === null || raw === undefined || raw === '') return 0;

  if (typeof raw === 'number') {
    return Math.max(0, Math.round(raw));
  }

  const str = String(raw).trim().toLowerCase();
  if (!str || str === '0' || str === '00:00' || str === '00:00:00') return 0;

  // Direct integer/float in string: "151"
  if (/^\d+(\.\d+)?$/.test(str)) {
    return Math.max(0, Math.round(Number(str)));
  }

  // Time format: "HH:MM:SS" or "MM:SS"
  if (str.includes(':')) {
    const parts = str.split(':').map((p) => Number(p.trim()) || 0);
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return h * 3600 + m * 60 + s;
    }
    if (parts.length === 2) {
      const [m, s] = parts;
      return m * 60 + s;
    }
  }

  // Text format like "1h 20m 30s" or "2m 31s" or "45s"
  let total = 0;
  const hMatch = str.match(/(\d+)\s*(?:h|hr|hour|hours)/);
  const mMatch = str.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/);
  const sMatch = str.match(/(\d+)\s*(?:s|sec|secs|second|seconds)/);

  if (hMatch) total += Number(hMatch[1]) * 3600;
  if (mMatch) total += Number(mMatch[1]) * 60;
  if (sMatch) total += Number(sMatch[1]);

  if (total > 0) return total;

  // Fallback try stripping non-digits
  const fallbackDigits = str.replace(/[^\d.]/g, '');
  if (fallbackDigits) {
    return Math.max(0, Math.round(Number(fallbackDigits)));
  }

  return 0;
}

/**
 * Formats duration in seconds into human-readable string.
 * Example: 67200 -> "18h 40m", 151 -> "02:31" (or "02m 31s"), 8 -> "8s"
 */
export function formatDuration(seconds: number, style: 'compact' | 'clock' | 'full' = 'compact'): string {
  if (!seconds || seconds <= 0) return '00:00';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (style === 'clock') {
    const sStr = String(s).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  }

  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (m > 0) {
    return s > 0 ? `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s` : `${m}m`;
  }
  return `${s}s`;
}

/**
 * Parses date and time values from diverse formats into unified { date, time, timestamp }.
 */
export function parseCallDateTime(dateVal: any, timeVal?: any): { date: string; time: string; timestamp: number } {
  const now = new Date();
  let parsedDate: Date | null = null;

  // Case 1: Numeric Unix timestamp (milliseconds or seconds)
  if (typeof dateVal === 'number' || (typeof dateVal === 'string' && /^\d{10,13}$/.test(dateVal.trim()))) {
    const num = Number(dateVal);
    const ms = num < 10000000000 ? num * 1000 : num;
    parsedDate = new Date(ms);
  }

  // Case 2: Combined string or separate date & time
  if (!parsedDate && dateVal) {
    let combinedStr = String(dateVal).trim();
    if (timeVal) {
      combinedStr = `${combinedStr} ${String(timeVal).trim()}`;
    }

    // Try standard Date.parse
    const candidate = new Date(combinedStr);
    if (!isNaN(candidate.getTime())) {
      parsedDate = candidate;
    } else {
      // Try DD/MM/YYYY or DD-MM-YYYY format (common in Europe/India/Asia)
      const dmyMatch = combinedStr.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(am|pm))?)?/i);
      if (dmyMatch) {
        const day = Number(dmyMatch[1]);
        const month = Number(dmyMatch[2]) - 1;
        const year = Number(dmyMatch[3]);
        let hour = Number(dmyMatch[4] || 0);
        const min = Number(dmyMatch[5] || 0);
        const sec = Number(dmyMatch[6] || 0);
        const ampm = dmyMatch[7]?.toLowerCase();

        if (ampm === 'pm' && hour < 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;

        parsedDate = new Date(year, month, day, hour, min, sec);
      }
    }
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    parsedDate = now;
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const mins = String(parsedDate.getMinutes()).padStart(2, '0');
  const secs = String(parsedDate.getSeconds()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${mins}`,
    timestamp: parsedDate.getTime(),
  };
}

/**
 * Formats a timestamp into a readable date string: "26 Sep 2026"
 */
export function formatCallDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a timestamp into a readable 12h time string: "10:32 AM"
 */
export function formatCallTime(timestamp: number): string {
  if (!timestamp) return 'N/A';
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
