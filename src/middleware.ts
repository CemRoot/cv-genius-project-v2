import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkMaintenanceMode } from './middleware/maintenance'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log(`🔧 MINIMAL MIDDLEWARE: ${pathname}`)
  
  // Evaluate maintenance mode first
  const maintenanceResponse = await checkMaintenanceMode(request)
  if (maintenanceResponse) {
    return maintenanceResponse
  }

  // Otherwise allow request to continue
  return NextResponse.next()
}

export const config = {
  // Don't match API routes, admin routes, maintenance page, or static files
  matcher: [
    '/((?!api|admin|maintenance|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ]
} 