import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/gemini-client'

export async function GET(request: NextRequest) {
  try {
    // Check if API key is configured
    const apiKeyValidation = validateApiKey()
    
    if (apiKeyValidation) {
      // API key is missing or invalid
      return NextResponse.json({
        success: false,
        hasApiKey: false,
        message: 'GEMINI_API_KEY is not configured',
        envVars: {
          GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
          NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        }
      })
    }
    
    // Try a simple test
    const { generateContent } = await import('@/lib/gemini-client')
    
    try {
      const result = await generateContent('Say "API is working" in 3 words exactly.', {
        temperature: 0.1,
        maxTokens: 10
      })
      
      return NextResponse.json({
        success: true,
        hasApiKey: true,
        testResult: result.success,
        message: result.content || 'Test completed',
        envVars: {
          GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
          NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        }
      })
    } catch (genError: any) {
      return NextResponse.json({
        success: false,
        hasApiKey: true,
        testResult: false,
        error: genError.message,
        envVars: {
          GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
          NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        }
      })
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}