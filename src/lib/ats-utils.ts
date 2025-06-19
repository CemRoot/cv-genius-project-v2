// ATS Utility functions for file format checking and report generation

export interface FileFormatAnalysis {
  compatible: boolean
  format: string
  warnings: string[]
  recommendations: string[]
}

export interface ATSReport {
  summary: string
  keyFindings: string[]
  priorityActions: string[]
  score: number
  timestamp: string
}

// File format compatibility checker
export function analyzeFileFormat(fileName: string, fileSize?: number): FileFormatAnalysis {
  const extension = fileName.toLowerCase().split('.').pop() || ''
  const warnings: string[] = []
  const recommendations: string[] = []
  let compatible = true

  switch (extension) {
    case 'pdf':
      recommendations.push('PDF is ATS-friendly - ensure it\'s text-based, not scanned')
      if (fileSize && fileSize > 5 * 1024 * 1024) { // 5MB
        warnings.push('File size is large - consider optimizing to under 5MB')
      }
      break

    case 'doc':
    case 'docx':
      recommendations.push('Word documents are highly ATS-compatible')
      recommendations.push('Ensure you\'re using standard fonts and formatting')
      break

    case 'txt':
      warnings.push('Plain text files lose formatting but are fully ATS-compatible')
      recommendations.push('Consider using .docx or .pdf for better presentation')
      break

    case 'rtf':
      warnings.push('RTF files may have compatibility issues with some ATS systems')
      recommendations.push('Convert to .docx or .pdf for better compatibility')
      break

    case 'html':
    case 'htm':
      compatible = false
      warnings.push('HTML files are not recommended for ATS systems')
      recommendations.push('Convert to .docx or .pdf format')
      break

    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      compatible = false
      warnings.push('Image files cannot be parsed by ATS systems')
      recommendations.push('Use text-based formats like .docx or .pdf')
      break

    default:
      compatible = false
      warnings.push('Unknown or unsupported file format')
      recommendations.push('Use .docx or .pdf for optimal ATS compatibility')
  }

  // Irish market specific recommendations
  if (compatible) {
    recommendations.push('Include your Eircode in contact details for Irish employers')
    recommendations.push('Mention work authorization status if non-EU citizen')
  }

  return {
    compatible,
    format: extension.toUpperCase(),
    warnings,
    recommendations
  }
}

// Generate comprehensive ATS report
export function generateATSReport(
  overallScore: number,
  keywordAnalysis: { total: number; matched: number; missing: string[]; density: Record<string, number> },
  formatAnalysis: { score: number },
  sectionAnalysis: { score: number; details: Record<string, { score: number; issues: string[] }> },
  suggestions: string[],
  warnings: string[]
): ATSReport {
  const keyFindings: string[] = []
  const priorityActions: string[] = []

  // Determine key findings based on scores
  if (overallScore >= 80) {
    keyFindings.push('🎉 Excellent ATS compatibility - your CV should pass most screening systems')
  } else if (overallScore >= 60) {
    keyFindings.push('⚠️ Good ATS compatibility with room for improvement')
  } else {
    keyFindings.push('🚨 Poor ATS compatibility - significant improvements needed')
  }

  // Keyword findings
  const keywordScore = keywordAnalysis.total > 0 
    ? (keywordAnalysis.matched / keywordAnalysis.total) * 100 
    : 0

  if (keywordScore >= 70) {
    keyFindings.push('✅ Strong keyword optimization')
  } else if (keywordScore >= 40) {
    keyFindings.push('⚠️ Moderate keyword coverage')
    priorityActions.push('Increase relevant keyword density')
  } else {
    keyFindings.push('🚨 Poor keyword optimization')
    priorityActions.push('URGENT: Add more relevant keywords from job descriptions')
  }

  // Format findings
  if (formatAnalysis.score >= 80) {
    keyFindings.push('✅ ATS-friendly formatting detected')
  } else {
    keyFindings.push('⚠️ Formatting may cause ATS parsing issues')
    priorityActions.push('Simplify formatting and remove complex elements')
  }

  // Section findings
  if (sectionAnalysis.score >= 80) {
    keyFindings.push('✅ Well-structured with clear sections')
  } else {
    keyFindings.push('⚠️ Section structure needs improvement')
    priorityActions.push('Use standard section headings (Experience, Skills, Education)')
  }

  // Irish market specific findings
  keyFindings.push('🇮🇪 Analyzed for Irish job market compatibility')

  // Priority actions from warnings
  if (warnings.length > 0) {
    priorityActions.push(...warnings.slice(0, 3))
  }

  // Add top suggestions as priority actions
  if (suggestions.length > 0 && priorityActions.length < 5) {
    priorityActions.push(...suggestions.slice(0, 5 - priorityActions.length))
  }

  // Generate summary
  let summary = ''
  if (overallScore >= 80) {
    summary = `Your CV scores ${overallScore}/100 for ATS compatibility - excellent! It should successfully pass through most Applicant Tracking Systems used by Irish employers. Focus on maintaining this quality while tailoring keywords for specific job applications.`
  } else if (overallScore >= 60) {
    summary = `Your CV scores ${overallScore}/100 for ATS compatibility. It's in good shape but has room for improvement. Focus on the priority actions below to increase your chances of passing ATS screening.`
  } else {
    summary = `Your CV scores ${overallScore}/100 for ATS compatibility and needs significant improvement. Many ATS systems may struggle to parse your CV effectively. Please address the critical issues identified below.`
  }

  return {
    summary,
    keyFindings: keyFindings.slice(0, 6),
    priorityActions: priorityActions.slice(0, 5),
    score: overallScore,
    timestamp: new Date().toISOString()
  }
}

// Irish market specific ATS keywords
export const IRISH_ATS_KEYWORDS = {
  locations: [
    'dublin', 'cork', 'galway', 'limerick', 'waterford', 'kilkenny', 'drogheda', 'dundalk',
    'bray', 'navan', 'ennis', 'tralee', 'carlow', 'naas', 'athlone', 'portlaoise'
  ],
  workAuth: [
    'eu citizen', 'irish citizen', 'work permit', 'stamp 4', 'eligible to work',
    'right to work', 'no visa required', 'permanent resident'
  ],
  companies: [
    'google', 'microsoft', 'facebook', 'meta', 'amazon', 'apple', 'intel', 'ibm',
    'accenture', 'deloitte', 'pwc', 'kpmg', 'ey', 'citi', 'bank of america',
    'aib', 'bank of ireland', 'permanent tsb', 'irish life', 'zurich'
  ],
  sectors: [
    'fintech', 'pharmaceuticals', 'medical devices', 'agriculture', 'food processing',
    'technology', 'financial services', 'healthcare', 'manufacturing', 'logistics'
  ]
}

// Calculate keyword relevance for Irish market
export function calculateIrishMarketRelevance(cvText: string): {
  score: number
  foundKeywords: string[]
  suggestions: string[]
} {
  const cvLower = cvText.toLowerCase()
  const allIrishKeywords = [
    ...IRISH_ATS_KEYWORDS.locations,
    ...IRISH_ATS_KEYWORDS.workAuth,
    ...IRISH_ATS_KEYWORDS.companies,
    ...IRISH_ATS_KEYWORDS.sectors
  ]

  const foundKeywords = allIrishKeywords.filter(keyword => 
    cvLower.includes(keyword.toLowerCase())
  )

  const score = Math.min(100, (foundKeywords.length / allIrishKeywords.length) * 100 * 5)

  const suggestions: string[] = []
  
  if (!IRISH_ATS_KEYWORDS.locations.some(loc => cvLower.includes(loc))) {
    suggestions.push('Consider mentioning your location or target work location in Ireland')
  }
  
  if (!IRISH_ATS_KEYWORDS.workAuth.some(auth => cvLower.includes(auth))) {
    suggestions.push('Clearly state your work authorization status for Ireland/EU')
  }

  if (foundKeywords.length < 3) {
    suggestions.push('Include more Ireland-specific keywords and location references')
  }

  return { score, foundKeywords, suggestions }
}

// Format validation for ATS systems
export function validateATSFormat(text: string): {
  isValid: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []

  // Check for common ATS-breaking elements
  if (text.includes('\t')) {
    issues.push('Contains tab characters that may break formatting')
    recommendations.push('Replace tabs with spaces for consistent formatting')
  }

  if (/[●◆▪▫■□◦‣⁃]/.test(text)) {
    issues.push('Contains special Unicode bullet points')
    recommendations.push('Use standard hyphens (-) or asterisks (*) for bullet points')
  }

  if (/<[^>]*>/.test(text)) {
    issues.push('Contains HTML or XML tags')
    recommendations.push('Remove all HTML formatting and use plain text')
  }

  if (text.includes('|')) {
    issues.push('May contain tables or pipe characters')
    recommendations.push('Avoid tables and complex layouts')
  }

  // Check line length
  const lines = text.split('\n')
  const longLines = lines.filter(line => line.length > 100)
  if (longLines.length > lines.length * 0.3) {
    issues.push('Many lines are very long')
    recommendations.push('Break long lines for better readability')
  }

  // Check for minimum content
  if (text.split(/\s+/).length < 150) {
    issues.push('Content appears too short for a complete CV')
    recommendations.push('Expand with more detail about your experience and skills')
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  }
}

// Enterprise ATS Standards and Algorithms
export const ENTERPRISE_ATS_STANDARDS = {
  // Major ATS Systems Used by Enterprise Companies
  systems: {
    workday: {
      name: 'Workday',
      marketShare: 28,
      algorithms: ['keyword_density', 'semantic_matching', 'ml_scoring'],
      strictness: 'high',
      requirements: {
        minKeywordDensity: 15,
        maxFileSize: 2048, // 2MB
        supportedFormats: ['pdf', 'docx', 'doc'],
        requiredSections: ['contact', 'experience', 'skills', 'education']
      }
    },
    taleo: {
      name: 'Oracle Taleo',
      marketShare: 18,
      algorithms: ['exact_matching', 'phrase_matching', 'location_scoring'],
      strictness: 'very_high',
      requirements: {
        minKeywordDensity: 20,
        maxFileSize: 1024, // 1MB
        supportedFormats: ['pdf', 'docx'],
        requiredSections: ['contact', 'summary', 'experience', 'skills', 'education']
      }
    },
    greenhouse: {
      name: 'Greenhouse',
      marketShare: 15,
      algorithms: ['nlp_processing', 'context_analysis', 'diversity_scoring'],
      strictness: 'medium',
      requirements: {
        minKeywordDensity: 12,
        maxFileSize: 3072, // 3MB
        supportedFormats: ['pdf', 'docx', 'doc', 'txt'],
        requiredSections: ['contact', 'experience', 'skills']
      }
    },
    bamboohr: {
      name: 'BambooHR',
      marketShare: 12,
      algorithms: ['simple_matching', 'section_analysis'],
      strictness: 'low',
      requirements: {
        minKeywordDensity: 8,
        maxFileSize: 4096, // 4MB
        supportedFormats: ['pdf', 'docx', 'doc', 'txt', 'rtf'],
        requiredSections: ['contact', 'experience']
      }
    }
  },

  // ATS Rejection Criteria (Based on 2024 Industry Research)
  rejectionCriteria: {
    immediate: [
      'missing_contact_info',
      'unsupported_file_format',
      'file_too_large',
      'corrupted_file',
      'no_relevant_keywords',
      'unparseable_format'
    ],
    highRisk: [
      'low_keyword_density',
      'missing_critical_sections',
      'poor_formatting',
      'excessive_graphics',
      'incompatible_fonts',
      'complex_tables'
    ],
    mediumRisk: [
      'inconsistent_dates',
      'spelling_errors',
      'formatting_inconsistencies',
      'missing_achievements',
      'vague_descriptions'
    ]
  },

  // Industry-Specific Requirements
  industryRequirements: {
    technology: {
      criticalKeywords: ['agile', 'scrum', 'git', 'api', 'cloud', 'devops'],
      minExperience: 2,
      preferredFormats: ['pdf', 'docx'],
      scoringWeights: { technical: 0.4, experience: 0.3, education: 0.2, soft: 0.1 }
    },
    finance: {
      criticalKeywords: ['regulatory', 'compliance', 'risk', 'audit', 'reporting'],
      minExperience: 3,
      preferredFormats: ['pdf'],
      scoringWeights: { experience: 0.4, technical: 0.2, education: 0.3, soft: 0.1 }
    },
    healthcare: {
      criticalKeywords: ['patient', 'clinical', 'healthcare', 'medical', 'safety'],
      minExperience: 1,
      preferredFormats: ['pdf', 'docx'],
      scoringWeights: { education: 0.4, experience: 0.3, technical: 0.2, soft: 0.1 }
    }
  }
}

// Enhanced ATS Analysis with Enterprise Standards
export function analyzeEnterpriseATSCompatibility(
  cvText: string,
  options: {
    targetATS?: keyof typeof ENTERPRISE_ATS_STANDARDS.systems
    jobDescription?: string
    industry?: keyof typeof ENTERPRISE_ATS_STANDARDS.industryRequirements
    fileName?: string
    fileSize?: number
  } = {}
): Promise<{
  overallScore: number
  atsSystemScores: Record<string, number>
  rejectionRisk: 'low' | 'medium' | 'high' | 'critical'
  industryAlignment: number
  parsing: {
    success: boolean
    extractedData: Record<string, any>
    parsingErrors: string[]
  }
  recommendations: {
    critical: string[]
    important: string[]
    suggested: string[]
  }
}> {
  return new Promise((resolve) => {
    // Enterprise-level analysis
    const parsing = analyzeEnterpriseParsingCompatibility(cvText, options.fileName, options.fileSize)
    const keywordAnalysis = analyzeEnterpriseKeywords(cvText, options.jobDescription, options.industry)
    const sectionAnalysis = analyzeEnterpriseSections(cvText, options.targetATS)
    
    // Calculate ATS system scores
    const atsSystemScores: Record<string, number> = {}
    Object.keys(ENTERPRISE_ATS_STANDARDS.systems).forEach(system => {
      atsSystemScores[system] = calculateEnterpriseSystemScore(
        cvText, 
        system as keyof typeof ENTERPRISE_ATS_STANDARDS.systems,
        options.jobDescription
      )
    })
    
    // Calculate overall score
    const overallScore = Math.round(
      parsing.score * 0.3 + 
      keywordAnalysis.score * 0.4 + 
      sectionAnalysis.score * 0.3
    )
    
    // Determine rejection risk
    const rejectionRisk = calculateEnterpriseRejectionRisk(
      overallScore,
      parsing,
      keywordAnalysis,
      sectionAnalysis
    )
    
    // Calculate industry alignment
    const industryAlignment = calculateEnterpriseIndustryAlignment(cvText, options.industry)
    
    // Generate recommendations
    const recommendations = generateEnterpriseRecommendations(
      overallScore,
      parsing,
      keywordAnalysis,
      sectionAnalysis,
      rejectionRisk
    )
    
    resolve({
      overallScore,
      atsSystemScores,
      rejectionRisk,
      industryAlignment,
      parsing: {
        success: parsing.success,
        extractedData: parsing.extractedData,
        parsingErrors: parsing.errors
      },
      recommendations
    })
  })
}

// Enterprise parsing compatibility analysis
function analyzeEnterpriseParsingCompatibility(
  cvText: string,
  fileName?: string,
  fileSize?: number
): {
  success: boolean
  score: number
  extractedData: Record<string, any>
  errors: string[]
} {
  const errors: string[] = []
  let score = 100
  
  // File format analysis
  if (fileName) {
    const ext = fileName.toLowerCase().split('.').pop() || ''
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      errors.push(`Unsupported file format: ${ext}`)
      score -= 25
    }
  }
  
  // File size analysis
  if (fileSize && fileSize > 2 * 1024 * 1024) { // 2MB
    errors.push('File size exceeds recommended limit (2MB)')
    score -= 10
  }
  
  // Content parsing analysis
  const parsingIssues = validateATSFormat(cvText)
  if (!parsingIssues.isValid) {
    errors.push(...parsingIssues.issues)
    score -= parsingIssues.issues.length * 5
  }
  
  // Extract structured data
  const extractedData = extractEnterpriseData(cvText)
  
  return {
    success: errors.length === 0,
    score: Math.max(0, score),
    extractedData,
    errors
  }
}

// Enterprise keyword analysis
function analyzeEnterpriseKeywords(
  cvText: string,
  jobDescription?: string,
  industry?: keyof typeof ENTERPRISE_ATS_STANDARDS.industryRequirements
): {
  score: number
  density: number
  matched: number
  missing: string[]
  critical: string[]
} {
  const cvLower = cvText.toLowerCase()
  const jobLower = jobDescription?.toLowerCase() || ''
  
  // Industry-specific keywords
  const industryKeywords = industry ? 
    ENTERPRISE_ATS_STANDARDS.industryRequirements[industry].criticalKeywords : []
  
  // Extract keywords from job description
  const jobKeywords = jobDescription ? extractJobKeywords(jobDescription) : []
  
  // Combined keyword analysis
  const allKeywords = [...industryKeywords, ...jobKeywords]
  const matchedKeywords = allKeywords.filter(keyword => cvLower.includes(keyword.toLowerCase()))
  const missingKeywords = allKeywords.filter(keyword => !cvLower.includes(keyword.toLowerCase()))
  
  const density = allKeywords.length > 0 ? (matchedKeywords.length / allKeywords.length) * 100 : 0
  const score = Math.min(100, density * 1.2) // Scale to 100
  
  return {
    score,
    density,
    matched: matchedKeywords.length,
    missing: missingKeywords,
    critical: industryKeywords.filter(keyword => !cvLower.includes(keyword.toLowerCase()))
  }
}

// Enterprise section analysis
function analyzeEnterpriseSections(
  cvText: string,
  targetATS?: keyof typeof ENTERPRISE_ATS_STANDARDS.systems
): {
  score: number
  requiredSections: string[]
  foundSections: string[]
  missingSections: string[]
} {
  const system = targetATS ? ENTERPRISE_ATS_STANDARDS.systems[targetATS] : null
  const requiredSections = system?.requirements.requiredSections || ['contact', 'experience', 'skills']
  
  const result = simulateSectionAnalysis(cvText, system)
  
  return {
    score: result.score,
    requiredSections,
    foundSections: result.foundSections,
    missingSections: result.missingSections
  }
}

// Calculate enterprise system compatibility score
function calculateEnterpriseSystemScore(
  cvText: string,
  system: keyof typeof ENTERPRISE_ATS_STANDARDS.systems,
  jobDescription?: string
): number {
  const systemConfig = ENTERPRISE_ATS_STANDARDS.systems[system]
  
  // Simulate full ATS processing
  if (jobDescription) {
    const simulation = simulateATSProcessing(cvText, jobDescription, system)
    return simulation.score
  }
  
  // Basic compatibility score
  const baseScore = 75 // Default baseline
  const strictnessModifier = {
    'high': 0.85,
    'very_high': 0.80,
    'medium': 0.95,
    'low': 1.05
  }[systemConfig.strictness] || 1.0
  
  return Math.round(baseScore * strictnessModifier)
}

// Calculate enterprise rejection risk
function calculateEnterpriseRejectionRisk(
  overallScore: number,
  parsing: any,
  keywords: any,
  sections: any
): 'low' | 'medium' | 'high' | 'critical' {
  // Immediate rejection criteria
  if (!parsing.success || keywords.critical.length > 0 || sections.missingSections.length > 2) {
    return 'critical'
  }
  
  // High risk criteria
  if (overallScore < 50 || keywords.missing.length > 5 || sections.score < 60) {
    return 'high'
  }
  
  // Medium risk criteria
  if (overallScore < 70 || keywords.density < 15 || sections.score < 80) {
    return 'medium'
  }
  
  return 'low'
}

// Calculate enterprise industry alignment
function calculateEnterpriseIndustryAlignment(
  cvText: string,
  industry?: keyof typeof ENTERPRISE_ATS_STANDARDS.industryRequirements
): number {
  if (!industry) return 50
  
  const requirements = ENTERPRISE_ATS_STANDARDS.industryRequirements[industry]
  const cvLower = cvText.toLowerCase()
  
  const matchedKeywords = requirements.criticalKeywords.filter(keyword => 
    cvLower.includes(keyword.toLowerCase())
  )
  
  return Math.round((matchedKeywords.length / requirements.criticalKeywords.length) * 100)
}

// Generate enterprise recommendations
function generateEnterpriseRecommendations(
  overallScore: number,
  parsing: any,
  keywords: any,
  sections: any,
  rejectionRisk: string
): {
  critical: string[]
  important: string[]
  suggested: string[]
} {
  const critical: string[] = []
  const important: string[] = []
  const suggested: string[] = []
  
  // Critical recommendations
  if (rejectionRisk === 'critical') {
    if (!parsing.success) {
      critical.push('Fix parsing errors immediately - CV cannot be read by ATS systems')
    }
    if (keywords.critical.length > 0) {
      critical.push(`Add critical industry keywords: ${keywords.critical.slice(0, 3).join(', ')}`)
    }
    if (sections.missingSections.length > 0) {
      critical.push(`Add required sections: ${sections.missingSections.join(', ')}`)
    }
  }
  
  // Important recommendations
  if (overallScore < 70) {
    important.push('Overall ATS compatibility is below industry standards')
  }
  if (keywords.density < 15) {
    important.push('Increase keyword density to match job requirements')
  }
  if (sections.score < 80) {
    important.push('Improve section structure and content organization')
  }
  
  // Suggested improvements
  if (overallScore < 85) {
    suggested.push('Optimize CV for specific ATS systems used by target companies')
  }
  if (keywords.missing.length > 0) {
    suggested.push('Consider adding relevant keywords naturally throughout content')
  }
  suggested.push('Review and update CV regularly to maintain ATS compatibility')
  
  return { critical, important, suggested }
}

// Extract enterprise-level structured data
function extractEnterpriseData(cvText: string): Record<string, any> {
  const emailRegex = /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/g
  const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/g
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/gi
  
  // Improved extraction with more flexible patterns
  const emails = cvText.match(emailRegex) || []
  const phones = cvText.match(phoneRegex) || []
  const linkedin = cvText.match(linkedinRegex) || []
  
  return {
    contact: {
      emails,
      phones,
      linkedin
    },
    content: {
      wordCount: cvText.split(/\s+/).length,
      sectionCount: cvText.split(/\n\s*\n/).length,
      hasContactInfo: emails.length > 0 && phones.length > 0,
      hasLinkedIn: linkedin.length > 0
    },
    skills: extractSkillsFromText(cvText),
    experience: extractExperienceFromText(cvText),
    education: extractEducationFromText(cvText)
  }
}

// Extract skills from text
function extractSkillsFromText(cvText: string): string[] {
  const skillsSection = cvText.match(/(?:skills?|competencies|expertise|abilities)[:\s]*([^.]+)/gi)
  if (!skillsSection) return []
  
  const skills: string[] = []
  skillsSection.forEach(section => {
    const skillText = section.replace(/(?:skills?|competencies|expertise|abilities)[:\s]*/gi, '')
    const extractedSkills = skillText.split(/[,;|]/).map(skill => skill.trim()).filter(skill => skill.length > 1)
    skills.push(...extractedSkills)
  })
  
  return [...new Set(skills)] // Remove duplicates
}

// Extract experience from text
function extractExperienceFromText(cvText: string): Array<{
  title?: string
  company?: string
  duration?: string
}> {
  const experienceEntries: Array<{title?: string, company?: string, duration?: string}> = []
  
  // Look for date patterns that indicate work experience
  const datePattern = /(20\d{2}|19\d{2})\s*[-–]\s*(20\d{2}|present|current)/gi
  const dates = cvText.match(datePattern) || []
  
  // Extract job titles and companies (basic extraction)
  const jobTitlePattern = /(manager|developer|engineer|analyst|coordinator|specialist|director|senior|junior|lead|principal)\s+[\w\s]+/gi
  const jobTitles = cvText.match(jobTitlePattern) || []
  
  dates.forEach((date, index) => {
    experienceEntries.push({
      duration: date,
      title: jobTitles[index] || 'Unknown',
      company: 'Not specified'
    })
  })
  
  return experienceEntries
}

// Extract education from text
function extractEducationFromText(cvText: string): Array<{
  degree?: string
  institution?: string
  year?: string
}> {
  const educationEntries: Array<{degree?: string, institution?: string, year?: string}> = []
  
  const degreePattern = /(bachelor|master|phd|doctorate|diploma|certificate|degree)\s+[\w\s]+/gi
  const degrees = cvText.match(degreePattern) || []
  
  const institutionPattern = /(university|college|institute|school)\s+[\w\s]+/gi
  const institutions = cvText.match(institutionPattern) || []
  
  degrees.forEach((degree, index) => {
    educationEntries.push({
      degree: degree.trim(),
      institution: institutions[index] || 'Not specified',
      year: 'Not specified'
    })
  })
  
  return educationEntries
}

// Real-time ATS Simulation
export function simulateATSProcessing(
  cvText: string,
  jobDescription: string,
  atsSystem: keyof typeof ENTERPRISE_ATS_STANDARDS.systems
): {
  passed: boolean
  stage: 'parsing' | 'keyword_matching' | 'section_analysis' | 'scoring' | 'human_review'
  score: number
  feedback: string[]
  nextSteps: string[]
} {
  const system = ENTERPRISE_ATS_STANDARDS.systems[atsSystem]
  
  // Stage 1: Parsing
  const parsingResult = simulateParsing(cvText, system)
  if (!parsingResult.success) {
    return {
      passed: false,
      stage: 'parsing',
      score: 0,
      feedback: parsingResult.errors,
      nextSteps: ['Fix parsing issues', 'Simplify formatting', 'Use standard sections']
    }
  }

  // Stage 2: Keyword Matching
  const keywordResult = simulateKeywordMatching(cvText, jobDescription, system)
  const minKeywordDensity = system?.requirements?.minKeywordDensity || 10
  if (keywordResult.density < minKeywordDensity) {
    return {
      passed: false,
      stage: 'keyword_matching',
      score: keywordResult.score,
      feedback: [`Keyword density ${keywordResult.density}% below minimum ${minKeywordDensity}%`],
      nextSteps: ['Add relevant keywords', 'Optimize job description alignment', 'Include industry terms']
    }
  }

  // Stage 3: Section Analysis
  const sectionResult = simulateSectionAnalysis(cvText, system)
  if (!sectionResult.hasRequiredSections) {
    return {
      passed: false,
      stage: 'section_analysis',
      score: sectionResult.score,
      feedback: sectionResult.missingSections.map(section => `Missing required section: ${section}`),
      nextSteps: ['Add missing sections', 'Use standard headings', 'Organize content properly']
    }
  }

  // Stage 4: Final Scoring
  const finalScore = calculateFinalATSScore(parsingResult, keywordResult, sectionResult, system)
  
  return {
    passed: finalScore >= 70, // Industry standard passing score
    stage: finalScore >= 70 ? 'human_review' : 'scoring',
    score: finalScore,
    feedback: generateATSFeedback(finalScore, system),
    nextSteps: finalScore >= 70 ? 
      ['Prepare for human review', 'Optimize for interview', 'Research company culture'] :
      ['Improve CV score', 'Address feedback points', 'Resubmit after improvements']
  }
}

// Helper functions for ATS simulation
function simulateParsing(cvText: string, system: any) {
  const errors: string[] = []
  
  // Check for common parsing issues
  if (cvText.includes('│') || cvText.includes('┌') || cvText.includes('└')) {
    errors.push('Complex table formatting detected')
  }
  
  if (cvText.match(/[^\x00-\x7F]/g)?.length > 10) {
    errors.push('Too many special characters')
  }
  
  if (cvText.split('\n').length < 5) {
    errors.push('CV appears to have insufficient structure')
  }
  
  return {
    success: errors.length === 0,
    errors
  }
}

function simulateKeywordMatching(cvText: string, jobDescription: string, system: any) {
  const jobKeywords = extractJobKeywords(jobDescription)
  const cvKeywords = extractCVKeywords(cvText)
  
  const matchedCount = jobKeywords.filter(keyword => 
    cvKeywords.some(cvKeyword => cvKeyword.includes(keyword.toLowerCase()))
  ).length
  
  const density = jobKeywords.length > 0 ? (matchedCount / jobKeywords.length) * 100 : 0
  const score = Math.min(density * 2, 100) // Scale to 100
  
  return { density, score, matchedCount, totalKeywords: jobKeywords.length }
}

function simulateSectionAnalysis(cvText: string, system: any) {
  const requiredSections = system?.requirements?.requiredSections || []
  const foundSections: string[] = []
  const missingSections: string[] = []
  
  const cvLower = cvText.toLowerCase()
  
  // Enhanced section detection with better patterns
  const sectionMapping: Record<string, string[]> = {
    contact: ['contact', 'personal', 'details', 'information', '@', '+353', '+44', 'dublin', 'london', 'phone', 'email'],
    experience: ['experience', 'employment', 'work', 'career', 'professional', 'developer', 'engineer', 'manager', 'analyst', 'consultant', 'specialist'],
    skills: ['skills', 'technical', 'competencies', 'expertise', 'abilities', 'programming', 'languages', 'frameworks', 'tools', 'python', 'java', 'javascript'],
    education: ['education', 'qualifications', 'academic', 'training', 'certifications', 'university', 'college', 'degree', 'bachelor', 'master', 'phd'],
    summary: ['summary', 'profile', 'objective', 'about']
  }
  
  requiredSections.forEach((section: string) => {
    const sectionPatterns = sectionMapping[section as keyof typeof sectionMapping] || [section]
    const hasSection = sectionPatterns.some((pattern: string) => {
      // Check for pattern anywhere in text (more flexible)
      return cvLower.includes(pattern.toLowerCase())
    })
    
    if (hasSection) {
      foundSections.push(section)
    } else {
      missingSections.push(section)
    }
  })
  
  const score = requiredSections.length > 0 ? (foundSections.length / requiredSections.length) * 100 : 100
  
  return {
    hasRequiredSections: missingSections.length === 0,
    foundSections,
    missingSections,
    score
  }
}

function calculateFinalATSScore(parsing: any, keywords: any, sections: any, system: any) {
  const weights = {
    parsing: 0.3,
    keywords: 0.4,
    sections: 0.3
  }
  
  const parsingScore = parsing.success ? 100 : 0
  
  return Math.round(
    parsingScore * weights.parsing +
    keywords.score * weights.keywords +
    sections.score * weights.sections
  )
}

function generateATSFeedback(score: number, system: any) {
  const feedback: string[] = []
  const systemName = system?.name || 'ATS System'
  
  if (score >= 80) {
    feedback.push(`Excellent compatibility with ${systemName}`)
    feedback.push('High probability of passing initial screening')
  } else if (score >= 70) {
    feedback.push(`Good compatibility with ${systemName}`)
    feedback.push('Likely to pass initial screening with minor improvements')
  } else if (score >= 50) {
    feedback.push(`Moderate compatibility with ${systemName}`)
    feedback.push('Requires significant improvements to pass screening')
  } else {
    feedback.push(`Poor compatibility with ${systemName}`)
    feedback.push('Major revisions needed to pass ATS filtering')
  }
  
  return feedback
}

function extractJobKeywords(jobDescription: string): string[] {
  if (!jobDescription) return []
  
  // Simple keyword extraction - can be enhanced with NLP
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']
  const words = jobDescription.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
  
  // Return most frequent words
  const wordCount: Record<string, number> = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}

function extractCVKeywords(cvText: string): string[] {
  // Similar logic for CV keywords
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']
  return cvText.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
}