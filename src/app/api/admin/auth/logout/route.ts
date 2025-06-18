import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // Clear all admin-related cookies
    cookieStore.delete('admin-refresh-token')
    cookieStore.delete('csrf-token')
    
    // Log logout
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    console.log(`🔓 Admin logout from IP: ${clientIP}`)

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout Error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}