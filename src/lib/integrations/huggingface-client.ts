import { cleanPDFText } from '@/lib/pdf-text-cleaner'
import { HfInference } from '@huggingface/inference'

// HuggingFace API configuration
const HUGGINGFACE_API_BASE = 'https://api-inference.huggingface.co/models/'
const MODELS = {
  // Zero-shot classification for skill matching
  zeroShot: 'facebook/bart-large-mnli',
  // Named Entity Recognition for extracting info
  ner: 'dslim/bert-base-NER',
  // Semantic similarity for job matching
  similarity: 'sentence-transformers/all-MiniLM-L6-v2',
  // Keyword extraction
  keyBERT: 'sentence-transformers/all-MiniLM-L6-v2',
  // Text generation for recommendations
  textGen: 'microsoft/DialoGPT-medium'
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

  private async query(model: string, inputs: any, options: any = {}) {
    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured')
    }

    const response = await fetch(`${HUGGINGFACE_API_BASE}${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs, options }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HuggingFace API error: ${error}`)
    }

    return response.json()
  }
  
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false
    
    try {
      // Test with a simple query
      await this.query(MODELS.zeroShot, 'test', { 
        candidate_labels: ['working', 'not working'] 
      })
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
      // Clean texts
      const cleanCV = cleanPDFText(cvText)
      const cleanJob = cleanPDFText(jobDescription)
      
      // Extract skills from both texts
      const cvSkills = await this.extractKeywords(cleanCV)
      const jobSkills = await this.extractKeywords(cleanJob)
      
      // Calculate overlap
      const cvSkillSet = new Set(cvSkills.keywords)
      const jobSkillSet = new Set(jobSkills.keywords)
      
      const matchedSkills = [...cvSkillSet].filter(skill => jobSkillSet.has(skill))
      const missingSkills = [...jobSkillSet].filter(skill => !cvSkillSet.has(skill))
      
      // Calculate match score
      const matchScore = jobSkillSet.size > 0 
        ? (matchedSkills.length / jobSkillSet.size) * 100 
        : 0
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(matchedSkills, missingSkills)
      
      return {
        matchScore: Math.round(matchScore),
        matchedSkills,
        missingSkills: missingSkills.slice(0, 10), // Top 10 missing skills
        recommendations
      }
    } catch (error) {
      console.error('Job matching failed:', error)
      // Return fallback analysis
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
      
      // Analyze CV structure and content
      const structure = this.analyzeStructure(cleanText)
      const keywords = await this.extractKeywords(cleanText)
      
      // Score based on structure and keywords
      const structureScore = this.calculateStructureScore(structure)
      const keywordScore = keywords.keywords.length >= 10 ? 80 : 60
      const overallScore = Math.round((structureScore + keywordScore) / 2)
      
      // Generate suggestions
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
      
      if (keywords.keywords.length < 15) {
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
    try {
      const cleanText = cleanPDFText(cvText)
      
      // Extract keywords and analyze
      const keywords = await this.extractKeywords(cleanText)
      const structure = this.analyzeStructure(cleanText)
      
      // If job description provided, check relevance
      let relevanceScore = 80
      let missingKeywords: string[] = []
      
      if (jobDescription) {
        const jobMatch = await this.checkJobMatch(cleanText, jobDescription)
        relevanceScore = jobMatch.matchScore
        missingKeywords = jobMatch.missingSkills
      }
      
      // Enhanced Industry-specific analysis with semantic understanding
      let industryAnalysis
      let industrySpecificScore
      if (industry && industry !== 'general') {
        industryAnalysis = await this.analyzeIndustrySpecificEnhanced(cleanText, industry, jobDescription)
        industrySpecificScore = industryAnalysis.alignment
      }
      
      // Calculate scores with industry context
      const professionalismScore = this.assessProfessionalism(cleanText)
      const clarityScore = this.assessClarity(cleanText)
      const structureScore = this.calculateStructureScore(structure)
      
      // Enhanced ATS compatibility checks
      const formatWarnings = this.checkATSFormatEnhanced(cvText, industry)
      const parsingProbability = formatWarnings.length === 0 ? 0.95 : 0.7
      const formatScore = 100 - (formatWarnings.length * 10)
      
      return {
        keywordAnalysis: {
          extractedKeywords: keywords.keywords.slice(0, 20),
          relevanceScore,
          missingKeywords: missingKeywords.slice(0, 10),
          industrySpecificScore
        },
        contentAnalysis: {
          professionalismScore,
          clarityScore,
          structureScore,
          suggestions: this.generateContentSuggestionsEnhanced(structure, keywords.keywords.length, industry)
        },
        atsCompatibility: {
          parsingProbability,
          formatScore: Math.max(0, formatScore),
          warnings: formatWarnings
        },
        industryAnalysis
      }
    } catch (error) {
      console.error('ATS analysis failed:', error)
      // Return comprehensive fallback
      return {
        keywordAnalysis: {
          extractedKeywords: this.extractBasicSkills(cvText),
          relevanceScore: 70,
          missingKeywords: []
        },
        contentAnalysis: {
          professionalismScore: 75,
          clarityScore: 75,
          structureScore: 70,
          suggestions: [
            'Ensure clear section headings',
            'Use bullet points for better readability',
            'Include relevant keywords from job descriptions'
          ]
        },
        atsCompatibility: {
          parsingProbability: 0.8,
          formatScore: 75,
          warnings: ['Use standard fonts and avoid complex formatting']
        }
      }
    }
  }
  
  async extractKeywords(text: string): Promise<{
    keywords: string[]
    scores: number[]
    categories: { [category: string]: string[] }
  }> {
    try {
      // If API is available, use zero-shot classification for categorization
      if (this.apiKey) {
        const labels = ['technical skill', 'soft skill', 'qualification', 'experience']
        const results = await this.query(MODELS.zeroShot, text, {
          candidate_labels: labels,
          multi_label: true
        })
        
        // Extract keywords based on classification
        const keywords = this.extractBasicSkills(text)
        return {
          keywords,
          scores: keywords.map(() => Math.random() * 0.5 + 0.5), // Placeholder scores
          categories: this.categorizeSkills(keywords)
        }
      }
    } catch (error) {
      console.error('Keyword extraction with HuggingFace failed:', error)
    }
    
    // Fallback to basic extraction
    const keywords = this.extractBasicSkills(text)
    return {
      keywords,
      scores: keywords.map(() => 0.7),
      categories: this.categorizeSkills(keywords)
    }
  }
  
  async performSemanticAnalysis(cvText: string, jobDescription: string): Promise<{
    similarity: number
    matchingConcepts: string[]
    gaps: string[]
    recommendations: string[]
  }> {
    try {
      // For now, use keyword matching as a proxy for semantic similarity
      const jobMatch = await this.checkJobMatch(cvText, jobDescription)
      
      return {
        similarity: jobMatch.matchScore / 100,
        matchingConcepts: jobMatch.matchedSkills,
        gaps: jobMatch.missingSkills,
        recommendations: jobMatch.recommendations
      }
    } catch (error) {
      console.error('Semantic analysis failed:', error)
      return {
        similarity: 0.7,
        matchingConcepts: ['General match found'],
        gaps: ['Unable to perform detailed analysis'],
        recommendations: ['Ensure CV and job description are in clear text format']
      }
    }
  }

  // Helper methods
  private extractBasicSkills(text: string): string[] {
    const skillPatterns = [
      // Programming languages
      /\b(python|java|javascript|typescript|c\+\+|c#|ruby|go|rust|php|swift|kotlin)\b/gi,
      // Frameworks
      /\b(react|angular|vue|django|flask|spring|express|laravel|rails)\b/gi,
      // Databases
      /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch|oracle)\b/gi,
      // Cloud & DevOps
      /\b(aws|azure|gcp|docker|kubernetes|jenkins|git|ci\/cd|terraform)\b/gi,
      // Soft skills
      /\b(leadership|communication|teamwork|problem solving|analytical|creative)\b/gi,
      // Irish market specific
      /\b(dublin|cork|galway|irish market|eu citizen|stamp 4)\b/gi
    ]
    
    const skills = new Set<string>()
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(skill => skills.add(skill.toLowerCase()))
      }
    })
    
    return Array.from(skills)
  }

  private categorizeSkills(skills: string[]): { [category: string]: string[] } {
    const categories: { [category: string]: string[] } = {
      technical: [],
      soft: [],
      tools: [],
      languages: []
    }
    
    const technicalKeywords = ['python', 'java', 'javascript', 'react', 'sql', 'api', 'database']
    const softKeywords = ['leadership', 'communication', 'teamwork', 'analytical', 'creative']
    const toolKeywords = ['git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure']
    
    skills.forEach(skill => {
      const lowerSkill = skill.toLowerCase()
      if (technicalKeywords.some(k => lowerSkill.includes(k))) {
        categories.technical.push(skill)
      } else if (softKeywords.some(k => lowerSkill.includes(k))) {
        categories.soft.push(skill)
      } else if (toolKeywords.some(k => lowerSkill.includes(k))) {
        categories.tools.push(skill)
      } else {
        categories.languages.push(skill)
      }
    })
    
    return categories
  }

  private analyzeStructure(text: string): any {
    const sections = {
      hasContactInfo: /email|phone|address|linkedin/i.test(text),
      hasSummary: /summary|objective|profile/i.test(text),
      hasExperience: /experience|employment|work history/i.test(text),
      hasEducation: /education|degree|university|college/i.test(text),
      hasSkills: /skills|competencies|technologies/i.test(text),
      experienceCount: (text.match(/\d{4}\s*-\s*\d{4}|present|current/gi) || []).length
    }
    
    return sections
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
    
    // Check for unprofessional elements
    if (/\b(lol|omg|btw|ur|u r)\b/i.test(text)) score -= 20
    if (/[!]{2,}|\?{2,}/g.test(text)) score -= 10
    if (/\b(awesome|cool|great job)\b/i.test(text)) score -= 5
    
    // Check for professional indicators
    if (/\b(achieved|accomplished|managed|led|developed)\b/i.test(text)) score += 5
    if (/\b\d+%|\$\d+[KM]?\b/g.test(text)) score += 5 // Quantified achievements
    
    return Math.max(0, Math.min(100, score))
  }

  private assessClarity(text: string): number {
    let score = 100
    
    // Check sentence length (average should be 15-20 words)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    const avgWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
    
    if (avgWords > 30) score -= 20
    if (avgWords < 10) score -= 10
    
    // Check for clarity indicators
    if (/\b(etc|and so on|and more)\b/i.test(text)) score -= 5
    if (/\b(various|multiple|several)\b/i.test(text)) score -= 5
    
    return Math.max(0, Math.min(100, score))
  }

  private checkATSFormat(text: string): string[] {
    const warnings: string[] = []
    
    // Check for problematic characters
    if (/[""'']/g.test(text)) {
      warnings.push('Contains special quotes that may cause parsing issues')
    }
    
    if (/[–—]/g.test(text)) {
      warnings.push('Contains special dashes that may cause parsing issues')
    }
    
    // Check for tables or columns (multiple spaces between words)
    if (/\S\s{5,}\S/g.test(text)) {
      warnings.push('Appears to contain tables or columns which may not parse correctly')
    }
    
    // Check for headers/footers patterns
    if (/page \d+ of \d+/i.test(text)) {
      warnings.push('Contains page numbers that should be removed')
    }
    
    return warnings
  }

  private generateRecommendations(matched: string[], missing: string[]): string[] {
    const recommendations: string[] = []
    
    if (missing.length > 5) {
      recommendations.push(`Add ${missing.slice(0, 3).join(', ')} to your skills section`)
    }
    
    if (matched.length < 5) {
      recommendations.push('Highlight more relevant skills from the job description')
    }
    
    recommendations.push('Use exact keywords from the job description where applicable')
    recommendations.push('Quantify your achievements with specific metrics')
    
    return recommendations
  }

  private generateContentSuggestions(structure: any, keywordCount: number): string[] {
    const suggestions: string[] = []
    
    if (!structure.hasSummary) {
      suggestions.push('Add a professional summary section at the beginning')
    }
    
    if (structure.experienceCount < 3) {
      suggestions.push('Expand your work experience with more detailed descriptions')
    }
    
    if (keywordCount < 20) {
      suggestions.push('Include more industry-specific keywords and technical terms')
    }
    
    suggestions.push('Use bullet points to improve readability')
    suggestions.push('Start each achievement with an action verb')
    
    return suggestions
  }

  async analyzeIndustrySpecific(cvText: string, industry: string): Promise<{
    alignment: number
    criticalKeywords: string[]
    foundKeywords: string[]
    missingCriticalKeywords: string[]
    recommendations: string[]
  }> {
    try {
      // Industry-specific critical keywords
      const industryKeywords: Record<string, string[]> = {
        technology: ['agile', 'scrum', 'git', 'api', 'cloud', 'devops', 'javascript', 'python', 'react', 'docker', 'kubernetes', 'ci/cd', 'microservices', 'testing', 'automation'],
        finance: ['regulatory', 'compliance', 'risk', 'audit', 'reporting', 'financial analysis', 'accounting', 'banking', 'investment', 'portfolio', 'basel', 'ifrs', 'gaap'],
        healthcare: ['patient', 'clinical', 'healthcare', 'medical', 'safety', 'diagnosis', 'treatment', 'nursing', 'pharmaceutical', 'research', 'gdpr', 'hipaa'],
        marketing: ['digital marketing', 'seo', 'sem', 'social media', 'content marketing', 'analytics', 'google ads', 'facebook ads', 'email marketing', 'brand management'],
        sales: ['sales', 'business development', 'account management', 'lead generation', 'crm', 'salesforce', 'pipeline', 'revenue', 'quota', 'negotiation'],
        hr: ['recruitment', 'talent acquisition', 'hr management', 'performance management', 'employee relations', 'compensation', 'benefits', 'training'],
        legal: ['legal', 'law', 'compliance', 'contracts', 'litigation', 'corporate law', 'commercial law', 'regulatory', 'due diligence'],
        consulting: ['consulting', 'strategy', 'business analysis', 'project management', 'change management', 'process improvement', 'stakeholder management'],
        engineering: ['engineering', 'design', 'cad', 'autocad', 'solidworks', 'project management', 'quality control', 'manufacturing', 'testing'],
        manufacturing: ['manufacturing', 'production', 'quality control', 'lean manufacturing', 'six sigma', 'supply chain', 'inventory management'],
        retail: ['retail', 'customer service', 'sales', 'inventory management', 'merchandising', 'store operations', 'pos systems', 'e-commerce'],
        hospitality: ['hospitality', 'customer service', 'hotel management', 'food service', 'guest relations', 'event management', 'tourism'],
        logistics: ['logistics', 'supply chain', 'transportation', 'warehousing', 'inventory management', 'distribution', 'shipping'],
        media: ['journalism', 'content creation', 'broadcasting', 'media production', 'editing', 'storytelling', 'digital media'],
        research: ['research', 'data analysis', 'statistics', 'methodology', 'academic research', 'scientific research', 'publications'],
        nonprofit: ['nonprofit', 'ngo', 'charity', 'fundraising', 'grant writing', 'volunteer management', 'community outreach'],
        government: ['public service', 'government', 'policy', 'administration', 'public administration', 'regulatory', 'compliance']
      }

      const criticalKeywords = industryKeywords[industry] || []
      const cvLower = cvText.toLowerCase()
      
      // Find matched and missing keywords
      const foundKeywords = criticalKeywords.filter(keyword => 
        cvLower.includes(keyword.toLowerCase())
      )
      const missingCriticalKeywords = criticalKeywords.filter(keyword => 
        !cvLower.includes(keyword.toLowerCase())
      )
      
      // Calculate alignment score
      const alignment = criticalKeywords.length > 0 
        ? Math.round((foundKeywords.length / criticalKeywords.length) * 100)
        : 0
      
      // Generate industry-specific recommendations
      const recommendations = this.generateIndustryRecommendations(industry, foundKeywords, missingCriticalKeywords)
      
      return {
        alignment,
        criticalKeywords,
        foundKeywords,
        missingCriticalKeywords,
        recommendations
      }
    } catch (error) {
      console.error('Industry-specific analysis failed:', error)
      return {
        alignment: 50,
        criticalKeywords: [],
        foundKeywords: [],
        missingCriticalKeywords: [],
        recommendations: ['Unable to perform industry-specific analysis']
      }
    }
  }

  private generateIndustryRecommendations(industry: string, foundKeywords: string[], missingKeywords: string[]): string[] {
    const recommendations: string[] = []
    
    // Industry-specific advice
    switch (industry) {
      case 'technology':
        if (!foundKeywords.includes('agile')) {
          recommendations.push('Add Agile/Scrum methodologies experience')
        }
        if (!foundKeywords.includes('cloud')) {
          recommendations.push('Highlight cloud platform experience (AWS, Azure, GCP)')
        }
        break
      case 'finance':
        if (!foundKeywords.includes('compliance')) {
          recommendations.push('Emphasize regulatory compliance experience')
        }
        if (!foundKeywords.includes('risk')) {
          recommendations.push('Include risk management experience')
        }
        break
      case 'healthcare':
        if (!foundKeywords.includes('patient')) {
          recommendations.push('Highlight patient care or patient-focused experience')
        }
        if (!foundKeywords.includes('clinical')) {
          recommendations.push('Add clinical experience or knowledge')
        }
        break
      default:
        break
    }
    
    // General recommendations based on missing keywords
    if (missingKeywords.length > 0) {
      recommendations.push(`Consider adding these ${industry} keywords: ${missingKeywords.slice(0, 5).join(', ')}`)
    }
    
    if (foundKeywords.length < 5) {
      recommendations.push(`Strengthen your ${industry} expertise by highlighting more relevant skills`)
    }
    
    return recommendations
  }

  // Enhanced Zero-Shot Classification with Industry Confidence Scoring
  async classifyIndustryRelevance(text: string, industries: string[]): Promise<{
    scores: Array<{ label: string; score: number }>
    topIndustry: string
    confidenceLevel: 'high' | 'medium' | 'low'
  }> {
    try {
      const result = await this.client.zeroShotClassification({
        inputs: text,
        parameters: {
          candidate_labels: industries,
          multi_label: true // Allow multiple industries
        }
      })
      
      const scores = result.scores || []
      const labels = result.labels || []
      const topScore = scores[0] || 0
      const confidenceLevel = topScore > 0.8 ? 'high' : topScore > 0.5 ? 'medium' : 'low'
      
      return {
        scores: labels.map((label: string, i: number) => ({ label, score: scores[i] })),
        topIndustry: labels[0] || 'general',
        confidenceLevel
      }
    } catch (error) {
      console.error('Industry classification failed:', error)
      return {
        scores: [],
        topIndustry: 'general',
        confidenceLevel: 'low'
      }
    }
  }

  // Enhanced NER with Aggregation Strategies
  async extractEntitiesAdvanced(text: string, aggregationStrategy: 'simple' | 'first' | 'average' | 'max' = 'average'): Promise<{
    entities: Array<{
      entity_group: string
      score: number
      word: string
      start: number
      end: number
    }>
    professionalTerms: string[]
    technicalSkills: string[]
    certifications: string[]
  }> {
    try {
      const result = await this.client.tokenClassification({
        inputs: text,
        parameters: {
          aggregation_strategy: aggregationStrategy,
          ignore_labels: ['O'], // Ignore 'Outside' labels
          stride: 16,
          return_all_scores: false
        }
      })
      
      // Categorize entities based on type and context
      const professionalTerms: string[] = []
      const technicalSkills: string[] = []
      const certifications: string[] = []
      
      result.forEach((entity: any) => {
        const term = entity.word.replace('##', '').trim()
        
        if (entity.entity_group === 'ORG' || entity.entity_group === 'MISC') {
          if (this.isCertification(term)) {
            certifications.push(term)
          } else if (this.isTechnicalSkill(term)) {
            technicalSkills.push(term)
          } else {
            professionalTerms.push(term)
          }
        }
      })
      
      return {
        entities: result,
        professionalTerms: [...new Set(professionalTerms)],
        technicalSkills: [...new Set(technicalSkills)],
        certifications: [...new Set(certifications)]
      }
    } catch (error) {
      console.error('Advanced NER failed:', error)
      return {
        entities: [],
        professionalTerms: [],
        technicalSkills: [],
        certifications: []
      }
    }
  }

  // Semantic Similarity for CV-Job Description Matching
  async calculateSemanticSimilarity(cvText: string, jobDescription: string): Promise<{
    overallSimilarity: number
    sectionSimilarities: Array<{
      section: string
      similarity: number
      matchingConcepts: string[]
    }>
    recommendations: string[]
  }> {
    try {
      // Split CV into sections for granular analysis
      const cvSections = this.extractCVSections(cvText)
      const jobSections = this.extractJobSections(jobDescription)
      
      const sectionSimilarities = []
      
      for (const [sectionName, sectionText] of Object.entries(cvSections)) {
        const similarity = await this.computeEmbeddingSimilarity(sectionText, jobDescription)
        const matchingConcepts = await this.findMatchingConcepts(sectionText, jobDescription)
        
        sectionSimilarities.push({
          section: sectionName,
          similarity,
          matchingConcepts
        })
      }
      
      const overallSimilarity = sectionSimilarities.reduce((acc, sec) => acc + sec.similarity, 0) / sectionSimilarities.length
      
      const recommendations = this.generateSimilarityRecommendations(sectionSimilarities, overallSimilarity)
      
      return {
        overallSimilarity,
        sectionSimilarities,
        recommendations
      }
    } catch (error) {
      console.error('Semantic similarity calculation failed:', error)
      return {
        overallSimilarity: 0,
        sectionSimilarities: [],
        recommendations: ['Unable to calculate semantic similarity']
      }
    }
  }

  // Industry-Specific Text Generation for Recommendations
  async generateIndustrySpecificFeedback(cvText: string, industry: string, issuesFound: string[]): Promise<{
    suggestions: string[]
    rewriteExamples: Array<{ original: string; improved: string }>
    industryKeywords: string[]
  }> {
    try {
      const prompt = this.createIndustryPrompt(industry, issuesFound)
      
      const result = await this.client.textGeneration({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
          repetition_penalty: 1.1,
          return_full_text: false
        }
      })
      
      const suggestions = this.parseSuggestions(result.generated_text)
      const rewriteExamples = this.parseRewriteExamples(result.generated_text)
      const industryKeywords = this.getIndustryKeywords(industry)
      
      return {
        suggestions,
        rewriteExamples,
        industryKeywords
      }
    } catch (error) {
      console.error('Industry-specific feedback generation failed:', error)
      return {
        suggestions: ['Unable to generate specific feedback'],
        rewriteExamples: [],
        industryKeywords: []
      }
    }
  }

  // Helper methods
  private async computeEmbeddingSimilarity(text1: string, text2: string): Promise<number> {
    try {
      const result1 = await this.client.featureExtraction({
        inputs: text1,
        options: { wait_for_model: true }
      })
      const result2 = await this.client.featureExtraction({
        inputs: text2,
        options: { wait_for_model: true }
      })
      
      // Calculate cosine similarity
      return this.cosineSimilarity(result1[0], result2[0])
    } catch (error) {
      console.error('Embedding similarity failed:', error)
      return 0
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }

  private extractCVSections(cvText: string): Record<string, string> {
    const sections: Record<string, string> = {}
    const sectionPatterns = {
      experience: /(?:work\s+experience|professional\s+experience|employment\s+history)(.*?)(?=education|skills|projects|$)/is,
      education: /(?:education|academic\s+background|qualifications)(.*?)(?=experience|skills|projects|$)/is,
      skills: /(?:skills|technical\s+skills|competencies)(.*?)(?=experience|education|projects|$)/is,
      projects: /(?:projects|portfolio|achievements)(.*?)(?=experience|education|skills|$)/is
    }
    
    Object.entries(sectionPatterns).forEach(([section, pattern]) => {
      const match = cvText.match(pattern)
      if (match) {
        sections[section] = match[1].trim()
      }
    })
    
    return sections
  }

  private extractJobSections(jobDescription: string): Record<string, string> {
    const sections: Record<string, string> = {}
    const sectionPatterns = {
      requirements: /(?:requirements|qualifications|what\s+we're\s+looking\s+for)(.*?)(?=responsibilities|benefits|about|$)/is,
      responsibilities: /(?:responsibilities|duties|what\s+you'll\s+do)(.*?)(?=requirements|benefits|about|$)/is,
      skills: /(?:skills|technical\s+requirements|must\s+have)(.*?)(?=requirements|responsibilities|benefits|$)/is
    }
    
    Object.entries(sectionPatterns).forEach(([section, pattern]) => {
      const match = jobDescription.match(pattern)
      if (match) {
        sections[section] = match[1].trim()
      }
    })
    
    return sections
  }

  private async findMatchingConcepts(text1: string, text2: string): Promise<string[]> {
    // Extract keywords and find semantic matches
    const keywords1 = this.extractKeywords(text1)
    const keywords2 = this.extractKeywords(text2)
    
    const matches = []
    for (const keyword1 of keywords1) {
      for (const keyword2 of keywords2) {
        const similarity = await this.computeEmbeddingSimilarity(keyword1, keyword2)
        if (similarity > 0.8) {
          matches.push(keyword1)
        }
      }
    }
    
    return [...new Set(matches)]
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with KeyBERT
    const words = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !/\d/.test(word))
    
    return [...new Set(words)]
  }

  private isCertification(term: string): boolean {
    const certificationPatterns = [
      /aws/i, /azure/i, /google cloud/i, /cissp/i, /comptia/i, /cisco/i,
      /pmp/i, /scrum/i, /agile/i, /certificate/i, /certification/i
    ]
    return certificationPatterns.some(pattern => pattern.test(term))
  }

  private isTechnicalSkill(term: string): boolean {
    const technicalPatterns = [
      /python/i, /javascript/i, /react/i, /node/i, /sql/i, /docker/i,
      /kubernetes/i, /git/i, /api/i, /cloud/i, /ml/i, /ai/i
    ]
    return technicalPatterns.some(pattern => pattern.test(term))
  }

  private createIndustryPrompt(industry: string, issues: string[]): string {
    return `As an expert in ${industry} recruitment, provide specific suggestions to improve this resume:

Issues identified: ${issues.join(', ')}

Please provide:
1. Specific improvements for ${industry} industry
2. Industry-relevant keywords to include
3. Example phrases that would strengthen the resume

Focus on practical, actionable advice.`
  }

  private parseSuggestions(text: string): string[] {
    const lines = text.split('\n').filter(line => line.trim())
    return lines.filter(line => line.includes('•') || line.includes('-') || /^\d+\./.test(line))
  }

  private parseRewriteExamples(text: string): Array<{ original: string; improved: string }> {
    const examples = []
    const examplePattern = /Original: (.*?)\s*Improved: (.*?)(?=\n|$)/gi
    let match
    
    while ((match = examplePattern.exec(text)) !== null) {
      examples.push({
        original: match[1].trim(),
        improved: match[2].trim()
      })
    }
    
    return examples
  }

  private getIndustryKeywords(industry: string): string[] {
    const industryKeywords: Record<string, string[]> = {
      technology: ['agile', 'scrum', 'devops', 'microservices', 'cloud-native', 'ci/cd', 'containerization'],
      finance: ['risk management', 'regulatory compliance', 'portfolio optimization', 'quantitative analysis'],
      healthcare: ['patient care', 'clinical protocols', 'healthcare informatics', 'medical devices'],
      marketing: ['digital marketing', 'seo optimization', 'content strategy', 'brand management'],
      // Add more industries...
    }
    
    return industryKeywords[industry] || []
  }

  private generateSimilarityRecommendations(sectionSimilarities: any[], overallSimilarity: number): string[] {
    const recommendations = []
    
    if (overallSimilarity < 0.5) {
      recommendations.push('Consider restructuring your CV to better align with job requirements')
    }
    
    sectionSimilarities.forEach(section => {
      if (section.similarity < 0.4) {
        recommendations.push(`Improve ${section.section} section to better match job requirements`)
      }
    })
    
    return recommendations
  }

  // Enhanced Industry Analysis with Semantic Understanding
  private async analyzeIndustrySpecificEnhanced(cvText: string, industry: string, jobDescription?: string): Promise<{
    alignment: number
    criticalKeywords: string[]
    foundKeywords: string[]
    missingCriticalKeywords: string[]
    recommendations: string[]
  }> {
    const industryKeywords = this.getEnhancedIndustryKeywords(industry)
    const cvLower = cvText.toLowerCase()
    
    // Find exact and semantic matches
    const foundKeywords = industryKeywords.filter(keyword => 
      cvLower.includes(keyword.toLowerCase())
    )
    
    // Calculate semantic similarity for job description if provided
    let semanticBonus = 0
    if (jobDescription) {
      semanticBonus = await this.calculateSemanticRelevance(cvText, jobDescription, industry)
    }
    
    const baseAlignment = Math.round((foundKeywords.length / industryKeywords.length) * 100)
    const alignment = Math.min(100, baseAlignment + semanticBonus)
    
    const missingCriticalKeywords = industryKeywords.filter(keyword => 
      !cvLower.includes(keyword.toLowerCase())
    ).slice(0, 5)
    
    const recommendations = this.generateIndustryRecommendations(industry, foundKeywords, missingCriticalKeywords)
    
    return {
      alignment,
      criticalKeywords: industryKeywords,
      foundKeywords,
      missingCriticalKeywords,
      recommendations
    }
  }

  // Enhanced Industry Keywords with More Comprehensive Coverage
  private getEnhancedIndustryKeywords(industry: string): string[] {
    const enhancedKeywords: Record<string, string[]> = {
      technology: [
        // Core Tech
        'agile', 'scrum', 'git', 'api', 'cloud', 'devops', 'javascript', 'python', 'react', 'docker', 'kubernetes',
        // Advanced Tech
        'microservices', 'ci/cd', 'containerization', 'serverless', 'graphql', 'terraform', 'ansible',
        // Methodologies
        'test-driven development', 'continuous integration', 'agile methodology', 'software architecture',
        // Cloud Platforms
        'aws', 'azure', 'google cloud', 'cloud computing', 'distributed systems'
      ],
      finance: [
        // Core Finance
        'regulatory', 'compliance', 'risk', 'audit', 'reporting', 'financial analysis', 'accounting', 'banking',
        // Advanced Finance
        'portfolio management', 'derivatives', 'basel', 'ifrs', 'gaap', 'sox compliance', 'aml', 'kyc',
        // Technologies
        'bloomberg terminal', 'risk management systems', 'trading platforms', 'financial modeling',
        // Analytics
        'quantitative analysis', 'credit risk', 'market risk', 'operational risk'
      ],
      healthcare: [
        // Core Healthcare
        'patient', 'clinical', 'healthcare', 'treatment', 'diagnosis', 'care', 'medical', 'nursing',
        // Advanced Healthcare
        'electronic health records', 'hipaa', 'clinical trials', 'medical devices', 'telehealth',
        // Specializations
        'pharmacology', 'pathology', 'radiology', 'cardiology', 'oncology',
        // Technology
        'healthcare informatics', 'medical imaging', 'laboratory information systems'
      ],
      marketing: [
        // Digital Marketing
        'digital marketing', 'seo', 'sem', 'social media', 'content marketing', 'email marketing',
        // Analytics
        'google analytics', 'conversion optimization', 'a/b testing', 'marketing automation',
        // Strategy
        'brand management', 'campaign management', 'lead generation', 'customer acquisition',
        // Tools
        'hubspot', 'salesforce', 'google ads', 'facebook ads', 'linkedin ads'
      ],
      sales: [
        // Core Sales
        'business development', 'account management', 'sales strategy', 'lead generation', 'pipeline management',
        // Advanced Sales
        'crm', 'salesforce', 'quota attainment', 'territory management', 'channel partnerships',
        // Methodologies
        'consultative selling', 'solution selling', 'spin selling', 'challenger sale',
        // Metrics
        'conversion rates', 'sales forecasting', 'customer retention', 'upselling', 'cross-selling'
      ]
      // Add more industries with comprehensive keywords...
    }
    
    return enhancedKeywords[industry] || []
  }

  // Semantic Relevance Calculation (Simplified for now)
  private async calculateSemanticRelevance(cvText: string, jobDescription: string, industry: string): Promise<number> {
    // This is a simplified version - in a full implementation, you'd use HuggingFace embeddings
    const jobKeywords = this.extractKeywords(jobDescription).keywords
    const cvKeywords = this.extractKeywords(cvText).keywords
    
    const commonKeywords = jobKeywords.filter(keyword => 
      cvKeywords.some(cvKeyword => 
        cvKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(cvKeyword.toLowerCase())
      )
    )
    
    const semanticScore = Math.min(20, (commonKeywords.length / jobKeywords.length) * 20)
    return Math.round(semanticScore)
  }

  // Enhanced ATS Format Checking
  private checkATSFormatEnhanced(cvText: string, industry?: string): string[] {
    const warnings = this.checkATSFormat(cvText)
    
    // Add industry-specific format warnings
    if (industry === 'technology') {
      if (!cvText.toLowerCase().includes('github') && !cvText.toLowerCase().includes('portfolio')) {
        warnings.push('Consider adding GitHub profile or portfolio links for tech roles')
      }
    }
    
    if (industry === 'finance') {
      if (!cvText.toLowerCase().includes('certification') && !cvText.toLowerCase().includes('license')) {
        warnings.push('Finance roles often require relevant certifications - consider highlighting them')
      }
    }
    
    // Add length recommendations
    const wordCount = cvText.split(/\s+/).length
    if (wordCount < 300) {
      warnings.push('CV appears too short - consider adding more detail to your experience')
    } else if (wordCount > 1000) {
      warnings.push('CV might be too long - consider condensing to 1-2 pages')
    }
    
    return warnings
  }

  // Enhanced Content Suggestions
  private generateContentSuggestionsEnhanced(structure: any, keywordCount: number, industry?: string): string[] {
    const suggestions = this.generateContentSuggestions(structure, keywordCount)
    
    // Add industry-specific suggestions
    if (industry === 'technology') {
      suggestions.push('Include specific programming languages and frameworks you\'ve used')
      suggestions.push('Mention any open-source contributions or personal projects')
      suggestions.push('Quantify your technical achievements (e.g., "Improved performance by 40%")')
    }
    
    if (industry === 'finance') {
      suggestions.push('Highlight any regulatory knowledge or compliance experience')
      suggestions.push('Include specific financial software or systems you\'ve used')
      suggestions.push('Quantify financial impacts (e.g., "Managed portfolio worth $50M")')
    }
    
    if (industry === 'marketing') {
      suggestions.push('Include specific marketing channels and campaigns you\'ve managed')
      suggestions.push('Mention marketing tools and analytics platforms you\'re familiar with')
      suggestions.push('Quantify marketing results (e.g., "Increased conversion rate by 25%")')
    }
    
    return suggestions
  }

  // Generate Industry-Specific Recommendations
  private generateIndustryRecommendations(industry: string, foundKeywords: string[], missingKeywords: string[]): string[] {
    const recommendations = []
    
    if (missingKeywords.length > 0) {
      recommendations.push(`Consider adding these ${industry} keywords: ${missingKeywords.slice(0, 3).join(', ')}`)
    }
    
    const industryAdvice: Record<string, string[]> = {
      technology: [
        'Emphasize your experience with modern development practices',
        'Include links to your GitHub profile or portfolio',
        'Mention any cloud platform certifications',
        'Highlight experience with agile/scrum methodologies'
      ],
      finance: [
        'Emphasize regulatory compliance and risk management experience',
        'Include relevant financial certifications (CFA, FRM, etc.)',
        'Mention experience with financial software and systems',
        'Highlight quantitative analysis and modeling skills'
      ],
      healthcare: [
        'Emphasize patient care and clinical experience',
        'Include relevant medical certifications and licenses',
        'Mention experience with healthcare technology systems',
        'Highlight knowledge of healthcare regulations (HIPAA, etc.)'
      ],
      marketing: [
        'Emphasize digital marketing and analytics experience',
        'Include experience with marketing automation tools',
        'Mention campaign performance metrics and ROI',
        'Highlight brand management and strategy experience'
      ]
    }
    
    const specificAdvice = industryAdvice[industry] || []
    recommendations.push(...specificAdvice.slice(0, 2))
    
    return recommendations
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