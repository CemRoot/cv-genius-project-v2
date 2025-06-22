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

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get user ID for rate limiting
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const userAgent = request.headers.get('user-agent') || ''
    const isMobileRequest = /Mobile|Android|iPhone|iPad/.test(userAgent)
    
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

    // Clean up PDF extraction artifacts before analysis
    const cleanedCvText = cleanPDFText(cvText)

    // Try HuggingFace analysis first, fallback to traditional analysis
    let analysis
    try {
      analysis = await analyzeWithHuggingFace(
        cleanedCvText, 
        jobDescription, 
        fileName, 
        fileSize, 
        analysisMode,
        targetATS,
        industry,
        isMobileRequest
      )
    } catch (error) {
      console.warn('HuggingFace analysis failed, using fallback:', error)
      // Fallback to traditional analysis
      analysis = await analyzeATSCompatibility(
        cleanedCvText, 
        jobDescription, 
        fileName, 
        fileSize, 
        analysisMode,
        targetATS,
        industry,
        isMobileRequest
      )
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      analysis,
      meta: {
        processingTime,
        isMobile: isMobileRequest,
        version: '2.0',
        provider: 'hybrid' // HuggingFace + fallback
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
      { 
        error: 'Internal server error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      },
      { status: 500 }
    )
  }
}

// Enhanced analysis using HuggingFace AI
async function analyzeWithHuggingFace(
  cvText: string, 
  jobDescription?: string, 
  fileName?: string, 
  fileSize?: number,
  analysisMode: 'basic' | 'enterprise' = 'basic',
  targetATS: string = 'workday',
  industry: string = 'technology',
  isMobile: boolean = false
) {
  const hfClient = getHuggingFaceClient()
  
  // Health check first
  const isHealthy = await hfClient.healthCheck()
  if (!isHealthy) {
    throw new Error('HuggingFace service unavailable')
  }

  // Get AI analysis
  const aiAnalysis = await hfClient.analyzeCVForATS(cvText, jobDescription)
  
  // Traditional analysis for validation
  const keywordAnalysis = analyzeKeywords(cvText, jobDescription || '')
  const formatAnalysis = analyzeFormat(cvText)
  const sectionAnalysis = analyzeSections(cvText)
  
  // Irish Market Relevance
  const irishMarketAnalysis = calculateIrishMarketRelevance(cvText)
  
  // Format Validation
  const formatValidation = validateATSFormat(cvText)
  
  // Combine AI and traditional analysis
  const enhancedKeywordAnalysis = {
    total: Math.max(keywordAnalysis.total, aiAnalysis.keywordAnalysis.extractedKeywords.length),
    matched: Math.max(keywordAnalysis.matched, aiAnalysis.keywordAnalysis.extractedKeywords.length),
    missing: [...new Set([...keywordAnalysis.missing, ...aiAnalysis.keywordAnalysis.missingKeywords])],
    density: {
      ...keywordAnalysis.density,
      // Add AI-extracted keywords
      ...aiAnalysis.keywordAnalysis.extractedKeywords.reduce((acc, keyword) => {
        acc[keyword] = 2.5 // AI-weighted keywords
        return acc
      }, {} as Record<string, number>)
    }
  }

  // Enhanced format analysis
  const enhancedFormatAnalysis = {
    score: Math.round((formatAnalysis.score + aiAnalysis.atsCompatibility.formatScore) / 2),
    details: {
      score: Math.round((formatAnalysis.score + aiAnalysis.atsCompatibility.formatScore) / 2),
      issues: [...formatAnalysis.details.issues, ...aiAnalysis.atsCompatibility.warnings]
    }
  }

  // Calculate overall score with AI weighting
  const overallScore = Math.round(
    (enhancedKeywordAnalysis.matched / enhancedKeywordAnalysis.total * 100 * 0.35) + 
    (enhancedFormatAnalysis.score * 0.25) + 
    (aiAnalysis.contentAnalysis.structureScore * 0.25) +
    (irishMarketAnalysis.score * 0.15)
  )

  // Generate enhanced suggestions
  const suggestions = [
    ...generateSuggestions(enhancedKeywordAnalysis, enhancedFormatAnalysis, sectionAnalysis, irishMarketAnalysis, formatValidation),
    ...aiAnalysis.contentAnalysis.suggestions
  ]

  const warnings = generateWarnings(enhancedKeywordAnalysis, enhancedFormatAnalysis, sectionAnalysis, formatValidation)
  const strengths = generateStrengths(enhancedKeywordAnalysis, enhancedFormatAnalysis, sectionAnalysis, irishMarketAnalysis)
  
  // Generate comprehensive report
  const report = generateATSReport(overallScore, enhancedKeywordAnalysis, enhancedFormatAnalysis, sectionAnalysis, suggestions, warnings)

  // Enterprise Analysis Features
  let enterpriseFeatures = {}
  if (analysisMode === 'enterprise') {
    try {
      if (isMobile && cvText.length > 5000) {
        // Simplified enterprise analysis for mobile
        enterpriseFeatures = {
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
      } else {
        // Full enterprise analysis with AI
        const enterpriseAnalysis = await analyzeEnterpriseATSCompatibility(cvText, {
          targetATS: targetATS as any,
          jobDescription,
          industry: industry as any,
          fileName,
          fileSize
        })
        
        // Enhanced job matching with AI
        let jobMatch = null
        if (jobDescription) {
          jobMatch = await hfClient.checkJobMatch(cvText, jobDescription)
        }
        
        enterpriseFeatures = {
          atsSystemScores: enterpriseAnalysis.atsSystemScores,
          rejectionRisk: enterpriseAnalysis.rejectionRisk,
          industryAlignment: enterpriseAnalysis.industryAlignment,
          simulation: jobMatch ? {
            passed: jobMatch.matchScore > 70,
            stage: jobMatch.matchScore > 70 ? 'human_review' : 'keyword_matching',
            feedback: jobMatch.recommendations,
            nextSteps: jobMatch.matchScore > 70 ? 
              ['Prepare for interview', 'Research company culture'] :
              ['Improve keyword matching', 'Add missing skills']
          } : null,
          parsing: enterpriseAnalysis.parsing,
          jobMatch
        }
      }
    } catch (error) {
      console.error('Enterprise analysis error:', error)
      // Fallback enterprise features
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
    keywordDensity: enhancedKeywordAnalysis,
    formatScore: enhancedFormatAnalysis.score,
    sectionScore: aiAnalysis.contentAnalysis.structureScore,
    irishMarketScore: irishMarketAnalysis.score,
    suggestions: [...new Set(suggestions)], // Remove duplicates
    strengths,
    warnings,
    report,
    formatValidation,
    aiInsights: {
      professionalismScore: aiAnalysis.contentAnalysis.professionalismScore,
      clarityScore: aiAnalysis.contentAnalysis.clarityScore,
      parsingProbability: aiAnalysis.atsCompatibility.parsingProbability
    },
    ...enterpriseFeatures,
    details: {
      contactInfo: sectionAnalysis.details.contactInfo,
      experience: sectionAnalysis.details.experience,
      skills: sectionAnalysis.details.skills,
      education: sectionAnalysis.details.education,
      formatting: enhancedFormatAnalysis.details
    }
  }
}

// Fallback traditional analysis (moved from existing code)
async function analyzeATSCompatibility(
  cvText: string, 
  jobDescription?: string, 
  _fileName?: string, 
  _fileSize?: number,
  analysisMode: 'basic' | 'enterprise' = 'basic',
  _targetATS: string = 'workday',
  industry: string = 'technology',
  _isMobile: boolean = false
) {
  const keywordAnalysis = analyzeKeywords(cvText, jobDescription || '')
  const formatAnalysis = analyzeFormat(cvText)
  const sectionAnalysis = analyzeSections(cvText)
  const irishMarketAnalysis = calculateIrishMarketRelevance(cvText)
  const formatValidation = validateATSFormat(cvText)
  
  const overallScore = calculateOverallScore(keywordAnalysis, formatAnalysis, sectionAnalysis, irishMarketAnalysis)
  
  const suggestions = generateSuggestions(keywordAnalysis, formatAnalysis, sectionAnalysis, irishMarketAnalysis, formatValidation)
  const warnings = generateWarnings(keywordAnalysis, formatAnalysis, sectionAnalysis, formatValidation)
  const strengths = generateStrengths(keywordAnalysis, formatAnalysis, sectionAnalysis, irishMarketAnalysis)
  
  const report = generateATSReport(overallScore, keywordAnalysis, formatAnalysis, sectionAnalysis, suggestions, warnings)

  // Enterprise features for fallback
  let enterpriseFeatures = {}
  if (analysisMode === 'enterprise') {
    enterpriseFeatures = {
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
    formatValidation,
    ...enterpriseFeatures,
    details: {
      contactInfo: sectionAnalysis.details.contactInfo,
      experience: sectionAnalysis.details.experience,
      skills: sectionAnalysis.details.skills,
      education: sectionAnalysis.details.education,
      formatting: formatAnalysis.details
    }
  }
}

// Helper functions (imported from existing logic)
function analyzeKeywords(cvText: string, jobDescription?: string) {
  const allKeywords = [...ATS_KEYWORDS.technical, ...ATS_KEYWORDS.soft, ...ATS_KEYWORDS.irish]
  
  let targetKeywords = allKeywords
  let jobSpecificKeywords: string[] = []
  
  if (jobDescription) {
    const jobLower = jobDescription.toLowerCase()
    
    // Add job-specific keywords for AI/Python roles
    const aiKeywords = ['python', 'ai', 'api', 'llm', 'openai', 'hugging face', 'langchain', 'nodejs', 'backend', 'integration', 'prompt', 'engineering', 'machine learning', 'automation', 'workflow']
    jobSpecificKeywords = aiKeywords.filter(keyword => jobLower.includes(keyword))
    
    targetKeywords = allKeywords.filter(keyword => 
      jobLower.includes(keyword.toLowerCase())
    )
    
    targetKeywords = [...new Set([...targetKeywords, ...jobSpecificKeywords])]
  }

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
    // Technology terms
    'artifi cial': 'artificial',
    'artifi cal': 'artificial', 
    'intel ligence': 'intelligence',
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