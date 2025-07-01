import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check critical environment variables
  const envVars = {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    HUGGINGFACE_API_KEY: !!process.env.HUGGINGFACE_API_KEY,
    JWT_SECRET: !!process.env.JWT_SECRET,
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    DISABLE_IP_WHITELIST: process.env.DISABLE_IP_WHITELIST,
    NODE_ENV: process.env.NODE_ENV,
  }

  // Don't expose actual values, just whether they exist
  return NextResponse.json({
    success: true,
    environment: envVars,
    timestamp: new Date().toISOString()
  })
}