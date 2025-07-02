import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import IPWhitelistManager from '@/lib/ip-whitelist'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  console.log(`🔧 MIDDLEWARE CHECK: ${pathname}`)
  
  // Admin routes are now protected by layout.tsx
  // Only handle admin API routes if needed
  if (pathname.startsWith('/api/admin/')) {
    // Get client IP
    const xForwardedFor = request.headers.get('x-forwarded-for')
    const xRealIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    const clientIP = xForwardedFor?.split(',')[0]?.trim() || 
                     xRealIP || 
                     cfConnectingIP || 
                     'unknown'
    
    console.log(`🔒 ADMIN API: ${pathname} | IP: ${clientIP}`)
    
    // Use the proper IP whitelist manager
    const isAllowed = IPWhitelistManager.isIPAllowed(clientIP)
    const allowedIPs = IPWhitelistManager.getActiveIPs()
    
    if (!isAllowed) {
      console.log(`🚫 BLOCKED API: ${clientIP} not in whitelist (Active IPs: ${allowedIPs.join(', ')})`)
      return NextResponse.json({ 
        error: 'Access Denied',
        ip: clientIP,
        allowedIPs: allowedIPs.length
      }, { status: 403 })
    }
    
    console.log(`✅ ALLOWED API: ${clientIP} (Active IPs: ${allowedIPs.join(', ')})`)
  }
  
  // Always return next for all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*'
  ]
} 