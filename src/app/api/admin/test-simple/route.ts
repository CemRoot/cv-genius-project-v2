import { NextRequest, NextResponse } from 'next/server'

// Simple edge runtime endpoint for testing
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Simple admin test endpoint hit')
    
    const result = {
      message: 'Admin test endpoint working!',
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
    console.error('❌ Simple admin test error:', error)
    return NextResponse.json({ 
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      message: 'POST test successful',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'POST test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 