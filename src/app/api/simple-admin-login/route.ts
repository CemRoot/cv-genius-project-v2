import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Simple admin login WITHOUT edge runtime
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Simple admin login attempt started')
    
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
    
    console.log('✅ Login successful')
    
    // Create simple JWT-like token (for testing)
    const token = Buffer.from(JSON.stringify({
      username,
      timestamp: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64')
    
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { username }
    })
    
  } catch (error) {
    console.error('❌ Simple admin login error:', error)
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

// Node.js runtime (no edge) 