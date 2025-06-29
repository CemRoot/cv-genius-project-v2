import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import speakeasy from 'speakeasy'
import bcrypt from 'bcryptjs'
import Admin2FAState from '@/lib/admin-2fa-state'
import SecurityAuditLogger from '@/lib/security-audit'

// JWT secret must be set via environment variable
const JWT_SECRET = process.env.JWT_SECRET 
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : (() => {
      throw new Error('JWT_SECRET environment variable is required')
    })()

// Admin credentials must be stored in environment variables
const getPasswordHash = () => {
  const base64Hash = process.env.ADMIN_PWD_HASH_B64
  console.log('🔑 ENV VARIABLES CHECK:', {
    hasAdminUsername: !!process.env.ADMIN_USERNAME,
    hasAdminPwdHash: !!base64Hash,
    adminUsernameValue: process.env.ADMIN_USERNAME,
    pwdHashLength: base64Hash?.length,
    nodeEnv: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET
  })
  
  if (!base64Hash) {
    console.log('❌ ADMIN_PWD_HASH_B64 missing!')
    throw new Error('ADMIN_PWD_HASH_B64 environment variable is required')
  }
  return Buffer.from(base64Hash, 'base64').toString()
}

const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || (() => {
    throw new Error('ADMIN_USERNAME environment variable is required')
  })(),
  passwordHash: getPasswordHash()
}

// Failed login attempts tracking
const loginAttempts = new Map<string, { count: number; lockoutUntil: number }>()

export async function POST(request: NextRequest) {
  try {
    // IMMEDIATE DEBUG AT START
    console.log('🔍 LOGIN ATTEMPT STARTED:', {
      url: request.nextUrl.href,
      method: request.method,
      timestamp: new Date().toISOString()
    })

    const body = await request.json()
    const { username, password, twoFactorToken } = body

    console.log('📝 REQUEST BODY RECEIVED:', {
      hasUsername: !!username,
      hasPassword: !!password,
      has2FA: !!twoFactorToken,
      usernameLength: username?.length,
      passwordLength: password?.length
    })

    if (!username || !password) {
      console.log('❌ MISSING CREDENTIALS')
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const auditLogger = SecurityAuditLogger.getInstance()
    
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

    // Verify credentials using bcrypt
    const isPasswordValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash)
    
    // TEMPORARY DEBUG
    console.log('DEBUG LOGIN:', {
      receivedUsername: username,
      expectedUsername: ADMIN_CREDENTIALS.username,
      receivedPassword: password,
      passwordHashExists: !!ADMIN_CREDENTIALS.passwordHash,
      passwordHashLength: ADMIN_CREDENTIALS.passwordHash.length,
      isPasswordValid
    })
    
    if (username !== ADMIN_CREDENTIALS.username || !isPasswordValid) {
      // Track failed attempt
      const current = loginAttempts.get(clientIP) || { count: 0, lockoutUntil: 0 }
      current.count++
      
      // Lock out after 5 failed attempts for 15 minutes
      if (current.count >= 5) {
        current.lockoutUntil = Date.now() + (15 * 60 * 1000)
      }
      
      loginAttempts.set(clientIP, current)
      
      // Log failed login attempt
      await auditLogger.logLoginAttempt({
        ip: clientIP,
        timestamp: new Date().toISOString(),
        success: false,
        username,
        failureReason: username !== ADMIN_CREDENTIALS.username ? 'Invalid username' : 'Invalid password',
        userAgent,
        location: await auditLogger.getIPLocation(clientIP)
      })
      
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
    
    // Log successful login attempt
    await auditLogger.logLoginAttempt({
      ip: clientIP,
      timestamp: new Date().toISOString(),
      success: true,
      username,
      userAgent,
      location: await auditLogger.getIPLocation(clientIP)
    })

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
    const cookieStore = await cookies()
    
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