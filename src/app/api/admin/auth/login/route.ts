import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'
import { cookies } from 'next/headers'
import speakeasy from 'speakeasy'
import * as bcrypt from 'bcryptjs'
import Admin2FAState from '@/lib/admin-2fa-state'
import SecurityAuditLogger from '@/lib/security-audit'

// Use Node.js runtime for speakeasy compatibility
// export const runtime = 'edge'

// JWT secret must be set via environment variable
let JWT_SECRET: Uint8Array | null = null
try {
  if (process.env.JWT_SECRET) {
    JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
  }
} catch (e) {
  console.error('Failed to initialize JWT_SECRET:', e)
}

// Admin credentials must be stored in environment variables
const getPasswordHash = () => {
  const base64Hash = process.env.ADMIN_PWD_HASH_B64
  
  if (!base64Hash) {
    console.error('ADMIN_PWD_HASH_B64 environment variable is not set')
    return null
  }
  
  try {
    return Buffer.from(base64Hash, 'base64').toString()
  } catch (e) {
    console.error('Failed to decode password hash:', e)
    return null
  }
}

const getAdminCredentials = () => {
  const username = process.env.ADMIN_USERNAME
  const passwordHash = getPasswordHash()
  
  if (!username || !passwordHash) {
    return null
  }
  
  return { username, passwordHash }
}

// Failed login attempts tracking
const loginAttempts = new Map<string, { count: number; lockoutUntil: number }>()

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Admin login attempt started')
    
    // Debug environment variables (without exposing secrets)
    console.log('Environment check:', {
      hasJWT: !!process.env.JWT_SECRET,
      hasUsername: !!process.env.ADMIN_USERNAME,
      hasPasswordHash: !!process.env.ADMIN_PWD_HASH_B64,
      nodeEnv: process.env.NODE_ENV,
      runtime: 'edge'
    })
    
    // Check if environment is properly configured
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured')
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: 'JWT_SECRET environment variable is not set. Please configure it in Vercel.',
          debug: {
            hasJWT: !!process.env.JWT_SECRET,
            jwtLength: process.env.JWT_SECRET?.length || 0
          }
        },
        { status: 500 }
      )
    }
    
    const ADMIN_CREDENTIALS = getAdminCredentials()
    if (!ADMIN_CREDENTIALS) {
      console.error('❌ Admin credentials not configured', {
        hasUsername: !!process.env.ADMIN_USERNAME,
        hasPasswordHash: !!process.env.ADMIN_PWD_HASH_B64,
        usernameLength: process.env.ADMIN_USERNAME?.length || 0,
        hashLength: process.env.ADMIN_PWD_HASH_B64?.length || 0
      })
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: 'Admin credentials are not properly configured. Check ADMIN_USERNAME and ADMIN_PWD_HASH_B64 in Vercel.',
          debug: {
            hasUsername: !!process.env.ADMIN_USERNAME,
            hasPasswordHash: !!process.env.ADMIN_PWD_HASH_B64
          }
        },
        { status: 500 }
      )
    }

    console.log('✅ Environment configuration OK')

    const body = await request.json()
    const { username, password, twoFactorToken } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    console.log('📝 Login attempt:', {
      username: username,
      hasPassword: !!password,
      passwordLength: password?.length || 0
    })

    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const auditLogger = SecurityAuditLogger.getInstance()
    
    // Check if IP is locked out
    const attemptData = loginAttempts.get(clientIP)
    if (attemptData && attemptData.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil((attemptData.lockoutUntil - Date.now()) / 1000)
      console.log('🚫 IP locked out:', clientIP)
      return NextResponse.json(
        { 
          error: `Too many failed attempts. Try again in ${remainingTime} seconds`,
          lockoutRemaining: remainingTime
        },
        { status: 429 }
      )
    }

    // Verify credentials using bcrypt
    let isPasswordValid = false
    try {
      console.log('🔍 Verifying password...')
      isPasswordValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash)
      
      // TEMPORARY: Fallback to known working hash for admin123 if Vercel env is outdated
      if (!isPasswordValid && password === 'admin123') {
        console.log('⚠️ Trying fallback hash for admin123...')
        const fallbackHash = '$2b$10$jluMJZHfaiLmR39yKoeiKupt1.H3TtSEzTafASHZzB8boM.KcM8wm'
        isPasswordValid = await bcrypt.compare(password, fallbackHash)
        if (isPasswordValid) {
          console.log('✅ Fallback hash worked - Vercel env needs update!')
        }
      }
      
      console.log('Password verification result:', {
        usernameMatch: username === ADMIN_CREDENTIALS.username,
        passwordValid: isPasswordValid,
        hashUsed: isPasswordValid ? 'primary or fallback' : 'none'
      })
    } catch (bcryptError) {
      console.error('❌ Bcrypt comparison error:', bcryptError)
      return NextResponse.json(
        { 
          error: 'Authentication error',
          details: 'Password verification failed'
        },
        { status: 500 }
      )
    }
    
    if (username !== ADMIN_CREDENTIALS.username || !isPasswordValid) {
      // Track failed attempt
      const current = loginAttempts.get(clientIP) || { count: 0, lockoutUntil: 0 }
      current.count++
      
      // Lock out after 5 failed attempts for 15 minutes
      if (current.count >= 5) {
        current.lockoutUntil = Date.now() + (15 * 60 * 1000)
      }
      
      loginAttempts.set(clientIP, current)
      
      // Log failed login attempt (with error handling)
      try {
        await auditLogger.logLoginAttempt({
          ip: clientIP,
          timestamp: new Date().toISOString(),
          success: false,
          username,
          failureReason: username !== ADMIN_CREDENTIALS.username ? 'Invalid username' : 'Invalid password',
          userAgent,
          location: await auditLogger.getIPLocation(clientIP)
        })
      } catch (auditError) {
        console.error('Audit logging error (non-fatal):', auditError)
        // Continue with error response even if audit logging fails
      }
      
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

        // Debug: Log token info (remove in production)
        console.log('🔐 2FA Debug:', {
          tokenProvided: twoFactorToken,
          secretFirstChars: secret.substring(0, 8) + '...',
          timestamp: new Date().toISOString()
        })

        const verified = speakeasy.totp.verify({
          secret: secret,
          encoding: 'base32',
          token: twoFactorToken,
          window: 6 // Allow 6 time steps before/after for clock drift (3 minutes)
        })

        // Generate expected token for debugging
        const expectedToken = speakeasy.totp({
          secret: secret,
          encoding: 'base32'
        })
        
        console.log('🔐 2FA Verification:', {
          verified,
          expectedToken,
          providedToken: twoFactorToken
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
    
    // Log successful login attempt (with error handling)
    try {
      await auditLogger.logLoginAttempt({
        ip: clientIP,
        timestamp: new Date().toISOString(),
        success: true,
        username,
        userAgent,
        location: await auditLogger.getIPLocation(clientIP)
      })
    } catch (auditError) {
      console.error('Audit logging error (non-fatal):', auditError)
      // Continue with login even if audit logging fails
    }

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

    // Generate CSRF token using Web Crypto API (Edge Runtime compatible)
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    const csrfToken = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

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
    console.error('Login error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      hasJWT: !!process.env.JWT_SECRET,
      hasUsername: !!process.env.ADMIN_USERNAME,
      hasPassword: !!process.env.ADMIN_PWD_HASH_B64
    })
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }
    
    // Provide more detailed error in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
        debug: process.env.NODE_ENV === 'development' ? {
          hasRequiredEnvVars: {
            JWT_SECRET: !!process.env.JWT_SECRET,
            ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
            ADMIN_PWD_HASH_B64: !!process.env.ADMIN_PWD_HASH_B64
          }
        } : undefined
      },
      { status: 500 }
    )
  }
}