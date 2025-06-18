import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/gemini-client'
import { 
  analyzeFileFormat, 
  generateATSReport, 
  calculateIrishMarketRelevance,
  validateATSFormat 
} from '@/lib/ats-utils'

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
    const { cvText, jobDescription, fileName, fileSize }: ATSAnalysisRequest = body

    // Validation
    if (!cvText || cvText.trim().length < 100) {
      return NextResponse.json(
        { error: 'CV text must be at least 100 characters long' },
        { status: 400 }
      )
    }

    // Analyze the CV
    const analysis = await analyzeATSCompatibility(cvText, jobDescription, fileName, fileSize)

    return NextResponse.json({
      success: true,
      analysis
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
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

async function analyzeATSCompatibility(cvText: string, jobDescription?: string, fileName?: string, fileSize?: number) {
  const cvLower = cvText.toLowerCase()
  const jobLower = jobDescription?.toLowerCase() || ''

  // 1. Keyword Analysis
  const keywordAnalysis = analyzeKeywords(cvLower, jobLower)
  
  // 2. Format Analysis
  const formatAnalysis = analyzeFormat(cvText)
  
  // 3. Section Analysis
  const sectionAnalysis = analyzeSections(cvLower)
  
  // 4. File Format Analysis (if fileName provided)
  const fileFormatAnalysis = fileName ? analyzeFileFormat(fileName, fileSize) : null
  
  // 5. Irish Market Relevance
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
    details: {
      contactInfo: sectionAnalysis.details.contact,
      experience: sectionAnalysis.details.experience,
      skills: sectionAnalysis.details.skills,
      education: sectionAnalysis.details.education,
      formatting: formatAnalysis.details
    }
  }
}

function analyzeKeywords(cvText: string, jobDescription: string) {
  const allKeywords = [...ATS_KEYWORDS.technical, ...ATS_KEYWORDS.soft, ...ATS_KEYWORDS.irish]
  
  // Extract keywords from job description if provided
  let targetKeywords = allKeywords
  if (jobDescription) {
    targetKeywords = allKeywords.filter(keyword => 
      jobDescription.includes(keyword.toLowerCase())
    )
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
    } else if (jobDescription && jobDescription.includes(keyword.toLowerCase())) {
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
    contact: { score: 0, issues: [] },
    experience: { score: 0, issues: [] },
    skills: { score: 0, issues: [] },
    education: { score: 0, issues: [] }
  }

  // Analyze each section
  Object.entries(ATS_SECTIONS).forEach(([section, headers]) => {
    let sectionFound = false
    let score = 0
    const issues: string[] = []

    // Check if section headers exist
    headers.forEach(header => {
      const regex = new RegExp(`\\b${header}\\b`, 'i')
      if (regex.test(cvText)) {
        sectionFound = true
      }
    })

    if (sectionFound) {
      score += 50
    } else {
      issues.push(`${section.charAt(0).toUpperCase() + section.slice(1)} section not clearly identified`)
    }

    // Section-specific analysis
    switch (section) {
      case 'contact':
        if (cvText.includes('@')) score += 20
        if (/(\+353|0)[1-9][0-9]{7,9}/.test(cvText)) score += 20
        if (!cvText.includes('@')) issues.push('Email address missing')
        if (!/(\+353|0)[1-9][0-9]{7,9}/.test(cvText)) issues.push('Irish phone number missing')
        break

      case 'experience':
        // Look for date patterns
        const datePattern = /\b(20\d{2}|19\d{2})\b/g
        const dates = cvText.match(datePattern)
        if (dates && dates.length >= 2) score += 25
        else issues.push('Employment dates not clearly specified')
        
        // Look for job titles
        const jobTitleIndicators = ['manager', 'developer', 'engineer', 'analyst', 'coordinator', 'specialist']
        if (jobTitleIndicators.some(title => cvText.toLowerCase().includes(title))) score += 25
        else issues.push('Job titles not clearly identified')
        break

      case 'skills':
        const skillKeywords = [...ATS_KEYWORDS.technical, ...ATS_KEYWORDS.soft]
        const foundSkills = skillKeywords.filter(skill => cvText.toLowerCase().includes(skill))
        if (foundSkills.length >= 5) score += 50
        else if (foundSkills.length >= 3) score += 30
        else issues.push('Insufficient skills listed for ATS detection')
        break

      case 'education':
        const educationKeywords = ['university', 'college', 'degree', 'bachelor', 'master', 'phd', 'diploma', 'certificate']
        if (educationKeywords.some(edu => cvText.toLowerCase().includes(edu))) score += 50
        else issues.push('Educational qualifications not clearly specified')
        break
    }

    sectionScores[section] = { score: Math.min(100, score), issues }
    totalScore += sectionScores[section].score
  })

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

  if (sectionAnalysis.details.contact.score < 50) {
    warnings.push('Contact information is incomplete or not clearly formatted')
  }

  if (keywordAnalysis.matched === 0 && keywordAnalysis.total > 0) {
    warnings.push('No relevant keywords found - CV may not match job requirements')
  }

  if (sectionAnalysis.details.experience.score < 40) {
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

  if (sectionAnalysis.details.contact.score >= 80) {
    strengths.push('Complete contact information in proper format')
  }

  if (sectionAnalysis.details.skills.score >= 80) {
    strengths.push('Comprehensive skills section with relevant competencies')
  }

  if (irishMarketAnalysis && irishMarketAnalysis.score >= 70) {
    strengths.push('Strong optimization for the Irish job market')
  }

  return strengths
}