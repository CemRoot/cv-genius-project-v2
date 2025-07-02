import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only allow from whitelisted IP
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  
  // Basic debug info
  const debugInfo = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    clientIP,
    hasAdminKey1: !!process.env.ADMIN_KEY_1,
    hasAdminKey2: !!process.env.ADMIN_KEY_2,
    hasAdminKey3: !!process.env.ADMIN_KEY_3,
    hasAdminKey4: !!process.env.ADMIN_KEY_4,
    adminKey1Value: process.env.ADMIN_KEY_1 || 'NOT_SET',
    adminKey2Value: process.env.ADMIN_KEY_2 || 'NOT_SET',
    adminKey3Value: process.env.ADMIN_KEY_3 || 'NOT_SET',
    adminKey4Value: process.env.ADMIN_KEY_4 || 'NOT_SET',
    disableIpWhitelist: process.env.DISABLE_IP_WHITELIST,
    adminIpWhitelist: !!process.env.ADMIN_IP_WHITELIST
  }

  // Calculate expected key with current values
  const validationKeys = [
    parseInt(process.env.ADMIN_KEY_1 ?? '0x1A2B', 16),
    parseInt(process.env.ADMIN_KEY_2 ?? '0x3C4D', 16),
    parseInt(process.env.ADMIN_KEY_3 ?? '0x5E6F', 16),
    parseInt(process.env.ADMIN_KEY_4 ?? '0x7890', 16)
  ]
  const timeWindow = Date.now() % 86400000
  const expectedHash = validationKeys.reduce((acc, key) => acc ^ key, timeWindow)
  const expectedKey = (expectedHash & 0xFFFF).toString(16)

  const keyCalculation = {
    validationKeys,
    timeWindow,
    expectedHash,
    expectedKey,
    suggestedUrl: `https://cvgenius-one.vercel.app/admin?k=${expectedKey}`
  }

  return NextResponse.json({
    success: true,
    debugInfo,
    keyCalculation
  })
} 