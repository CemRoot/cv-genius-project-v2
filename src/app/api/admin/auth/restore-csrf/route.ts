import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import * as jose from 'jose'

// JWT secret
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No valid authorization token' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    
    // Verify JWT token
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
        issuer: 'cvgenius-admin',
        audience: 'cvgenius-admin-api',
      })
      
      // Check if token has admin role
      if (payload.role !== 'admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      
      // Generate new CSRF token
      const csrfToken = crypto.randomBytes(32).toString('hex')
      
      // Set CSRF token cookie
      const cookieStore = await cookies()
      cookieStore.set('csrf-token', csrfToken, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60, // 2 hours (same as JWT)
        path: '/'
      })
      
      console.log('✅ CSRF token restored for admin session')
      
      return NextResponse.json({
        success: true,
        csrfToken,
        message: 'CSRF token restored successfully'
      })
      
    } catch (jwtError) {
      console.error('JWT verification failed in CSRF restore:', jwtError)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
  } catch (error) {
    console.error('CSRF restore error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 