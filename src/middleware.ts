import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  console.log(`🔧 MIDDLEWARE CHECK: ${pathname}`)
  
  // Admin routes are now protected by layout.tsx
  // Only handle admin API routes if needed
  if (pathname.startsWith('/api/admin/')) {
    // Get client IP
    const xForwardedFor = request.headers.get('x-forwarded-for')
    const clientIP = xForwardedFor?.split(',')[0]?.trim() || 'unknown'
    
    console.log(`🔒 ADMIN API: ${pathname} | IP: ${clientIP}`)
    
    // Simple whitelist - only allow your IP
    const allowedIPs = ['86.41.242.48']
    
    if (!allowedIPs.includes(clientIP)) {
      console.log(`🚫 BLOCKED API: ${clientIP} not in whitelist`)
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
    }
    
    console.log(`✅ ALLOWED API: ${clientIP}`)
  }
  
  // Always return next for all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*'
  ]
} 