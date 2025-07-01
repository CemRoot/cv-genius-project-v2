import { NextRequest, NextResponse } from 'next/server'
import { getHuggingFaceClient } from '@/lib/integrations/huggingface-client'
import { checkRateLimit } from '@/lib/gemini-client'
import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'

interface HuggingFaceATSRequest {
  cvText: string
  jobDescription?: string
  analysisType: 'full' | 'keywords' | 'match' | 'improve'
  targetRole?: string
  options?: {
    includeKeywords?: boolean
    includeJobMatch?: boolean
    includeImprovements?: boolean
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Rate limiting with user identification
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const userAgent = request.headers.get('user-agent') || ''
    const isMobileRequest = /Mobile|Android|iPhone|iPad/.test(userAgent)

    // Check rate limit (stricter for AI model usage)
    const rateLimit = checkRateLimit(userId, 'huggingface')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for AI analysis. Please upgrade to PRO.' },
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
    const { 
      cvText, 
      jobDescription, 
      analysisType = 'full',
      targetRole = 'Software Developer',
      options = {}
    }: HuggingFaceATSRequest = body

    // Validation
    if (!cvText || cvText.trim().length < 100) {
      return NextResponse.json(
        { error: 'CV text must be at least 100 characters long' },
        { status: 400 }
      )
    }

    // Initialize Hugging Face client
    const hfClient = getHuggingFaceClient()

    // Health check for Hugging Face service
    const isHealthy = await hfClient.healthCheck()
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'AI analysis service temporarily unavailable' },
        { status: 503 }
      )
    }

    let result: any = {}

    switch (analysisType) {
      case 'full':
        result = await performFullAnalysis(hfClient, cvText, jobDescription, options, isMobileRequest)
        break
      
      case 'keywords':
        result = await performKeywordAnalysis(hfClient, cvText)
        break
      
      case 'match':
        if (!jobDescription) {
          return NextResponse.json(
            { error: 'Job description is required for match analysis' },
            { status: 400 }
          )
        }
        result = await performJobMatchAnalysis(hfClient, cvText, jobDescription)
        break
      
      case 'improve':
        result = await performImprovementAnalysis(hfClient, cvText, targetRole)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        )
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      analysisType,
      result,
      meta: {
        processingTime,
        isMobile: isMobileRequest,
        provider: 'huggingface',
        version: '2024.1'
      }
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        'X-Processing-Time': processingTime.toString(),
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Hugging Face ATS API Error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'AI service quota exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('timeout') || error.message.includes('network')) {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable. Please try again.' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'AI analysis failed. Please try again later.' },
      { status: 500 }
    )
  }
}

// Perform full AI-powered ATS analysis
async function performFullAnalysis(
  hfClient: any, 
  cvText: string, 
  jobDescription?: string, 
  options: any = {},
  isMobile: boolean = false
) {
  try {
    // For mobile, optimize by running analyses in parallel but with reduced scope
    const analysisPromises: Promise<any>[] = []

    // Core ATS analysis (always included)
    analysisPromises.push(hfClient.analyzeCVForATS(cvText, jobDescription))

    // Optional analyses based on options and device type
    if (options.includeKeywords !== false && (!isMobile || cvText.length < 3000)) {
      analysisPromises.push(hfClient.extractKeywords(cvText))
    }

    if (options.includeJobMatch && jobDescription && (!isMobile || cvText.length < 2000)) {
      analysisPromises.push(hfClient.checkJobMatch(cvText, jobDescription))
    }

    if (options.includeImprovements && !isMobile) {
      // Skip improvements on mobile to save processing time
      analysisPromises.push(hfClient.improveCVContent(cvText, 'Software Developer'))
    }

    const results = await Promise.allSettled(analysisPromises)

    // Process results
    const analysis: any = {
      coreAnalysis: null,
      keywordAnalysis: null,
      jobMatch: null,
      improvements: null,
      errors: []
    }

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        switch (index) {
          case 0:
            analysis.coreAnalysis = result.value
            break
          case 1:
            if (options.includeKeywords !== false) {
              analysis.keywordAnalysis = result.value
            }
            break
          case 2:
            if (options.includeJobMatch && jobDescription) {
              analysis.jobMatch = result.value
            }
            break
          case 3:
            if (options.includeImprovements && !isMobile) {
              analysis.improvements = result.value
            }
            break
        }
      } else {
        analysis.errors.push(`Analysis ${index} failed: ${result.reason}`)
      }
    })

    return analysis
  } catch (error) {
    console.error('Full analysis error:', error)
    throw new Error('Failed to complete full AI analysis')
  }
}

// Perform keyword-focused analysis
async function performKeywordAnalysis(hfClient: any, cvText: string) {
  try {
    const keywordData = await hfClient.extractKeywords(cvText)
    
    return {
      keywords: keywordData.keywords || [],
      scores: keywordData.scores || [],
      categories: keywordData.categories || {},
      summary: {
        totalKeywords: keywordData.keywords?.length || 0,
        averageScore: keywordData.scores?.reduce((a: number, b: number) => a + b, 0) / (keywordData.scores?.length || 1),
        strongKeywords: keywordData.keywords?.filter((_, i) => (keywordData.scores?.[i] || 0) > 0.7) || [],
        suggestions: [
          'Add more industry-specific terms',
          'Include technical skills relevant to your field',
          'Use action verbs to describe achievements'
        ]
      }
    }
  } catch (error) {
    console.error('Keyword analysis error:', error)
    throw new Error('Failed to analyze keywords')
  }
}

// Perform job matching analysis
async function performJobMatchAnalysis(hfClient: any, cvText: string, jobDescription: string) {
  try {
    const matchData = await hfClient.checkJobMatch(cvText, jobDescription)
    
    return {
      ...matchData,
      analysis: {
        overallFit: matchData.matchScore > 80 ? 'Excellent' : 
                   matchData.matchScore > 60 ? 'Good' : 
                   matchData.matchScore > 40 ? 'Fair' : 'Poor',
        keyStrengths: matchData.matchedSkills?.slice(0, 5) || [],
        improvementAreas: matchData.missingSkills?.slice(0, 5) || [],
        confidenceLevel: matchData.matchScore > 70 ? 'High' : 
                        matchData.matchScore > 50 ? 'Medium' : 'Low'
      }
    }
  } catch (error) {
    console.error('Job match analysis error:', error)
    throw new Error('Failed to analyze job match')
  }
}

// Perform improvement analysis
async function performImprovementAnalysis(hfClient: any, cvText: string, targetRole: string) {
  try {
    const improvementData = await hfClient.improveCVContent(cvText, targetRole)
    
    return {
      ...improvementData,
      prioritizedSuggestions: {
        critical: improvementData.suggestions?.filter((s: string) => 
          s.toLowerCase().includes('missing') || s.toLowerCase().includes('required')
        ) || [],
        important: improvementData.suggestions?.filter((s: string) => 
          s.toLowerCase().includes('improve') || s.toLowerCase().includes('enhance')
        ) || [],
        optional: improvementData.suggestions?.filter((s: string) => 
          s.toLowerCase().includes('consider') || s.toLowerCase().includes('could')
        ) || []
      },
      implementationGuide: {
        quickWins: ['Update contact information', 'Add relevant keywords', 'Use action verbs'],
        mediumEffort: ['Reorganize sections', 'Quantify achievements', 'Tailor content'],
        longTerm: ['Gain additional skills', 'Pursue certifications', 'Build portfolio']
      }
    }
  } catch (error) {
    console.error('Improvement analysis error:', error)
    throw new Error('Failed to generate improvement suggestions')
  }
}

// GET endpoint for service status
export async function GET() {
  try {
    const hfClient = getHuggingFaceClient()
    const isHealthy = await hfClient.healthCheck()
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'huggingface-ats',
      version: '2024.1',
      features: {
        fullAnalysis: true,
        keywordExtraction: true,
        jobMatching: true,
        improvementSuggestions: true
      },
      lastChecked: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: 'Service unavailable'
    }, { status: 503 })
  }
}