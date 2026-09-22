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
  campaignStartedAt?: number | null;
  resetTime?: number | null;
  sentInWindow: number;
  deliveredNumbers: string[];
}

export interface CalculatedUsage {
  sentInWindow: number;
  limit: number;
  remaining: number;
  resetTime: number | null;
  isLimitReached: boolean;
  isResetTimerActive: boolean;
  deliveredNumbers: string[];
  timeRemainingStr: string;
  resetTimeFormatted: string;
  resetDayFormatted: string;
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
   * Fetch latest usage directly from MongoDB and update local cache.
   * Enables cross-device quota tracking (e.g. sent 8/10 on device 1, shows 2 remaining on device 2).
   */
  static async fetchUsageFromDb(
    username: string,
    limit: number,
    resetHours: number = DEFAULT_PLAN_LIMITS.resetHours
  ): Promise<CalculatedUsage> {
    const cleanUser = (username || 'default').toLowerCase().trim();
    if (typeof window === 'undefined') {
      return this.getUsage(cleanUser, limit, resetHours);
    }

    try {
      const res = await fetch(`/api/whatsapp/user-quota?username=${encodeURIComponent(cleanUser)}&resetHours=${resetHours}&limit=${limit}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const storageKey = `${STORAGE_PREFIX}${cleanUser}`;
          const localRecord: UserLimitUsage = {
            campaignStartedAt: data.campaignStartedAt,
            resetTime: data.resetTime,
            sentInWindow: data.sentInWindow,
            deliveredNumbers: data.deliveredNumbers || []
          };
          try {
            localStorage.setItem(storageKey, JSON.stringify(localRecord));
          } catch {}

          return {
            sentInWindow: data.sentInWindow,
            limit: data.limit || limit,
            remaining: data.remaining,
            resetTime: data.resetTime,
            isLimitReached: data.isLimitReached,
            isResetTimerActive: data.isResetTimerActive,
            deliveredNumbers: data.deliveredNumbers || [],
            timeRemainingStr: data.timeRemainingStr || '',
            resetTimeFormatted: data.resetTimeFormatted || '',
            resetDayFormatted: data.resetDayFormatted || ''
          };
        }
      }
    } catch (err) {
      console.warn('[WhatsAppLimitManager] Failed to fetch usage from DB, using local cache:', err);
    }

    return this.getUsage(cleanUser, limit, resetHours);
  }

  /**
   * Called when a user starts sending a campaign.
   * Records the campaign start anchor timestamp.
   */
  static startCampaignTracking(
    username: string,
    resetHours: number = DEFAULT_PLAN_LIMITS.resetHours
  ): void {
    if (typeof window === 'undefined') return;
    const cleanUser = (username || 'default').toLowerCase().trim();
    const storageKey = `${STORAGE_PREFIX}${cleanUser}`;

    let record: UserLimitUsage | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) record = JSON.parse(raw);
    } catch {}

    const now = Date.now();
    if (!record) {
      record = {
        campaignStartedAt: now,
        resetTime: null,
        sentInWindow: 0,
        deliveredNumbers: []
      };
    } else {
      if (record.resetTime && now >= record.resetTime) {
        record.sentInWindow = 0;
        record.resetTime = null;
        record.campaignStartedAt = now;
      } else if (!record.campaignStartedAt) {
        record.campaignStartedAt = now;
      }
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
    } catch {}

    // Background sync with MongoDB
    if (cleanUser && cleanUser !== 'default') {
      fetch('/api/whatsapp/user-quota/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, resetHours })
      }).catch(err => console.warn('[UserQuota start sync warning]:', err));
    }
  }

  /**
   * Get the current usage and reset status from localStorage.
   * The reset timer is only active if the message limit has been fully used.
   */
  static getUsage(
    username: string,
    limit: number,
    resetHours: number = DEFAULT_PLAN_LIMITS.resetHours
  ): CalculatedUsage {
    if (typeof window === 'undefined') {
      return {
        sentInWindow: 0,
        limit,
        remaining: limit,
        resetTime: null,
        isLimitReached: false,
        isResetTimerActive: false,
        deliveredNumbers: [],
        timeRemainingStr: '',
        resetTimeFormatted: '',
        resetDayFormatted: ''
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

    if (!record || typeof record.sentInWindow !== 'number') {
      record = {
        campaignStartedAt: null,
        resetTime: null,
        sentInWindow: 0,
        deliveredNumbers: []
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(record));
      } catch {}
    } else if (record.resetTime && now >= record.resetTime) {
      // Configured time period has expired! Reset window count, but RETAIN deliveredNumbers
      record.campaignStartedAt = null;
      record.resetTime = null;
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

    // Check condition: If limit is used, ensure resetTime is active; otherwise keep resetTime inactive
    if (isLimitReached && !record.resetTime) {
      const base = record.campaignStartedAt || now;
      let calculatedReset = base + windowMs;
      if (calculatedReset <= now) {
        calculatedReset = now + windowMs;
      }
      record.resetTime = calculatedReset;
      try {
        localStorage.setItem(storageKey, JSON.stringify(record));
      } catch {}
    } else if (!isLimitReached && record.resetTime) {
      // If limit is not fully used, don't start / stop the reset timer
      record.resetTime = null;
      try {
        localStorage.setItem(storageKey, JSON.stringify(record));
      } catch {}
    }

    const isResetTimerActive = Boolean(isLimitReached && record.resetTime && record.resetTime > now);
    const deliveredNumbers = Array.isArray(record.deliveredNumbers) ? record.deliveredNumbers : [];

    return {
      sentInWindow,
      limit,
      remaining,
      resetTime: isResetTimerActive ? record.resetTime || null : null,
      isLimitReached,
      isResetTimerActive,
      deliveredNumbers,
      timeRemainingStr: isResetTimerActive && record.resetTime ? this.formatTimeRemaining(record.resetTime) : '',
      resetTimeFormatted: isResetTimerActive && record.resetTime ? this.formatResetTime(record.resetTime) : '',
      resetDayFormatted: isResetTimerActive && record.resetTime ? this.formatResetDay(record.resetTime) : ''
    };
  }

  /**
   * Record a message that was delivered successfully.
   * Only starts the reset timer if the current limit has been fully used.
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
    const now = Date.now();
    const windowMs = Math.max(1, resetHours) * 3600 * 1000;

    let record: UserLimitUsage;
    try {
      const raw = localStorage.getItem(storageKey);
      record = raw ? JSON.parse(raw) : (null as any);
    } catch {
      record = null as any;
    }

    if (!record) {
      record = {
        campaignStartedAt: now,
        resetTime: null,
        sentInWindow: 1,
        deliveredNumbers: normPhone ? [normPhone] : []
      };
    } else {
      if (record.resetTime && now >= record.resetTime) {
        record.sentInWindow = 0;
        record.resetTime = null;
        record.campaignStartedAt = now;
      }

      if (!record.campaignStartedAt) {
        record.campaignStartedAt = now;
      }

      record.sentInWindow = (record.sentInWindow || 0) + 1;
      if (!Array.isArray(record.deliveredNumbers)) {
        record.deliveredNumbers = [];
      }
      if (normPhone && !record.deliveredNumbers.includes(normPhone)) {
        record.deliveredNumbers.push(normPhone);
      }
    }

    const remaining = Math.max(0, limit - record.sentInWindow);
    const isLimitReached = limit < 999999 && remaining <= 0;

    // Check condition: If limit is fully used, start the reset timer from campaignStartedAt. Otherwise do not start!
    if (isLimitReached) {
      const base = record.campaignStartedAt || now;
      let calculatedReset = base + windowMs;
      if (calculatedReset <= now) {
        calculatedReset = now + windowMs;
      }
      record.resetTime = calculatedReset;
    } else {
      record.resetTime = null;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
    } catch {}

    // Background sync with MongoDB
    if (cleanUser && cleanUser !== 'default') {
      fetch('/api/whatsapp/user-quota/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          phoneNumber: normPhone,
          limit,
          resetHours
        })
      }).catch(err => console.warn('[UserQuota record sync warning]:', err));
    }

    const isResetTimerActive = Boolean(isLimitReached && record.resetTime && record.resetTime > now);

    return {
      sentInWindow: record.sentInWindow,
      limit,
      remaining,
      resetTime: isResetTimerActive ? record.resetTime || null : null,
      isLimitReached,
      isResetTimerActive,
      deliveredNumbers: record.deliveredNumbers,
      timeRemainingStr: isResetTimerActive && record.resetTime ? this.formatTimeRemaining(record.resetTime) : '',
      resetTimeFormatted: isResetTimerActive && record.resetTime ? this.formatResetTime(record.resetTime) : '',
      resetDayFormatted: isResetTimerActive && record.resetTime ? this.formatResetDay(record.resetTime) : ''
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
   * Helper to format human-readable reset timestamp with day and time
   * e.g. "Today at 06:30 PM", "Tomorrow at 06:30 PM", "Thu, Sep 24 at 06:30 PM"
   */
  static formatResetTime(resetTime: number): string {
    if (!resetTime) return '';
    const target = new Date(resetTime);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffDays = Math.round((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const timeStr = target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 0) {
      return `Today at ${timeStr}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${timeStr}`;
    } else {
      const weekday = target.toLocaleDateString([], { weekday: 'short' });
      const monthDay = target.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${weekday}, ${monthDay} at ${timeStr}`;
    }
  }

  /**
   * Helper to format reset day only (e.g. "Today", "Tomorrow", "Thursday")
   */
  static formatResetDay(resetTime: number): string {
    if (!resetTime) return '';
    const target = new Date(resetTime);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffDays = Math.round((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return target.toLocaleDateString([], { weekday: 'long' });
    }
  }
}
