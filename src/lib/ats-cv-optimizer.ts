// Enhanced ATS CV Optimizer for CVGenius CV Builder
// Based on 2024 ATS requirements and industry best practices

import { CvBuilderDocument, CvBuilderSection } from '@/types/cv-builder'

export interface ATSOptimizationResult {
  overallScore: number
  compatibility: {
    workday: number
    greenhouse: number
    lever: number
    icims: number
    taleo: number
  }
  sections: {
    personal: SectionAnalysis
    summary: SectionAnalysis
    experience: SectionAnalysis
    education: SectionAnalysis
    skills: SectionAnalysis
  }
  formatting: FormattingAnalysis
  keywords: KeywordAnalysis
  recommendations: Recommendation[]
  warnings: Warning[]
  strengths: string[]
  rejectionRisk: 'low' | 'medium' | 'high' | 'critical'
}

export interface SectionAnalysis {
  score: number
  issues: string[]
  suggestions: string[]
  missingElements: string[]
  atsCompliant: boolean
}

export interface FormattingAnalysis {
  score: number
  issues: string[]
  fontCompatible: boolean
  structureValid: boolean
  parseability: number
  textExtraction: number
}

export interface KeywordAnalysis {
  density: number
  relevantKeywords: string[]
  missingKeywords: string[]
  overOptimization: boolean
  contextualPlacement: number
  score: number
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'formatting' | 'content' | 'keywords' | 'structure'
  issue: string
  solution: string
  impact: string
  autoFixable: boolean
}

export interface Warning {
  severity: 'error' | 'warning' | 'info'
  message: string
  section?: string
  autoFixable: boolean
}

// ATS-Friendly fonts (safe across all ATS systems)
export const ATS_SAFE_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Calibri',
  'Georgia',
  'Verdana',
  'Tahoma'
] as const

// Critical ATS keywords by industry (Irish market focused)
export const ATS_KEYWORDS_IRISH = {
  technology: {
    core: ['software development', 'programming', 'coding', 'web development', 'mobile development'],
    technical: ['javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'sql', 'html', 'css'],
    frameworks: ['angular', 'vue.js', 'express', 'spring', 'django', 'laravel'],
    tools: ['git', 'docker', 'kubernetes', 'aws', 'azure', 'jenkins', 'jira'],
    methodologies: ['agile', 'scrum', 'devops', 'ci/cd', 'test-driven development'],
    irish_context: ['dublin tech', 'remote work', 'hybrid work', 'multinational', 'startup ecosystem']
  },
  finance: {
    core: ['financial analysis', 'accounting', 'budgeting', 'forecasting', 'risk management'],
    technical: ['excel', 'sql', 'tableau', 'power bi', 'sap', 'oracle', 'bloomberg'],
    compliance: ['gdpr', 'mifid', 'central bank', 'regulatory compliance', 'audit'],
    certifications: ['cfa', 'acca', 'cpa', 'aia', 'cima'],
    irish_context: ['ifsc', 'dublin financial', 'central bank ireland', 'revenue', 'financial services']
  },
  healthcare: {
    core: ['patient care', 'clinical', 'medical', 'nursing', 'treatment', 'diagnosis'],
    technical: ['epic', 'cerner', 'hl7', 'hipaa', 'medical terminology'],
    certifications: ['nmbi', 'coru', 'rcpi', 'rcsi', 'irish medical council'],
    irish_context: ['hse', 'irish healthcare', 'medical council', 'nursing board', 'private healthcare']
  }
} as const

// ATS Section requirements
export const ATS_SECTION_REQUIREMENTS = {
  personal: {
    required: ['fullName', 'email', 'phone', 'address'],
    recommended: ['linkedin', 'website'],
    irish_specific: ['work authorization', 'visa status'],
    formatting: {
      name_prominence: true,
      contact_visibility: true,
      irish_phone_format: true
    }
  },
  summary: {
    min_length: 50,
    max_length: 300,
    keyword_density: { min: 2, max: 8 },
    required_elements: ['years of experience', 'key skills', 'value proposition']
  },
  experience: {
    required_fields: ['company', 'role', 'dates', 'achievements'],
    date_format: 'MM/YYYY',
    min_entries: 1,
    max_entries: 10,
    achievement_format: 'quantified results'
  },
  education: {
    required_fields: ['institution', 'degree', 'dates'],
    irish_specific: ['leaving cert', 'honours degree', 'irish universities'],
    format: 'reverse chronological'
  },
  skills: {
    min_skills: 6,
    max_skills: 20,
    categories: ['technical', 'soft', 'language'],
    format: 'simple list'
  }
} as const

export class ATSCVOptimizer {
  private cvData: CvBuilderDocument
  private jobKeywords: string[] = []
  private industry: string = 'general'

  constructor(cvData: CvBuilderDocument, options?: { jobKeywords?: string[], industry?: string }) {
    this.cvData = cvData
    this.jobKeywords = options?.jobKeywords || []
    this.industry = options?.industry || 'general'
  }

  // Main optimization analysis
  public analyzeATS(): ATSOptimizationResult {
    const personalAnalysis = this.analyzePersonalSection()
    const summaryAnalysis = this.analyzeSummarySection()
    const experienceAnalysis = this.analyzeExperienceSection()
    const educationAnalysis = this.analyzeEducationSection()
    const skillsAnalysis = this.analyzeSkillsSection()
    
    const formattingAnalysis = this.analyzeFormatting()
    const keywordAnalysis = this.analyzeKeywords()
    
    const compatibility = this.calculateATSCompatibility()
    const overallScore = this.calculateOverallScore({
      personal: personalAnalysis,
      summary: summaryAnalysis,
      experience: experienceAnalysis,
      education: educationAnalysis,
      skills: skillsAnalysis
    }, formattingAnalysis, keywordAnalysis)

    const recommendations = this.generateRecommendations({
      personal: personalAnalysis,
      summary: summaryAnalysis,
      experience: experienceAnalysis,
      education: educationAnalysis,
      skills: skillsAnalysis
    }, formattingAnalysis, keywordAnalysis)

    const warnings = this.generateWarnings({
      personal: personalAnalysis,
      summary: summaryAnalysis,
      experience: experienceAnalysis,
      education: educationAnalysis,
      skills: skillsAnalysis
    }, formattingAnalysis)

    const strengths = this.identifyStrengths({
      personal: personalAnalysis,
      summary: summaryAnalysis,
      experience: experienceAnalysis,
      education: educationAnalysis,
      skills: skillsAnalysis
    }, keywordAnalysis)

    const rejectionRisk = this.calculateRejectionRisk(overallScore, warnings)

    return {
      overallScore,
      compatibility,
      sections: {
        personal: personalAnalysis,
        summary: summaryAnalysis,
        experience: experienceAnalysis,
        education: educationAnalysis,
        skills: skillsAnalysis
      },
      formatting: formattingAnalysis,
      keywords: keywordAnalysis,
      recommendations,
      warnings,
      strengths,
      rejectionRisk
    }
  }

  private analyzePersonalSection(): SectionAnalysis {
    const personal = this.cvData.personal
    const issues: string[] = []
    const suggestions: string[] = []
    const missingElements: string[] = []
    
    let score = 100

    // Check required fields
    if (!personal.fullName || personal.fullName.trim().length < 2) {
      issues.push('Full name is missing or too short')
      missingElements.push('fullName')
      score -= 25
    }

    if (!personal.email || !this.isValidEmail(personal.email)) {
      issues.push('Valid email address is required')
      missingElements.push('email')
      score -= 20
    }

    if (!personal.phone || !this.isValidIrishPhone(personal.phone)) {
      issues.push('Valid Irish phone number is required (+353 format preferred)')
      missingElements.push('phone')
      score -= 20
    }

    if (!personal.address || !personal.address.includes('Ireland')) {
      issues.push('Irish address/location not clearly specified')
      missingElements.push('irish_location')
      score -= 15
    }

    // Check recommended fields
    if (!personal.linkedin) {
      suggestions.push('Add LinkedIn profile URL for better ATS scoring')
      score -= 5
    }

    // Check work authorization for non-EU
    if (!personal.workPermit && !this.hasWorkAuthorizationMention()) {
      suggestions.push('Consider adding work authorization status (EU Citizen, Stamp 4, etc.)')
      score -= 10
    }

    const atsCompliant = score >= 70

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      missingElements,
      atsCompliant
    }
  }

  private analyzeSummarySection(): SectionAnalysis {
    const summarySection = this.cvData.sections.find(s => s.type === 'summary') as { type: 'summary'; markdown: string } | undefined
    const summary = summarySection?.markdown || ''
    
    const issues: string[] = []
    const suggestions: string[] = []
    const missingElements: string[] = []
    let score = 100

    if (!summary || summary.trim().length === 0) {
      issues.push('Professional summary is missing - critical for ATS ranking')
      missingElements.push('summary_content')
      score = 0
    } else {
      const wordCount = summary.split(/\s+/).length
      
      if (wordCount < 20) {
        issues.push('Summary too short - minimum 20 words recommended')
        score -= 30
      } else if (wordCount > 100) {
        issues.push('Summary too long - maximum 100 words for optimal ATS parsing')
        score -= 15
      }

      // Check for keyword density
      const keywordCount = this.countKeywordsInText(summary)
      if (keywordCount < 2) {
        issues.push('Summary lacks relevant keywords for ATS matching')
        score -= 25
      }

      // Check for quantifiable achievements
      if (!this.hasQuantifiableResults(summary)) {
        suggestions.push('Include specific numbers or achievements in summary')
        score -= 10
      }

      // Check for years of experience mention
      if (!/\d+[\s-]+years?/i.test(summary)) {
        suggestions.push('Mention years of experience in summary')
        score -= 5
      }
    }

    const atsCompliant = score >= 70

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      missingElements,
      atsCompliant
    }
  }

  private analyzeExperienceSection(): SectionAnalysis {
    const experienceSection = this.cvData.sections.find(s => s.type === 'experience') as { type: 'experience'; items: any[] } | undefined
    const experiences = experienceSection?.items || []
    
    const issues: string[] = []
    const suggestions: string[] = []
    const missingElements: string[] = []
    let score = 100

    if (experiences.length === 0) {
      issues.push('No work experience listed - critical for ATS ranking')
      missingElements.push('work_experience')
      score = 0
    } else {
      experiences.forEach((exp, index) => {
        const expNum = index + 1

        if (!exp.company || exp.company.trim().length < 2) {
          issues.push(`Experience ${expNum}: Company name missing or too short`)
          score -= 15
        }

        if (!exp.role || exp.role.trim().length < 2) {
          issues.push(`Experience ${expNum}: Job title missing or too short`)
          score -= 15
        }

        if (!exp.start || !this.isValidDate(exp.start)) {
          issues.push(`Experience ${expNum}: Invalid or missing start date`)
          score -= 10
        }

        if (!exp.bullets || exp.bullets.length === 0) {
          issues.push(`Experience ${expNum}: No job responsibilities or achievements listed`)
          score -= 20
        } else {
          // Check for quantifiable achievements
          const hasQuantified = exp.bullets.some((bullet: string) => this.hasQuantifiableResults(bullet))
          if (!hasQuantified) {
            suggestions.push(`Experience ${expNum}: Add quantified achievements (numbers, percentages, etc.)`)
            score -= 10
          }

          // Check for keyword usage
          const experienceText = exp.bullets.join(' ')
          const keywordCount = this.countKeywordsInText(experienceText)
          if (keywordCount < 2) {
            suggestions.push(`Experience ${expNum}: Include more relevant keywords`)
            score -= 5
          }
        }
      })

      // Check for recent experience
      const recentExperience = experiences.find(exp => 
        exp.end === 'Present' || this.isRecentDate(exp.end)
      )
      if (!recentExperience) {
        suggestions.push('Include recent or current work experience')
        score -= 15
      }
    }

    const atsCompliant = score >= 70

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      missingElements,
      atsCompliant
    }
  }

  private analyzeEducationSection(): SectionAnalysis {
    const educationSection = this.cvData.sections.find(s => s.type === 'education') as { type: 'education'; items: any[] } | undefined
    const education = educationSection?.items || []
    
    const issues: string[] = []
    const suggestions: string[] = []
    const missingElements: string[] = []
    let score = 100

    if (education.length === 0) {
      issues.push('No education listed - required for most ATS systems')
      missingElements.push('education')
      score -= 40
    } else {
      education.forEach((edu, index) => {
        const eduNum = index + 1

        if (!edu.institution || edu.institution.trim().length < 2) {
          issues.push(`Education ${eduNum}: Institution name missing`)
          score -= 15
        }

        if (!edu.degree || edu.degree.trim().length < 2) {
          issues.push(`Education ${eduNum}: Degree/qualification missing`)
          score -= 15
        }

        if (!edu.field || edu.field.trim().length < 2) {
          suggestions.push(`Education ${eduNum}: Field of study not specified`)
          score -= 5
        }

        if (!edu.end || !this.isValidDate(edu.end)) {
          suggestions.push(`Education ${eduNum}: Graduation date not specified`)
          score -= 5
        }
      })

      // Check for Irish education context
      const hasIrishEducation = education.some(edu => 
        this.isIrishInstitution(edu.institution)
      )
      if (hasIrishEducation) {
        suggestions.push('Irish education detected - good for local ATS systems')
      }
    }

    const atsCompliant = score >= 70

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      missingElements,
      atsCompliant
    }
  }

  private analyzeSkillsSection(): SectionAnalysis {
    const skillsSection = this.cvData.sections.find(s => s.type === 'skills') as { type: 'skills'; items: string[] } | undefined
    const skills = skillsSection?.items || []
    
    const issues: string[] = []
    const suggestions: string[] = []
    const missingElements: string[] = []
    let score = 100

    if (skills.length === 0) {
      issues.push('No skills listed - critical for ATS keyword matching')
      missingElements.push('skills')
      score = 0
    } else {
      if (skills.length < 6) {
        issues.push('Too few skills listed - minimum 6 recommended for ATS')
        score -= 30
      } else if (skills.length > 20) {
        issues.push('Too many skills listed - maximum 20 for optimal ATS parsing')
        score -= 15
      }

      // Check for relevant keywords
      const relevantSkills = skills.filter(skill => 
        this.isRelevantSkill(skill)
      )
      
      if (relevantSkills.length < skills.length * 0.7) {
        suggestions.push('Include more industry-relevant skills')
        score -= 20
      }

      // Check for both technical and soft skills
      const technicalSkills = skills.filter(skill => this.isTechnicalSkill(skill))
      const softSkills = skills.filter(skill => this.isSoftSkill(skill))

      if (technicalSkills.length === 0) {
        suggestions.push('Include technical skills relevant to your field')
        score -= 15
      }

      if (softSkills.length === 0) {
        suggestions.push('Include soft skills (communication, leadership, etc.)')
        score -= 10
      }

      // Check for keyword matching with job description
      if (this.jobKeywords.length > 0) {
        const matchingSkills = skills.filter(skill => 
          this.jobKeywords.some(keyword => 
            skill.toLowerCase().includes(keyword.toLowerCase())
          )
        )
        
        if (matchingSkills.length === 0) {
          issues.push('No skills match the job requirements')
          score -= 25
        } else if (matchingSkills.length < this.jobKeywords.length * 0.3) {
          suggestions.push('Add more skills that match the job requirements')
          score -= 15
        }
      }
    }

    const atsCompliant = score >= 70

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      missingElements,
      atsCompliant
    }
  }

  private analyzeFormatting(): FormattingAnalysis {
    const issues: string[] = []
    let score = 100

    // Check section structure
    const requiredSections = ['summary', 'experience', 'education', 'skills']
    const presentSections = this.cvData.sections.map(s => s.type)
    
    const missingSections = requiredSections.filter(section => 
      !presentSections.includes(section as any)
    )

    if (missingSections.length > 0) {
      issues.push(`Missing required sections: ${missingSections.join(', ')}`)
      score -= missingSections.length * 20
    }

    // Check section visibility
    const hiddenRequiredSections = requiredSections.filter(section => 
      this.cvData.sectionVisibility?.[section as keyof typeof this.cvData.sectionVisibility] === false
    )

    if (hiddenRequiredSections.length > 0) {
      issues.push(`Required sections are hidden: ${hiddenRequiredSections.join(', ')}`)
      score -= hiddenRequiredSections.length * 15
    }

    // Font compatibility (assuming default is ATS-safe)
    const fontCompatible = true // CV builder uses safe fonts by default

    // Structure validation
    const structureValid = missingSections.length === 0

    // Parseability score
    let parseability = 100
    if (missingSections.length > 0) parseability -= 25
    if (hiddenRequiredSections.length > 0) parseability -= 20

    // Text extraction score (high for CV builder generated content)
    const textExtraction = 95

    return {
      score: Math.max(0, score),
      issues,
      fontCompatible,
      structureValid,
      parseability: Math.max(0, parseability),
      textExtraction
    }
  }

  private analyzeKeywords(): KeywordAnalysis {
    const allText = this.getAllCVText()
    const relevantKeywords: string[] = []
    const missingKeywords: string[] = []
    
    // Get industry-specific keywords
    const industryKeywords = this.getIndustryKeywords()
    
    // Analyze keyword presence
    industryKeywords.forEach(keyword => {
      if (this.textContainsKeyword(allText, keyword)) {
        relevantKeywords.push(keyword)
      } else {
        missingKeywords.push(keyword)
      }
    })

    // Add job-specific keywords if provided
    this.jobKeywords.forEach(keyword => {
      if (this.textContainsKeyword(allText, keyword)) {
        if (!relevantKeywords.includes(keyword)) {
          relevantKeywords.push(keyword)
        }
      } else {
        if (!missingKeywords.includes(keyword)) {
          missingKeywords.push(keyword)
        }
      }
    })

    // Calculate keyword density
    const wordCount = allText.split(/\s+/).length
    const keywordCount = relevantKeywords.length
    const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0

    // Check for over-optimization
    const overOptimization = density > 15 // More than 15% keyword density is suspicious

    // Contextual placement score
    const contextualPlacement = this.calculateContextualPlacement(allText, relevantKeywords)

    // Overall keyword score
    const score = Math.min(100, 
      (relevantKeywords.length / Math.max(1, industryKeywords.length + this.jobKeywords.length)) * 100
    )

    return {
      density,
      relevantKeywords,
      missingKeywords: missingKeywords.slice(0, 10), // Limit to top 10 missing
      overOptimization,
      contextualPlacement,
      score
    }
  }

  private calculateATSCompatibility() {
    const baseScore = 75 // CV builder generates good base format
    
    return {
      workday: baseScore + this.getWorkdayBonus(),
      greenhouse: baseScore + this.getGreenhouseBonus(),
      lever: baseScore + this.getLeverBonus(),
      icims: baseScore + this.getICIMSBonus(),
      taleo: baseScore + this.getTaleoBonus()
    }
  }

  private calculateOverallScore(sections: any, formatting: FormattingAnalysis, keywords: KeywordAnalysis): number {
    const sectionScores = Object.values(sections).map((s: any) => s.score)
    const avgSectionScore = sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length
    
    return Math.round(
      avgSectionScore * 0.5 +  // Sections 50%
      formatting.score * 0.3 +  // Formatting 30%
      keywords.score * 0.2      // Keywords 20%
    )
  }

  private generateRecommendations(sections: any, formatting: FormattingAnalysis, keywords: KeywordAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Critical formatting issues
    if (formatting.score < 70) {
      recommendations.push({
        priority: 'critical',
        category: 'formatting',
        issue: 'CV structure not ATS-compliant',
        solution: 'Ensure all required sections are present and visible',
        impact: 'Prevents ATS from parsing CV correctly',
        autoFixable: true
      })
    }

    // Missing keywords
    if (keywords.missingKeywords.length > 5) {
      recommendations.push({
        priority: 'high',
        category: 'keywords',
        issue: 'Missing important keywords',
        solution: `Add these keywords naturally: ${keywords.missingKeywords.slice(0, 3).join(', ')}`,
        impact: 'Improves ATS ranking and keyword matching',
        autoFixable: false
      })
    }

    // Section-specific recommendations
    Object.entries(sections).forEach(([sectionName, analysis]: [string, any]) => {
      if (analysis.score < 70) {
        const critical = analysis.score < 50
        recommendations.push({
          priority: critical ? 'critical' : 'high',
          category: 'content',
          issue: `${sectionName} section needs improvement`,
          solution: analysis.suggestions[0] || analysis.issues[0],
          impact: `Improves ${sectionName} section ATS scoring`,
          autoFixable: false
        })
      }
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  private generateWarnings(sections: any, formatting: FormattingAnalysis): Warning[] {
    const warnings: Warning[] = []

    // Critical errors
    if (formatting.score < 50) {
      warnings.push({
        severity: 'error',
        message: 'CV structure will likely be rejected by ATS systems',
        autoFixable: true
      })
    }

    // Section warnings
    Object.entries(sections).forEach(([sectionName, analysis]: [string, any]) => {
      if (!analysis.atsCompliant) {
        warnings.push({
          severity: analysis.score < 50 ? 'error' : 'warning',
          message: `${sectionName} section not ATS-compliant`,
          section: sectionName,
          autoFixable: false
        })
      }
    })

    return warnings
  }

  private identifyStrengths(sections: any, keywords: KeywordAnalysis): string[] {
    const strengths: string[] = []

    if (keywords.score >= 80) {
      strengths.push('Excellent keyword optimization')
    }

    Object.entries(sections).forEach(([sectionName, analysis]: [string, any]) => {
      if (analysis.score >= 90) {
        strengths.push(`Strong ${sectionName} section`)
      }
    })

    if (this.cvData.personal.address?.includes('Ireland')) {
      strengths.push('Irish location clearly specified')
    }

    if (this.cvData.personal.linkedin) {
      strengths.push('LinkedIn profile included')
    }

    return strengths
  }

  private calculateRejectionRisk(score: number, warnings: Warning[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalWarnings = warnings.filter(w => w.severity === 'error').length
    
    if (criticalWarnings > 0 || score < 40) return 'critical'
    if (score < 60) return 'high'
    if (score < 80) return 'medium'
    return 'low'
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  private isValidIrishPhone(phone: string): boolean {
    return /(\+353|0)[1-9][0-9]{7,9}/.test(phone.replace(/\s+/g, ''))
  }

  private hasWorkAuthorizationMention(): boolean {
    const allText = this.getAllCVText().toLowerCase()
    const authKeywords = ['eu citizen', 'stamp', 'work permit', 'visa', 'eligible to work']
    return authKeywords.some(keyword => allText.includes(keyword))
  }

  private countKeywordsInText(text: string): number {
    const keywords = this.getIndustryKeywords().concat(this.jobKeywords)
    return keywords.filter(keyword => 
      this.textContainsKeyword(text, keyword)
    ).length
  }

  private hasQuantifiableResults(text: string): boolean {
    return /\d+[\s]*(%|percent|million|thousand|k\b|\$|€|£)/.test(text)
  }

  private isValidDate(dateStr: string): boolean {
    if (dateStr === 'Present') return true
    return /^\d{2}\/\d{4}$|^\d{4}$/.test(dateStr)
  }

  private isRecentDate(dateStr: string): boolean {
    if (dateStr === 'Present') return true
    const currentYear = new Date().getFullYear()
    const year = parseInt(dateStr.split('/').pop() || '0')
    return currentYear - year <= 2
  }

  private isIrishInstitution(institution: string): boolean {
    const irishInstitutions = [
      'trinity', 'ucd', 'dcu', 'dit', 'nuig', 'ucc', 'ul', 'maynooth', 
      'dublin', 'cork', 'galway', 'limerick', 'ireland'
    ]
    return irishInstitutions.some(inst => 
      institution.toLowerCase().includes(inst)
    )
  }

  private isRelevantSkill(skill: string): boolean {
    const industryKeywords = this.getIndustryKeywords()
    return industryKeywords.some(keyword => 
      skill.toLowerCase().includes(keyword.toLowerCase())
    ) || this.jobKeywords.some(keyword => 
      skill.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  private isTechnicalSkill(skill: string): boolean {
    const technicalTerms = [
      'programming', 'software', 'development', 'programming', 'coding',
      'javascript', 'python', 'java', 'html', 'css', 'sql', 'database',
      'cloud', 'aws', 'azure', 'docker', 'git', 'api', 'framework'
    ]
    return technicalTerms.some(term => 
      skill.toLowerCase().includes(term)
    )
  }

  private isSoftSkill(skill: string): boolean {
    const softSkillTerms = [
      'communication', 'leadership', 'teamwork', 'management', 'problem',
      'analytical', 'creative', 'organized', 'time management', 'adaptable'
    ]
    return softSkillTerms.some(term => 
      skill.toLowerCase().includes(term)
    )
  }

  private getAllCVText(): string {
    const texts: string[] = [
      this.cvData.personal.fullName,
      this.cvData.personal.title,
      this.cvData.personal.email,
      this.cvData.personal.address
    ]

    this.cvData.sections.forEach(section => {
      if (section.type === 'summary') {
        texts.push(section.markdown)
      } else if ('items' in section) {
        section.items.forEach((item: any) => {
          if (typeof item === 'string') {
            texts.push(item)
          } else {
            Object.values(item).forEach(value => {
              if (typeof value === 'string') {
                texts.push(value)
              } else if (Array.isArray(value)) {
                texts.push(...value.filter(v => typeof v === 'string'))
              }
            })
          }
        })
      }
    })

    return texts.join(' ').toLowerCase()
  }

  private getIndustryKeywords(): string[] {
    const industryData = ATS_KEYWORDS_IRISH[this.industry as keyof typeof ATS_KEYWORDS_IRISH]
    if (!industryData) return []

    return [
      ...industryData.core,
      ...('technical' in industryData ? industryData.technical : []),
      ...('irish_context' in industryData ? industryData.irish_context : [])
    ]
  }

  private textContainsKeyword(text: string, keyword: string): boolean {
    const cleanText = text.toLowerCase()
    const cleanKeyword = keyword.toLowerCase()
    return cleanText.includes(cleanKeyword)
  }

  private calculateContextualPlacement(text: string, keywords: string[]): number {
    // Simple implementation - could be enhanced with NLP
    let score = 0
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 10
      }
    })
    return Math.min(100, score)
  }

  // ATS System specific bonuses
  private getWorkdayBonus(): number {
    let bonus = 0
    if (this.cvData.personal.linkedin) bonus += 5
    if (this.hasQuantifiableResults(this.getAllCVText())) bonus += 10
    return Math.min(25, bonus)
  }

  private getGreenhouseBonus(): number {
    let bonus = 0
    const skillsSection = this.cvData.sections.find(s => s.type === 'skills')
    if (skillsSection && 'items' in skillsSection && skillsSection.items.length >= 8) bonus += 10
    if (this.isTechRole()) bonus += 15
    return Math.min(25, bonus)
  }

  private getLeverBonus(): number {
    let bonus = 0
    if (this.cvData.personal.website) bonus += 5
    if (this.hasRecentExperience()) bonus += 10
    return Math.min(25, bonus)
  }

  private getICIMSBonus(): number {
    let bonus = 0
    if (this.hasEducationDetails()) bonus += 10
    if (this.hasWorkAuthorizationMention()) bonus += 5
    return Math.min(25, bonus)
  }

  private getTaleoBonus(): number {
    let bonus = 0
    if (this.hasCompleteContactInfo()) bonus += 15
    return Math.min(25, bonus)
  }

  private isTechRole(): boolean {
    const allText = this.getAllCVText()
    const techTerms = ['developer', 'engineer', 'programmer', 'software', 'technical']
    return techTerms.some(term => allText.includes(term))
  }

  private hasRecentExperience(): boolean {
    const experienceSection = this.cvData.sections.find(s => s.type === 'experience')
    if (!experienceSection || !('items' in experienceSection)) return false
    
    return experienceSection.items.some((exp: any) => 
      exp.end === 'Present' || this.isRecentDate(exp.end)
    )
  }

  private hasEducationDetails(): boolean {
    const educationSection = this.cvData.sections.find(s => s.type === 'education')
    return !!(educationSection && 'items' in educationSection && educationSection.items.length > 0)
  }

  private hasCompleteContactInfo(): boolean {
    const { fullName, email, phone, address } = this.cvData.personal
    return !!(fullName && email && phone && address)
  }
}

// Export utility functions for real-time optimization
export function getATSOptimizationSuggestions(cvData: CvBuilderDocument, jobKeywords?: string[], industry?: string): string[] {
  const optimizer = new ATSCVOptimizer(cvData, { jobKeywords, industry })
  const analysis = optimizer.analyzeATS()
  
  return analysis.recommendations
    .filter(r => r.priority === 'critical' || r.priority === 'high')
    .slice(0, 5)
    .map(r => r.solution)
}

export function calculateATSScore(cvData: CvBuilderDocument, jobKeywords?: string[], industry?: string): number {
  const optimizer = new ATSCVOptimizer(cvData, { jobKeywords, industry })
  const analysis = optimizer.analyzeATS()
  return analysis.overallScore
}

export function getATSCompatibilityWarnings(cvData: CvBuilderDocument): Warning[] {
  const optimizer = new ATSCVOptimizer(cvData)
  const analysis = optimizer.analyzeATS()
  return analysis.warnings.filter(w => w.severity === 'error')
} 