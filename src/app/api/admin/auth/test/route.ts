import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      environment: {
        hasJWT: !!process.env.JWT_SECRET,
        hasUsername: !!process.env.ADMIN_USERNAME,
        hasPasswordHash: !!process.env.ADMIN_PWD_HASH_B64,
        nodeEnv: process.env.NODE_ENV,
        jwtLength: process.env.JWT_SECRET?.length || 0,
        usernameValue: process.env.ADMIN_USERNAME || 'undefined',
        hashLength: process.env.ADMIN_PWD_HASH_B64?.length || 0,
        hashFirstChars: process.env.ADMIN_PWD_HASH_B64?.substring(0, 20) + '...' || 'undefined',
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('ADMIN')).join(', '),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'POST test working',
      receivedBody: body,
      environment: {
        hasJWT: !!process.env.JWT_SECRET,
        hasUsername: !!process.env.ADMIN_USERNAME,
        hasPasswordHash: !!process.env.ADMIN_PWD_HASH_B64
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}