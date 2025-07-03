import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Minimal middleware - don't handle admin routes at all
  console.log(`🔧 MINIMAL MIDDLEWARE: ${request.nextUrl.pathname}`)
  
  // Just pass through all requests
  return NextResponse.next()
}

export const config = {
  // Don't match admin routes at all
  matcher: [
    '/((?!api/admin|_next/static|_next/image|favicon.ico).*)',
  ]
} 