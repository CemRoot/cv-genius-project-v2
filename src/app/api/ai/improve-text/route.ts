import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit } from '@/lib/gemini-client'

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { 
          error: 'AI service not configured', 
          message: 'Please set your GEMINI_API_KEY in .env.local file to use AI features.',
          setup: 'Get your API key from https://makersuite.google.com/app/apikey'
        },
        { status: 503 }
      )
    }

    // Get user ID for rate limiting (in production, use actual user auth)
    const userId = request.headers.get('x-user-id') || 'anonymous'
    
    // Check rate limit
    const rateLimit = checkRateLimit(userId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      )
    }

    const body = await request.json()
    const { text, type }: { text: string; type: string } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Create improvement prompt
    const prompt = `You are a professional text improvement specialist. Improve this ${type} text while preserving its original meaning and language.

Original text: "${text}"

Instructions:
- Fix grammar and spelling errors only
- Improve sentence structure and flow
- Make it more professional and clear
- DO NOT change the language or add content
- DO NOT merge words together
- Preserve the original tone and meaning
- Keep the same length approximately
- If it's in Turkish, keep it in Turkish
- If it's in English, keep it in English

Return only the improved text, nothing else.`

    // Generate AI response
    const result = await generateContent(prompt, {
      context: 'cvOptimization',
      maxTokens: 1000
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to improve text', details: result.error },
        { status: 500 }
      )
    }

    // Return the improved text
    return NextResponse.json({
      success: true,
      improvedText: result.content?.trim() || text,
      usage: result.usage
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('Text Improvement API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}