import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get client IP for debugging
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  let clientIP = 'unknown'
  if (xForwardedFor) {
    clientIP = xForwardedFor.split(',')[0].trim()
  } else if (cfConnectingIp) {
    clientIP = cfConnectingIp.trim()
  } else if (xRealIp) {
    clientIP = xRealIp.trim()
  }

  // Check critical environment variables
  const envVars = {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    HUGGINGFACE_API_KEY: !!process.env.HUGGINGFACE_API_KEY,
    JWT_SECRET: !!process.env.JWT_SECRET,
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    DISABLE_IP_WHITELIST: process.env.DISABLE_IP_WHITELIST,
    ADMIN_IP_WHITELIST: process.env.ADMIN_IP_WHITELIST ? '***SET***' : null,
    NODE_ENV: process.env.NODE_ENV,
  }

  // Don't expose actual values, just whether they exist
  return NextResponse.json({
    success: true,
    environment: envVars,
    clientIP: clientIP,
    ipHeaders: {
      'x-forwarded-for': xForwardedFor,
      'cf-connecting-ip': cfConnectingIp,
      'x-real-ip': xRealIp
    },
    timestamp: new Date().toISOString()
  })
}