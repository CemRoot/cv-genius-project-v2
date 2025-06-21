// AI-Powered CV Parser for CVGenius Mobile
// Intelligent text extraction and structured data parsing from CVs

export interface ParsedCVData {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin?: string
    github?: string
    website?: string
  }
  summary: string
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
    achievements: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    grade?: string
  }>
  skills: {
    technical: string[]
    soft: string[]
    languages: Array<{
      language: string
      proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native'
    }>
  }
  certifications: Array<{
    name: string
    issuer: string
    date: string
    expiryDate?: string
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
    url?: string
  }>
  awards: Array<{
    name: string
    issuer: string
    date: string
    description?: string
  }>
  confidence: number // 0-100 confidence score
  originalText: string
}

export interface AIParsingOptions {
  enableSmartExtraction: boolean
  dublinJobFocus: boolean
  includeKeywordOptimization: boolean
  extractProjects: boolean
  detectLanguages: boolean
}

const defaultOptions: AIParsingOptions = {
  enableSmartExtraction: true,
  dublinJobFocus: true,
  includeKeywordOptimization: true,
  extractProjects: true,
  detectLanguages: true
}

// Dublin-focused keywords and patterns
const DUBLIN_PATTERNS = {
  companies: [
    'google', 'facebook', 'meta', 'microsoft', 'amazon', 'apple',
    'accenture', 'deloitte', 'pwc', 'kpmg', 'ey',
    'bank of ireland', 'aib', 'ulster bank', 'permanent tsb',
    'ryanair', 'paddy power', 'betfair', 'flutter',
    'stripe', 'hubspot', 'zendesk', 'intercom',
    'pfizer', 'novartis', 'johnson & johnson', 'merck',
    'trinity college', 'ucd', 'dcu', 'dit', 'tud'
  ],
  locations: [
    'dublin', 'cork', 'galway', 'limerick', 'waterford',
    'sandyford', 'ifsc', 'grand canal dock', 'ballsbridge',
    'leopardstown', 'citywest', 'blanchardstown'
  ],
  industries: [
    'fintech', 'pharmaceuticals', 'technology', 'finance',
    'healthcare', 'consulting', 'aviation', 'gaming',
    'software development', 'data science', 'cybersecurity'
  ]
}

// AI-powered text analysis patterns
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(?:\+353|0)\s*[1-9]\s*[\d\s-]{6,12}/g,
  linkedin: /(?:linkedin\.com\/in\/|linkedin\.com\/profile\/view\?id=)[A-Za-z0-9-]+/gi,
  github: /(?:github\.com\/)[A-Za-z0-9-]+/gi,
  website: /(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s]*)?/g,
  dateRange: /(\d{1,2}\/\d{4}|\d{4}|\w+ \d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|\d{4}|\w+ \d{4}|present|current)/gi,
  monthYear: /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b/gi,
  yearOnly: /\b(19|20)\d{2}\b/g
}

// Industry-specific skill mapping
const SKILL_CATEGORIES = {
  technical: [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    // Web Technologies
    'react', 'angular', 'vue', 'node.js', 'express', 'next.js', 'nuxt', 'svelte',
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql server',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
    // Data & AI
    'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'spark', 'hadoop',
    // Mobile
    'ios', 'android', 'react native', 'flutter', 'xamarin',
    // Other
    'git', 'linux', 'agile', 'scrum', 'jira', 'confluence'
  ],
  soft: [
    'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical thinking',
    'project management', 'time management', 'adaptability', 'creativity', 'attention to detail',
    'customer service', 'negotiation', 'presentation', 'mentoring', 'collaboration'
  ]
}

export class AICVParser {
  private options: AIParsingOptions

  constructor(options: Partial<AIParsingOptions> = {}) {
    this.options = { ...defaultOptions, ...options }
  }

  async parseCV(text: string): Promise<ParsedCVData> {
    const cleanedText = this.preprocessText(text)
    
    // Extract different sections
    const personalInfo = this.extractPersonalInfo(cleanedText)
    const summary = this.extractSummary(cleanedText)
    const experience = this.extractExperience(cleanedText)
    const education = this.extractEducation(cleanedText)
    const skills = this.extractSkills(cleanedText)
    const certifications = this.extractCertifications(cleanedText)
    const projects = this.options.extractProjects ? this.extractProjects(cleanedText) : []
    const awards = this.extractAwards(cleanedText)

    // Calculate confidence score
    const confidence = this.calculateConfidence({
      personalInfo,
      summary,
      experience,
      education,
      skills,
      certifications,
      projects,
      awards
    })

    return {
      personalInfo,
      summary,
      experience,
      education,
      skills,
      certifications,
      projects,
      awards,
      confidence,
      originalText: text
    }
  }

  private preprocessText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private extractPersonalInfo(text: string): ParsedCVData['personalInfo'] {
    const lines = text.split('\n').slice(0, 10) // Check first 10 lines
    const topText = lines.join(' ')

    // Extract email
    const emailMatch = topText.match(PATTERNS.email)
    const email = emailMatch ? emailMatch[0] : ''

    // Extract phone
    const phoneMatch = topText.match(PATTERNS.phone)
    const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, ' ').trim() : ''

    // Extract name (usually the first meaningful line)
    const name = this.extractName(lines)

    // Extract location
    const location = this.extractLocation(topText)

    // Extract social links
    const linkedinMatch = topText.match(PATTERNS.linkedin)
    const linkedin = linkedinMatch ? linkedinMatch[0] : ''

    const githubMatch = topText.match(PATTERNS.github)
    const github = githubMatch ? githubMatch[0] : ''

    const websiteMatch = topText.match(PATTERNS.website)
    const website = websiteMatch ? websiteMatch.find(url => 
      !url.includes('linkedin.com') && !url.includes('github.com')
    ) || '' : ''

    return {
      name,
      email,
      phone,
      location,
      linkedin,
      github,
      website
    }
  }

  private extractName(lines: string[]): string {
    for (const line of lines) {
      const cleanLine = line.trim()
      // Skip email lines, phone lines, and common headers
      if (cleanLine.match(PATTERNS.email) || 
          cleanLine.match(PATTERNS.phone) ||
          cleanLine.toLowerCase().includes('curriculum vitae') ||
          cleanLine.toLowerCase().includes('resume') ||
          cleanLine.length < 5 ||
          cleanLine.length > 50) {
        continue
      }

      // Check if it looks like a name (2-4 words, mostly letters)
      const words = cleanLine.split(/\s+/)
      if (words.length >= 2 && words.length <= 4 && 
          words.every(word => /^[A-Za-z'\-\.]+$/.test(word))) {
        return cleanLine
      }
    }
    return ''
  }

  private extractLocation(text: string): string {
    const locationPatterns = [
      ...DUBLIN_PATTERNS.locations,
      'ireland', 'dublin', 'cork', 'galway', 'limerick'
    ]

    for (const location of locationPatterns) {
      const regex = new RegExp(`\\b${location}\\b`, 'gi')
      if (regex.test(text)) {
        return location.charAt(0).toUpperCase() + location.slice(1)
      }
    }

    // Look for city, country pattern
    const cityCountryMatch = text.match(/([A-Za-z\s]+),\s*([A-Za-z\s]+)/g)
    if (cityCountryMatch) {
      return cityCountryMatch[0]
    }

    return ''
  }

  private extractSummary(text: string): string {
    const summaryKeywords = [
      'summary', 'profile', 'objective', 'about', 'overview',
      'professional summary', 'career objective', 'personal statement'
    ]

    const sections = this.splitIntoSections(text)
    
    for (const section of sections) {
      const header = section.header.toLowerCase()
      if (summaryKeywords.some(keyword => header.includes(keyword))) {
        return section.content.substring(0, 500) // Limit summary length
      }
    }

    // If no explicit summary section, try to extract from the beginning
    const lines = text.split('\n')
    let summaryStart = -1
    
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const line = lines[i].toLowerCase()
      if (summaryKeywords.some(keyword => line.includes(keyword))) {
        summaryStart = i + 1
        break
      }
    }

    if (summaryStart > -1) {
      const summaryLines = []
      for (let i = summaryStart; i < Math.min(lines.length, summaryStart + 5); i++) {
        const line = lines[i].trim()
        if (line.length > 20) {
          summaryLines.push(line)
        }
        if (line.length < 10) break // End of summary
      }
      return summaryLines.join(' ').substring(0, 500)
    }

    return ''
  }

  private extractExperience(text: string): ParsedCVData['experience'] {
    const experienceKeywords = ['experience', 'employment', 'work history', 'career', 'professional experience']
    const sections = this.splitIntoSections(text)
    
    let experienceSection = ''
    for (const section of sections) {
      const header = section.header.toLowerCase()
      if (experienceKeywords.some(keyword => header.includes(keyword))) {
        experienceSection = section.content
        break
      }
    }

    if (!experienceSection) return []

    return this.parseExperienceEntries(experienceSection)
  }

  private parseExperienceEntries(text: string): ParsedCVData['experience'] {
    const entries: ParsedCVData['experience'] = []
    const blocks = text.split(/\n\s*\n/).filter(block => block.trim().length > 50)

    for (const block of blocks) {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      if (lines.length < 2) continue

      // First line is usually position/company
      const firstLine = lines[0]
      const dateMatches = block.match(PATTERNS.dateRange)
      
      let position = ''
      let company = ''
      let startDate = ''
      let endDate = ''

      // Parse position and company from first line
      if (firstLine.includes(' at ')) {
        const parts = firstLine.split(' at ')
        position = parts[0].trim()
        company = parts[1].trim()
      } else if (firstLine.includes(' - ')) {
        const parts = firstLine.split(' - ')
        position = parts[0].trim()
        company = parts[1].trim()
      } else {
        position = firstLine
        // Try to find company in subsequent lines
        for (let i = 1; i < Math.min(lines.length, 3); i++) {
          if (!lines[i].match(PATTERNS.dateRange) && lines[i].length < 50) {
            company = lines[i]
            break
          }
        }
      }

      // Parse dates
      if (dateMatches && dateMatches.length > 0) {
        const dateRange = dateMatches[0]
        const parts = dateRange.split(/[-–—]/)
        if (parts.length === 2) {
          startDate = parts[0].trim()
          endDate = parts[1].trim()
        }
      }

      // Extract description and achievements
      const descriptionLines = lines.filter(line => 
        !line.includes(position) && 
        !line.includes(company) && 
        !line.match(PATTERNS.dateRange)
      )

      const description = descriptionLines.join(' ').substring(0, 300)
      const achievements = this.extractAchievements(descriptionLines)

      if (position || company) {
        entries.push({
          position,
          company,
          startDate,
          endDate,
          description,
          achievements
        })
      }
    }

    return entries
  }

  private extractAchievements(lines: string[]): string[] {
    const achievements: string[] = []
    const achievementIndicators = ['achieved', 'delivered', 'improved', 'increased', 'reduced', 'led', 'managed', 'created', 'developed']
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      if (achievementIndicators.some(indicator => lowerLine.includes(indicator)) ||
          line.includes('%') || 
          line.match(/\d+/)) {
        achievements.push(line.trim())
      }
    }

    return achievements.slice(0, 5) // Limit to 5 achievements per role
  }

  private extractEducation(text: string): ParsedCVData['education'] {
    const educationKeywords = ['education', 'academic', 'qualifications', 'degrees']
    const sections = this.splitIntoSections(text)
    
    let educationSection = ''
    for (const section of sections) {
      const header = section.header.toLowerCase()
      if (educationKeywords.some(keyword => header.includes(keyword))) {
        educationSection = section.content
        break
      }
    }

    if (!educationSection) return []

    return this.parseEducationEntries(educationSection)
  }

  private parseEducationEntries(text: string): ParsedCVData['education'] {
    const entries: ParsedCVData['education'] = []
    const blocks = text.split(/\n\s*\n/).filter(block => block.trim().length > 20)

    for (const block of blocks) {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      if (lines.length < 1) continue

      const dateMatches = block.match(PATTERNS.dateRange)
      let institution = ''
      let degree = ''
      let field = ''
      let startDate = ''
      let endDate = ''
      let grade = ''

      // Try to identify institution (usually contains university, college, school)
      const institutionLine = lines.find(line => 
        /university|college|school|institute|academy/i.test(line)
      ) || lines[lines.length - 1] // Fallback to last line

      institution = institutionLine || ''

      // Try to identify degree
      const degreeLine = lines.find(line => 
        /bachelor|master|phd|diploma|certificate|degree/i.test(line)
      ) || lines[0] // Fallback to first line

      degree = degreeLine || ''

      // Extract field of study
      const fieldPatterns = [
        /in\s+([^,\n]+)/i,
        /of\s+([^,\n]+)/i,
        /([^,\n]+)\s+degree/i
      ]

      for (const pattern of fieldPatterns) {
        const match = degree.match(pattern)
        if (match) {
          field = match[1].trim()
          break
        }
      }

      // Parse dates
      if (dateMatches && dateMatches.length > 0) {
        const dateRange = dateMatches[0]
        const parts = dateRange.split(/[-–—]/)
        if (parts.length === 2) {
          startDate = parts[0].trim()
          endDate = parts[1].trim()
        }
      }

      // Look for grade/GPA
      const gradeMatch = block.match(/(?:gpa|grade|result)[:\s]*([0-9.]+)/i)
      if (gradeMatch) {
        grade = gradeMatch[1]
      }

      if (institution || degree) {
        entries.push({
          institution,
          degree,
          field,
          startDate,
          endDate,
          grade
        })
      }
    }

    return entries
  }

  private extractSkills(text: string): ParsedCVData['skills'] {
    const skillsKeywords = ['skills', 'competencies', 'technologies', 'expertise', 'proficiencies']
    const sections = this.splitIntoSections(text)
    
    let skillsSection = ''
    for (const section of sections) {
      const header = section.header.toLowerCase()
      if (skillsKeywords.some(keyword => header.includes(keyword))) {
        skillsSection = section.content
        break
      }
    }

    // Also search in the entire document for skills
    const allText = skillsSection || text
    
    const technical: string[] = []
    const soft: string[] = []
    const languages: Array<{ language: string; proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native' }> = []

    // Extract technical skills
    for (const skill of SKILL_CATEGORIES.technical) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      if (regex.test(allText)) {
        technical.push(skill)
      }
    }

    // Extract soft skills
    for (const skill of SKILL_CATEGORIES.soft) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      if (regex.test(allText)) {
        soft.push(skill)
      }
    }

    // Extract languages if enabled
    if (this.options.detectLanguages) {
      const languagePatterns = [
        'english', 'irish', 'gaelic', 'french', 'german', 'spanish', 'italian',
        'portuguese', 'dutch', 'polish', 'mandarin', 'chinese', 'japanese',
        'arabic', 'russian', 'hindi'
      ]

      for (const lang of languagePatterns) {
        const regex = new RegExp(`\\b${lang}\\b`, 'gi')
        if (regex.test(allText)) {
          // Try to determine proficiency level
          const proficiencyMatch = allText.match(new RegExp(`${lang}[^.]*?(native|fluent|advanced|intermediate|basic|beginner)`, 'gi'))
          let proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native' = 'Intermediate'
          
          if (proficiencyMatch) {
            const level = proficiencyMatch[0].toLowerCase()
            if (level.includes('native') || level.includes('fluent')) proficiency = 'Native'
            else if (level.includes('advanced')) proficiency = 'Advanced'
            else if (level.includes('basic') || level.includes('beginner')) proficiency = 'Basic'
          }

          languages.push({
            language: lang.charAt(0).toUpperCase() + lang.slice(1),
            proficiency
          })
        }
      }
    }

    return {
      technical: [...new Set(technical)], // Remove duplicates
      soft: [...new Set(soft)],
      languages
    }
  }

  private extractCertifications(text: string): ParsedCVData['certifications'] {
    const certKeywords = ['certifications', 'certificates', 'licenses', 'credentials']
    const sections = this.splitIntoSections(text)
    
    let certSection = ''
    for (const section of sections) {
      const header = section.header.toLowerCase()
      if (certKeywords.some(keyword => header.includes(keyword))) {
        certSection = section.content
        break
      }
    }

    if (!certSection) return []

    const certifications: ParsedCVData['certifications'] = []
    const lines = certSection.split('\n').filter(line => line.trim().length > 10)

    for (const line of lines) {
      const dateMatch = line.match(/\b(19|20)\d{2}\b/)
      const year = dateMatch ? dateMatch[0] : ''
      
      // Common certification issuers
      const issuers = ['microsoft', 'google', 'amazon', 'aws', 'cisco', 'oracle', 'ibm', 'salesforce', 'comptia']
      let issuer = ''
      
      for (const iss of issuers) {
        if (line.toLowerCase().includes(iss)) {
          issuer = iss.charAt(0).toUpperCase() + iss.slice(1)
          break
        }
      }

      const name = line.replace(/\b(19|20)\d{2}\b/g, '').replace(new RegExp(issuer, 'gi'), '').trim()

      if (name.length > 5) {
        certifications.push({
          name,
          issuer: issuer || 'Unknown',
          date: year,
          expiryDate: ''
        })
      }
    }

    return certifications
  }

  private extractProjects(text: string): ParsedCVData['projects'] {
    const projectKeywords = ['projects', 'portfolio', 'work samples', 'notable projects']
    const sections = this.splitIntoSections(text)
    
    let projectSection = ''
    for (const section of sections) {
      const header = section.header.toLowerCase()
      if (projectKeywords.some(keyword => header.includes(keyword))) {
        projectSection = section.content
        break
      }
    }

    if (!projectSection) return []

    const projects: ParsedCVData['projects'] = []
    const blocks = projectSection.split(/\n\s*\n/).filter(block => block.trim().length > 30)

    for (const block of blocks) {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      if (lines.length < 2) continue

      const name = lines[0]
      const description = lines.slice(1).join(' ').substring(0, 200)
      
      // Extract technologies
      const technologies: string[] = []
      for (const tech of SKILL_CATEGORIES.technical) {
        if (block.toLowerCase().includes(tech.toLowerCase())) {
          technologies.push(tech)
        }
      }

      // Look for URL
      const urlMatch = block.match(PATTERNS.website)
      const url = urlMatch ? urlMatch[0] : ''

      projects.push({
        name,
        description,
        technologies,
        url
      })
    }

    return projects
  }

  private extractAwards(text: string): ParsedCVData['awards'] {
    const awardKeywords = ['awards', 'honors', 'achievements', 'recognition', 'distinctions']
    const sections = this.splitIntoSections(text)
    
    let awardSection = ''
    for (const section of sections) {
      const header = section.header.toLowerCase()
      if (awardKeywords.some(keyword => header.includes(keyword))) {
        awardSection = section.content
        break
      }
    }

    if (!awardSection) return []

    const awards: ParsedCVData['awards'] = []
    const lines = awardSection.split('\n').filter(line => line.trim().length > 10)

    for (const line of lines) {
      const dateMatch = line.match(/\b(19|20)\d{2}\b/)
      const year = dateMatch ? dateMatch[0] : ''
      
      const name = line.replace(/\b(19|20)\d{2}\b/g, '').trim()

      if (name.length > 5) {
        awards.push({
          name,
          issuer: 'Unknown',
          date: year,
          description: ''
        })
      }
    }

    return awards
  }

  private splitIntoSections(text: string): Array<{ header: string; content: string }> {
    const sections: Array<{ header: string; content: string }> = []
    const lines = text.split('\n')
    
    let currentSection = { header: '', content: '' }
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Check if this line looks like a section header
      if (this.isSectionHeader(trimmedLine)) {
        if (currentSection.header || currentSection.content) {
          sections.push(currentSection)
        }
        currentSection = { header: trimmedLine, content: '' }
      } else {
        if (currentSection.content) {
          currentSection.content += '\n' + line
        } else {
          currentSection.content = line
        }
      }
    }
    
    if (currentSection.header || currentSection.content) {
      sections.push(currentSection)
    }
    
    return sections
  }

  private isSectionHeader(line: string): boolean {
    const sectionKeywords = [
      'summary', 'profile', 'objective', 'about', 'overview',
      'experience', 'employment', 'work history', 'career',
      'education', 'academic', 'qualifications', 'degrees',
      'skills', 'competencies', 'technologies', 'expertise',
      'certifications', 'certificates', 'licenses',
      'projects', 'portfolio', 'work samples',
      'awards', 'honors', 'achievements', 'recognition',
      'references', 'interests', 'hobbies'
    ]

    const lowerLine = line.toLowerCase()
    
    // Must be short enough to be a header
    if (line.length > 50) return false
    
    // Must contain section keywords
    if (!sectionKeywords.some(keyword => lowerLine.includes(keyword))) return false
    
    // Check for header formatting patterns
    const isAllCaps = line === line.toUpperCase()
    const hasSpecialChars = /[:\-_=]/.test(line)
    const isShort = line.length < 30
    
    return isAllCaps || hasSpecialChars || isShort
  }

  private calculateConfidence(data: Omit<ParsedCVData, 'confidence' | 'originalText'>): number {
    let score = 0
    
    // Personal info scoring (max 25 points)
    if (data.personalInfo.name) score += 10
    if (data.personalInfo.email) score += 8
    if (data.personalInfo.phone) score += 4
    if (data.personalInfo.location) score += 3
    
    // Experience scoring (max 30 points)
    if (data.experience.length > 0) score += 15
    if (data.experience.length > 1) score += 10
    if (data.experience.some(exp => exp.achievements.length > 0)) score += 5
    
    // Education scoring (max 15 points)
    if (data.education.length > 0) score += 15
    
    // Skills scoring (max 20 points)
    if (data.skills.technical.length > 0) score += 10
    if (data.skills.soft.length > 0) score += 5
    if (data.skills.languages.length > 0) score += 5
    
    // Additional content scoring (max 10 points)
    if (data.summary) score += 5
    if (data.certifications.length > 0) score += 3
    if (data.projects.length > 0) score += 2
    
    return Math.min(100, score)
  }

  // Dublin job market optimization
  optimizeForDublinMarket(data: ParsedCVData): ParsedCVData {
    if (!this.options.dublinJobFocus) return data

    // Add Dublin-specific keywords to skills if relevant experience is found
    const dublinKeywords = ['dublin', 'ireland', 'irish', 'eu', 'european']
    const hasIrishExperience = data.experience.some(exp => 
      DUBLIN_PATTERNS.companies.some(company => 
        exp.company.toLowerCase().includes(company)
      ) ||
      DUBLIN_PATTERNS.locations.some(location => 
        exp.company.toLowerCase().includes(location) ||
        exp.description.toLowerCase().includes(location)
      )
    )

    if (hasIrishExperience) {
      // Add EU work authorization implications
      if (!data.skills.soft.includes('EU work authorization')) {
        data.skills.soft.push('EU work authorization')
      }
    }

    return data
  }
}

// Export default instance
export const aiCVParser = new AICVParser()

// Convenience function for quick parsing
export async function parseCV(text: string, options?: Partial<AIParsingOptions>): Promise<ParsedCVData> {
  const parser = new AICVParser(options)
  return parser.parseCV(text)
}

export default AICVParser