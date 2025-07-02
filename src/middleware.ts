import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { VercelKVManager } from '@/lib/vercel-kv-manager'

// Security validation with development bypass
const validateHiddenSecurity = (request: NextRequest): boolean => {
  // EMERGENCY BYPASS: Always allow admin access when IP whitelist is disabled
  if (process.env.DISABLE_IP_WHITELIST?.trim() === 'true') {
    console.log('🚨 EMERGENCY BYPASS: Admin access allowed due to DISABLE_IP_WHITELIST=true')
    return true
  }
  
  // Development mode bypass
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // Admin panel access validation
  if (request.nextUrl.pathname === '/admin' && process.env.NODE_ENV === 'production') {
    const accessKey = request.nextUrl.searchParams.get('k')
    console.log('🔑 DEBUG Admin access attempt:', {
      pathname: request.nextUrl.pathname,
      accessKey,
      nodeEnv: process.env.NODE_ENV,
      hasKey1: !!process.env.ADMIN_KEY_1,
      hasKey2: !!process.env.ADMIN_KEY_2,
      hasKey3: !!process.env.ADMIN_KEY_3,
      hasKey4: !!process.env.ADMIN_KEY_4
    })
    
    if (!accessKey) {
      console.log('🚫 No access key provided')
      return false
    }

    // Time-based validation using environment variables
    const validationKeys = [
      parseInt(process.env.ADMIN_KEY_1 ?? '0x1A2B', 16),
      parseInt(process.env.ADMIN_KEY_2 ?? '0x3C4D', 16),
      parseInt(process.env.ADMIN_KEY_3 ?? '0x5E6F', 16),
      parseInt(process.env.ADMIN_KEY_4 ?? '0x7890', 16)
    ]
    const timeWindow = Date.now() % 86400000
    const expectedHash = validationKeys.reduce((acc, key) => acc ^ key, timeWindow)
    const expectedKey = (expectedHash & 0xFFFF).toString(16)
    const providedKey = parseInt(accessKey!, 16)
    const expectedKeyInt = expectedHash & 0xFFFF
    
    console.log('🔑 DEBUG Key validation:', {
      validationKeys,
      timeWindow,
      expectedHash,
      expectedKey,
      providedKey,
      expectedKeyInt,
      accessKeyHex: accessKey,
      isValid: providedKey === expectedKeyInt
    })
    
    return providedKey === expectedKeyInt
  }

  // API endpoint security parameter validation
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    const securityHash = request.nextUrl.searchParams.get('__s')
    const timestamp = request.nextUrl.searchParams.get('__t')
    
    if (securityHash && timestamp) {
      // Basic validation - more sophisticated validation can be added
      const timestampNum = parseInt(timestamp)
      const currentTime = Date.now()
      
      // 5 minute window
      return Math.abs(currentTime - timestampNum) <= 300000
    }
  }

  return true
}

// Admin routes that need protection
const protectedAdminRoutes = ['/admin', '/api/admin']

// Admin routes that don't need JWT authentication (login, refresh, logout only)
const publicAdminRoutes = [
  '/api/admin/auth/login',
  '/api/admin/auth/refresh',
  '/api/admin/auth/logout'
]

// 2FA verify during login doesn't need CSRF (no session yet)
const loginFlow2FARoutes = [
  '/api/admin/auth/2fa/verify'
]

// Routes that need JWT but are exempt from CSRF (for restoration purposes)
const csrfExemptRoutes = [
  '/api/admin/auth/restore-csrf'
]

// Admin routes that need special handling but still require CSRF for safety
const sensitiveAdminRoutes = [
  '/api/admin/auth/2fa/setup',
  '/api/admin/auth/2fa/disable'
]

// Rate limiting store (in production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// IP whitelist from environment variable or Vercel KV
const getIPWhitelist = async (): Promise<string[]> => {
  try {
    // Try to get from Vercel KV first
    const kvWhitelist = await VercelKVManager.getIPWhitelist()
    if (kvWhitelist && kvWhitelist.length > 0) {
      return kvWhitelist
    }
  } catch (error) {
    // Fallback to env var
  }
  
  const envWhitelist = process.env.ADMIN_IP_WHITELIST
  if (!envWhitelist) {
    // Default development IPs if no env var set - PRODUCTION SHOULD ALWAYS SET THIS!
    console.warn('⚠️ ADMIN_IP_WHITELIST not set! Using development defaults - NOT SECURE FOR PRODUCTION!')
    return ['::1', '127.0.0.1', 'localhost']
  }
  return envWhitelist.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0)
}

// Admin panel IP protection
const isAdminIPAllowed = async (request: NextRequest): Promise<boolean> => {
  // Development mode bypass
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Bypassing IP whitelist check')
    return true
  }
  
  // Emergency bypass (for setup) - Check both ways for Vercel Edge Runtime
  const disableWhitelist = process.env.DISABLE_IP_WHITELIST?.trim() === 'true' || 
                          process.env.NEXT_PUBLIC_DISABLE_IP_WHITELIST?.trim() === 'true'
  if (disableWhitelist) {
    console.log('⚠️ EMERGENCY BYPASS: IP whitelist disabled via environment variable')
    return true
  }
  
  // Get client IP with better detection for IPv4/IPv6
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  
  let clientIP = 'unknown'
  
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first (original client)
    clientIP = xForwardedFor.split(',')[0].trim()
  } else if (cfConnectingIp) {
    clientIP = cfConnectingIp.trim()
  } else if (xRealIp) {
    clientIP = xRealIp.trim()
  }
  
  // Clean up IPv6 format if needed
  if (clientIP.startsWith('::ffff:')) {
    clientIP = clientIP.substring(7) // Remove IPv4-mapped IPv6 prefix
  }
  
  console.log(`🔍 Checking IP access for admin route. Client IP: ${clientIP}`)
  
  const allowedIPs = await getIPWhitelist()
  
  // Enhanced IP matching logic for IPv4/IPv6
  const isAllowed = allowedIPs.some(allowedIP => {
    const cleanAllowedIP = allowedIP.trim()
    
    // Exact match
    if (clientIP === cleanAllowedIP) return true
    
    // IPv6 case-insensitive match
    if (clientIP.toLowerCase() === cleanAllowedIP.toLowerCase()) return true
    
    // Localhost variants
    if (cleanAllowedIP === 'localhost' && 
        (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.toLowerCase() === 'localhost')) {
      return true
    }
    
    // IPv4-mapped IPv6 format
    if (clientIP.startsWith('::ffff:') && clientIP.substring(7) === cleanAllowedIP) return true
    
    // Development IPs
    if (process.env.NODE_ENV === 'development' && 
        (clientIP.startsWith('192.168.') || clientIP.startsWith('10.') || clientIP.startsWith('172.'))) {
      return cleanAllowedIP.startsWith('192.168.') || cleanAllowedIP.startsWith('10.') || cleanAllowedIP.startsWith('172.')
    }
    
    return false
  })
  
  if (!isAllowed) {
    console.warn(`🚨 SECURITY ALERT: Blocked admin access from IP: ${clientIP}`)
    console.warn(`🔒 Allowed IPs: ${allowedIPs.join(', ')}`)
    console.warn(`🌍 Headers: ${JSON.stringify({
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      'x-real-ip': request.headers.get('x-real-ip'),
      'user-agent': request.headers.get('user-agent')?.substring(0, 50)
    })}`)
  } else {
    console.log(`✅ IP access granted for ${clientIP} (from allowed list)`)
  }
  
  return isAllowed
}

// Security headers (with Vercel Analytics support)
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://cdnjs.cloudflare.com blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://va.vercel-scripts.com https://vercel.live https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; object-src 'none'; worker-src 'self' blob: https://cdnjs.cloudflare.com;",
}

// Relaxed CSP for admin routes (includes Vercel Analytics + Google Ads)
const adminSecurityHeaders = {
  ...securityHeaders,
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://cdnjs.cloudflare.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagmanager.com https://tpc.googlesyndication.com blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://va.vercel-scripts.com https://vercel.live https://vercel.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagmanager.com https://tpc.googlesyndication.com https://www.google-analytics.com; img-src 'self' data: https:; frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; object-src 'none'; worker-src 'self' blob: https://cdnjs.cloudflare.com;",
}

// JWT secret must be set via environment variable
const JWT_SECRET = process.env.JWT_SECRET 
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : (() => {
      throw new Error('JWT_SECRET environment variable is required')
    })()

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname
  
  // Environment variables have been added to production - deployment trigger

  // Silent handling of Chrome DevTools requests
  if (pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
    return new NextResponse('{}', { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Hidden security layer - silent rejection
  if (!validateHiddenSecurity(request)) {
    // Return 404 instead of 403 to hide admin panel existence
    return new NextResponse('Not Found', { status: 404 })
  }
  
  // Check if it's an admin route
  const isAdminRoute = protectedAdminRoutes.some(route => pathname.startsWith(route))
  const isPublicAdminRoute = publicAdminRoutes.includes(pathname)
  const isLoginFlow2FA = loginFlow2FARoutes.includes(pathname)
  const isSensitiveAdminRoute = sensitiveAdminRoutes.includes(pathname)
  const isCsrfExempt = csrfExemptRoutes.includes(pathname)
  
  // Apply appropriate security headers
  // Skip CSP header as it's set in vercel.json
  const headersToApply = isAdminRoute ? adminSecurityHeaders : securityHeaders
  Object.entries(headersToApply).forEach(([key, value]) => {
    // Skip CSP as it's handled by vercel.json
    if (key !== 'Content-Security-Policy') {
      response.headers.set(key, value)
    }
  })
  
  if (isAdminRoute) {
    // 1. IP Whitelist Check for admin panel AND admin API routes
    console.log('🔒 ADMIN ROUTE ACCESS CHECK:', {
      path: pathname,
      isAdminRoute,
      isDisabled: process.env.DISABLE_IP_WHITELIST === 'true',
      clientIP: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    })
    
    // IP Whitelist Check
    if ((pathname === '/admin' || pathname.startsWith('/api/admin/')) && !(await isAdminIPAllowed(request))) {
      console.log('🚫 IP ACCESS DENIED for', pathname)
      // Redirect to 404 page instead of returning plain text
      if (pathname === '/admin') {
        return NextResponse.rewrite(new URL('/404', request.url))
      }
      // For API routes, return 404 status
      return new NextResponse('Not Found', { status: 404 })
    }
    
    console.log('✅ IP ACCESS ALLOWED for', pathname)

    // 2. Rate Limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const identifier = clientIP
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    
    // More relaxed rate limiting for development
    const maxRequests = process.env.NODE_ENV === 'development' ? 500 : 100 // 500 for dev, 100 for production
    
    const rateLimit = rateLimitStore.get(identifier) || { count: 0, resetTime: now + windowMs }
    
    if (now > rateLimit.resetTime) {
      rateLimit.count = 1
      rateLimit.resetTime = now + windowMs
    } else {
      rateLimit.count++
    }
    
    rateLimitStore.set(identifier, rateLimit)
    
    if (rateLimit.count > maxRequests) {
      console.log(`🚫 Rate limit exceeded for ${clientIP}: ${rateLimit.count}/${maxRequests}`)
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - now) / 1000))
        }
      })
    }

    // 3. JWT Authentication Check for API routes (skip public routes)
    let requestHeaders = new Headers(request.headers)
    
    if (pathname.startsWith('/api/admin') && !isPublicAdminRoute) {
      const authHeader = request.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
      
      const token = authHeader.substring(7)
      
      try {
        // Verify JWT token
        const { payload } = await jwtVerify(token, JWT_SECRET, {
          issuer: 'cvgenius-admin',
          audience: 'cvgenius-admin-api',
        })
        
        // Check if token has admin role
        if (payload.role !== 'admin') {
          return new NextResponse('Forbidden', { status: 403 })
        }
        
        // Add user info to request headers for use in API routes
        requestHeaders.set('x-admin-id', String(payload.sub))
        requestHeaders.set('x-admin-email', String(payload.email))
        requestHeaders.set('x-admin-role', String(payload.role || 'admin'))
        
      } catch (error) {
        return new NextResponse('Invalid token', { status: 401 })
      }
    }

    // 4. CSRF Protection for POST/PUT/DELETE (all admin routes except public, login-flow 2FA, and CSRF exempt)
    if (['POST', 'PUT', 'DELETE'].includes(request.method) && !isPublicAdminRoute && !isLoginFlow2FA && !isCsrfExempt) {
      const csrfToken = request.headers.get('x-csrf-token')
      const sessionCsrf = request.cookies.get('csrf-token')?.value
      
      if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
        // Debug logs removed for production security
        return new NextResponse('CSRF token validation failed', { status: 403 })
      }
      
      // Extra validation for sensitive 2FA routes
      if (isSensitiveAdminRoute) {
        // Debug logs removed for production security
      }
    }
    
    // Return response with modified headers for authenticated requests
    if (pathname.startsWith('/api/admin') && !isPublicAdminRoute) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }

  // Add security headers for admin routes
  if (isAdminRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}