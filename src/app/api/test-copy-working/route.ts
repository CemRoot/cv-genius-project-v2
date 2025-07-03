import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check ALL environment variables for admin functionality
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      
      // JWT Secret
      HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
      JWT_SECRET_PREVIEW: process.env.JWT_SECRET?.substring(0, 10) + '...' || 'NOT_SET',
      
      // Admin Username
      HAS_ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
      ADMIN_USERNAME_LENGTH: process.env.ADMIN_USERNAME?.length || 0,
      ADMIN_USERNAME_VALUE: process.env.ADMIN_USERNAME || 'NOT_SET',
      
      // Admin Password Hash
      HAS_ADMIN_PWD_HASH: !!process.env.ADMIN_PWD_HASH_B64,
      ADMIN_PWD_HASH_LENGTH: process.env.ADMIN_PWD_HASH_B64?.length || 0,
      ADMIN_PWD_HASH_PREVIEW: process.env.ADMIN_PWD_HASH_B64?.substring(0, 15) + '...' || 'NOT_SET',
      
      // Other environment variables
      DISABLE_IP_WHITELIST: process.env.DISABLE_IP_WHITELIST,
      HAS_ADMIN_WHITELIST: !!process.env.ADMIN_IP_WHITELIST,
      
      // Deployment info
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
      
      timestamp: new Date().toISOString(),
      endpoint: '/api/test-copy-working',
      message: 'This is a copy of the working env-check endpoint'
    }

    console.log('📊 Environment status check:', envStatus)
    
    return NextResponse.json(envStatus)
    
  } catch (error) {
    console.error('❌ Environment check error:', error)
    return NextResponse.json(
      { 
        error: 'Environment check failed',
        details: String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
} // Environment variables updated Thu Jul  3 11:59:54 IST 2025
