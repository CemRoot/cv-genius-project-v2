import { NextRequest, NextResponse } from 'next/server'

// Simple test WITHOUT edge runtime
export async function GET(request: NextRequest) {
  try {
    const result = {
      message: 'Simple Node.js runtime test working!',
      timestamp: new Date().toISOString(),
      runtime: 'nodejs',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        hasJWT: !!process.env.JWT_SECRET,
        jwtLength: process.env.JWT_SECRET?.length || 0,
        hasUsername: !!process.env.ADMIN_USERNAME,
        username: process.env.ADMIN_USERNAME,
        hasPasswordHash: !!process.env.ADMIN_PWD_HASH_B64,
        passwordHashLength: process.env.ADMIN_PWD_HASH_B64?.length || 0,
        deployment: 'working'
      }
    }
    
    console.log('✅ Node.js runtime test endpoint hit:', result)
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Node.js runtime test error:', error)
    return NextResponse.json(
      { 
        error: 'Node.js test failed',
        details: String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// No edge runtime specified - use Node.js 