import { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // Clean expired entries
    if (entry && now > entry.resetAt) {
      this.requests.delete(identifier);
    }

    const currentEntry = this.requests.get(identifier);

    if (!currentEntry) {
      // First request in window
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetAt: now + this.windowMs,
      };
    }

    if (currentEntry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: currentEntry.resetAt,
      };
    }

    // Increment count
    currentEntry.count += 1;
    this.requests.set(identifier, currentEntry);

    return {
      allowed: true,
      remaining: this.maxRequests - currentEntry.count,
      resetAt: currentEntry.resetAt,
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetAt) {
        this.requests.delete(key);
      }
    }
  }
}

// Rate limiter instance: 100 requests per minute per IP
export const rateLimiter = new RateLimiter(60000, 100);

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

