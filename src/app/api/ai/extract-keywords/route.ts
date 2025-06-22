import { NextRequest, NextResponse } from 'next/server'
import { generateContent, checkRateLimit, validateApiKey } from '@/lib/gemini-client'
import { GLOBAL_PROMPTS, LANGUAGE_ADAPTATIONS } from '@/lib/ai/global-prompts'
import { GLOBAL_KEYWORDS, analyzeKeywordDensity } from '@/lib/keywords/global-keywords'

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    const apiKeyError = validateApiKey()
    if (apiKeyError) {
      return apiKeyError
    }

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
    const { jobDescription, market = 'global' }: { jobDescription: string; market?: string } = body

    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: 'Job description must be at least 20 characters long' },
        { status: 400 }
      )
    }

    // Generate keyword extraction using global prompts
    const prompt = `${GLOBAL_PROMPTS.extractKeywords}

Job Description:
${jobDescription.trim()}

Target Market: ${market}`

    // Generate AI response with context-aware configuration
    const result = await generateContent(prompt, {
      context: 'keywordExtraction',
      maxTokens: 1000
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to extract keywords', details: result.error },
        { status: 500 }
      )
    }

    // Post-process with British English
    let keywordContent = result.content || ''
    keywordContent = LANGUAGE_ADAPTATIONS.toBritishEnglish(keywordContent)
    
    // Try to parse JSON response
    let keywords
    try {
      keywords = JSON.parse(keywordContent)
    } catch {
      // Fallback keyword extraction using global keyword analysis
      keywords = extractGlobalKeywords(keywordContent, jobDescription, market)
    }

    return NextResponse.json({
      success: true,
      keywords,
      usage: result.usage
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('Keyword Extraction API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractGlobalKeywords(aiResponse: string, jobDescription: string, market: string = 'global') {
  // Advanced keyword extraction using global keyword database
  const techKeywords = [
    ...GLOBAL_KEYWORDS.certifications.technology,
    ...GLOBAL_KEYWORDS.industries.technology
  ]
  
  const businessKeywords = [
    ...GLOBAL_KEYWORDS.certifications.business,
    ...GLOBAL_KEYWORDS.industries.consulting
  ]
  
  const remoteKeywords = [
    ...GLOBAL_KEYWORDS.remoteWork.arrangements,
    ...GLOBAL_KEYWORDS.remoteWork.skills
  ]
  
  const workAuthKeywords = [
    ...GLOBAL_KEYWORDS.workAuthorization.universal,
    ...GLOBAL_KEYWORDS.workAuthorization.ireland
  ]

  const jobLower = jobDescription.toLowerCase()
  const responseLower = aiResponse.toLowerCase()
  
  // Use global keyword analysis
  const keywordAnalysis = analyzeKeywordDensity(
    jobDescription,
    [...techKeywords, ...businessKeywords, ...remoteKeywords, ...workAuthKeywords],
    market
  )
  
  // Extract keywords from AI response
  const foundTech = techKeywords.filter(keyword => 
    jobLower.includes(keyword.toLowerCase()) || responseLower.includes(keyword.toLowerCase())
  )
  
  const foundBusiness = businessKeywords.filter(keyword =>
    jobLower.includes(keyword.toLowerCase()) || responseLower.includes(keyword.toLowerCase())
  )
  
  const foundRemote = remoteKeywords.filter(keyword =>
    jobLower.includes(keyword.toLowerCase()) || responseLower.includes(keyword.toLowerCase())
  )
  
  const foundAuth = workAuthKeywords.filter(keyword =>
    jobLower.includes(keyword.toLowerCase()) || responseLower.includes(keyword.toLowerCase())
  )

  // Simple importance ranking based on frequency
  const wordFrequency: Record<string, number> = {}
  const words = jobDescription.toLowerCase().match(/\b\w{3,}\b/g) || []
  
  words.forEach(word => {
    if (word.length > 3 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'own', 'run', 'she', 'too', 'use', 'why'].includes(word)) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    }
  })

  const frequentWords = Object.entries(wordFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)

  return {
    critical: foundTech.slice(0, 5),
    important: [...foundBusiness.slice(0, 3), ...foundRemote.slice(0, 2)],
    beneficial: [...foundTech.slice(5), ...foundBusiness.slice(3)],
    industrySpecific: foundTech,
    locationSpecific: foundAuth,
    qualificationKeywords: frequentWords.filter(word => 
      ['degree', 'bachelor', 'master', 'phd', 'diploma', 'certificate', 'qualification', 'certified'].includes(word)
    ),
    workAuthorization: foundAuth,
    remoteWork: foundRemote,
    frequentTerms: frequentWords,
    keywordDensity: keywordAnalysis.density,
    suggestions: keywordAnalysis.suggestions,
    globalOptimized: true,
    rawResponse: aiResponse
  }
}