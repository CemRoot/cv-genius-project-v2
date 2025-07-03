import { NextRequest, NextResponse } from 'next/server'

// Simple test endpoint in new admin-panel path
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Admin-panel test endpoint hit')
    
    const result = {
      message: 'Admin-panel test endpoint working!',
      path: '/api/admin-panel/test',
      timestamp: new Date().toISOString(),
      runtime: 'edge',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasJWT: !!process.env.JWT_SECRET,
        hasUsername: !!process.env.ADMIN_USERNAME,
        hasPasswordHash: !!process.env.ADMIN_PWD_HASH_B64
      }
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Admin-panel test error:', error)
    return NextResponse.json({ 
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 