import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/gemini-client'
import { getHuggingFaceClient } from '@/lib/integrations/huggingface-client'
import { cleanPDFText } from '@/lib/pdf-text-cleaner'
import { 
  generateATSReport, 
  calculateIrishMarketRelevance,
  validateATSFormat,
  analyzeEnterpriseATSCompatibility
} from '@/lib/ats-utils'
import { validateAiApiRequest, createApiErrorResponse } from '@/lib/api-auth'

// ATS Keywords for Irish market
const ATS_KEYWORDS = {
  technical: [
    'javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'sql', 'aws', 'azure', 'git',
    'html', 'css', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'api', 'rest', 'graphql',
    'agile', 'scrum', 'ci/cd', 'devops', 'cloud', 'microservices', 'testing', 'automation'
  ],
  soft: [
    'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'creative',
    'collaborative', 'adaptable', 'organized', 'detail-oriented', 'proactive', 'innovative',
    'strategic', 'customer-focused', 'results-driven', 'time management', 'multitasking'
  ],
  irish: [
    'dublin', 'cork', 'galway', 'limerick', 'waterford', 'irish', 'ireland', 'eu citizen',
    'work permit', 'stamp 4', 'eligible to work', 'fluent english', 'irish market',
    'multinational', 'sme', 'enterprise ireland', 'ida ireland'
  ]
}

interface ATSAnalysisRequest {
  cvText: string
  jobDescription?: string
  fileName?: string
  fileSize?: number
  analysisMode?: 'basic' | 'enterprise'
  targetATS?: string
  industry?: string
}

interface KeywordAnalysis {
  total: number
  matched: number
  missing: string[]
  density: { [key: string]: number }
}

interface FormatAnalysis {
  score: number
  details: { score: number; issues: string[] }
}

interface SectionAnalysis {
  score: number
  details: {
    [key: string]: { score: number; issues: string[] }
  }
}

interface IrishMarketAnalysis {
  score: number
  foundKeywords: string[]
  suggestions: string[]
}

// Realistic ATS System Scoring based on research findings
function calculateRealisticATSScores(
  cvText: string, 
  keywordAnalysis: KeywordAnalysis, 
  formatAnalysis: FormatAnalysis, 
  structureAnalysis: SectionAnalysis, 
  industry: string,
  baseScore: number
) {
  const textLower = cvText.toLowerCase()
  
  // WORKDAY ATS - Advanced NLP & Contextual Matching
  const workdayScore = calculateWorkdayScore(cvText, keywordAnalysis, formatAnalysis, structureAnalysis, industry)
  
  // ORACLE TALEO - 4 Criteria + Boolean Logic
  const taleoScore = calculateTaleoScore(cvText, keywordAnalysis, formatAnalysis, structureAnalysis, industry)
  
  // GREENHOUSE - Tech-friendly, Smart Parsing
  const greenhouseScore = calculateGreenhouseScore(cvText, keywordAnalysis, formatAnalysis, structureAnalysis, industry)
  
  // BAMBOOHR - SME-focused, Skills-heavy
  const bamboohrScore = calculateBambooHRScore(cvText, keywordAnalysis, formatAnalysis, structureAnalysis, industry)
  
  return {
    workday: Math.round(Math.max(30, Math.min(95, workdayScore))),
    taleo: Math.round(Math.max(25, Math.min(90, taleoScore))),
    greenhouse: Math.round(Math.max(35, Math.min(98, greenhouseScore))),
    bamboohr: Math.round(Math.max(40, Math.min(92, bamboohrScore)))
  }
}

// WORKDAY ATS - Contextual NLP Analysis
function calculateWorkdayScore(cvText: string, keywords: KeywordAnalysis, format: FormatAnalysis, structure: SectionAnalysis, industry: string): number {
  let score = 0
  
  // Profile Score (0-3 stars -> 0-25 points)
  const profileKeywords = ['professional', 'experience', 'senior', 'lead', 'manager', 'specialist']
  const profileMatches = profileKeywords.filter(kw => cvText.toLowerCase().includes(kw)).length
  const profileScore = Math.min(25, (profileMatches / profileKeywords.length) * 25)
  
  // Education Score (0-3 stars -> 0-20 points)  
  const educationKeywords = ['degree', 'university', 'college', 'bachelor', 'master', 'phd', 'certification']
  const educationMatches = educationKeywords.filter(kw => cvText.toLowerCase().includes(kw)).length
  const educationScore = Math.min(20, (educationMatches / educationKeywords.length) * 20)
  
  // Experience Score (0-3 stars -> 0-30 points)
  const experienceIndicators = cvText.match(/\d+[\s-]+(years?|yrs?)\s+(of\s+)?experience/gi) || []
  const jobTitles = cvText.match(/(developer|engineer|analyst|manager|director|lead|senior)/gi) || []
  const experienceScore = Math.min(30, experienceIndicators.length * 10 + jobTitles.length * 2)
  
  // Skills Score (0-3 stars -> 0-25 points)
  const skillsScore = Math.min(25, (keywords.matched / Math.max(keywords.total, 1)) * 25)
  
  score = profileScore + educationScore + experienceScore + skillsScore
  
  // Workday bonus for clean format (they hate complex tables)
  if (format.score > 80) score += 10
  
  // Industry bonus
  if (industry === 'technology' && cvText.toLowerCase().includes('agile')) score += 5
  
  return score
}

// ORACLE TALEO - 4 Criteria System + Boolean Logic
function calculateTaleoScore(cvText: string, keywords: KeywordAnalysis, format: FormatAnalysis, structure: SectionAnalysis, industry: string): number {
  let score = 0
  
  // Taleo's 4 main criteria (Profile, Education, Experience, Skills)
  const profileScore = Math.min(22, keywords.matched * 2) // Max 22
  const educationScore = cvText.toLowerCase().includes('degree') ? 18 : 8 // Max 18
  const experienceScore = Math.min(25, (cvText.match(/\d+[\s-]+years?/gi) || []).length * 8) // Max 25
  const skillsScore = Math.min(25, (keywords.matched / Math.max(keywords.total, 1)) * 25) // Max 25
  
  score = profileScore + educationScore + experienceScore + skillsScore
  
  // Taleo penalizes complex formatting heavily
  if (format.score < 60) score *= 0.7
  
  // Boolean logic bonus for exact matches
  const exactMatches = keywords.density
  const hasExactMatches = Object.values(exactMatches).some(density => density > 0.5)
  if (hasExactMatches) score += 8
  
  return score
}

// GREENHOUSE - Tech Company Favorite
function calculateGreenhouseScore(cvText: string, keywords: KeywordAnalysis, format: FormatAnalysis, structure: SectionAnalysis, industry: string): number {
  let score = 0
  
  // Greenhouse loves tech keywords
  const techKeywords = ['python', 'javascript', 'react', 'api', 'git', 'docker', 'kubernetes', 'aws', 'ci/cd']
  const techMatches = techKeywords.filter(kw => cvText.toLowerCase().includes(kw)).length
  const techScore = Math.min(35, techMatches * 4)
  
  // Communication skills are valued
  const softSkills = ['communication', 'teamwork', 'leadership', 'agile', 'scrum', 'collaboration']
  const softMatches = softSkills.filter(kw => cvText.toLowerCase().includes(kw)).length
  const softScore = Math.min(20, softMatches * 3)
  
  // Project experience
  const projectIndicators = cvText.match(/(project|developed|built|created|implemented)/gi) || []
  const projectScore = Math.min(25, projectIndicators.length * 2)
  
  // Keyword density
  const keywordScore = Math.min(20, (keywords.matched / Math.max(keywords.total, 1)) * 20)
  
  score = techScore + softScore + projectScore + keywordScore
  
  // Greenhouse bonus for GitHub/portfolio links
  if (cvText.toLowerCase().includes('github') || cvText.toLowerCase().includes('portfolio')) score += 8
  
  // Industry-specific bonuses
  if (industry === 'technology') score += 10
  
  return score
}

// BAMBOOHR - SME & Startup Focused
function calculateBambooHRScore(cvText: string, keywords: KeywordAnalysis, format: FormatAnalysis, structure: SectionAnalysis, industry: string): number {
  let score = 0
  
  // BambooHR focuses heavily on skills and cultural fit
  const skillsScore = Math.min(40, (keywords.matched / Math.max(keywords.total, 1)) * 40)
  
  // Cultural fit indicators
  const cultureKeywords = ['team', 'collaboration', 'adaptable', 'flexible', 'startup', 'fast-paced', 'growth']
  const cultureMatches = cultureKeywords.filter(kw => cvText.toLowerCase().includes(kw)).length
  const cultureScore = Math.min(25, cultureMatches * 4)
  
  // Experience relevance
  const experienceScore = Math.min(20, keywords.matched * 1.5)
  
  // Communication & interpersonal
  const communicationWords = ['communication', 'presentation', 'client', 'customer', 'stakeholder']
  const commMatches = communicationWords.filter(kw => cvText.toLowerCase().includes(kw)).length
  const commScore = Math.min(15, commMatches * 3)
  
  score = skillsScore + cultureScore + experienceScore + commScore
  
  // BambooHR likes clean, readable formats
  if (format.score > 75) score += 5
  
  // SME bonus for Dublin location
  if (cvText.toLowerCase().includes('dublin')) score += 7
  
  return score
}

// Generate realistic ATS-specific simulation results
function generateRealisticATSSimulation(
  atsScores: { workday: number, taleo: number, greenhouse: number, bamboohr: number },
  cvText: string,
  keywords: KeywordAnalysis,
  overallScore: number
) {
  const avgScore = (atsScores.workday + atsScores.taleo + atsScores.greenhouse + atsScores.bamboohr) / 4
  const passed = avgScore >= 60
  
  // Determine which systems would likely pass/fail
  const systemResults = {
    workday: atsScores.workday >= 65 ? 'PASS' : atsScores.workday >= 45 ? 'REVIEW' : 'FAIL',
    taleo: atsScores.taleo >= 60 ? 'PASS' : atsScores.taleo >= 40 ? 'REVIEW' : 'FAIL',
    greenhouse: atsScores.greenhouse >= 70 ? 'PASS' : atsScores.greenhouse >= 50 ? 'REVIEW' : 'FAIL',
    bamboohr: atsScores.bamboohr >= 65 ? 'PASS' : atsScores.bamboohr >= 45 ? 'REVIEW' : 'FAIL'
  }
  
  // Determine processing stage based on scores
  let stage = 'initial_scan'
  if (avgScore >= 80) stage = 'final_review'
  else if (avgScore >= 65) stage = 'hiring_manager_review'  
  else if (avgScore >= 50) stage = 'keyword_screening'
  else if (avgScore >= 35) stage = 'format_parsing'
  
  // Generate ATS-specific feedback
  const feedback: string[] = []
  const nextSteps: string[] = []
  
  // Workday feedback
  if (atsScores.workday >= 70) {
    feedback.push('✅ Workday: Strong contextual keyword matching detected')
  } else if (atsScores.workday >= 45) {
    feedback.push('⚠️ Workday: Needs better contextual keyword usage')
    nextSteps.push('Add more professional context around technical keywords')
  } else {
    feedback.push('❌ Workday: Poor NLP analysis score - risk of auto-rejection')
    nextSteps.push('Critical: Rewrite with stronger contextual language')
  }
  
  // Taleo feedback  
  if (atsScores.taleo >= 60) {
    feedback.push('✅ Taleo: Meets 4-criteria scoring system requirements')
  } else {
    feedback.push('⚠️ Taleo: Failing boolean logic screening')
    nextSteps.push('Add exact keyword matches from job description')
  }
  
  // Greenhouse feedback
  if (atsScores.greenhouse >= 70) {
    feedback.push('✅ Greenhouse: Excellent tech keyword coverage')
  } else if (atsScores.greenhouse >= 50) {
    feedback.push('⚠️ Greenhouse: Tech skills visible but need strengthening')  
    nextSteps.push('Add more project details and technical achievements')
  } else {
    feedback.push('❌ Greenhouse: Insufficient tech keyword density')
    nextSteps.push('Critical: Add GitHub/portfolio links and tech projects')
  }
  
  // BambooHR feedback
  if (atsScores.bamboohr >= 65) {
    feedback.push('✅ BambooHR: Good cultural fit indicators')
  } else {
    feedback.push('⚠️ BambooHR: Needs more teamwork/collaboration emphasis')
    nextSteps.push('Highlight team projects and soft skills')
  }
  
  // Overall recommendations based on worst performer
  const worstSystem = Object.keys(atsScores).reduce((a, b) => 
    atsScores[a as keyof typeof atsScores] < atsScores[b as keyof typeof atsScores] ? a : b
  )
  
  if (worstSystem === 'workday') {
    nextSteps.push('🎯 Priority: Improve contextual language for Workday systems')
  } else if (worstSystem === 'taleo') {
    nextSteps.push('🎯 Priority: Add exact keyword matches for Taleo systems')
  } else if (worstSystem === 'greenhouse') {
    nextSteps.push('🎯 Priority: Strengthen technical content for Greenhouse')
  } else if (worstSystem === 'bamboohr') {
    nextSteps.push('🎯 Priority: Emphasize team/culture fit for BambooHR')
  }
  
  return {
    passed,
    stage,
    systemResults,
    feedback,
    nextSteps,
    worstPerformer: worstSystem,
    averageScore: Math.round(avgScore),
    riskLevel: avgScore >= 70 ? 'low' : avgScore >= 50 ? 'medium' : avgScore >= 35 ? 'high' : 'critical'
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🔍 ATS Analysis started at:', new Date().toISOString())
  
  try {
    // Get user ID for rate limiting
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const userAgent = request.headers.get('user-agent') || ''
    const isMobileRequest = /Mobile|Android|iPhone|iPad/.test(userAgent)
    console.log('📱 Request info:', { userId, isMobileRequest, userAgent: userAgent.substring(0, 50) })
    
    // Check rate limit (more lenient for mobile)
    const rateLimit = checkRateLimit(userId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }
      )
    }

    const body = await request.json()
    console.log('📝 Request body received, parsing...')
    
    const { 
      cvText, 
      jobDescription, 
      fileName, 
      fileSize, 
      analysisMode = 'basic',
      targetATS = 'workday',
      industry = 'technology'
    }: ATSAnalysisRequest = body

    console.log('📊 Analysis parameters:', { 
      cvTextLength: cvText?.length || 0, 
      hasJobDescription: !!jobDescription,
      fileName, 
      fileSize, 
      analysisMode, 
      targetATS, 
      industry 
    })

    // Validation
    if (!cvText || cvText.trim().length < 100) {
      console.log('❌ Validation failed: CV text too short')
      return NextResponse.json(
        { error: 'CV text must be at least 100 characters long' },
        { status: 400 }
      )
    }
    console.log('✅ Validation passed')

    // Standard analysis
    console.log('🔍 Starting standard analysis...')
    const keywordAnalysis = await analyzeKeywords(cvText, jobDescription)
    console.log('🔑 Keyword analysis completed:', { matched: keywordAnalysis.matched, total: keywordAnalysis.total })
    
    const structureAnalysis = analyzeSections(cvText)
    console.log('🏗️ Structure analysis completed:', { score: structureAnalysis.score })
    
    const formatAnalysis = analyzeFormat(cvText)
    console.log('📄 Format analysis completed:', { score: formatAnalysis.score })
    
    const industryAlignment = calculateIndustryAlignment(cvText, industry)
    console.log('🏢 Industry alignment calculated:', industryAlignment)

    // Try HuggingFace analysis (with fallback)
    console.log('🤖 Starting HuggingFace AI analysis...')
    let aiAnalysis = null
    try {
      const hfClient = getHuggingFaceClient()
      console.log('🔗 HuggingFace client obtained')
      aiAnalysis = await hfClient.analyzeCVForATS(cvText, jobDescription, industry)
      console.log('✅ HuggingFace analysis completed successfully')
    } catch (hfError: unknown) {
      console.error('❌ HuggingFace analysis failed:', hfError)
      if (hfError instanceof Error) {
        console.error('📋 Error details:', {
          name: hfError.name,
          message: hfError.message,
          stack: hfError.stack?.substring(0, 200)
        })
      } else {
        console.error('📋 Unknown error type:', typeof hfError)
      }
    }

    // Calculate scores
    console.log('🧮 Calculating final scores...')
    const keywordScore = Math.round((keywordAnalysis.matched / Math.max(keywordAnalysis.total, 1)) * 100) || 0
    const formatScore = Math.round(formatAnalysis.score) || 0
    const structureScore = Math.round(structureAnalysis.score) || 0
    const safeIndustryAlignment = isNaN(industryAlignment) ? 50 : industryAlignment
    console.log('📊 Individual scores:', { keywordScore, formatScore, structureScore, industryAlignment: safeIndustryAlignment })

    // Overall score calculation
    const rawOverallScore = (keywordScore + formatScore + structureScore + safeIndustryAlignment) / 4
    const overallScore = Math.max(0, Math.min(100, Math.round(rawOverallScore)))
    console.log('🎯 Overall score calculated:', { 
      raw: rawOverallScore, 
      final: overallScore, 
      components: { keywordScore, formatScore, structureScore, industryAlignment: safeIndustryAlignment }
    })

    // Build response
    const irishMarketAnalysis = calculateLocalIrishMarketRelevance(cvText)
    const suggestions = generateSuggestions(keywordAnalysis, formatAnalysis, structureAnalysis, irishMarketAnalysis, validateATSFormat(cvText))
    const warnings = generateWarnings(keywordAnalysis, formatAnalysis, structureAnalysis, validateATSFormat(cvText))
    const strengths = generateStrengths(keywordAnalysis, formatAnalysis, structureAnalysis, irishMarketAnalysis)
    
    // Calculate rejection risk
    const rejectionRisk = overallScore >= 80 ? 'low' : 
                         overallScore >= 60 ? 'medium' : 
                         overallScore >= 40 ? 'high' : 'critical'

    // Generate ATS system scores with realistic algorithms based on research
    const atsSystemScores = calculateRealisticATSScores(cvText, keywordAnalysis, formatAnalysis, structureAnalysis, industry, overallScore)

    // Generate simulation results with ATS-specific behaviors
    const simulation = generateRealisticATSSimulation(atsSystemScores, cvText, keywordAnalysis, overallScore)

    const response = {
      // Basic scores
      overallScore,
      keywordScore,
      formatScore,
      structureScore,
      sectionScore: structureScore, // For compatibility
      industryAlignment: safeIndustryAlignment,
      rejectionRisk,

      // Detailed analysis
      keywords: {
        found: Object.keys(keywordAnalysis.density).filter(k => keywordAnalysis.density[k] > 0),
        missing: keywordAnalysis.missing,
        total: keywordAnalysis.total,
        matched: keywordAnalysis.matched,
        density: Math.round((keywordAnalysis.matched / Math.max(keywordAnalysis.total, 1)) * 100)
      },

      // Section details (for UI display)
      details: structureAnalysis.details,

      structure: {
        score: structureScore,
        issues: structureAnalysis.details?.issues || [],
        suggestions: suggestions
      },

      format: {
        score: formatScore,
        issues: formatAnalysis.details?.issues || [],
        warnings: warnings
      },

      // ATS System Compatibility
      atsSystemScores,

      // Simulation results
      simulation,

      // Recommendations and feedback
      suggestions,
      recommendations: suggestions,
      strengths,
      warnings,

      // AI Analysis (if available)
      aiAnalysis: aiAnalysis ? {
        keywordAnalysis: aiAnalysis.keywordAnalysis,
        contentAnalysis: aiAnalysis.contentAnalysis,
        atsCompatibility: aiAnalysis.atsCompatibility
      } : null,

      // Report
      report: generateATSReport(
        overallScore,
        keywordAnalysis,
        formatAnalysis,
        structureAnalysis,
        suggestions,
        warnings
      )
    }

    const processingTime = Date.now() - startTime
    console.log('⏱️ Processing completed in:', processingTime + 'ms')
    console.log('✅ ATS Analysis completed successfully')

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        'X-Processing-Time': processingTime.toString(),
        'Cache-Control': isMobileRequest ? 'public, max-age=300' : 'public, max-age=600',
        'Content-Type': 'application/json'
      }
    })

  } catch (error: unknown) {
    console.error('💥 CRITICAL: ATS analysis failed completely:', error)
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    } else {
      console.error('💥 Unknown error type:', typeof error, error)
    }
    return NextResponse.json(
      { error: 'Failed to analyze CV' },
      { status: 500 }
    )
  }
}

// Helper functions (imported from existing logic)
function analyzeKeywords(cvText: string, jobDescription?: string) {
  const allKeywords = [...ATS_KEYWORDS.technical, ...ATS_KEYWORDS.soft, ...ATS_KEYWORDS.irish]
  
  let targetKeywords = allKeywords
  let jobSpecificKeywords: string[] = []
  
  if (jobDescription) {
    const jobLower = jobDescription.toLowerCase()
    
    // Instead of extracting every word, use the HuggingFace client's intelligent extraction
    console.log('🎯 Using HuggingFace intelligent keyword extraction for precise matching')
    
    // Get the HuggingFace client for intelligent keyword extraction
    const hfClient = getHuggingFaceClient()
    
    // Use the intelligent extraction method - this will only return meaningful keywords
    const meaningfulJobKeywords = hfClient.extractJobSpecificKeywords ? 
      hfClient.extractJobSpecificKeywords(jobDescription) : 
      hfClient.extractBasicSkills(jobDescription)
    
    // Also include any words from our standard keywords that appear in the job description with word boundaries
    const relevantStandardKeywords = allKeywords.filter(keyword => {
      // Use word boundary regex to avoid false positives like \"java\" in \"javascript\"
      const regex = new RegExp(`\\\\b${keyword.toLowerCase()}\\\\b`, 'i')
      return regex.test(jobLower)
    })
    
    // Combine meaningful job keywords with relevant standard keywords
    jobSpecificKeywords = [...new Set([...meaningfulJobKeywords, ...relevantStandardKeywords])]
    targetKeywords = jobSpecificKeywords
    
    console.log('✅ Extracted meaningful keywords:', jobSpecificKeywords.length)
  }
  
  const cvLower = cvText.toLowerCase()
  const matchedKeywords: { [key: string]: number } = {}
  const missingKeywords: string[] = []
  
  targetKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi')
    const matches = cvText.match(regex)
    const count = matches ? matches.length : 0
    
    if (count > 0) {
      const wordCount = cvText.split(/\s+/).length
      const density = Math.round((count / wordCount) * 1000) / 10
      matchedKeywords[keyword] = density
    } else {
      missingKeywords.push(keyword)
    }
  })
  
  console.log('📊 Keyword analysis:', {
    matched: Object.keys(matchedKeywords).length,
    missing: missingKeywords.length,
    total: targetKeywords.length
  })
  
  return {
    total: targetKeywords.length,
    matched: Object.keys(matchedKeywords).length,
    missing: missingKeywords.slice(0, 10), // Limit to 10 most relevant missing keywords
    density: matchedKeywords
  }
}

function analyzeFormat(cvText: string) {
  let score = 100
  const issues: string[] = []

  const problematicChars = /[●◆▪▫■□◦‣⁃]/g
  if (problematicChars.test(cvText)) {
    score -= 10
    issues.push('Contains special bullet characters that may not be ATS-friendly')
  }

  const htmlTags = /<[^>]*>/g
  if (htmlTags.test(cvText)) {
    score -= 15
    issues.push('Contains HTML tags or rich formatting')
  }

  if (cvText.includes('\t') || cvText.match(/\|.*\|/)) {
    score -= 10
    issues.push('May contain tables or complex formatting')
  }

  const wordCount = cvText.split(/\s+/).length
  if (wordCount < 200) {
    score -= 20
    issues.push('CV appears too short (under 200 words)')
  } else if (wordCount > 800) {
    score -= 10
    issues.push('CV may be too long for optimal ATS parsing')
  }

  const irishPhoneRegex = /(\+353|0)[1-9][0-9]{7,9}/
  if (!irishPhoneRegex.test(cvText)) {
    score -= 5
    issues.push('Irish phone number format not detected')
  }

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  if (!emailRegex.test(cvText)) {
    score -= 15
    issues.push('Email address not found')
  }

  return {
    score: Math.max(0, score),
    details: { score: Math.max(0, score), issues }
  }
}

function analyzeSections(cvText: string) {
  let totalScore = 0
  const sectionScores: { [key: string]: { score: number; issues: string[] } } = {
    contactInfo: { score: 0, issues: [] },
    experience: { score: 0, issues: [] },
    skills: { score: 0, issues: [] },
    education: { score: 0, issues: [] },
    formatting: { score: 0, issues: [] }
  }

  // Contact Information Analysis
  let contactScore = 0
  const contactIssues: string[] = []
  
  if (/@/.test(cvText)) contactScore += 30
  else contactIssues.push('Email address missing')
  
  if (/[\+]?[\d\s\-\(\)]{10,}/.test(cvText)) contactScore += 30
  else contactIssues.push('Phone number missing')
  
  if (/dublin|ireland|ie\b/i.test(cvText)) contactScore += 20
  
  if (/linkedin/i.test(cvText)) contactScore += 20
  
  sectionScores.contactInfo = { score: contactScore, issues: contactIssues }

  // Experience Analysis
  let experienceScore = 0
  const experienceIssues: string[] = []
  
  if (/experience|employment|work|career/i.test(cvText)) experienceScore += 30
  
  const datePattern = /\b(20\d{2}|19\d{2})\b|\b(present|current)\b/gi
  const dates = cvText.match(datePattern)
  if (dates && dates.length >= 2) experienceScore += 35
  else experienceIssues.push('Employment dates not clearly specified')
  
  const jobTitleIndicators = ['developer', 'engineer', 'manager', 'analyst', 'coordinator', 'specialist', 'officer', 'founder', 'ceo', 'director', 'consultant']
  if (jobTitleIndicators.some(title => cvText.toLowerCase().includes(title))) experienceScore += 35
  else experienceIssues.push('Job titles not clearly identified')
  
  sectionScores.experience = { score: experienceScore, issues: experienceIssues }

  // Skills Analysis
  let skillsScore = 0
  const skillsIssues: string[] = []
  
  if (/skills|competencies|expertise|abilities|programming|frameworks|tools/i.test(cvText)) skillsScore += 40
  
  const techSkills = ['python', 'javascript', 'java', 'html', 'css', 'sql', 'git', 'docker', 'aws', 'api']
  const foundTechSkills = techSkills.filter(skill => cvText.toLowerCase().includes(skill))
  if (foundTechSkills.length >= 5) skillsScore += 40
  else if (foundTechSkills.length >= 3) skillsScore += 25
  else skillsIssues.push('Insufficient skills listed for ATS detection')
  
  const softSkills = ['leadership', 'communication', 'team', 'management', 'problem', 'analytical']
  const foundSoftSkills = softSkills.filter(skill => cvText.toLowerCase().includes(skill))
  if (foundSoftSkills.length >= 2) skillsScore += 20
  
  sectionScores.skills = { score: skillsScore, issues: skillsIssues }

  // Education Analysis
  let educationScore = 0
  const educationIssues: string[] = []
  
  if (/education|qualifications|academic|training|university|college/i.test(cvText)) educationScore += 40
  
  const educationKeywords = ['university', 'college', 'degree', 'bachelor', 'master', 'phd', 'diploma', 'certificate']
  if (educationKeywords.some(edu => cvText.toLowerCase().includes(edu))) educationScore += 40
  else educationIssues.push('Educational qualifications not clearly specified')
  
  if (/gpa|grade|3\.|4\./i.test(cvText)) educationScore += 20
  
  sectionScores.education = { score: educationScore, issues: educationIssues }

  // Formatting Analysis
  let formattingScore = 60
  const formattingIssues: string[] = []
  
  const wordCount = cvText.split(/\s+/).length
  if (wordCount >= 200) formattingScore += 20
  else formattingIssues.push('CV appears too short (under 200 words)')
  
  if (!/dublin|ireland|irish|ie\b/i.test(cvText)) formattingIssues.push('Irish location not clearly specified')
  
  sectionScores.formatting = { score: formattingScore, issues: formattingIssues }

  totalScore = Object.values(sectionScores).reduce((sum, section) => sum + section.score, 0)

  return {
    score: Math.round(totalScore / Object.keys(sectionScores).length),
    details: sectionScores
  }
}

function calculateOverallScore(
  keywordAnalysis: KeywordAnalysis,
  formatAnalysis: FormatAnalysis,
  sectionAnalysis: SectionAnalysis,
  irishMarketAnalysis?: IrishMarketAnalysis
): number {
  const keywordScore = keywordAnalysis.total > 0 
    ? (keywordAnalysis.matched / keywordAnalysis.total) * 100 
    : 50

  const irishScore = irishMarketAnalysis?.score || 50

  const overallScore = Math.round(
    (keywordScore * 0.35) + 
    (formatAnalysis.score * 0.25) + 
    (sectionAnalysis.score * 0.25) +
    (irishScore * 0.15)
  )

  return Math.min(100, Math.max(0, overallScore))
}

function generateSuggestions(keywordAnalysis: KeywordAnalysis, formatAnalysis: FormatAnalysis, sectionAnalysis: SectionAnalysis, irishMarketAnalysis?: IrishMarketAnalysis, _formatValidation?: any): string[] {
  const suggestions: string[] = []

  if (keywordAnalysis.matched < keywordAnalysis.total * 0.6) {
    suggestions.push('Include more relevant keywords from the job description naturally in your content')
  }

  if (keywordAnalysis.missing.length > 0) {
    suggestions.push(`Consider adding these missing keywords: ${keywordAnalysis.missing.slice(0, 3).join(', ')}`)
  }

  if (formatAnalysis.score < 80) {
    suggestions.push('Use standard formatting with simple bullet points and clear section headers')
    suggestions.push('Avoid tables, graphics, and complex layouts that ATS systems cannot parse')
  }

  if (sectionAnalysis.score < 70) {
    suggestions.push('Use clear, standard section headings like "Experience", "Skills", and "Education"')
    suggestions.push('Ensure each section contains relevant, detailed information')
  }

  if (irishMarketAnalysis && irishMarketAnalysis.score < 60) {
    suggestions.push(...irishMarketAnalysis.suggestions)
  }

  suggestions.push('Include your work authorization status clearly if you are not an EU citizen')
  suggestions.push('Use Irish English spelling and terminology familiar to Irish employers')

  return suggestions
}

function generateWarnings(keywordAnalysis: KeywordAnalysis, formatAnalysis: FormatAnalysis, sectionAnalysis: SectionAnalysis, formatValidation?: any): string[] {
  const warnings: string[] = []

  if (formatAnalysis.score < 50) {
    warnings.push('CV formatting may prevent proper ATS parsing - consider simplifying layout')
  }

  if (sectionAnalysis.details.contactInfo && sectionAnalysis.details.contactInfo.score < 50) {
    warnings.push('Contact information is incomplete or not clearly formatted')
  }

  if (keywordAnalysis.matched === 0 && keywordAnalysis.total > 0) {
    warnings.push('No relevant keywords found - CV may not match job requirements')
  }

  if (sectionAnalysis.details.experience && sectionAnalysis.details.experience.score < 40) {
    warnings.push('Work experience section needs improvement for ATS compatibility')
  }

  if (formatValidation && !formatValidation.isValid) {
    warnings.push(...formatValidation.issues.slice(0, 2))
  }

  return warnings
}

function generateStrengths(keywordAnalysis: KeywordAnalysis, formatAnalysis: FormatAnalysis, sectionAnalysis: SectionAnalysis, irishMarketAnalysis?: IrishMarketAnalysis): string[] {
  const strengths: string[] = []

  if (keywordAnalysis.matched > keywordAnalysis.total * 0.7) {
    strengths.push('Excellent keyword optimization with relevant terms throughout')
  }

  if (formatAnalysis.score >= 80) {
    strengths.push('Clean, ATS-friendly formatting that systems can easily parse')
  }

  if (sectionAnalysis.score >= 80) {
    strengths.push('Well-structured with clear sections that ATS systems recognize')
  }

  if (sectionAnalysis.details.contactInfo && sectionAnalysis.details.contactInfo.score >= 80) {
    strengths.push('Complete contact information in proper format')
  }

  if (sectionAnalysis.details.skills && sectionAnalysis.details.skills.score >= 80) {
    strengths.push('Comprehensive skills section with relevant competencies')
  }

  if (irishMarketAnalysis && irishMarketAnalysis.score >= 70) {
    strengths.push('Strong optimization for the Irish job market')
  }

  return strengths
}

function calculateLocalIrishMarketRelevance(cvText: string): IrishMarketAnalysis {
  const foundKeywords: string[] = []
  let score = 0
  const cvLower = cvText.toLowerCase()
  
  // 🇮🇪 IRISH WORK AUTHORIZATION PATTERNS (Critical for ATS)
  const workAuthPatterns = [
    // STAMP Types
    { pattern: /stamp\s*1[\s|]*/, points: 25, label: 'STAMP1 (Employment permit)' },
    { pattern: /stamp\s*2[\s|]*/, points: 25, label: 'STAMP2 (Student with work rights)' },
    { pattern: /stamp\s*3[\s|]*/, points: 25, label: 'STAMP3 (Non-EEA family member)' },
    { pattern: /stamp\s*4[\s|]*/, points: 25, label: 'STAMP4 (Long-term resident)' },
    { pattern: /stamp\s*5[\s|]*/, points: 25, label: 'STAMP5 (EU Treaty Rights)' },
    { pattern: /stamp\s*6[\s|]*/, points: 25, label: 'STAMP6 (Retired/Independent)' },
    
    // EU Status
    { pattern: /eu\s+citizen/i, points: 30, label: 'EU Citizen' },
    { pattern: /eu\s+national/i, points: 30, label: 'EU National' },
    { pattern: /european\s+union/i, points: 25, label: 'European Union status' },
    { pattern: /eea\s+national/i, points: 25, label: 'EEA National' },
    { pattern: /non[\-\s]*eu/i, points: 20, label: 'Non-EU (disclosed)' },
    { pattern: /non[\-\s]*eea/i, points: 20, label: 'Non-EEA (disclosed)' },
    
    // Work Permits & Rights
    { pattern: /work\s+permit/i, points: 25, label: 'Work Permit' },
    { pattern: /employment\s+permit/i, points: 25, label: 'Employment Permit' },
    { pattern: /critical\s+skills\s+permit/i, points: 30, label: 'Critical Skills Permit' },
    { pattern: /general\s+employment\s+permit/i, points: 25, label: 'General Employment Permit' },
    { pattern: /right\s+to\s+work/i, points: 25, label: 'Right to Work' },
    { pattern: /visa\s+required/i, points: 15, label: 'Visa Required (disclosed)' },
    { pattern: /no\s+visa\s+required/i, points: 25, label: 'No Visa Required' },
    { pattern: /work\s+authorization/i, points: 20, label: 'Work Authorization' },
    { pattern: /eligible\s+to\s+work/i, points: 25, label: 'Eligible to Work' },
    
    // Irish/UK Specific
    { pattern: /irish\s+citizen/i, points: 30, label: 'Irish Citizen' },
    { pattern: /uk\s+citizen/i, points: 25, label: 'UK Citizen' },
    { pattern: /british\s+citizen/i, points: 25, label: 'British Citizen' },
    { pattern: /cta\s+rights/i, points: 25, label: 'CTA Rights' },
    { pattern: /common\s+travel\s+area/i, points: 25, label: 'Common Travel Area' }
  ]
  
  // Check work authorization patterns
  let highestAuthScore = 0
  workAuthPatterns.forEach(auth => {
    if (auth.pattern.test(cvText)) {
      foundKeywords.push(auth.label)
      highestAuthScore = Math.max(highestAuthScore, auth.points)
    }
  })
  score += highestAuthScore
  
  // 📍 IRISH LOCATION KEYWORDS
  const locationKeywords = [
    { keyword: 'dublin', points: 20, label: 'Dublin' },
    { keyword: 'cork', points: 15, label: 'Cork' },
    { keyword: 'galway', points: 15, label: 'Galway' },
    { keyword: 'limerick', points: 12, label: 'Limerick' },
    { keyword: 'waterford', points: 12, label: 'Waterford' },
    { keyword: 'ireland', points: 15, label: 'Ireland' },
    { keyword: 'irish', points: 10, label: 'Irish' },
    { keyword: 'eircode', points: 10, label: 'Eircode' }
  ]
  
  locationKeywords.forEach(loc => {
    if (cvLower.includes(loc.keyword)) {
      foundKeywords.push(loc.label)
      score += loc.points
    }
  })
  
  // 📞 IRISH CONTACT FORMATS
  // Irish phone numbers: +353 or 0, followed by area code
  if (/(\+353|0)[1-9][0-9]{7,9}/.test(cvText)) {
    score += 15
    foundKeywords.push('Irish phone format')
  }
  
  // Irish domain (.ie)
  if (/.ie\b/i.test(cvText)) {
    score += 10
    foundKeywords.push('Irish domain (.ie)')
  }
  
  // 🏢 IRISH MARKET CONTEXT
  const irishMarketTerms = [
    'revenue commissioners', 'hse', 'ida ireland', 'enterprise ireland', 
    'dáil', 'oireachtas', 'rte', 'eircom', 'aib', 'bank of ireland',
    'trinity college', 'ucd', 'dcu', 'dit', 'nuig', 'ucc'
  ]
  
  irishMarketTerms.forEach(term => {
    if (cvLower.includes(term)) {
      score += 8
      foundKeywords.push(`Irish institution: ${term}`)
    }
  })
  
  // 💡 GENERATE TARGETED SUGGESTIONS
  const suggestions = []
  
  if (highestAuthScore === 0) {
    suggestions.push('🚨 CRITICAL: Include your work authorization status (EU/Non-EU, STAMP type, or work permit)')
    suggestions.push('Irish employers MUST verify work authorization - be explicit about your status')
  }
  
  if (score < 30) {
    suggestions.push('Add Dublin location if you\'re based there (major hiring advantage)')
    suggestions.push('Include Irish contact details (phone number with +353 format)')
  }
  
  if (!cvLower.includes('dublin') && !cvLower.includes('ireland')) {
    suggestions.push('Consider adding Ireland/Dublin to location section for local relevance')
  }
  
  return {
    score: Math.min(100, score),
    foundKeywords,
    suggestions
  }
}

function calculateIndustryAlignment(cvText: string, industry: string): number {
  const industryKeywords: Record<string, string[]> = {
    technology: ['agile', 'scrum', 'git', 'api', 'cloud', 'devops', 'javascript', 'python', 'react', 'docker', 'kubernetes', 'ci/cd', 'microservices', 'testing', 'automation', 'frontend', 'backend', 'full-stack'],
    finance: ['regulatory', 'compliance', 'risk', 'audit', 'reporting', 'financial analysis', 'accounting', 'banking', 'investment', 'portfolio', 'basel', 'ifrs', 'gaap', 'tax', 'budgeting', 'forecasting', 'excel', 'sql'],
    healthcare: ['patient', 'clinical', 'healthcare', 'medical', 'safety', 'diagnosis', 'treatment', 'nursing', 'pharmaceutical', 'research', 'gdpr', 'hipaa', 'medical devices', 'quality assurance', 'regulatory affairs'],
    marketing: ['digital marketing', 'seo', 'sem', 'social media', 'content marketing', 'analytics', 'google ads', 'facebook ads', 'email marketing', 'brand management', 'campaign', 'roi', 'conversion', 'lead generation', 'marketing automation'],
    sales: ['sales', 'business development', 'account management', 'lead generation', 'crm', 'salesforce', 'pipeline', 'revenue', 'quota', 'negotiation', 'relationship building', 'client acquisition', 'territory management', 'b2b', 'b2c'],
    hr: ['recruitment', 'talent acquisition', 'hr management', 'performance management', 'employee relations', 'compensation', 'benefits', 'training', 'development', 'hris', 'payroll', 'compliance', 'diversity', 'inclusion', 'onboarding'],
    legal: ['legal', 'law', 'compliance', 'contracts', 'litigation', 'corporate law', 'commercial law', 'regulatory', 'due diligence', 'intellectual property', 'data protection', 'gdpr', 'legal research', 'case management', 'legal writing'],
    consulting: ['consulting', 'strategy', 'business analysis', 'project management', 'change management', 'process improvement', 'stakeholder management', 'business case', 'requirements gathering', 'solution design', 'implementation', 'client facing'],
    education: ['teaching', 'curriculum', 'educational technology', 'assessment', 'learning outcomes', 'pedagogy', 'research', 'academic', 'student engagement', 'classroom management', 'educational psychology', 'e-learning', 'training design'],
    engineering: ['engineering', 'design', 'cad', 'autocad', 'solidworks', 'project management', 'quality control', 'manufacturing', 'testing', 'specifications', 'technical documentation', 'problem solving', 'process optimization', 'safety standards'],
    manufacturing: ['manufacturing', 'production', 'quality control', 'lean manufacturing', 'six sigma', 'supply chain', 'inventory management', 'process improvement', 'safety', 'automation', 'operations', 'efficiency', 'cost reduction'],
    retail: ['retail', 'customer service', 'sales', 'inventory management', 'merchandising', 'store operations', 'pos systems', 'e-commerce', 'customer experience', 'visual merchandising', 'product knowledge', 'team leadership'],
    hospitality: ['hospitality', 'customer service', 'hotel management', 'food service', 'guest relations', 'event management', 'tourism', 'restaurant operations', 'reservation systems', 'quality service', 'team management', 'multitasking'],
    logistics: ['logistics', 'supply chain', 'transportation', 'warehousing', 'inventory management', 'distribution', 'shipping', 'procurement', 'vendor management', 'cost optimization', 'tracking systems', 'delivery', 'freight'],
    media: ['journalism', 'content creation', 'broadcasting', 'media production', 'editing', 'storytelling', 'digital media', 'social media', 'photography', 'video production', 'writing', 'communication', 'creative', 'multimedia'],
    research: ['research', 'data analysis', 'statistics', 'methodology', 'academic research', 'scientific research', 'publications', 'grant writing', 'data collection', 'analysis software', 'spss', 'r', 'python', 'peer review'],
    nonprofit: ['nonprofit', 'ngo', 'charity', 'fundraising', 'grant writing', 'volunteer management', 'community outreach', 'social services', 'program management', 'advocacy', 'social impact', 'stakeholder engagement'],
    government: ['public service', 'government', 'policy', 'administration', 'public administration', 'regulatory', 'compliance', 'stakeholder management', 'project management', 'public sector', 'civil service', 'government relations'],
    general: ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative', 'project management', 'time management', 'organization', 'detail oriented', 'customer service', 'sales', 'microsoft office', 'excel', 'collaboration', 'adaptability', 'initiative', 'results driven']
  }
  
  const keywords = industryKeywords[industry] || industryKeywords.general || []
  const cvLower = cvText.toLowerCase()
  
  if (keywords.length === 0) {
    console.log('⚠️ No keywords found for industry:', industry, 'defaulting to 50')
    return 50 // Default score when no industry keywords are available
  }
  
  const foundKeywords = keywords.filter(keyword => cvLower.includes(keyword.toLowerCase()))
  const alignmentScore = Math.round((foundKeywords.length / keywords.length) * 100)
  console.log('🎯 Industry alignment details:', { 
    industry, 
    totalKeywords: keywords.length, 
    foundKeywords: foundKeywords.length, 
    score: alignmentScore 
  })
  return alignmentScore
}

function extractBasicData(cvText: string): Record<string, any> {
  const emailRegex = /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g
  const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/g
  
  return {
    emails: cvText.match(emailRegex) || [],
    phones: cvText.match(phoneRegex) || [],
    wordCount: cvText.split(/\s+/).length,
    hasContactInfo: !!(cvText.match(emailRegex) && cvText.match(phoneRegex))
  }
}

// Clean up PDF extraction artifacts and reconstruct broken words
function cleanPDFExtractionArtifacts(text: string): string {
  let cleaned = text

  // Step 1: Fix common PDF extraction issues
  // Remove excessive whitespace and normalize line breaks
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  // Step 2: Fix broken words - common patterns from PDF extraction
  const brokenWordPatterns: { [key: string]: string } = {
    // Technology terms - high priority ligature fixes
    'arti fi cial': 'artificial',
    'artifi cial': 'artificial',
    'artifi cal': 'artificial',
    'arti ficial': 'artificial',
    'intel li gence': 'intelligence',
    'intel ligence': 'intelligence',
    'intelli gence': 'intelligence',
    'mach ine': 'machine',
    'learn ing': 'learning',
    'develop ment': 'development',
    'develop er': 'developer',
    'program ming': 'programming',
    'program mer': 'programmer',
    'java script': 'javascript',
    'type script': 'typescript',
    'data base': 'database',
    'front end': 'frontend',
    'back end': 'backend',
    'full stack': 'fullstack',
    'work flow': 'workflow',
    'frame work': 'framework',
    'frame works': 'frameworks',
    'micro services': 'microservices',
    'micro service': 'microservice',
    'cloud computing': 'cloud computing', // Already correct but check for breaks
    'cloud comput ing': 'cloud computing',
    'soft ware': 'software',
    'hard ware': 'hardware',
    'net work': 'network',
    'net working': 'networking',
    'cyber security': 'cybersecurity',
    'cyber secur ity': 'cybersecurity',
    
    // Business terms
    'manage ment': 'management',
    'manage r': 'manager',
    'lead ership': 'leadership',
    'commun ication': 'communication',
    'commun ications': 'communications',
    'organ ization': 'organization',
    'organ izations': 'organizations',
    'admin istration': 'administration',
    'admin istrator': 'administrator',
    'coord ination': 'coordination',
    'coord inator': 'coordinator',
    'oper ations': 'operations',
    'oper ational': 'operational',
    'strat egy': 'strategy',
    'strat egic': 'strategic',
    'project manage ment': 'project management',
    'project manager': 'project manager',
    'quality assur ance': 'quality assurance',
    'quality control': 'quality control',
    'custom er': 'customer',
    'custom ers': 'customers',
    'custom er service': 'customer service',
    
    // Education terms
    'univ ersity': 'university',
    'univ ersities': 'universities',
    'bach elor': 'bachelor',
    'mast er': 'master',
    'mast ers': 'masters',
    'doc torate': 'doctorate',
    'certif ication': 'certification',
    'certif icate': 'certificate',
    'grad uate': 'graduate',
    'grad uation': 'graduation',
    'under graduate': 'undergraduate',
    'post graduate': 'postgraduate',
    
    // Location terms (Irish context)
    'dub lin': 'dublin',
    'ire land': 'ireland',
    'cork city': 'cork',
    'gal way': 'galway',
    'limer ick': 'limerick',
    'water ford': 'waterford',
    
    // Common broken patterns
    'respon sible': 'responsible',
    'respon sibility': 'responsibility',
    'exper ience': 'experience',
    'exper ienced': 'experienced',
    'achieve ment': 'achievement',
    'achieve ments': 'achievements',
    'improve ment': 'improvement',
    'improve ments': 'improvements',
    'require ment': 'requirement',
    'require ments': 'requirements',
    'environ ment': 'environment',
    'environ mental': 'environmental',
    'profess ional': 'professional',
    'profess ionals': 'professionals',
    'intern ational': 'international',
    'nation al': 'national',
    'region al': 'regional',
    'glob al': 'global'
  }

  // Apply broken word fixes (case insensitive)
  Object.entries(brokenWordPatterns).forEach(([broken, fixed]) => {
    const regex = new RegExp('\\b' + broken.replace(/\s/g, '\\s+') + '\\b', 'gi')
    cleaned = cleaned.replace(regex, fixed)
  })

  // Step 3: Fix spacing around common punctuation
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1') // Remove space before punctuation
  cleaned = cleaned.replace(/([.,;:!?])([A-Za-z])/g, '$1 $2') // Add space after punctuation

  // Step 4: Fix email and phone number breaks
  // Email fixes: john @ example.com → john@example.com
  cleaned = cleaned.replace(/(\w+)\s*@\s*(\w+)/g, '$1@$2')
  
  // Phone number fixes: +353 1 234 5678 (this is correct, but fix weird breaks)
  cleaned = cleaned.replace(/\+\s*(\d+)\s+(\d+)/g, '+$1 $2')

  // Step 5: Fix common URL breaks
  cleaned = cleaned.replace(/https?\s*:\s*\/\s*\/\s*/g, 'https://')
  cleaned = cleaned.replace(/www\s*\.\s*/g, 'www.')

  // Step 6: Normalize multiple spaces to single spaces
  cleaned = cleaned.replace(/[ \t]+/g, ' ')
  
  // Step 7: Clean up multiple line breaks
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n')
  
  // Step 8: Apply advanced technical term reconstruction
  cleaned = reconstructTechnicalTerms(cleaned)
  
  // Step 9: Trim whitespace
  cleaned = cleaned.trim()

  return cleaned
}

// Advanced keyword reconstruction for better ATS matching
function reconstructTechnicalTerms(text: string): string {
  // Common technical term patterns that get broken in PDFs
  const technicalPatterns = [
    // AI/ML terms
    { pattern: /\b(artificial|artifi\s*cial)\s+(intelligence|intel\s*ligence)\b/gi, replacement: 'artificial intelligence' },
    { pattern: /\b(machine|mach\s*ine)\s+(learning|learn\s*ing)\b/gi, replacement: 'machine learning' },
    { pattern: /\b(deep|dee\s*p)\s+(learning|learn\s*ing)\b/gi, replacement: 'deep learning' },
    { pattern: /\b(neural|neur\s*al)\s+(network|net\s*work)\b/gi, replacement: 'neural network' },
    { pattern: /\b(natural|natur\s*al)\s+(language|lang\s*uage)\b/gi, replacement: 'natural language' },
    
    // Programming languages
    { pattern: /\b(java|jav\s*a)\s+(script|scr\s*ipt)\b/gi, replacement: 'javascript' },
    { pattern: /\b(type|typ\s*e)\s+(script|scr\s*ipt)\b/gi, replacement: 'typescript' },
    { pattern: /\b(object|obj\s*ect)\s+(oriented|ori\s*ented)\b/gi, replacement: 'object oriented' },
    
    // Frameworks & Technologies
    { pattern: /\b(react|rea\s*ct)\s+(js|j\s*s)\b/gi, replacement: 'react' },
    { pattern: /\b(node|nod\s*e)\s+(js|j\s*s)\b/gi, replacement: 'nodejs' },
    { pattern: /\b(angular|ang\s*ular)\s+(js|j\s*s)\b/gi, replacement: 'angular' },
    { pattern: /\b(vue|vu\s*e)\s+(js|j\s*s)\b/gi, replacement: 'vue' },
    
    // Cloud & DevOps
    { pattern: /\b(amazon|amaz\s*on)\s+(web|we\s*b)\s+(services|serv\s*ices)\b/gi, replacement: 'aws' },
    { pattern: /\b(microsoft|micr\s*osoft)\s+(azure|az\s*ure)\b/gi, replacement: 'azure' },
    { pattern: /\b(google|goog\s*le)\s+(cloud|clo\s*ud)\b/gi, replacement: 'google cloud' },
    { pattern: /\b(docker|dock\s*er)\s+(container|cont\s*ainer)\b/gi, replacement: 'docker container' },
    { pattern: /\b(kubernetes|kuber\s*netes)\b/gi, replacement: 'kubernetes' },
    
    // Databases
    { pattern: /\b(mongo|mong\s*o)\s+(db|d\s*b)\b/gi, replacement: 'mongodb' },
    { pattern: /\b(postgre|postgr\s*e)\s+(sql|s\s*ql)\b/gi, replacement: 'postgresql' },
    { pattern: /\b(my|m\s*y)\s+(sql|s\s*ql)\b/gi, replacement: 'mysql' },
    
    // Methodologies
    { pattern: /\b(agile|ag\s*ile)\s+(development|develop\s*ment)\b/gi, replacement: 'agile development' },
    { pattern: /\b(scrum|scr\s*um)\s+(master|mast\s*er)\b/gi, replacement: 'scrum master' },
    { pattern: /\b(test|tes\s*t)\s+(driven|driv\s*en)\b/gi, replacement: 'test driven' },
    { pattern: /\b(behavior|behav\s*ior)\s+(driven|driv\s*en)\b/gi, replacement: 'behavior driven' },
  ]

  let result = text
  technicalPatterns.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement)
  })

  return result
}

// GET endpoint for health check
export async function GET() {
  try {
    const hfClient = getHuggingFaceClient()
    const isHealthy = await hfClient.healthCheck()
    
    return NextResponse.json({
      status: 'healthy',
      service: 'ats-analyzer',
      version: '2.0',
      providers: {
        huggingface: isHealthy ? 'available' : 'degraded',
        fallback: 'available'
      },
      features: {
        basicAnalysis: true,
        enterpriseAnalysis: true,
        aiEnhanced: isHealthy,
        jobMatching: true,
        irishMarketOptimization: true
      },
      lastChecked: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'degraded',
      error: 'Partial service availability',
      providers: {
        huggingface: 'unavailable',
        fallback: 'available'
      }
    }, { status: 206 }) // Partial Content
  }
}