export interface PlanLimitsConfig {
  trial: number;
  '1_month': number;
  '3_months': number;
  '6_months': number;
  resetHours: number;
}

export const DEFAULT_PLAN_LIMITS: PlanLimitsConfig = {
  trial: 100,
  '1_month': 450,
  '3_months': 650,
  '6_months': 850,
  resetHours: 24
};

export interface UserLimitUsage {
  windowStartTime: number;
  resetTime: number;
  sentInWindow: number;
  deliveredNumbers: string[];
}

export interface CalculatedUsage {
  sentInWindow: number;
  limit: number;
  remaining: number;
  resetTime: number;
  isLimitReached: boolean;
  deliveredNumbers: string[];
  timeRemainingStr: string;
  resetTimeFormatted: string;
}

const STORAGE_PREFIX = 'toolnest_limit_usage_';

export class WhatsAppLimitManager {
  /**
   * Determine the configured message limit for a user based on their plan
   */
  static getPlanLimit(
    userRole: string | undefined,
    subscriptionType: string | undefined,
    planType: string | null | undefined,
    limits: PlanLimitsConfig = DEFAULT_PLAN_LIMITS
  ): number {
    if (userRole === 'admin') {
      return 999999; // Unlimited for admin
    }

    if (subscriptionType === 'trial' || planType === 'trial') {
      return Number(limits.trial) || DEFAULT_PLAN_LIMITS.trial;
    }

    if (subscriptionType === 'paid') {
      if (planType === '1_month') {
        return Number(limits['1_month']) || DEFAULT_PLAN_LIMITS['1_month'];
      }
      if (planType === '3_months') {
        return Number(limits['3_months']) || DEFAULT_PLAN_LIMITS['3_months'];
      }
      if (planType === '6_months') {
        return Number(limits['6_months']) || DEFAULT_PLAN_LIMITS['6_months'];
      }
    }

    // Default to free trial limit
    return Number(limits.trial) || DEFAULT_PLAN_LIMITS.trial;
  }

  /**
   * Normalize phone number to pure digits (last 10 digits or full digits)
   */
  static normalizePhone(phone: string): string {
    const digits = (phone || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }

  /**
   * Get the current usage and reset status from localStorage
   */
  static getUsage(
    username: string,
    limit: number,
    resetHours: number = DEFAULT_PLAN_LIMITS.resetHours
  ): CalculatedUsage {
    if (typeof window === 'undefined') {
      const now = Date.now();
      const resetTime = now + resetHours * 3600 * 1000;
      return {
        sentInWindow: 0,
        limit,
        remaining: limit,
        resetTime,
        isLimitReached: false,
        deliveredNumbers: [],
        timeRemainingStr: `${resetHours}h 0m`,
        resetTimeFormatted: new Date(resetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    const cleanUser = (username || 'default').toLowerCase().trim();
    const storageKey = `${STORAGE_PREFIX}${cleanUser}`;

    let record: UserLimitUsage | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        record = JSON.parse(raw);
      }
    } catch {
      record = null;
    }

    const now = Date.now();
    const windowMs = Math.max(1, resetHours) * 3600 * 1000;

    if (!record || !record.resetTime || typeof record.sentInWindow !== 'number') {
      // First time initialization
      record = {
        windowStartTime: now,
        resetTime: now + windowMs,
        sentInWindow: 0,
        deliveredNumbers: []
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(record));
      } catch {}
    } else if (now >= record.resetTime) {
      // Configured time period has expired! Reset window count, but RETAIN deliveredNumbers
      record.windowStartTime = now;
      record.resetTime = now + windowMs;
      record.sentInWindow = 0;
      if (!Array.isArray(record.deliveredNumbers)) {
        record.deliveredNumbers = [];
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(record));
      } catch {}
    }

    const sentInWindow = Math.max(0, record.sentInWindow);
    const remaining = Math.max(0, limit - sentInWindow);
    const isLimitReached = limit < 999999 && remaining <= 0;
    const deliveredNumbers = Array.isArray(record.deliveredNumbers) ? record.deliveredNumbers : [];

    return {
      sentInWindow,
      limit,
      remaining,
      resetTime: record.resetTime,
      isLimitReached,
      deliveredNumbers,
      timeRemainingStr: this.formatTimeRemaining(record.resetTime),
      resetTimeFormatted: this.formatResetTime(record.resetTime)
    };
  }

  /**
   * Record a message that was delivered successfully
   */
  static recordDelivery(
    username: string,
    phoneNumber: string,
    limit: number,
    resetHours: number = DEFAULT_PLAN_LIMITS.resetHours
  ): CalculatedUsage {
    if (typeof window === 'undefined') {
      return this.getUsage(username, limit, resetHours);
    }

    const cleanUser = (username || 'default').toLowerCase().trim();
    const storageKey = `${STORAGE_PREFIX}${cleanUser}`;
    const normPhone = this.normalizePhone(phoneNumber);

    let record: UserLimitUsage;
    try {
      const raw = localStorage.getItem(storageKey);
      record = raw ? JSON.parse(raw) : null;
    } catch {
      record = null as any;
    }

    const now = Date.now();
    const windowMs = Math.max(1, resetHours) * 3600 * 1000;

    if (!record || !record.resetTime || now >= record.resetTime) {
      record = {
        windowStartTime: now,
        resetTime: now + windowMs,
        sentInWindow: 1,
        deliveredNumbers: normPhone ? [normPhone] : []
      };
    } else {
      record.sentInWindow = (record.sentInWindow || 0) + 1;
      if (!Array.isArray(record.deliveredNumbers)) {
        record.deliveredNumbers = [];
      }
      if (normPhone && !record.deliveredNumbers.includes(normPhone)) {
        record.deliveredNumbers.push(normPhone);
      }
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
    } catch {}

    const remaining = Math.max(0, limit - record.sentInWindow);
    return {
      sentInWindow: record.sentInWindow,
      limit,
      remaining,
      resetTime: record.resetTime,
      isLimitReached: limit < 999999 && remaining <= 0,
      deliveredNumbers: record.deliveredNumbers,
      timeRemainingStr: this.formatTimeRemaining(record.resetTime),
      resetTimeFormatted: this.formatResetTime(record.resetTime)
    };
  }

  /**
   * Check if a contact phone number has already been delivered
   */
  static isAlreadyDelivered(username: string, phoneNumber: string): boolean {
    if (typeof window === 'undefined') return false;
    const cleanUser = (username || 'default').toLowerCase().trim();
    const storageKey = `${STORAGE_PREFIX}${cleanUser}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return false;
      const record: UserLimitUsage = JSON.parse(raw);
      if (!Array.isArray(record.deliveredNumbers)) return false;
      const norm = this.normalizePhone(phoneNumber);
      return Boolean(norm && record.deliveredNumbers.includes(norm));
    } catch {
      return false;
    }
  }

  /**
   * Helper to format time remaining until reset (e.g. "17h 24m" or "45m")
   */
  static formatTimeRemaining(resetTime: number): string {
    const diffMs = resetTime - Date.now();
    if (diffMs <= 0) return 'Resetting now';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${Math.max(1, minutes)}m`;
  }

  /**
   * Helper to format human-readable reset timestamp (e.g. "Today at 06:30 PM")
   */
  static formatResetTime(resetTime: number): string {
    const target = new Date(resetTime);
    const now = new Date();
    const isToday = target.toDateString() === now.toDateString();

    const timeStr = target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today at ${timeStr}`;
    }
    return `${target.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  }
}
