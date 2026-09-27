interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipMap.entries()) {
      if (now > record.resetTime) {
        ipMap.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * In-memory rate limiter per IP address
 * @param ip Client IP address
 * @param limit Max requests per window (default 20)
 * @param windowMs Window in milliseconds (default 60,000 = 1 minute)
 */
export function checkRateLimit(
  ip: string,
  limit: number = 20,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const safeIp = ip || 'anonymous';
  const now = Date.now();
  const record = ipMap.get(safeIp);

  if (!record || now > record.resetTime) {
    ipMap.set(safeIp, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((record.resetTime - now) / 1000)),
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSeconds: Math.max(1, Math.ceil((record.resetTime - now) / 1000)),
  };
}
