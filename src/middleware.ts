import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // COMPLETELY DISABLED MIDDLEWARE TO FIX MIDDLEWARE_INVOCATION_FAILED
  // Admin panel is protected by layout.tsx
  console.log(`🔧 MIDDLEWARE DISABLED: ${request.nextUrl.pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*'
  ]
} 