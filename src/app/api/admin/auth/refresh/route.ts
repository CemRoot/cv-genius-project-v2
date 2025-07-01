import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'
import crypto from 'crypto'
import { cookies } from 'next/headers'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('admin-refresh-token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Verify refresh token
    const { payload } = await jose.jwtVerify(refreshToken, JWT_SECRET)

    if (payload.type !== 'refresh' || payload.sub !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Generate new access token
    const newToken = await new jose.SignJWT({
      sub: 'admin',
      role: 'admin',
      email: 'admin@cvgenius.com',
      ip: clientIP
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('cvgenius-admin')
      .setAudience('cvgenius-admin-api')
      .setExpirationTime('2h')
      .sign(JWT_SECRET)

    // Generate new CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex')

    // Update CSRF token cookie
    cookieStore.set('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60, // 2 hours
      path: '/'
    })

    return NextResponse.json({
      success: true,
      token: newToken,
      csrfToken,
      expiresIn: 7200 // 2 hours in seconds
    })

  } catch (error) {
    console.error('Token Refresh Error:', error)
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 401 }
    )
  }
}