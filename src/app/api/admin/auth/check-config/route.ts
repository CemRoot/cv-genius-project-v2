import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only allow in development or with a special header
  const debugKey = request.headers.get('x-debug-key')
  if (process.env.NODE_ENV === 'production' && debugKey !== process.env.DEBUG_KEY) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const hasJwtSecret = !!process.env.JWT_SECRET
  const hasAdminUsername = !!process.env.ADMIN_USERNAME
  const hasAdminPwdHash = !!process.env.ADMIN_PWD_HASH_B64
  
  // Try to decode the password hash
  let hashDecodable = false
  if (hasAdminPwdHash) {
    try {
      const decoded = Buffer.from(process.env.ADMIN_PWD_HASH_B64!, 'base64').toString()
      hashDecodable = decoded.startsWith('$2')  // bcrypt hashes start with $2
    } catch (e) {
      hashDecodable = false
    }
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    config: {
      jwt_secret: hasJwtSecret ? 'SET' : 'MISSING',
      admin_username: hasAdminUsername ? 'SET' : 'MISSING',
      admin_pwd_hash: hasAdminPwdHash ? 'SET' : 'MISSING',
      hash_format_valid: hashDecodable ? 'VALID' : 'INVALID',
    },
    message: 'Check your Vercel environment variables'
  })
}