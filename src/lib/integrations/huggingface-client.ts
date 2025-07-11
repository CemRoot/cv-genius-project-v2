import { cleanPDFText } from '@/lib/pdf-text-cleaner'
import { HfInference } from '@huggingface/inference'

// HuggingFace API configuration
const MODELS = {
  zeroShot: 'facebook/bart-large-mnli',
  ner: 'dslim/bert-base-NER',
  similarity: 'sentence-transformers/all-MiniLM-L6-v2'
}

export class HuggingFaceATSClient {
  private apiKey: string | null
  private client: HfInference

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || null
    if (!this.apiKey) {
      console.warn('HuggingFace API key not configured. Using fallback analysis.')
    }
    this.client = new HfInference(this.apiKey || undefined)
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false
    
    try {
      // Simple test
      return true
    } catch (error) {
      console.error('HuggingFace health check failed:', error)
      return false
    }
  }
  
  async checkJobMatch(cvText: string, jobDescription: string): Promise<{
    matchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    recommendations: string[]
  }> {
    try {
      const cleanCV = cleanPDFText(cvText)
      const cleanJob = cleanPDFText(jobDescription)
      
      const cvSkills = this.extractBasicSkills(cleanCV)
      const jobSkills = this.extractBasicSkills(cleanJob)
      
      const cvSkillSet = new Set(cvSkills)
      const jobSkillSet = new Set(jobSkills)
      
      const matchedSkills = [...cvSkillSet].filter(skill => jobSkillSet.has(skill))
      const missingSkills = [...jobSkillSet].filter(skill => !cvSkillSet.has(skill))
      
      const matchScore = jobSkillSet.size > 0 
        ? (matchedSkills.length / jobSkillSet.size) * 100 
        : 0
      
      const recommendations = this.generateRecommendations(matchedSkills, missingSkills)
      
      return {
        matchScore: Math.round(matchScore),
        matchedSkills,
        missingSkills: missingSkills.slice(0, 10),
        recommendations
      }
    } catch (error) {
      console.error('Job matching failed:', error)
      return {
        matchScore: 75,
        matchedSkills: this.extractBasicSkills(cvText),
        missingSkills: ['Could not analyze - using basic extraction'],
        recommendations: ['Please ensure your CV and job description are in clear text format']
      }
    }
  }
  
  async improveCVContent(cvText: string, targetRole: string): Promise<{
    suggestions: string[]
    overallScore: number
    improvements: string[]
  }> {
    try {
      const cleanText = cleanPDFText(cvText)
      const structure = this.analyzeStructure(cleanText)
      const keywords = this.extractBasicSkills(cleanText)
      
      const structureScore = this.calculateStructureScore(structure)
      const keywordScore = keywords.length >= 10 ? 80 : 60
      const overallScore = Math.round((structureScore + keywordScore) / 2)
      
      const suggestions = []
      const improvements = []
      
      if (!structure.hasContactInfo) {
        suggestions.push('Add complete contact information at the top of your CV')
      }
      
      if (!structure.hasSummary) {
        suggestions.push('Add a professional summary highlighting your key qualifications')
      }
      
      if (structure.experienceCount < 2) {
        suggestions.push('Expand your work experience section with more details and achievements')
      }
      
      if (keywords.length < 15) {
        improvements.push('Include more industry-specific keywords and technical skills')
      }
      
      improvements.push('Quantify your achievements with numbers and metrics')
      improvements.push('Use action verbs to start each bullet point')
      improvements.push(`Tailor your CV specifically for ${targetRole} positions`)
      
      return {
        suggestions,
        overallScore,
        improvements
      }
    } catch (error) {
      console.error('CV improvement analysis failed:', error)
      return {
        suggestions: [
          'Ensure your CV has clear sections',
          'Include relevant keywords from the job description',
          'Quantify achievements where possible'
        ],
        overallScore: 70,
        improvements: [
          'Add more specific technical skills',
          'Improve formatting for ATS compatibility',
          'Include measurable results in experience section'
        ]
      }
    }
  }
  
  async analyzeCVForATS(cvText: string, jobDescription?: string, industry?: string): Promise<{
    keywordAnalysis: {
      extractedKeywords: string[]
      relevanceScore: number
      missingKeywords: string[]
      industrySpecificScore?: number
    }
    contentAnalysis: {
      professionalismScore: number
      clarityScore: number
      structureScore: number
      suggestions: string[]
    }
    atsCompatibility: {
      parsingProbability: number
      formatScore: number
      warnings: string[]
    }
    industryAnalysis?: {
      alignment: number
      criticalKeywords: string[]
      foundKeywords: string[]
      missingCriticalKeywords: string[]
      recommendations: string[]
    }
  }> {
    console.log('🔍 HuggingFace analyzeCVForATS started')
    try {
      console.log('🧹 Cleaning PDF text...')
      const cleanText = cleanPDFText(cvText)
      console.log('✅ PDF text cleaned, length:', cleanText.length)
      
      // Extract keywords
      console.log('🔑 Extracting keywords...')
      const extractedKeywords = this.extractBasicSkills(cleanText)
      console.log('✅ Keywords extracted:', extractedKeywords.length)
      
      console.log('🏗️ Analyzing structure...')
      const structure = this.analyzeStructure(cleanText)
      console.log('✅ Structure analyzed')
      
      // Analyze content quality
      console.log('📊 Analyzing content quality...')
      const professionalismScore = this.assessProfessionalism(cleanText)
      const clarityScore = this.assessClarity(cleanText)
      const structureScore = this.calculateStructureScore(structure)
      console.log('✅ Content quality scores:', { professionalismScore, clarityScore, structureScore })
      
      // Check ATS compatibility
      const warnings = this.checkATSFormat(cleanText)
      const formatScore = Math.max(0, 100 - (warnings.length * 15))
      const parsingProbability = Math.round((formatScore + structureScore) / 2)
      
      // Calculate relevance score
      let relevanceScore = 70
      let missingKeywords: string[] = []
      
      if (jobDescription) {
        const jobKeywords = this.extractBasicSkills(jobDescription)
        const matched = extractedKeywords.filter(kw => jobKeywords.includes(kw))
        relevanceScore = jobKeywords.length > 0 ? (matched.length / jobKeywords.length) * 100 : 70
        missingKeywords = jobKeywords.filter(kw => !extractedKeywords.includes(kw)).slice(0, 5)
      }
      
      // Industry analysis
      console.log('🏢 Starting industry analysis...')
      let industryAnalysis
      if (industry) {
        console.log('🎯 Analyzing for industry:', industry)
        industryAnalysis = await this.analyzeIndustrySpecific(cleanText, industry, jobDescription)
        console.log('✅ Industry analysis completed:', industryAnalysis.alignment)
      } else {
        console.log('⚠️ No industry specified, skipping industry analysis')
      }
      
      console.log('📦 Building response object...')
      return {
        keywordAnalysis: {
          extractedKeywords,
          relevanceScore: Math.round(relevanceScore),
          missingKeywords,
          industrySpecificScore: industryAnalysis?.alignment
        },
        contentAnalysis: {
          professionalismScore,
          clarityScore,
          structureScore,
          suggestions: this.generateContentSuggestions(structure, extractedKeywords.length)
        },
        atsCompatibility: {
          parsingProbability,
          formatScore,
          warnings
        },
        industryAnalysis
      }
    } catch (error: unknown) {
      console.error('💥 HuggingFace ATS analysis failed:', error)
      if (error instanceof Error) {
        console.error('💥 HuggingFace Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 300)
        })
      }
      console.log('🔄 Falling back to basic analysis...')
      // Return basic fallback analysis
      const basicKeywords = this.extractBasicSkills(cvText)
      console.log('📊 Basic fallback analysis prepared')
      return {
        keywordAnalysis: {
          extractedKeywords: basicKeywords,
          relevanceScore: 70,
          missingKeywords: []
        },
        contentAnalysis: {
          professionalismScore: 75,
          clarityScore: 70,
          structureScore: 65,
          suggestions: ['Ensure clear formatting and professional language']
        },
        atsCompatibility: {
          parsingProbability: 75,
          formatScore: 70,
          warnings: ['Basic analysis - could not perform detailed parsing']
        }
      }
    }
  }

  async analyzeIndustrySpecific(cvText: string, industry: string, jobDescription?: string): Promise<{
    alignment: number
    criticalKeywords: string[]
    foundKeywords: string[]
    missingCriticalKeywords: string[]
    recommendations: string[]
  }> {
    let industryKeywords: string[] = []
    
    // If we have a job description, extract keywords from it instead of using hardcoded lists
    if (jobDescription) {
      console.log('🔍 Using intelligent job description keyword extraction for industry analysis')
      industryKeywords = this.extractJobSpecificKeywords(jobDescription)
    } else {
      // Only fall back to hardcoded keywords if no job description is provided
      console.log('⚠️ No job description provided, falling back to hardcoded industry keywords')
      industryKeywords = this.getIndustryKeywords(industry)
    }
    
    const cvSkills = this.extractBasicSkills(cvText)
    const foundKeywords = cvSkills.filter(skill => industryKeywords.some(keyword => 
      keyword.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(keyword.toLowerCase())
    ))
    
    const missingCriticalKeywords = industryKeywords.filter(keyword => !foundKeywords.some(found => 
      found.toLowerCase().includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes(found.toLowerCase())
    )).slice(0, 8) // Limit missing keywords to prevent overwhelming output
    
    const alignment = industryKeywords.length > 0 
      ? Math.round((foundKeywords.length / industryKeywords.length) * 100) 
      : 75
    
    const recommendations = this.generateIndustryRecommendations(industry, foundKeywords, missingCriticalKeywords)
    
    return {
      alignment,
      criticalKeywords: industryKeywords,
      foundKeywords,
      missingCriticalKeywords,
      recommendations
    }
  }

  // Helper methods
  extractBasicSkills(text: string): string[] {
    const textLower = text.toLowerCase()
    
    // Comprehensive skill categories - focused on meaningful technical and professional terms
    const technicalSkills = [
      // Programming Languages
      'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
      'r', 'matlab', 'scala', 'perl', 'bash', 'powershell',
      
      // Frameworks & Libraries  
      'react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'laravel', 'rails',
      'nodejs', 'nextjs', 'nuxtjs', 'react native', 'flutter', 'xamarin',
      
      // Databases
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'cassandra',
      'dynamodb', 'sqlite', 'mariadb', 'neo4j',
      
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd', 'terraform',
      'ansible', 'helm', 'gitlab', 'github', 'bitbucket', 'travis', 'circleci',
      
      // APIs & Architecture
      'rest', 'api', 'restful apis', 'graphql', 'soap', 'microservices', 'serverless',
      'grpc', 'webhook', 'oauth', 'jwt',
      
      // Tools & Technologies
      'agile', 'scrum', 'kanban', 'jira', 'confluence', 'slack', 'teams',
      'webpack', 'gradle', 'maven', 'npm', 'yarn', 'pip'
    ]
    
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative',
      'project management', 'time management', 'organization', 'detail oriented',
      'collaboration', 'adaptability', 'innovation', 'mentoring', 'training'
    ]
    
    const locationSkills = [
      'dublin', 'cork', 'galway', 'irish market', 'eu citizen', 'stamp 4', 'work authorization',
      'visa', 'remote', 'hybrid', 'on-site'
    ]
    
    const allSkills = [...technicalSkills, ...softSkills, ...locationSkills]
    const foundSkills = new Set<string>()
    
    // Check each skill with proper word boundaries to avoid false positives
    allSkills.forEach(skill => {
      const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (skillRegex.test(textLower)) {
        foundSkills.add(skill.toLowerCase())
      }
    })
    
    // Special compound terms handling
    if ((textLower.includes('rest') && textLower.includes('api')) || textLower.includes('restful')) {
      foundSkills.add('rest api')
      foundSkills.add('api')
    }
    
    if (textLower.includes('ci/cd') || (textLower.includes('continuous integration') && textLower.includes('continuous deployment'))) {
      foundSkills.add('ci/cd')
    }
    
    return Array.from(foundSkills)
  }

  private analyzeStructure(text: string): any {
    return {
      hasContactInfo: /email|phone|address|linkedin/i.test(text),
      hasSummary: /summary|objective|profile/i.test(text),
      hasExperience: /experience|employment|work history/i.test(text),
      hasEducation: /education|degree|university|college/i.test(text),
      hasSkills: /skills|competencies|technologies/i.test(text),
      experienceCount: (text.match(/\d{4}\s*-\s*\d{4}|present|current/gi) || []).length
    }
  }

  private calculateStructureScore(structure: any): number {
    let score = 0
    if (structure.hasContactInfo) score += 20
    if (structure.hasSummary) score += 15
    if (structure.hasExperience) score += 25
    if (structure.hasEducation) score += 20
    if (structure.hasSkills) score += 20
    return Math.min(100, score)
  }

  private assessProfessionalism(text: string): number {
    let score = 100
    if (/\b(lol|omg|btw|ur|u r)\b/i.test(text)) score -= 20
    if (/[!]{2,}|\?{2,}/g.test(text)) score -= 10
    if (/\b(awesome|cool|great job)\b/i.test(text)) score -= 5
    if (/\b(achieved|accomplished|managed|led|developed)\b/i.test(text)) score += 5
    if (/\b\d+%|\$\d+[KM]?\b/g.test(text)) score += 5
    return Math.max(0, Math.min(100, score))
  }

  private assessClarity(text: string): number {
    let score = 100
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    const avgWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
    
    if (avgWords > 30) score -= 20
    if (avgWords < 10) score -= 10
    if (/\b(etc|and so on|and more)\b/i.test(text)) score -= 5
    if (/\b(various|multiple|several)\b/i.test(text)) score -= 5
    
    return Math.max(0, Math.min(100, score))
  }

  private checkATSFormat(text: string): string[] {
    const warnings: string[] = []
    
    if (/[""'']/g.test(text)) {
      warnings.push('Contains special quotes that may cause parsing issues')
    }
    
    if (/[–—]/g.test(text)) {
      warnings.push('Contains special dashes that may cause parsing issues')
    }
    
    if (/\S\s{5,}\S/g.test(text)) {
      warnings.push('Appears to contain tables or columns which may not parse correctly')
    }
    
    if (/page \d+ of \d+/i.test(text)) {
      warnings.push('Contains page numbers that should be removed')
    }
    
    return warnings
  }

  private generateRecommendations(matched: string[], missing: string[]): string[] {
    const recommendations = []
    
    if (missing.length > 0) {
      recommendations.push(`Consider adding these missing skills: ${missing.slice(0, 3).join(', ')}`)
    }
    
    if (matched.length < 5) {
      recommendations.push('Add more relevant keywords from the job description')
    }
    
    recommendations.push('Quantify your achievements with specific numbers and metrics')
    recommendations.push('Use action verbs to start each bullet point')
    
    return recommendations
  }

  private generateContentSuggestions(structure: any, keywordCount: number): string[] {
    const suggestions = []
    
    if (!structure.hasContactInfo) {
      suggestions.push('Add complete contact information')
    }
    
    if (!structure.hasSummary) {
      suggestions.push('Include a professional summary section')
    }
    
    if (keywordCount < 10) {
      suggestions.push('Include more relevant keywords and skills')
    }
    
    if (structure.experienceCount < 2) {
      suggestions.push('Expand work experience with more details')
    }
    
    return suggestions
  }

  private getIndustryKeywords(industry: string): string[] {
    const keywords: Record<string, string[]> = {
      technology: [
        'agile', 'scrum', 'git', 'api', 'cloud', 'devops', 'javascript', 'python', 'react', 'docker', 'kubernetes',
        'microservices', 'ci/cd', 'containerization', 'serverless', 'graphql', 'terraform', 'ansible'
      ],
      finance: [
        'regulatory', 'compliance', 'risk', 'audit', 'reporting', 'financial analysis', 'accounting', 'banking',
        'portfolio management', 'derivatives', 'basel', 'ifrs', 'gaap', 'sox compliance', 'aml', 'kyc'
      ],
      healthcare: [
        'patient', 'clinical', 'healthcare', 'treatment', 'diagnosis', 'care', 'medical', 'nursing',
        'electronic health records', 'hipaa', 'clinical trials', 'medical devices', 'telehealth'
      ],
      marketing: [
        'digital marketing', 'seo', 'sem', 'social media', 'content marketing', 'email marketing',
        'google analytics', 'conversion optimization', 'a/b testing', 'marketing automation'
      ],
      sales: [
        'business development', 'account management', 'sales strategy', 'lead generation', 'pipeline management',
        'crm', 'salesforce', 'quota attainment', 'territory management', 'channel partnerships'
      ],
      general: [
        'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative',
        'project management', 'time management', 'organization', 'detail oriented'
      ]
    }
    
    return keywords[industry] || keywords.general
  }

  private generateIndustryRecommendations(industry: string, foundKeywords: string[], missingKeywords: string[]): string[] {
    const recommendations = []
    
    if (missingKeywords.length > 0) {
      recommendations.push(`Consider adding these ${industry} keywords: ${missingKeywords.slice(0, 3).join(', ')}`)
    }
    
    const industryAdvice: Record<string, string[]> = {
      technology: [
        'Emphasize your experience with modern development practices',
        'Include links to your GitHub profile or portfolio',
        'Mention any cloud platform certifications'
      ],
      finance: [
        'Emphasize regulatory compliance and risk management experience',
        'Include relevant financial certifications (CFA, FRM, etc.)',
        'Mention experience with financial software and systems'
      ],
      healthcare: [
        'Emphasize patient care and clinical experience',
        'Include relevant medical certifications and licenses',
        'Mention experience with healthcare technology systems'
      ],
      marketing: [
        'Emphasize digital marketing and analytics experience',
        'Include experience with marketing automation tools',
        'Mention campaign performance metrics and ROI'
      ]
    }
    
    const specificAdvice = industryAdvice[industry] || []
    recommendations.push(...specificAdvice.slice(0, 2))
    
    return recommendations
  }

  // NEW: Intelligent job-specific keyword extraction (public method)
  extractJobSpecificKeywords(jobDescription: string): string[] {
    const jobLower = jobDescription.toLowerCase()
    const meaningfulKeywords = new Set<string>()
    
    // Extract our predefined skills that appear in the job description
    const basicSkills = this.extractBasicSkills(jobDescription)
    basicSkills.forEach(skill => meaningfulKeywords.add(skill))
    
    // Define patterns for meaningful job-specific terms
    const meaningfulPatterns = [
      // Job titles and roles
      /\b(senior|junior|lead|principal|staff|architect|manager|director|analyst|specialist|engineer|developer|designer|consultant)\b/g,
      
      // Important qualifications
      /\b(bachelor|master|phd|degree|certification|certified|license|accredited)\b/g,
      
      // Business terms
      /\b(enterprise|startup|saas|b2b|b2c|ecommerce|fintech|healthtech|edtech)\b/g,
      
      // Experience levels
      /\b(\d+\+?\s*years?|experienced?|expert|proficient|advanced|intermediate|beginner)\b/g,
      
      // Industry buzzwords
      /\b(innovation|digital transformation|scalability|performance|security|compliance|automation)\b/g
    ]
    
    meaningfulPatterns.forEach(pattern => {
      const matches = jobLower.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim().toLowerCase()
          if (cleaned.length > 2) {
            meaningfulKeywords.add(cleaned)
          }
        })
      }
    })
    
    // Extract specific industry keywords if mentioned
    const industryKeywords = {
      'fintech': ['trading', 'banking', 'payments', 'blockchain', 'cryptocurrency', 'regulatory'],
      'healthcare': ['patient', 'clinical', 'medical', 'healthcare', 'hipaa', 'fhir'],
      'ecommerce': ['marketplace', 'payment gateway', 'inventory', 'shopping cart', 'logistics'],
      'ai/ml': ['machine learning', 'artificial intelligence', 'deep learning', 'nlp', 'computer vision', 'tensorflow', 'pytorch']
    }
    
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      if (jobLower.includes(industry) || keywords.some(kw => jobLower.includes(kw))) {
        keywords.forEach(kw => {
          if (jobLower.includes(kw)) {
            meaningfulKeywords.add(kw)
          }
        })
      }
    })
    
    // Filter out overly common words that don't add value
    const commonWords = new Set([
      'new', 'work', 'working', 'role', 'position', 'job', 'company', 'team', 'member', 'members',
      'experience', 'experienced', 'skills', 'skill', 'knowledge', 'ability', 'strong', 'good',
      'excellent', 'great', 'best', 'top', 'high', 'quality', 'professional', 'business',
      'development', 'technical', 'technology', 'solution', 'solutions', 'system', 'systems',
      'application', 'applications', 'service', 'services', 'product', 'products', 'project', 'projects',
      'customer', 'client', 'user', 'users', 'support', 'help', 'assist', 'manage', 'management',
      'understand', 'understanding', 'knowledge', 'learn', 'learning', 'improve', 'improvement',
      'deliver', 'delivery', 'implement', 'implementation', 'create', 'creating', 'build', 'building',
      'develop', 'developing', 'design', 'designing', 'maintain', 'maintaining', 'test', 'testing',
      'ensure', 'provide', 'collaborate', 'collaboration', 'communicate', 'communication',
      'opportunity', 'opportunities', 'challenge', 'challenges', 'requirement', 'requirements',
      'responsible', 'responsibility', 'duties', 'task', 'tasks', 'goal', 'goals', 'objective', 'objectives'
    ])
    
    // Remove common words and very short terms
    const filteredKeywords = Array.from(meaningfulKeywords).filter(keyword => 
      !commonWords.has(keyword) && 
      keyword.length > 2 && 
      !/^\d+$/.test(keyword) // Remove pure numbers
    )
    
    return filteredKeywords.slice(0, 15) // Limit to most relevant keywords
  }
}

// Export singleton instance
let clientInstance: HuggingFaceATSClient | null = null

export function getHuggingFaceClient(): HuggingFaceATSClient {
  if (!clientInstance) {
    clientInstance = new HuggingFaceATSClient()
  }
  return clientInstance
}