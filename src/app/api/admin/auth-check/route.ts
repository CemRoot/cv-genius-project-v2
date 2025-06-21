import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Basit auth kontrolü
    // Gerçek uygulamada JWT token veya session kontrolü yapılmalı
    
    const authHeader = request.headers.get('authorization')
    const sessionToken = request.cookies.get('admin-session')
    
    // Development modunda auth'u bypass et
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ authenticated: true, user: 'dev-admin' })
    }
    
    // Production'da gerçek auth kontrolü
    if (!authHeader && !sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Basit token kontrolü (gerçek uygulamada daha güvenli olmalı)
    const token = authHeader?.replace('Bearer ', '') || sessionToken?.value
    
    if (token === 'admin-session-token' || isValidAdminSession(token)) {
      return NextResponse.json({ authenticated: true, user: 'admin' })
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } catch (error) {
    console.error('Auth check failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function isValidAdminSession(token?: string): boolean {
  if (!token) return false
  
  // Basit token kontrolü - gerçek uygulamada:
  // - JWT token doğrulama
  // - Database'den session kontrolü
  // - Role kontrolü vs.
  
  return token.startsWith('admin-') && token.length > 10
}