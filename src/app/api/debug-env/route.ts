import { NextRequest, NextResponse } from 'next/server'

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
      ADMIN_USERNAME_VALUE: process.env.ADMIN_USERNAME, // Temporarily show for debugging
      
      HAS_ADMIN_PWD_HASH: !!process.env.ADMIN_PWD_HASH_B64,
      ADMIN_PWD_HASH_LENGTH: process.env.ADMIN_PWD_HASH_B64?.length || 0,
      
      // Security settings
      DISABLE_IP_WHITELIST: process.env.DISABLE_IP_WHITELIST,
      HAS_ADMIN_IP_WHITELIST: !!process.env.ADMIN_IP_WHITELIST,
      ADMIN_IP_WHITELIST_LENGTH: process.env.ADMIN_IP_WHITELIST?.length || 0,
      
      // 2FA
      HAS_ADMIN_2FA_SECRET: !!process.env.ADMIN_2FA_SECRET,
      
      // Vercel integration
      HAS_VERCEL_TOKEN: !!process.env.VERCEL_TOKEN,
      HAS_VERCEL_PROJECT_ID: !!process.env.VERCEL_PROJECT_ID,
      
      // All environment variables (for debugging)
      ALL_ENV_KEYS: Object.keys(process.env).filter(key => 
        key.includes('ADMIN') || 
        key.includes('JWT') || 
        key.includes('VERCEL') ||
        key.includes('NODE')
      ),
      
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(envStatus)

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment variables',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    }, { status: 500 })
  }
} 