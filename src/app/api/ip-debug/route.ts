import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries())
  
  return NextResponse.json({
    'x-forwarded-for': headers['x-forwarded-for'],
    'x-real-ip': headers['x-real-ip'],
    'cf-connecting-ip': headers['cf-connecting-ip'],
    parsed: headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown',
    headers: {
      'x-forwarded-for': headers['x-forwarded-for'],
      'x-real-ip': headers['x-real-ip'],
      'cf-connecting-ip': headers['cf-connecting-ip']
    }
  })
} 