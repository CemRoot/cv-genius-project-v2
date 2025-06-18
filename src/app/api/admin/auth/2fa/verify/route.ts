import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import Admin2FAState from '@/lib/admin-2fa-state'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, action = 'verify' } = body

    if (!token || token.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid 2FA token format' },
        { status: 400 }
      )
    }

    const secret = Admin2FAState.getSecret()
    if (!secret) {
      return NextResponse.json(
        { error: '2FA not set up. Please set up 2FA first.' },
        { status: 400 }
      )
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps before/after for clock drift
    })

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid 2FA token' },
        { status: 401 }
      )
    }

    if (action === 'setup') {
      // Enable 2FA after successful verification
      Admin2FAState.setEnabled(true)
      
      return NextResponse.json({
        success: true,
        message: '2FA has been successfully enabled for your account',
        enabled: true
      })
    }

    // Regular verification for login
    return NextResponse.json({
      success: true,
      message: '2FA verification successful'
    })

  } catch (error) {
    console.error('2FA Verification Error:', error)
    return NextResponse.json(
      { error: '2FA verification failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    enabled: Admin2FAState.isEnabled()
  })
}