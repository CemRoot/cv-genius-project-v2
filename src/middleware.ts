import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Security validation with development bypass
const validateHiddenSecurity = (request: NextRequest): boolean => {
  // Admin panel access validation - DISABLED for easier access
  if (false && request.nextUrl.pathname === '/admin' && process.env.NODE_ENV === 'production') {
    const accessKey = request.nextUrl.searchParams.get('k')
    if (!accessKey) return false

    // Time-based validation using environment variables
    const validationKeys = [
      parseInt(process.env.ADMIN_KEY_1 ?? '0x1A2B', 16),
      parseInt(process.env.ADMIN_KEY_2 ?? '0x3C4D', 16),
      parseInt(process.env.ADMIN_KEY_3 ?? '0x5E6F', 16),
      parseInt(process.env.ADMIN_KEY_4 ?? '0x7890', 16)
    ]
    const timeWindow = Date.now() % 86400000
    const expectedHash = validationKeys.reduce((acc, key) => acc ^ key, timeWindow)
    
    return parseInt(accessKey!, 16) === (expectedHash & 0xFFFF)
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

// Admin routes that need special handling but still require CSRF for safety
const sensitiveAdminRoutes = [
  '/api/admin/auth/2fa/setup',
  '/api/admin/auth/2fa/disable'
]

// Rate limiting store (in production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// IP whitelist from environment variable
const getIPWhitelist = (): string[] => {
  const envWhitelist = process.env.ADMIN_IP_WHITELIST
  if (!envWhitelist) {
    // Default development IPs if no env var set
    return ['::1', '127.0.0.1', 'localhost', '192.168.1.11']
  }
  return envWhitelist.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0)
}

// Admin panel IP protection
const isAdminIPAllowed = (request: NextRequest): boolean => {
  // Development mode bypass
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Bypassing IP whitelist check')
    return true
  }
  
  // Emergency bypass (for setup)
  if (process.env.DISABLE_IP_WHITELIST === 'true') {
    console.log('⚠️ IP whitelist disabled via environment variable')
    return true
  }
  
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  const allowedIPs = getIPWhitelist()
  const isAllowed = allowedIPs.some(allowedIP => 
    clientIP === allowedIP || 
    clientIP.includes(allowedIP) ||
    allowedIP === 'localhost' && (clientIP === '127.0.0.1' || clientIP === '::1')
  )
  
  if (!isAllowed) {
    console.warn(`🚨 Blocked admin access from IP: ${clientIP}. Allowed IPs: ${allowedIPs.join(', ')}`)
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
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com data:; connect-src 'self' https://va.vercel-scripts.com https://vercel.live; img-src 'self' data: https:; object-src 'none';",
}

// Relaxed CSP for admin routes (includes Vercel Analytics)
const adminSecurityHeaders = {
  ...securityHeaders,
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com data:; connect-src 'self' https://va.vercel-scripts.com https://vercel.live https://vercel.com; img-src 'self' data: https:; object-src 'none';",
}

// JWT secret (use environment variable in production)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
)

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

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
  
  // Apply appropriate security headers
  const headersToApply = isAdminRoute ? adminSecurityHeaders : securityHeaders
  Object.entries(headersToApply).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  if (isAdminRoute) {
    // 1. IP Whitelist Check for admin panel
    if (pathname === '/admin' && !isAdminIPAllowed(request)) {
      // Return 404 instead of 403 to hide admin panel existence
      return new NextResponse('Not Found', { status: 404 })
    }

    // 2. Rate Limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const identifier = clientIP
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 100 // Max 100 requests per 15 minutes
    
    const rateLimit = rateLimitStore.get(identifier) || { count: 0, resetTime: now + windowMs }
    
    if (now > rateLimit.resetTime) {
      rateLimit.count = 1
      rateLimit.resetTime = now + windowMs
    } else {
      rateLimit.count++
    }
    
    rateLimitStore.set(identifier, rateLimit)
    
    if (rateLimit.count > maxRequests) {
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
      console.log('🔐 DEBUG: Auth check for:', pathname)
      console.log('🎫 Has auth header:', !!authHeader)
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ No valid auth header')
        return new NextResponse('Unauthorized', { status: 401 })
      }
      
      const token = authHeader.substring(7)
      console.log('🔑 Token length:', token.length)
      
      try {
        // Verify JWT token
        const { payload } = await jwtVerify(token, JWT_SECRET, {
          issuer: 'cvgenius-admin',
          audience: 'cvgenius-admin-api',
        })
        
        console.log('✅ JWT verified, payload:', payload)
        
        // Check if token has admin role
        if (payload.role !== 'admin') {
          console.log('🚫 Not admin role:', payload.role)
          return new NextResponse('Forbidden', { status: 403 })
        }
        
        // Add user info to request headers for use in API routes
        requestHeaders.set('x-admin-id', String(payload.sub))
        requestHeaders.set('x-admin-email', String(payload.email))
        requestHeaders.set('x-admin-role', String(payload.role || 'admin'))
        
        console.log('✅ Headers set for:', payload.email)
        
      } catch (error) {
        console.error('JWT Verification failed:', error)
        return new NextResponse('Invalid token', { status: 401 })
      }
    }

    // 4. CSRF Protection for POST/PUT/DELETE (all admin routes except public and login-flow 2FA)
    if (['POST', 'PUT', 'DELETE'].includes(request.method) && !isPublicAdminRoute && !isLoginFlow2FA) {
      const csrfToken = request.headers.get('x-csrf-token')
      const sessionCsrf = request.cookies.get('csrf-token')?.value
      
      if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
        console.log('🚨 CSRF token validation failed:', { 
          path: pathname, 
          hasHeaderToken: !!csrfToken, 
          hasCookieToken: !!sessionCsrf,
          tokensMatch: csrfToken === sessionCsrf
        })
        return new NextResponse('CSRF token validation failed', { status: 403 })
      }
      
      // Extra validation for sensitive 2FA routes
      if (isSensitiveAdminRoute) {
        console.log('🔐 Sensitive 2FA route accessed with valid CSRF:', pathname)
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