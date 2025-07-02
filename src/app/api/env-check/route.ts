import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    VERCEL_ENV: process.env.VERCEL_ENV || 'undefined',
    DISABLE_IP_WHITELIST: process.env.DISABLE_IP_WHITELIST || 'undefined',
    HAS_ADMIN_WHITELIST: !!process.env.ADMIN_IP_WHITELIST,
    timestamp: new Date().toISOString()
  })
} 