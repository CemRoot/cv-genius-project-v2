import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { VercelKVRateLimiter } from './vercel-kv-rate-limiter'

export async function verifyApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false
  
  // In production, validate against database or secure key store
  // For now, we'll use environment variable
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || []
  
  // Hash the provided key to compare with stored hashes
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')
  
  return validApiKeys.some(validKey => {
    const validKeyHash = crypto.createHash('sha256').update(validKey.trim()).digest('hex')
    return hashedKey === validKeyHash
  })
}


export function getApiKeyFromRequest(request: NextRequest): string | null {
  // Check header first
  const headerKey = request.headers.get('x-api-key')
  if (headerKey) return headerKey
  
  // Check query parameter as fallback
  const url = new URL(request.url)
  return url.searchParams.get('api_key')
}

export async function validateAiApiRequest(request: NextRequest): Promise<{ 
  valid: boolean
  error?: string
  status?: number
  retryAfter?: number
}> {
  // Get API key
  const apiKey = getApiKeyFromRequest(request)
  
  if (!apiKey) {
    return {
      valid: false,
      error: 'API key required. Please provide x-api-key header or api_key query parameter.',
      status: 401
    }
  }
  
  // Verify API key
  const isValidKey = await verifyApiKey(apiKey)
  if (!isValidKey) {
    return {
      valid: false,
      error: 'Invalid API key',
      status: 401
    }
  }
  
  // Check rate limit per API key using Vercel KV
  const rateLimitResult = await VercelKVRateLimiter.checkRateLimit({
    identifier: `api-key:${apiKey}`,
    maxRequests: 50, // 50 requests per 15 minutes per API key
    windowMs: 15 * 60 * 1000 // 15 minutes
  })
  
  if (!rateLimitResult.allowed) {
    return {
      valid: false,
      error: 'Rate limit exceeded',
      status: 429,
      retryAfter: rateLimitResult.retryAfter
    }
  }
  
  return { valid: true }
}

// Helper to create a consistent error response
export function createApiErrorResponse(error: string, status: number, retryAfter?: number) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (retryAfter) {
    headers['Retry-After'] = String(retryAfter)
  }
  
  return new Response(
    JSON.stringify({ error, status }),
    { status, headers }
  )
}