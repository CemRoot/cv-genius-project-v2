import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import speakeasy from 'speakeasy'
import Admin2FAState from '@/lib/admin-2fa-state'

// JWT secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
)

// Admin credentials (in production, store hashed in database)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  // Password: cvgenius2025admin (hashed with SHA-256)
  passwordHash: 'f8f403a41c6308a3b69d4d7fe1efa322be3bc6de344eb0535dd7560f79d858db'
}

// Failed login attempts tracking
const loginAttempts = new Map<string, { count: number; lockoutUntil: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, twoFactorToken } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Check if IP is locked out
    const attemptData = loginAttempts.get(clientIP)
    if (attemptData && attemptData.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((attemptData.lockoutUntil - Date.now()) / 1000)
      return NextResponse.json(
        { 
          error: `Too many failed attempts. Try again in ${remainingTime} seconds`,
          lockoutRemaining: remainingTime
        },
        { status: 429 }
      )
    }

    // Verify credentials
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    
    if (username !== ADMIN_CREDENTIALS.username || passwordHash !== ADMIN_CREDENTIALS.passwordHash) {
      // Track failed attempt
      const current = loginAttempts.get(clientIP) || { count: 0, lockoutUntil: 0 }
      current.count++
      
      // Lock out after 5 failed attempts for 15 minutes
      if (current.count >= 5) {
        current.lockoutUntil = Date.now() + (15 * 60 * 1000)
      }
      
      loginAttempts.set(clientIP, current)
      
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          attemptsRemaining: Math.max(0, 5 - current.count)
        },
        { status: 401 }
      )
    }

    // Check if 2FA is enabled
    const is2FAEnabled = Admin2FAState.isEnabled()
    
    if (is2FAEnabled && !twoFactorToken) {
      // First step passed, now require 2FA
      return NextResponse.json({
        success: false,
        require2FA: true,
        message: 'Please enter your 2FA token'
      })
    }
    
    if (twoFactorToken && is2FAEnabled) {
      // Verify 2FA token directly (avoid internal fetch issues)
      try {
        const secret = Admin2FAState.getSecret()
        
        // Debug logs removed for security
        
        if (!secret) {
          return NextResponse.json(
            { error: '2FA not set up properly' },
            { status: 401 }
          )
        }

        const verified = speakeasy.totp.verify({
          secret: secret,
          encoding: 'base32',
          token: twoFactorToken,
          window: 2 // Allow 2 time steps before/after for clock drift
        })

        if (!verified) {
          return NextResponse.json(
            { error: 'Invalid 2FA token' },
            { status: 401 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid 2FA token' },
          { status: 401 }
        )
      }
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(clientIP)

    // Generate JWT token
    const token = await new jose.SignJWT({
      sub: 'admin',
      role: 'admin',
      email: 'admin@cvgenius.com',
      ip: clientIP
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('cvgenius-admin')
      .setAudience('cvgenius-admin-api')
      .setExpirationTime('2h') // Token expires in 2 hours
      .sign(JWT_SECRET)

    // Generate refresh token
    const refreshToken = await new jose.SignJWT({
      sub: 'admin',
      type: 'refresh'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Refresh token expires in 7 days
      .sign(JWT_SECRET)

    // Generate CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex')

    // Set secure cookies
    const cookieStore = cookies()
    
    // Set refresh token as httpOnly cookie
    cookieStore.set('admin-refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Set CSRF token cookie
    cookieStore.set('csrf-token', csrfToken, {
      httpOnly: false, // Client needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60, // 2 hours
      path: '/'
    })

    // Login successful - no logs for security

    return NextResponse.json({
      success: true,
      token,
      csrfToken,
      expiresIn: 7200, // 2 hours in seconds
      user: {
        username: 'admin',
        email: 'admin@cvgenius.com',
        role: 'admin'
      },
      twoFactorEnabled: Admin2FAState.isEnabled()
    })

  } catch (error) {
    console.error('Admin Login Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}