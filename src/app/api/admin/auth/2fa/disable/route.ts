import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import Admin2FAState from '@/lib/admin-2fa-state'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, token } = body

    // Verify admin password using bcrypt (consistent with other endpoints)
    const bcrypt = require('bcryptjs')
    const adminPasswordHash = process.env.ADMIN_PWD_HASH_B64
    
    if (!adminPasswordHash) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      )
    }
    
    const decodedHash = Buffer.from(adminPasswordHash, 'base64').toString()
    const isValidPassword = await bcrypt.compare(password, decodedHash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // If 2FA is enabled, require token verification
    if (Admin2FAState.isEnabled() && Admin2FAState.getSecret()) {
      if (!token) {
        return NextResponse.json(
          { error: '2FA token required to disable 2FA' },
          { status: 400 }
        )
      }

      const verified = speakeasy.totp.verify({
        secret: Admin2FAState.getSecret()!,
        encoding: 'base32',
        token: token,
        window: 2
      })

      if (!verified) {
        return NextResponse.json(
          { error: 'Invalid 2FA token' },
          { status: 401 }
        )
      }
    }

    // Disable 2FA
    Admin2FAState.reset()

    console.log('🔓 2FA disabled for admin')

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled',
      enabled: false
    })

  } catch (error) {
    console.error('2FA Disable Error:', error)
    return NextResponse.json(
      { error: '2FA disable failed' },
      { status: 500 }
    )
  }
}