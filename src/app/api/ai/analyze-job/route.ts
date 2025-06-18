import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit } from '@/lib/gemini-client'
import { GLOBAL_PROMPTS, LANGUAGE_ADAPTATIONS } from '@/lib/ai/global-prompts'

export async function POST(request: NextRequest) {
  try {
    // Get user ID for rate limiting
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
    const { jobDescription }: { jobDescription: string } = body

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Job description must be at least 50 characters long' },
        { status: 400 }
      )
    }

    // Generate job analysis using global prompts
    const prompt = `${GLOBAL_PROMPTS.analyzeJob}

Job Description:
${jobDescription.trim()}`

    // Generate AI response with context-aware configuration
    const result = await generateContent(prompt, {
      context: 'jobAnalysis',
      maxTokens: 1500
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to analyze job description', details: result.error },
        { status: 500 }
      )
    }

    // Post-process the analysis with British English
    let analysisContent = result.content || ''
    analysisContent = LANGUAGE_ADAPTATIONS.toBritishEnglish(analysisContent)
    
    // Try to parse JSON response
    let analysis
    try {
      analysis = JSON.parse(analysisContent)
    } catch {
      // Fallback parsing for non-JSON responses
      analysis = parseJobAnalysisText(analysisContent)
      analysis.globalOptimized = true
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
    console.error('Job Analysis API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function parseJobAnalysisText(text: string) {
  // Fallback text parsing if JSON parsing fails
  const lines = text.split('\n').filter(line => line.trim())
  
  const analysis = {
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    experienceLevel: 'Not specified',
    keyResponsibilities: [] as string[],
    companyInfo: 'Not specified',
    salaryRange: 'Not specified',
    keywords: [] as string[],
    rawResponse: text,
    globalOptimized: false
  }

  // Simple text parsing - in production, you'd want more sophisticated parsing
  let currentSection = ''
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.includes('required') || lowerLine.includes('must have')) {
      currentSection = 'required'
      continue
    }
    if (lowerLine.includes('preferred') || lowerLine.includes('nice to have')) {
      currentSection = 'preferred'
      continue
    }
    if (lowerLine.includes('responsibilities') || lowerLine.includes('duties')) {
      currentSection = 'responsibilities'
      continue
    }
    if (lowerLine.includes('experience') && lowerLine.includes('year')) {
      analysis.experienceLevel = line.trim()
      continue
    }
    if (lowerLine.includes('salary') || lowerLine.includes('€') || lowerLine.includes('euro')) {
      analysis.salaryRange = line.trim()
      continue
    }
    
    // Extract items based on current section
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const item = line.trim().substring(1).trim()
      
      switch (currentSection) {
        case 'required':
          analysis.requiredSkills.push(item)
          analysis.keywords.push(item)
          break
        case 'preferred':
          analysis.preferredSkills.push(item)
          analysis.keywords.push(item)
          break
        case 'responsibilities':
          analysis.keyResponsibilities.push(item)
          break
      }
    }
  }

  return analysis
}