import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/gemini-client'
import { 
  analyzeFileFormat, 
  generateATSReport, 
  calculateIrishMarketRelevance,
  validateATSFormat,
  analyzeEnterpriseATSCompatibility
} from '@/lib/ats-utils'
// import { HuggingFaceATSClient } from '@/lib/integrations/huggingface-client' // AI integration coming soon

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

// Common section headers that ATS systems look for
const ATS_SECTIONS = {
  contact: ['contact', 'personal', 'details', 'information'],
  experience: ['experience', 'employment', 'work', 'career', 'professional'],
  skills: ['skills', 'technical', 'competencies', 'expertise', 'abilities'],
  education: ['education', 'qualifications', 'academic', 'training', 'certifications']
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

interface FormatValidation {
  isValid: boolean
  issues: string[]
  recommendations: string[]
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get user ID for rate limiting
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const userAgent = request.headers.get('user-agent') || ''
    const isMobileRequest = /Mobile|Android|iPhone|iPad/.test(userAgent)
    
    // Check rate limit (more lenient for mobile)
    const rateLimit = checkRateLimit(userId, isMobileRequest ? 'mobile' : 'desktop')
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
    const { 
      cvText, 
      jobDescription, 
      fileName, 
      fileSize, 
      analysisMode = 'basic',
      targetATS = 'workday',
      industry = 'technology'
    }: ATSAnalysisRequest = body

    // Validation
    if (!cvText || cvText.trim().length < 100) {
      return NextResponse.json(
        { error: 'CV text must be at least 100 characters long' },
        { status: 400 }
      )
    }

    // Analyze the CV with mobile optimizations
    const analysis = await analyzeATSCompatibility(
      cvText, 
      jobDescription, 
      fileName, 
      fileSize, 
      analysisMode,
      targetATS,
      industry,
      isMobileRequest
    )

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      analysis,
      meta: {
        processingTime,
        isMobile: isMobileRequest,
        version: '2.0'
      }
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        'X-Processing-Time': processingTime.toString(),
        'Cache-Control': isMobileRequest ? 'public, max-age=300' : 'public, max-age=600',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('ATS Analysis API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function analyzeATSCompatibility(
  cvText: string, 
  jobDescription?: string, 
  fileName?: string, 
  fileSize?: number,
  analysisMode: 'basic' | 'enterprise' = 'basic',
  targetATS: string = 'workday',
  industry: string = 'technology',
  isMobile: boolean = false
) {
  // Use enhanced analysis for all modes (much better than previous version)
      return await enhancedSmartAnalysis(cvText, jobDescription, targetATS, industry, analysisMode, isMobile, fileName, fileSize)
}

async function enhancedSmartAnalysis(
  cvText: string,
  jobDescription?: string,
  targetATS: string = 'workday',
  industry: string = 'technology',
  analysisMode: 'basic' | 'enterprise' = 'basic',
  isMobile: boolean = false,
  fileName?: string,
  fileSize?: number
) {
  // Enhanced analysis that works with any CV format
  const keywordAnalysis = analyzeKeywords(cvText, jobDescription || '')
  const formatAnalysis = analyzeFormat(cvText)
  const sectionAnalysis = analyzeSections(cvText)
  
  // File Format Analysis
  const fileFormatAnalysis = null // Will be added when fileName is available
  
  // Irish Market Relevance
  const irishMarketAnalysis = calculateIrishMarketRelevance(cvText)
  
  // 6. Format Validation
  const formatValidation = validateATSFormat(cvText)
  
  // 7. Calculate overall score
  const overallScore = calculateOverallScore(keywordAnalysis, formatAnalysis, sectionAnalysis, irishMarketAnalysis)
  
  // 8. Generate suggestions and warnings
  const suggestions = generateSuggestions(keywordAnalysis, formatAnalysis, sectionAnalysis, irishMarketAnalysis, formatValidation)
  const warnings = generateWarnings(keywordAnalysis, formatAnalysis, sectionAnalysis, formatValidation, fileFormatAnalysis || undefined)
  const strengths = generateStrengths(keywordAnalysis, formatAnalysis, sectionAnalysis, irishMarketAnalysis)
  
  // 9. Generate comprehensive report
  const report = generateATSReport(overallScore, keywordAnalysis, formatAnalysis, sectionAnalysis, suggestions, warnings)

  // 10. Enterprise Analysis Features (optimized for mobile)
  let enterpriseFeatures = {}
  if (analysisMode === 'enterprise') {
    try {
      // Mobile optimization: Skip heavy analysis if on mobile and CV is large
      if (isMobile && cvText.length > 5000) {
        // Simplified enterprise analysis for mobile
        const basicAnalysis = {
          atsSystemScores: {
            workday: Math.round(overallScore * 0.95),
            taleo: Math.round(overallScore * 0.90),
            greenhouse: Math.round(overallScore),
            bamboohr: Math.round(overallScore * 1.05)
          },
          rejectionRisk: overallScore >= 70 ? 'low' : overallScore >= 50 ? 'medium' : 'high' as const,
          industryAlignment: calculateIndustryAlignment(cvText, industry),
          simulation: null,
          parsing: {
            success: formatValidation.isValid,
            extractedData: extractBasicData(cvText),
            parsingErrors: formatValidation.issues
          }
        }
        enterpriseFeatures = basicAnalysis
      } else {
        // Full enterprise analysis
        const enterpriseAnalysis = await analyzeEnterpriseATSCompatibility(cvText, {
          targetATS: targetATS as any,
          jobDescription,
          industry: industry as any,
          fileName,
          fileSize
        })
        
        // ATS Simulation (if job description provided and not on mobile)
        let simulation = null
        if (jobDescription && (!isMobile || cvText.length < 3000)) {
          const { simulateATSProcessing } = await import('@/lib/ats-utils')
          simulation = simulateATSProcessing(cvText, jobDescription, targetATS as any)
        }
        
        enterpriseFeatures = {
          atsSystemScores: enterpriseAnalysis.atsSystemScores,
          rejectionRisk: enterpriseAnalysis.rejectionRisk,
          industryAlignment: enterpriseAnalysis.industryAlignment,
          simulation,
          parsing: enterpriseAnalysis.parsing,
          enterpriseRecommendations: enterpriseAnalysis.recommendations
        }
      }
    } catch (error) {
      console.error('Enterprise analysis error:', error)
      // Fallback to basic enterprise features
      enterpriseFeatures = {
        atsSystemScores: {
          workday: Math.round(overallScore * 0.95),
          taleo: Math.round(overallScore * 0.90),
          greenhouse: Math.round(overallScore),
          bamboohr: Math.round(overallScore * 1.05)
        },
        rejectionRisk: 'medium' as const,
        industryAlignment: 50,
        simulation: null,
        parsing: {
          success: formatValidation.isValid,
          extractedData: extractBasicData(cvText),
          parsingErrors: formatValidation.issues
        }
      }
    }
  }

  return {
    overallScore,
    keywordDensity: keywordAnalysis,
    formatScore: formatAnalysis.score,
    sectionScore: sectionAnalysis.score,
    irishMarketScore: irishMarketAnalysis.score,
    suggestions,
    strengths,
    warnings,
    report,
    fileFormat: fileFormatAnalysis,
    formatValidation,
    ...enterpriseFeatures,
    details: {
      contactInfo: sectionAnalysis.details.contact,
      experience: sectionAnalysis.details.experience,
      skills: sectionAnalysis.details.skills,
      education: sectionAnalysis.details.education,
      formatting: formatAnalysis.details
    }
  }
}

// Helper functions for enterprise features
function calculateSystemCompatibility(overallScore: number, system: string): number {
  // Simulate different ATS system strictness
  const systemModifiers: Record<string, number> = {
    workday: 0.95,   // High strictness
    taleo: 0.90,     // Very high strictness  
    greenhouse: 1.0, // Medium strictness
    bamboohr: 1.05   // Low strictness
  }
  
  const modifier = systemModifiers[system] || 1.0
  return Math.min(Math.round(overallScore * modifier), 100)
}

function calculateRejectionRisk(
  overallScore: number, 
  keywordAnalysis: any, 
  formatAnalysis: any
): 'low' | 'medium' | 'high' | 'critical' {
  if (overallScore >= 80 && keywordAnalysis.matched > 5 && formatAnalysis.score >= 80) {
    return 'low'
  } else if (overallScore >= 60 && keywordAnalysis.matched > 3 && formatAnalysis.score >= 60) {
    return 'medium'
  } else if (overallScore >= 40) {
    return 'high'
  } else {
    return 'critical'
  }
}

function calculateIndustryAlignment(cvText: string, industry: string): number {
  const industryKeywords: Record<string, string[]> = {
    technology: ['software', 'developer', 'programming', 'code', 'technical', 'agile', 'api', 'cloud'],
    finance: ['financial', 'banking', 'investment', 'analysis', 'risk', 'compliance', 'audit'],
    healthcare: ['medical', 'clinical', 'patient', 'healthcare', 'treatment', 'diagnosis', 'care']
  }
  
  const keywords = industryKeywords[industry] || []
  const cvLower = cvText.toLowerCase()
  
  const foundKeywords = keywords.filter(keyword => cvLower.includes(keyword))
  return Math.round((foundKeywords.length / keywords.length) * 100)
}

function extractBasicData(cvText: string): Record<string, any> {
  // Basic data extraction (can be enhanced with more sophisticated parsing)
  const emailRegex = /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g
  const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/g
  
  return {
    emails: cvText.match(emailRegex) || [],
    phones: cvText.match(phoneRegex) || [],
    wordCount: cvText.split(/\s+/).length,
    hasContactInfo: !!(cvText.match(emailRegex) && cvText.match(phoneRegex))
  }
}

function analyzeKeywords(cvText: string, jobDescription?: string) {
  const allKeywords = [...ATS_KEYWORDS.technical, ...ATS_KEYWORDS.soft, ...ATS_KEYWORDS.irish]
  
  // Enhanced keyword extraction from job description
  let targetKeywords = allKeywords
  let jobSpecificKeywords: string[] = []
  
  if (jobDescription) {
    // Extract specific keywords from job description
    const jobLower = jobDescription.toLowerCase()
    
    // Add job-specific keywords for AI/Python roles
    const aiKeywords = ['python', 'ai', 'api', 'llm', 'openai', 'hugging face', 'langchain', 'nodejs', 'backend', 'integration', 'prompt', 'engineering', 'machine learning', 'automation', 'workflow']
    jobSpecificKeywords = aiKeywords.filter(keyword => jobLower.includes(keyword))
    
    // Filter existing keywords that appear in job description
    targetKeywords = allKeywords.filter(keyword => 
      jobLower.includes(keyword.toLowerCase())
    )
    
    // Combine with job-specific keywords
    targetKeywords = [...new Set([...targetKeywords, ...jobSpecificKeywords])]
  }

  const matchedKeywords: { [key: string]: number } = {}
  const missingKeywords: string[] = []
  
  targetKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi')
    const matches = cvText.match(regex)
    const count = matches ? matches.length : 0
    
    if (count > 0) {
      // Calculate density as percentage
      const wordCount = cvText.split(/\s+/).length
      const density = Math.round((count / wordCount) * 1000) / 10 // Round to 1 decimal
      matchedKeywords[keyword] = density
    } else {
      missingKeywords.push(keyword)
    }
  })

  return {
    total: targetKeywords.length,
    matched: Object.keys(matchedKeywords).length,
    missing: missingKeywords,
    density: matchedKeywords
  }
}

function analyzeFormat(cvText: string) {
  let score = 100
  const issues: string[] = []

  // Check for problematic characters or symbols
  const problematicChars = /[●◆▪▫■□◦‣⁃]/g
  if (problematicChars.test(cvText)) {
    score -= 10
    issues.push('Contains special bullet characters that may not be ATS-friendly')
  }

  // Check for excessive formatting
  const htmlTags = /<[^>]*>/g
  if (htmlTags.test(cvText)) {
    score -= 15
    issues.push('Contains HTML tags or rich formatting')
  }

  // Check for tables or complex structures
  if (cvText.includes('\t') || cvText.match(/\|.*\|/)) {
    score -= 10
    issues.push('May contain tables or complex formatting')
  }

  // Check for appropriate length
  const wordCount = cvText.split(/\s+/).length
  if (wordCount < 200) {
    score -= 20
    issues.push('CV appears too short (under 200 words)')
  } else if (wordCount > 800) {
    score -= 10
    issues.push('CV may be too long for optimal ATS parsing')
  }

  // Check for phone number format
  const irishPhoneRegex = /(\+353|0)[1-9][0-9]{7,9}/
  if (!irishPhoneRegex.test(cvText)) {
    score -= 5
    issues.push('Irish phone number format not detected')
  }

  // Check for email
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
  
  // Check for email
  if (/@/.test(cvText)) contactScore += 30
  else contactIssues.push('Email address missing')
  
  // Check for phone (more flexible pattern)
  if (/[\+]?[\d\s\-\(\)]{10,}/.test(cvText)) contactScore += 30
  else contactIssues.push('Phone number missing')
  
  // Check for location indicators
  if (/dublin|ireland|ie\b/i.test(cvText)) contactScore += 20
  
  // Check for LinkedIn
  if (/linkedin/i.test(cvText)) contactScore += 20
  
  sectionScores.contactInfo = { score: contactScore, issues: contactIssues }

  // Experience Analysis
  let experienceScore = 0
  const experienceIssues: string[] = []
  
  // Look for experience indicators
  if (/experience|employment|work|career/i.test(cvText)) experienceScore += 30
  
  // Look for date patterns (more flexible)
  const datePattern = /\b(20\d{2}|19\d{2})\b|\b(present|current)\b/gi
  const dates = cvText.match(datePattern)
  if (dates && dates.length >= 2) experienceScore += 35
  else experienceIssues.push('Employment dates not clearly specified')
  
  // Look for job titles (more comprehensive)
  const jobTitleIndicators = ['developer', 'engineer', 'manager', 'analyst', 'coordinator', 'specialist', 'officer', 'founder', 'ceo', 'director', 'consultant', 'guard', 'security']
  if (jobTitleIndicators.some(title => cvText.toLowerCase().includes(title))) experienceScore += 35
  else experienceIssues.push('Job titles not clearly identified')
  
  sectionScores.experience = { score: experienceScore, issues: experienceIssues }

  // Skills Analysis
  let skillsScore = 0
  const skillsIssues: string[] = []
  
  // Check for skills section
  if (/skills|competencies|expertise|abilities|programming|frameworks|tools/i.test(cvText)) skillsScore += 40
  
  // Look for technical skills
  const techSkills = ['python', 'javascript', 'java', 'html', 'css', 'sql', 'git', 'docker', 'aws', 'api', 'flask', 'django', 'react', 'node']
  const foundTechSkills = techSkills.filter(skill => cvText.toLowerCase().includes(skill))
  if (foundTechSkills.length >= 5) skillsScore += 40
  else if (foundTechSkills.length >= 3) skillsScore += 25
  else skillsIssues.push('Insufficient skills listed for ATS detection')
  
  // Look for soft skills
  const softSkills = ['leadership', 'communication', 'team', 'management', 'problem', 'analytical']
  const foundSoftSkills = softSkills.filter(skill => cvText.toLowerCase().includes(skill))
  if (foundSoftSkills.length >= 2) skillsScore += 20
  
  sectionScores.skills = { score: skillsScore, issues: skillsIssues }

  // Education Analysis
  let educationScore = 0
  const educationIssues: string[] = []
  
  // Check for education section
  if (/education|qualifications|academic|training|university|college/i.test(cvText)) educationScore += 40
  
  // Look for degree types
  const educationKeywords = ['university', 'college', 'degree', 'bachelor', 'master', 'phd', 'diploma', 'certificate', 'artificial intelligence', 'software engineering']
  if (educationKeywords.some(edu => cvText.toLowerCase().includes(edu))) educationScore += 40
  else educationIssues.push('Educational qualifications not clearly specified')
  
  // Look for GPA or grades
  if (/gpa|grade|3\.|4\./i.test(cvText)) educationScore += 20
  
  sectionScores.education = { score: educationScore, issues: educationIssues }

  // Formatting Analysis
  let formattingScore = 60 // Base score
  const formattingIssues: string[] = []
  
  // Check word count
  const wordCount = cvText.split(/\s+/).length
  if (wordCount >= 200) formattingScore += 20
  else formattingIssues.push('CV appears too short (under 200 words)')
  
  // Check for Irish context
  if (!/dublin|ireland|irish|ie\b/i.test(cvText)) formattingIssues.push('Irish location not clearly specified')
  
  sectionScores.formatting = { score: formattingScore, issues: formattingIssues }

  // Calculate total score
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

  // Weighted average: Keywords 35%, Format 25%, Sections 25%, Irish Market 15%
  const overallScore = Math.round(
    (keywordScore * 0.35) + 
    (formatAnalysis.score * 0.25) + 
    (sectionAnalysis.score * 0.25) +
    (irishScore * 0.15)
  )

  return Math.min(100, Math.max(0, overallScore))
}

function generateSuggestions(keywordAnalysis: KeywordAnalysis, formatAnalysis: FormatAnalysis, sectionAnalysis: SectionAnalysis, irishMarketAnalysis?: IrishMarketAnalysis, formatValidation?: FormatValidation): string[] {
  const suggestions: string[] = []

  // Keyword suggestions
  if (keywordAnalysis.matched < keywordAnalysis.total * 0.6) {
    suggestions.push('Include more relevant keywords from the job description naturally in your content')
  }

  if (keywordAnalysis.missing.length > 0) {
    suggestions.push(`Consider adding these missing keywords: ${keywordAnalysis.missing.slice(0, 3).join(', ')}`)
  }

  // Format suggestions
  if (formatAnalysis.score < 80) {
    suggestions.push('Use standard formatting with simple bullet points and clear section headers')
    suggestions.push('Avoid tables, graphics, and complex layouts that ATS systems cannot parse')
  }

  // Section suggestions
  if (sectionAnalysis.score < 70) {
    suggestions.push('Use clear, standard section headings like "Experience", "Skills", and "Education"')
    suggestions.push('Ensure each section contains relevant, detailed information')
  }

  // Irish market specific suggestions
  if (irishMarketAnalysis && irishMarketAnalysis.score < 60) {
    suggestions.push(...irishMarketAnalysis.suggestions)
  }

  // Format validation suggestions
  if (formatValidation && !formatValidation.isValid) {
    suggestions.push(...formatValidation.recommendations.slice(0, 2))
  }

  suggestions.push('Include your work authorization status clearly if you are not an EU citizen')
  suggestions.push('Use Irish English spelling and terminology familiar to Irish employers')

  return suggestions
}

function generateWarnings(keywordAnalysis: KeywordAnalysis, formatAnalysis: FormatAnalysis, sectionAnalysis: SectionAnalysis, formatValidation?: FormatValidation, fileFormatAnalysis?: { compatible: boolean; warnings: string[] }): string[] {
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

  // Add format validation warnings
  if (formatValidation && !formatValidation.isValid) {
    warnings.push(...formatValidation.issues.slice(0, 2))
  }

  // Add file format warnings
  if (fileFormatAnalysis && !fileFormatAnalysis.compatible) {
    warnings.push(...fileFormatAnalysis.warnings.slice(0, 2))
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

// AI-powered analysis functions (temporarily disabled)
/*
async function analyzeWithHuggingFace(
  cvText: string,
  jobDescription?: string,
  targetATS: string = 'workday',
  industry: string = 'technology'
) {
  try {
    const hfClient = new HuggingFaceATSClient()
    
    // Use AI to analyze CV content and structure
    const aiAnalysis = await hfClient.analyzeCVForATS(cvText, jobDescription)
    
    // Combine AI analysis with traditional methods
    const sectionAnalysis = analyzeSmartSections(cvText)
    const formatAnalysis = analyzeFormat(cvText)
    
    // Enhanced keyword analysis using AI
    const keywordAnalysis = {
      total: aiAnalysis.keywordAnalysis.extractedKeywords.length + aiAnalysis.keywordAnalysis.missingKeywords.length,
      matched: aiAnalysis.keywordAnalysis.extractedKeywords.length,
      missing: aiAnalysis.keywordAnalysis.missingKeywords,
      density: aiAnalysis.keywordAnalysis.extractedKeywords.reduce((acc, keyword) => {
        acc[keyword] = 2.5 // Placeholder density
        return acc
      }, {} as Record<string, number>)
    }
    
    // Calculate overall score using AI insights
    const overallScore = Math.round(
      (aiAnalysis.atsCompatibility.formatScore * 0.3) +
      (aiAnalysis.keywordAnalysis.relevanceScore * 0.4) +
      (aiAnalysis.contentAnalysis.structureScore * 0.3)
    )
    
    return {
      overallScore,
      keywordDensity: keywordAnalysis,
      formatScore: aiAnalysis.atsCompatibility.formatScore,
      sectionScore: aiAnalysis.contentAnalysis.structureScore,
      suggestions: [
        ...aiAnalysis.contentAnalysis.suggestions,
        'Use AI-enhanced keyword optimization',
        'Leverage modern CV formatting best practices'
      ],
      strengths: [
        `Professional content quality: ${aiAnalysis.contentAnalysis.professionalismScore}/100`,
        `AI-detected parsing compatibility: ${aiAnalysis.atsCompatibility.parsingProbability * 100}%`
      ],
      warnings: aiAnalysis.atsCompatibility.warnings,
      details: sectionAnalysis.details,
      atsSystemScores: {
        [targetATS]: Math.max(70, overallScore - 5),
        'ai_optimized': overallScore
      },
      rejectionRisk: overallScore >= 80 ? 'low' : overallScore >= 60 ? 'medium' : 'high' as 'low' | 'medium' | 'high',
      industryAlignment: aiAnalysis.keywordAnalysis.relevanceScore
    }
  } catch (error) {
    console.error('Hugging Face analysis failed, falling back to basic analysis:', error)
    // Fallback to enhanced basic analysis
    return await enhancedBasicAnalysis(cvText, jobDescription, targetATS, industry)
  }
}

async function analyzeKeywordsWithAI(cvText: string, jobDescription?: string) {
  // Enhanced keyword analysis that adapts to different CV formats
  const smartKeywords = extractSmartKeywords(cvText, jobDescription)
  
  return {
    total: smartKeywords.total,
    matched: smartKeywords.matched,
    missing: smartKeywords.missing,
    density: smartKeywords.density
  }
}

function extractSmartKeywords(cvText: string, jobDescription?: string) {
  const cvLower = cvText.toLowerCase()
  const jobLower = jobDescription?.toLowerCase() || ''
  
  // Dynamic keyword extraction based on content
  const detectedSkills = []
  const techPatterns = [
    /\b(python|javascript|java|c\+\+|react|node|django|flask|api|sql|html|css|git|docker|aws|azure)\b/gi,
    /\b(machine learning|ai|artificial intelligence|data science|automation|backend|frontend)\b/gi,
    /\b(agile|scrum|devops|ci\/cd|testing|debugging|optimization)\b/gi
  ]
  
  techPatterns.forEach(pattern => {
    const matches = cvText.match(pattern) || []
    detectedSkills.push(...matches.map(m => m.toLowerCase()))
  })
  
  // Extract from job description if provided
  let targetKeywords = [...new Set(detectedSkills)]
  if (jobDescription) {
    const jobKeywords = jobLower.match(/\b\w{3,}\b/g) || []
    const relevantJobKeywords = jobKeywords.filter(keyword => 
      cvLower.includes(keyword) && keyword.length > 3
    )
    targetKeywords = [...new Set([...targetKeywords, ...relevantJobKeywords])]
  }
  
  const matchedKeywords: Record<string, number> = {}
  const missingKeywords: string[] = []
  
  targetKeywords.forEach(keyword => {
    if (cvLower.includes(keyword)) {
      const wordCount = cvText.split(/\s+/).length
      const occurrences = (cvLower.match(new RegExp(keyword, 'g')) || []).length
      matchedKeywords[keyword] = Math.round((occurrences / wordCount) * 1000) / 10
    } else {
      missingKeywords.push(keyword)
    }
  })
  
  return {
    total: targetKeywords.length,
    matched: Object.keys(matchedKeywords).length,
    missing: missingKeywords,
    density: matchedKeywords
  }
}

function analyzeSmartSections(cvText: string) {
  // Smart section detection that works with any CV format
  const sections = {
    contactInfo: analyzeContactSection(cvText),
    experience: analyzeExperienceSection(cvText),
    skills: analyzeSkillsSection(cvText),
    education: analyzeEducationSection(cvText),
    formatting: analyzeFormattingSection(cvText)
  }
  
  const totalScore = Object.values(sections).reduce((sum, section) => sum + section.score, 0)
  
  return {
    score: Math.round(totalScore / Object.keys(sections).length),
    details: sections
  }
}

function analyzeContactSection(cvText: string) {
  let score = 0
  const issues: string[] = []
  
  // Email detection (flexible)
  if (/@/.test(cvText)) score += 25
  else issues.push('Email address not found')
  
  // Phone detection (very flexible)
  if (/[\+]?[\d\s\-\(\)]{8,}/.test(cvText)) score += 25
  else issues.push('Phone number not found')
  
  // Location detection
  if (/\b(dublin|ireland|london|uk|usa|canada|germany|france|spain|italy)\b/i.test(cvText)) score += 25
  
  // Professional links
  if (/linkedin|github|portfolio|website/i.test(cvText)) score += 25
  
  return { score, issues }
}

function analyzeExperienceSection(cvText: string) {
  let score = 0
  const issues: string[] = []
  
  // Date patterns (very flexible)
  const datePatterns = [
    /\b(20\d{2}|19\d{2})\b/g,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi,
    /\b(present|current|now)\b/gi
  ]
  
  let datesFound = false
  datePatterns.forEach(pattern => {
    if (pattern.test(cvText)) datesFound = true
  })
  
  if (datesFound) score += 30
  else issues.push('Employment dates not clearly specified')
  
  // Job title indicators (comprehensive)
  const jobTitles = /\b(developer|engineer|manager|analyst|specialist|coordinator|director|officer|consultant|founder|ceo|cto|lead|senior|junior|intern)\b/gi
  if (jobTitles.test(cvText)) score += 35
  else issues.push('Job titles not clearly identified')
  
  // Company indicators
  if (/\b(company|corporation|ltd|inc|llc|group|systems|technologies|solutions)\b/i.test(cvText)) score += 35
  
  return { score, issues }
}

function analyzeSkillsSection(cvText: string) {
  let score = 0
  const issues: string[] = []
  
  // Technical skills (adaptive detection)
  const techSkillPatterns = [
    /\b(programming|languages|frameworks|tools|technologies)\b/i,
    /\b(python|javascript|java|c\+\+|html|css|sql|git|docker|aws)\b/i,
    /\b(react|angular|vue|node|django|flask|spring|laravel)\b/i
  ]
  
  let techSkillsFound = 0
  techSkillPatterns.forEach(pattern => {
    if (pattern.test(cvText)) techSkillsFound++
  })
  
  if (techSkillsFound >= 2) score += 50
  else if (techSkillsFound >= 1) score += 30
  else issues.push('Technical skills not clearly identified')
  
  // Soft skills
  const softSkills = /\b(leadership|communication|teamwork|problem|analytical|creative|management)\b/i
  if (softSkills.test(cvText)) score += 30
  
  // Certifications
  if (/\b(certified|certification|license|training|course)\b/i.test(cvText)) score += 20
  
  return { score, issues }
}

function analyzeEducationSection(cvText: string) {
  let score = 0
  const issues: string[] = []
  
  // Education keywords (comprehensive)
  const educationPatterns = [
    /\b(university|college|institute|school|academy)\b/i,
    /\b(bachelor|master|phd|doctorate|degree|diploma|certificate)\b/i,
    /\b(bsc|msc|ba|ma|engineering|science|technology|business)\b/i
  ]
  
  let educationFound = false
  educationPatterns.forEach(pattern => {
    if (pattern.test(cvText)) educationFound = true
  })
  
  if (educationFound) score += 60
  else issues.push('Educational qualifications not clearly specified')
  
  // GPA or grades
  if (/\b(gpa|grade|3\.|4\.|first|second|honours)\b/i.test(cvText)) score += 20
  
  // Graduation years
  if (/\b(20\d{2}|19\d{2})\b/.test(cvText)) score += 20
  
  return { score, issues }
}

function analyzeFormattingSection(cvText: string) {
  let score = 70 // Base score
  const issues: string[] = []
  
  // Word count analysis
  const wordCount = cvText.split(/\s+/).length
  if (wordCount >= 200) score += 15
  else if (wordCount >= 100) score += 10
  else issues.push('CV appears too short')
  
  // Structure indicators
  if (/\n\s*\n/.test(cvText)) score += 15 // Has paragraph breaks
  
  return { score, issues }
}

async function enhancedBasicAnalysis(
  cvText: string,
  jobDescription?: string,
  targetATS: string = 'workday',
  industry: string = 'technology'
) {
  // Fallback enhanced analysis when AI fails
  const keywordAnalysis = await analyzeKeywordsWithAI(cvText, jobDescription)
  const formatAnalysis = analyzeFormat(cvText)
  const sectionAnalysis = analyzeSmartSections(cvText)
  
  const overallScore = calculateOverallScore(keywordAnalysis, formatAnalysis, sectionAnalysis)
  
  return {
    overallScore,
    keywordDensity: keywordAnalysis,
    formatScore: formatAnalysis.score,
    sectionScore: sectionAnalysis.score,
    suggestions: [
      'Consider adding more relevant keywords from the job description',
      'Ensure clear section headings for better ATS parsing',
      'Use standard formatting with bullet points'
    ],
    strengths: [
      'CV structure is compatible with modern ATS systems',
      'Content appears professional and well-organized'
    ],
    warnings: [],
    details: sectionAnalysis.details,
    atsSystemScores: {
      [targetATS]: Math.max(60, overallScore - 10)
    },
    rejectionRisk: overallScore >= 75 ? 'low' : overallScore >= 50 ? 'medium' : 'high' as 'low' | 'medium' | 'high',
    industryAlignment: 70
  }
}
*/