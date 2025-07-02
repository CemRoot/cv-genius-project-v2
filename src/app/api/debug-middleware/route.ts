import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries())
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    ip: {
      xForwardedFor: request.headers.get('x-forwarded-for'),
      xRealIp: request.headers.get('x-real-ip'),
      cfConnectingIp: request.headers.get('cf-connecting-ip'),
      parsed: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DISABLE_IP_WHITELIST: process.env.DISABLE_IP_WHITELIST,
      ADMIN_IP_WHITELIST: process.env.ADMIN_IP_WHITELIST,
      VERCEL_ENV: process.env.VERCEL_ENV
    },
    headers: {
      'user-agent': headers['user-agent'],
      'x-forwarded-for': headers['x-forwarded-for'],
      'x-real-ip': headers['x-real-ip'],
      'cf-connecting-ip': headers['cf-connecting-ip']
    }
  }
  
  return NextResponse.json(debugInfo, { status: 200 })
} 