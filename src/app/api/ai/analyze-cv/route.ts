import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit, validateApiKey } from '@/lib/gemini-client'
import { GLOBAL_PROMPTS, LANGUAGE_ADAPTATIONS } from '@/lib/ai/global-prompts'
import { CVData } from '@/types/cv'
import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    const apiKeyError = validateApiKey()
    if (apiKeyError) {
      return apiKeyError
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
    const { cvData, targetRole }: { cvData: CVData; targetRole?: string } = body

    if (!cvData) {
      return NextResponse.json(
        { error: 'CV data is required' },
        { status: 400 }
      )
    }

    // Generate CV analysis using global prompts
    const prompt = GLOBAL_PROMPTS.analyzeCv(cvData)

    // Generate AI response with context-aware configuration
    const result = await generateContent(prompt, {
      context: 'cvAnalysis',
      maxTokens: 2048
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to analyze CV', details: result.error },
        { status: 500 }
      )
    }

    // Post-process the analysis with British English
    let analysisContent = result.content || ''
    analysisContent = LANGUAGE_ADAPTATIONS.toBritishEnglish(analysisContent)
    
    // Try to parse JSON response, fallback to text if needed
    let analysis
    try {
      analysis = JSON.parse(analysisContent)
    } catch {
      // If JSON parsing fails, return structured text response
      analysis = {
        rawResponse: analysisContent,
        overallScore: 75, // Default score for global analysis
        feedback: analysisContent
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      usage: result.usage
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('CV Analysis API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
      },
      { status: 500 }
    )
  }
}