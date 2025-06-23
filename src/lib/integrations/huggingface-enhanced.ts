import { HfInference } from '@huggingface/inference'

// Enhanced HuggingFace Integration for CV Analysis
export class EnhancedHuggingFaceService {
  private client: HfInference | null = null

  constructor() {
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      console.warn('HuggingFace API key not configured. Enhanced features will be disabled.')
      return
    }
    this.client = new HfInference(apiKey)
  }

  private isEnabled(): boolean {
    return this.client !== null
  }

  // Industry Classification with Confidence Scoring
  async classifyIndustry(cvText: string, candidateIndustries: string[]): Promise<{
    topIndustry: string
    confidence: number
    allScores: Array<{ industry: string; score: number }>
  }> {
    if (!this.isEnabled()) {
      return {
        topIndustry: 'general',
        confidence: 0,
        allScores: candidateIndustries.map(industry => ({ industry, score: 0 }))
      }
    }

    try {
      const cleanText = this.cleanText(cvText)
      
      const results = []
      for (const industry of candidateIndustries) {
        try {
          const result = await this.client!.zeroShotClassification({
            inputs: cleanText,
            parameters: {
              candidate_labels: [industry, 'other']
            }
          })
          
          // Extract the score for the industry (first label)
          const scores = Array.isArray(result.scores) ? result.scores : []
          const score = scores[0] || 0
          results.push({ industry, score })
        } catch (error) {
          console.warn(`Failed to classify for industry ${industry}:`, error)
          results.push({ industry, score: 0 })
        }
      }

      results.sort((a, b) => b.score - a.score)
      
      return {
        topIndustry: results[0]?.industry || 'general',
        confidence: results[0]?.score || 0,
        allScores: results
      }
    } catch (error) {
      console.error('Industry classification failed:', error)
      return {
        topIndustry: 'general',
        confidence: 0,
        allScores: candidateIndustries.map(industry => ({ industry, score: 0 }))
      }
    }
  }

  // Advanced Named Entity Recognition
  async extractProfessionalEntities(cvText: string): Promise<{
    skills: string[]
    organizations: string[]
    locations: string[]
    certifications: string[]
    technologies: string[]
  }> {
    try {
      const cleanText = this.cleanText(cvText)
      
      const entities = await this.client.tokenClassification({
        inputs: cleanText,
        parameters: {
          aggregation_strategy: 'average'
        }
      })

      const skills: string[] = []
      const organizations: string[] = []
      const locations: string[] = []
      const certifications: string[] = []
      const technologies: string[] = []

      entities.forEach((entity: any) => {
        const word = entity.word?.replace(/##/g, '').trim()
        if (!word || word.length < 2) return

        const entityType = entity.entity_group || entity.entity
        const score = entity.score || 0

        // Only include high-confidence entities
        if (score > 0.7) {
          switch (entityType) {
            case 'ORG':
              if (this.isKnownCompany(word)) {
                organizations.push(word)
              }
              break
            case 'LOC':
              locations.push(word)
              break
            case 'MISC':
              if (this.isTechnology(word)) {
                technologies.push(word)
              } else if (this.isCertification(word)) {
                certifications.push(word)
              } else {
                skills.push(word)
              }
              break
          }
        }
      })

      return {
        skills: [...new Set(skills)],
        organizations: [...new Set(organizations)],
        locations: [...new Set(locations)],
        certifications: [...new Set(certifications)],
        technologies: [...new Set(technologies)]
      }
    } catch (error) {
      console.error('Entity extraction failed:', error)
      return {
        skills: [],
        organizations: [],
        locations: [],
        certifications: [],
        technologies: []
      }
    }
  }

  // CV-Job Description Semantic Similarity
  async calculateJobAlignment(cvText: string, jobDescription: string): Promise<{
    overallSimilarity: number
    sectionSimilarities: {
      skills: number
      experience: number
      requirements: number
    }
    missingRequirements: string[]
    recommendations: string[]
  }> {
    try {
      const cvSections = this.extractCVSections(cvText)
      const jobSections = this.extractJobSections(jobDescription)

      // Calculate similarity for each section
      const skillsSimilarity = await this.calculateTextSimilarity(
        cvSections.skills, 
        jobSections.requirements
      )
      
      const experienceSimilarity = await this.calculateTextSimilarity(
        cvSections.experience, 
        jobSections.responsibilities
      )

      const requirementsSimilarity = await this.calculateTextSimilarity(
        cvText, 
        jobDescription
      )

      const overallSimilarity = (skillsSimilarity + experienceSimilarity + requirementsSimilarity) / 3

      // Extract missing requirements
      const missingRequirements = await this.findMissingRequirements(cvText, jobDescription)
      
      // Generate recommendations
      const recommendations = this.generateAlignmentRecommendations(
        overallSimilarity,
        { skills: skillsSimilarity, experience: experienceSimilarity, requirements: requirementsSimilarity },
        missingRequirements
      )

      return {
        overallSimilarity: Math.round(overallSimilarity * 100),
        sectionSimilarities: {
          skills: Math.round(skillsSimilarity * 100),
          experience: Math.round(experienceSimilarity * 100),
          requirements: Math.round(requirementsSimilarity * 100)
        },
        missingRequirements,
        recommendations
      }
    } catch (error) {
      console.error('Job alignment calculation failed:', error)
      return {
        overallSimilarity: 0,
        sectionSimilarities: { skills: 0, experience: 0, requirements: 0 },
        missingRequirements: [],
        recommendations: ['Unable to calculate job alignment']
      }
    }
  }

  // Industry-Specific Feedback Generation
  async generateIndustryFeedback(cvText: string, industry: string, issues: string[]): Promise<{
    improvementSuggestions: string[]
    keywordRecommendations: string[]
    exampleImprovements: Array<{ section: string; suggestion: string }>
  }> {
    try {
      const prompt = this.createIndustryFeedbackPrompt(industry, issues)
      
      const response = await this.client.textGeneration({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      })

      const feedback = this.parseFeedbackResponse(response.generated_text)
      const keywordRecommendations = this.getIndustryKeywords(industry)

      return {
        improvementSuggestions: feedback.suggestions,
        keywordRecommendations,
        exampleImprovements: feedback.examples
      }
    } catch (error) {
      console.error('Industry feedback generation failed:', error)
      return {
        improvementSuggestions: [`Consider tailoring your CV for the ${industry} industry`],
        keywordRecommendations: this.getIndustryKeywords(industry),
        exampleImprovements: []
      }
    }
  }

  // Helper Methods

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.,;:!()\-]/g, '')
      .trim()
      .substring(0, 2000) // Limit text length for API
  }

  private async calculateTextSimilarity(text1: string, text2: string): Promise<number> {
    if (!text1 || !text2) return 0

    try {
      // Simple word overlap similarity (can be enhanced with embeddings)
      const words1 = text1.toLowerCase().split(/\s+/)
      const words2 = text2.toLowerCase().split(/\s+/)
      
      const intersection = words1.filter(word => words2.includes(word))
      const union = [...new Set([...words1, ...words2])]
      
      return intersection.length / union.length
    } catch (error) {
      console.error('Text similarity calculation failed:', error)
      return 0
    }
  }

  private extractCVSections(cvText: string): { skills: string; experience: string } {
    const skillsMatch = cvText.match(/(?:skills|competencies|technical skills)(.*?)(?:experience|education|$)/is)
    const experienceMatch = cvText.match(/(?:experience|work history|employment)(.*?)(?:education|skills|$)/is)
    
    return {
      skills: skillsMatch?.[1]?.trim() || '',
      experience: experienceMatch?.[1]?.trim() || ''
    }
  }

  private extractJobSections(jobDescription: string): { requirements: string; responsibilities: string } {
    const requirementsMatch = jobDescription.match(/(?:requirements|qualifications|must have)(.*?)(?:responsibilities|duties|$)/is)
    const responsibilitiesMatch = jobDescription.match(/(?:responsibilities|duties|role)(.*?)(?:requirements|qualifications|$)/is)
    
    return {
      requirements: requirementsMatch?.[1]?.trim() || '',
      responsibilities: responsibilitiesMatch?.[1]?.trim() || ''
    }
  }

  private async findMissingRequirements(cvText: string, jobDescription: string): Promise<string[]> {
    // Extract key requirements from job description
    const requirements = jobDescription
      .match(/(?:required|must have|essential)(.*?)(?:\.|;|\n)/gi) || []
    
    const missing = requirements
      .map(req => req.replace(/(?:required|must have|essential)/i, '').trim())
      .filter(req => req.length > 5 && !cvText.toLowerCase().includes(req.toLowerCase()))
      .slice(0, 5)
    
    return missing
  }

  private isKnownCompany(word: string): boolean {
    const knownCompanies = ['google', 'microsoft', 'apple', 'amazon', 'facebook', 'tesla', 'netflix']
    return knownCompanies.some(company => word.toLowerCase().includes(company))
  }

  private isTechnology(word: string): boolean {
    const techTerms = ['javascript', 'python', 'react', 'node', 'sql', 'git', 'docker', 'aws']
    return techTerms.some(tech => word.toLowerCase().includes(tech))
  }

  private isCertification(word: string): boolean {
    const certTerms = ['aws', 'azure', 'google cloud', 'cisco', 'comptia', 'certification', 'certified']
    return certTerms.some(cert => word.toLowerCase().includes(cert))
  }

  private createIndustryFeedbackPrompt(industry: string, issues: string[]): string {
    return `As a professional recruiter specializing in ${industry}, provide specific advice to improve this resume.

Issues identified: ${issues.join(', ')}

Please provide:
1. 3 specific improvement suggestions
2. Key industry terms to include
3. Examples of strong achievement statements

Keep advice practical and actionable.`
  }

  private parseFeedbackResponse(response: string): { suggestions: string[]; examples: Array<{ section: string; suggestion: string }> } {
    const lines = response.split('\n').filter(line => line.trim())
    
    const suggestions = lines
      .filter(line => line.includes('•') || line.includes('-') || /^\d+\./.test(line))
      .slice(0, 5)
    
    const examples = [
      { section: 'Experience', suggestion: 'Use action verbs and quantify achievements' },
      { section: 'Skills', suggestion: 'Include both technical and soft skills relevant to the role' }
    ]
    
    return { suggestions, examples }
  }

  private getIndustryKeywords(industry: string): string[] {
    const keywords: Record<string, string[]> = {
      technology: ['agile', 'scrum', 'cloud', 'api', 'devops', 'microservices'],
      finance: ['compliance', 'risk management', 'regulatory', 'audit', 'financial modeling'],
      healthcare: ['patient care', 'clinical', 'hipaa', 'medical devices', 'healthcare systems'],
      marketing: ['digital marketing', 'seo', 'analytics', 'campaign management', 'brand strategy'],
      sales: ['crm', 'lead generation', 'pipeline management', 'quota attainment', 'customer retention']
    }
    
    return keywords[industry] || []
  }

  private generateAlignmentRecommendations(
    overallSimilarity: number,
    sectionSimilarities: { skills: number; experience: number; requirements: number },
    missingRequirements: string[]
  ): string[] {
    const recommendations = []
    
    if (overallSimilarity < 0.5) {
      recommendations.push('Consider significantly restructuring your CV to better match the job requirements')
    }
    
    if (sectionSimilarities.skills < 0.4) {
      recommendations.push('Add more relevant technical skills mentioned in the job description')
    }
    
    if (sectionSimilarities.experience < 0.4) {
      recommendations.push('Highlight experience that more closely matches the job responsibilities')
    }
    
    if (missingRequirements.length > 0) {
      recommendations.push(`Address these missing requirements: ${missingRequirements.slice(0, 2).join(', ')}`)
    }
    
    return recommendations
  }
}

export const enhancedHuggingFaceService = new EnhancedHuggingFaceService() 