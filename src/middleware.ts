import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log(`🔧 MINIMAL MIDDLEWARE: ${pathname}`)
  
  // Just pass through all requests
  // Maintenance mode will be handled client-side
  return NextResponse.next()
}

export const config = {
  // Don't match API routes, admin routes, maintenance page, or static files
  matcher: [
    '/((?!api|admin|maintenance|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ]
} 