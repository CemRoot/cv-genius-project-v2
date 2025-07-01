import { kv } from '@vercel/kv'

interface RateLimitConfig {
  identifier: string
  maxRequests: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
  retryAfter?: number
}

export class VercelKVRateLimiter {
  private static isKVAvailable(): boolean {
    return process.env.KV_REST_API_URL !== undefined && 
           process.env.KV_REST_API_TOKEN !== undefined
  }

  static async checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    // Use in-memory fallback if KV is not available
    if (!this.isKVAvailable()) {
      return this.inMemoryRateLimit(config)
    }

    try {
      const key = `ratelimit:${config.identifier}`
      const now = Date.now()
      const window = Math.floor(now / config.windowMs)
      const windowKey = `${key}:${window}`

      // Increment the counter
      const count = await kv.incr(windowKey)
      
      // Set expiry on first request in window
      if (count === 1) {
        await kv.expire(windowKey, Math.ceil(config.windowMs / 1000))
      }

      const allowed = count <= config.maxRequests
      const reset = (window + 1) * config.windowMs
      const remaining = Math.max(0, config.maxRequests - count)

      return {
        allowed,
        remaining,
        reset,
        retryAfter: allowed ? undefined : Math.ceil((reset - now) / 1000)
      }
    } catch (error) {
      console.error('Vercel KV rate limit error:', error)
      // Fallback to in-memory on error
      return this.inMemoryRateLimit(config)
    }
  }

  // In-memory fallback for development/KV unavailable
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>()

  private static inMemoryRateLimit(config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const rateLimit = this.rateLimitStore.get(config.identifier) || { 
      count: 0, 
      resetTime: now + config.windowMs 
    }

    if (now > rateLimit.resetTime) {
      // Window has passed, reset
      rateLimit.count = 1
      rateLimit.resetTime = now + config.windowMs
    } else {
      rateLimit.count++
    }

    this.rateLimitStore.set(config.identifier, rateLimit)

    const allowed = rateLimit.count <= config.maxRequests
    const remaining = Math.max(0, config.maxRequests - rateLimit.count)

    return {
      allowed,
      remaining,
      reset: rateLimit.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((rateLimit.resetTime - now) / 1000)
    }
  }

  // Utility method to create rate limit headers
  static createRateLimitHeaders(result: RateLimitResult): HeadersInit {
    const headers: HeadersInit = {
      'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.floor(result.reset / 1000))
    }

    if (result.retryAfter !== undefined) {
      headers['Retry-After'] = String(result.retryAfter)
    }

    return headers
  }

  // Clear rate limits for a specific identifier (useful for testing)
  static async clearRateLimit(identifier: string): Promise<void> {
    if (this.isKVAvailable()) {
      try {
        const pattern = `ratelimit:${identifier}:*`
        const keys = await kv.keys(pattern)
        if (keys.length > 0) {
          await kv.del(...keys)
        }
      } catch (error) {
        console.error('Failed to clear rate limits:', error)
      }
    } else {
      // Clear from in-memory store
      this.rateLimitStore.delete(identifier)
    }
  }
}

// Export convenience functions
export async function checkApiRateLimit(
  apiKey: string, 
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<RateLimitResult> {
  return VercelKVRateLimiter.checkRateLimit({
    identifier: `api:${apiKey}`,
    maxRequests,
    windowMs
  })
}

export async function checkIpRateLimit(
  ip: string,
  maxRequests: number = 50,
  windowMs: number = 15 * 60 * 1000 // 15 minutes  
): Promise<RateLimitResult> {
  return VercelKVRateLimiter.checkRateLimit({
    identifier: `ip:${ip}`,
    maxRequests,
    windowMs
  })
}