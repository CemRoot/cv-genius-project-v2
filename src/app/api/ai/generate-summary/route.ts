import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit, validateApiKey } from '@/lib/gemini-client'
import { GLOBAL_PROMPTS } from '@/lib/ai/global-prompts'
import { CVData } from '@/types/cv'

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
    const { cvData, questionnaireData }: { 
      cvData: CVData
      questionnaireData?: {
        experienceYears: string
        currentRole: string
        keySkills: string
        careerGoals: string
        achievements: string
      }
    } = body

    if (!cvData) {
      return NextResponse.json(
        { error: 'CV data is required' },
        { status: 400 }
      )
    }

    // Generate professional summary using specialized prompt
    let prompt
    if (questionnaireData) {
      prompt = `You are a professional summary specialist. Generate a compelling 2-3 sentence professional summary.

User Profile:
- Experience: ${questionnaireData.experienceYears}
- Current/Target Role: ${questionnaireData.currentRole}
- Key Skills: ${questionnaireData.keySkills}
- Career Goals: ${questionnaireData.careerGoals}
- Key Achievement: ${questionnaireData.achievements}

CV Data: ${JSON.stringify(cvData)}

Requirements:
- 2-3 sentences maximum
- Focus on their specific experience and goals
- Include their key skills naturally
- Professional yet engaging tone
- British English spelling
- Mention their achievement if relevant

Write a personalized professional summary based on their answers. Return only the summary text, nothing else.`
    } else {
      prompt = GLOBAL_PROMPTS.generateProfessionalSummary(cvData)
    }
    // Generate AI response with context-aware configuration
    const result = await generateContent(prompt, {
      context: 'cvOptimization',
      maxTokens: 500
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to generate summary', details: result.error },
        { status: 500 }
      )
    }

    // Return the summary directly
    return NextResponse.json({
      success: true,
      summary: result.content?.trim() || '',
      usage: result.usage
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('Professional Summary Generation API Error:', error)
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