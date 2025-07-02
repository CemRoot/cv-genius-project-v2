import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Only check admin routes
  if (pathname === '/admin' || pathname.startsWith('/api/admin/')) {
    // Get client IP
    const xForwardedFor = request.headers.get('x-forwarded-for')
    const clientIP = xForwardedFor?.split(',')[0]?.trim() || 'unknown'
    
    console.log(`🔒 SIMPLE MIDDLEWARE: ${pathname} | IP: ${clientIP}`)
    
    // Simple whitelist - only allow your IP
    const allowedIPs = ['86.41.242.48']
    
    if (!allowedIPs.includes(clientIP)) {
      console.log(`🚫 BLOCKED: ${clientIP} not in whitelist`)
      
      if (pathname === '/admin') {
        return new NextResponse(`
<!DOCTYPE html>
<html>
<head><title>Access Denied</title></head>
<body>
  <h1>🛡️ Access Denied</h1>
  <p>Your IP: ${clientIP}</p>
  <p>Only authorized IPs can access this area.</p>
  <a href="/">Go Home</a>
</body>
</html>`, {
          status: 403,
          headers: { 'Content-Type': 'text/html' }
        })
      }
      
      // For API routes
      return new NextResponse('Access Denied', { status: 403 })
    }
    
    console.log(`✅ ALLOWED: ${clientIP}`)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/api/admin/:path*']
} 