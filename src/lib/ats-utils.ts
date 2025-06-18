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