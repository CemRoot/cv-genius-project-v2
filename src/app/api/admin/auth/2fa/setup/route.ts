import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import Admin2FAState from '@/lib/admin-2fa-state'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Verify admin password using bcrypt
    const bcrypt = require('bcryptjs')
    const adminPasswordHash = process.env.ADMIN_PWD_HASH_B64
    
    if (!adminPasswordHash) {
      throw new Error('ADMIN_PWD_HASH_B64 environment variable is required')
    }
    
    const decodedHash = Buffer.from(adminPasswordHash, 'base64').toString()
    const isValidPassword = await bcrypt.compare(password, decodedHash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate secret for TOTP
    const secret = speakeasy.generateSecret({
      name: 'CV Genius Admin',
      issuer: 'CV Genius',
      length: 32
    })

    // Store secret temporarily (until verified)
    Admin2FAState.setSecret(secret.base32)

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Debug logs removed for production security

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      manualEntryKey: secret.base32,
      message: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)'
    })

  } catch (error) {
    console.error('2FA Setup Error:', error)
    return NextResponse.json(
      { error: '2FA setup failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    enabled: Admin2FAState.isEnabled(),
    hasSecret: !!Admin2FAState.getSecret()
  })
}