import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit, validateApiKey } from '@/lib/gemini-client'
import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'

// Configuration for AI processing
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // 30 seconds timeout
export const preferredRegion = 'auto'

const ANALYSIS_PROMPT = `
Analyze the following job description and extract:
1. Company Name (if mentioned)
2. Job Title/Role
3. Location (if mentioned)
4. If posted by recruitment agency (check for "our client", "my client", "the client")

Return ONLY a JSON object with this exact format:
{
  "company": "Company Name" or null,
  "role": "Job Title" or null,
  "location": "Location" or null,
  "isRecruitmentAgency": true/false,
  "confidence": {
    "company": 0-100,
    "role": 0-100,
    "location": 0-100
  }
}

Important rules:
- If you see "our client", "my client", "the client" followed by description, set company to null and isRecruitmentAgency to true
- For role, extract the EXACT job title (e.g., "Senior Python (AI) Developer: Generative AI Projects" → "Senior Python (AI) Developer")
- For location, extract specific locations (e.g., "Remote: Europe" → "Europe", "Dublin, Ireland" → "Dublin, Ireland")
- Confidence score: 100 = explicitly stated, 50 = inferred, 0 = not found
- Do NOT guess company names from industry descriptions
- Return valid JSON only, no explanation

Examples:
- "Our client, a global leader..." → company: null, isRecruitmentAgency: true
- "Join Microsoft as..." → company: "Microsoft", isRecruitmentAgency: false
- "Senior Python (AI) Developer: Generative AI Projects" → role: "Senior Python (AI) Developer"

Job Description:
`

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const apiKeyError = validateApiKey()
    if (apiKeyError) {
      return apiKeyError
    }

    // Rate limiting
    const userId = request.headers.get('x-user-id') || 'anonymous'
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

    const { jobDescription } = await request.json()

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Job description is required' },
        { status: 400 }
      )
    }

    // Analyze with AI
    const prompt = ANALYSIS_PROMPT + jobDescription
    
    const result = await generateContent(prompt, {
      context: 'jobAnalysis',
      temperature: 0.3, // Lower temperature for more consistent extraction
      maxTokens: 500
    })

    if (!result.success || !result.content) {
      throw new Error('Failed to analyze job description')
    }

    // Parse the JSON response
    let parsedResult
    try {
      // Clean up the response to ensure valid JSON
      const cleanedContent = result.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      parsedResult = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', result.content)
      throw new Error('Invalid response format from AI')
    }

    // Validate the response structure
    const validatedResult = {
      company: parsedResult.company || null,
      role: parsedResult.role || null,
      location: parsedResult.location || null,
      isRecruitmentAgency: parsedResult.isRecruitmentAgency || false,
      confidence: {
        company: parsedResult.confidence?.company || 0,
        role: parsedResult.confidence?.role || 0,
        location: parsedResult.confidence?.location || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: validatedResult
    })

  } catch (error) {
    console.error('Job description analysis error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze job description'
      },
      { status: 500 }
    )
  }
}