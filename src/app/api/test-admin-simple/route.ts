import { NextRequest, NextResponse } from 'next/server'

// Simple test for admin environment variables
export async function GET(request: NextRequest) {
  try {
    const result = {
      message: 'Simple admin test working!',
      timestamp: new Date().toISOString(),
      runtime: 'edge',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        hasJWT: !!process.env.JWT_SECRET,
        jwtLength: process.env.JWT_SECRET?.length || 0,
        hasUsername: !!process.env.ADMIN_USERNAME,
        username: process.env.ADMIN_USERNAME, // Show for debugging
        hasPasswordHash: !!process.env.ADMIN_PWD_HASH_B64,
        passwordHashLength: process.env.ADMIN_PWD_HASH_B64?.length || 0,
        hasIPWhitelist: !!process.env.ADMIN_IP_WHITELIST,
        disableIPWhitelist: process.env.DISABLE_IP_WHITELIST
      }
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Simple admin test error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export const runtime = 'edge' 