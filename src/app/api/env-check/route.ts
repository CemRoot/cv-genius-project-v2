import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    // Check critical environment variables (without exposing values)
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      
      // Admin credentials
      HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
      
      HAS_ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
      ADMIN_USERNAME_LENGTH: process.env.ADMIN_USERNAME?.length || 0,
      ADMIN_USERNAME_VALUE: process.env.ADMIN_USERNAME, // Show for debugging
      
      HAS_ADMIN_PWD_HASH: !!process.env.ADMIN_PWD_HASH_B64,
      ADMIN_PWD_HASH_LENGTH: process.env.ADMIN_PWD_HASH_B64?.length || 0,
      
      // Security settings  
      DISABLE_IP_WHITELIST: process.env.DISABLE_IP_WHITELIST,
      HAS_ADMIN_WHITELIST: !!process.env.ADMIN_IP_WHITELIST,
      
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(envStatus)

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment variables',
      timestamp: new Date().toISOString() 
    }, { status: 500 })
  }
}

// ADD ADMIN LOGIN FUNCTIONALITY TO WORKING ENDPOINT
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Admin login via env-check endpoint')
    
    // Get request body
    const body = await request.json()
    const { username, password } = body
    
    console.log('Login attempt for username:', username)
    
    // Environment check
    const envCheck = {
      hasJWT: !!process.env.JWT_SECRET,
      hasUsername: !!process.env.ADMIN_USERNAME,
      hasPasswordHash: !!process.env.ADMIN_PWD_HASH_B64,
      nodeEnv: process.env.NODE_ENV
    }
    
    console.log('Environment check:', envCheck)
    
    // Check if all required environment variables are present
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'JWT_SECRET not configured' },
        { status: 500 }
      )
    }
    
    if (!process.env.ADMIN_USERNAME) {
      return NextResponse.json(
        { error: 'ADMIN_USERNAME not configured' },
        { status: 500 }
      )
    }
    
    if (!process.env.ADMIN_PWD_HASH_B64) {
      return NextResponse.json(
        { error: 'ADMIN_PWD_HASH_B64 not configured' },
        { status: 500 }
      )
    }
    
    // Check username
    if (username !== process.env.ADMIN_USERNAME) {
      console.log('❌ Username mismatch')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Check password using simple hash comparison
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    const expectedHashBuffer = Buffer.from(process.env.ADMIN_PWD_HASH_B64, 'base64')
    const expectedHash = expectedHashBuffer.toString()
    
    if (passwordHash !== expectedHash) {
      console.log('❌ Password hash mismatch')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    console.log('✅ Login successful via env-check endpoint')
    
    // Create simple JWT-like token (for testing)
    const token = Buffer.from(JSON.stringify({
      username,
      timestamp: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64')
    
    return NextResponse.json({
      success: true,
      message: 'Login successful via working endpoint!',
      token,
      user: { username }
    })
    
  } catch (error) {
    console.error('❌ Admin login error in env-check:', error)
    return NextResponse.json(
      { 
        error: 'Login failed',
        details: String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
// Environment variables updated Thu Jul  3 11:59:54 IST 2025
